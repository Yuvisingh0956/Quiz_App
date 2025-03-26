from celery import shared_task
from datetime import datetime, timedelta
from .models import *
from sqlalchemy import desc, func, extract
from .utils import format_report
from .mail import send_email
import csv

@shared_task(ignore_results = False, name = "download_transaction_csv_report")
def transaction_csv_report():
    transactions = Payment.query.all()
    csv_file_name = f"transaction_{datetime.now().strftime('%f')}.csv"
    with open(f'static/{csv_file_name}','w', newline = '') as csvfile:
        sr_no = 1
        trans_csv = csv.writer(csvfile, delimiter=',')
        trans_csv.writerow(['Sr No.', 'Transaction Date', 'Username', 'Quiz ID', 'Quiz Name', 'Amount', 'Payment Method', 'Status'])
        for t in transactions:
            quiz = Quiz.query.get(t.quiz_id)
            user = User.query.get(t.user_id)
            t_date = get_date_from_datetime_string(t.payment_date)
            this_trans = [sr_no, t_date, t.user.username, t.quiz_id, quiz.name, t.amount, t.payment_method, t.status ]
            trans_csv.writerow(this_trans)
            sr_no += 1

    return csv_file_name

@shared_task(ignore_results = False, name = "download_user_csv_report")
def user_csv_report():
    user = User.query.filter(User.id != 1).all()
    csv_file_name = f"user_detail_{datetime.now().strftime('%f')}.csv"
    with open(f'static/{csv_file_name}','w', newline = '') as csvfile:
        sr_no = 1
        trans_csv = csv.writer(csvfile, delimiter=',')
        trans_csv.writerow(['Sr No.', 'User ID', 'Username', 'Email', 'Total Quizzes Taken', 'Total Attempts', 'Avg. Score (%)', 'Last Quiz Attempt Date'])
        for t in user:
            total_attempts = Scores.query.filter_by(user_id = t.id).count()
            total_quizzes_taken = (
                db.session.query(Scores.quiz_id)
                .filter(Scores.user_id == t.id)
                .distinct()
                .count()
            )
            average_score = get_user_average_score(t.id)
            last_attempt = Scores.query.filter_by(user_id=t.id) \
            .order_by(desc(Scores.date_of_quiz)) \
            .first()
            if last_attempt:
                last_attempt_date = last_attempt.date_of_quiz
            else:
                last_attempt_date = None

            this_trans = [sr_no, t.id, t.username, t.email, total_quizzes_taken, total_attempts, average_score, last_attempt_date ]
            trans_csv.writerow(this_trans)
            sr_no += 1

    return csv_file_name

@shared_task(ignore_results = False, name = "daily_report")
def daily_report():
    users = User.query.filter(User.id != 1).all()
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)

    for u in users:
        # Check if the user attempted any quiz
        last_attempt = Scores.query.filter(
            Scores.user_id == u.id,
        ).order_by(desc(Scores.date_of_quiz)).first()

        # Check if new quizzes were created yesterday
        new_quizzes = Quiz.query.filter(
            extract('year', Quiz.start_date) == yesterday.year,
            extract('month', Quiz.start_date) == yesterday.month,
            extract('day', Quiz.start_date) == yesterday.day
        ).count()

        # if not last_attempt or new_quizzes > 0:
        # Prepare reminder data
        user_data = {
            "username": u.username,
            "email": u.email,
            "last_quiz_attempt": last_attempt.date_of_quiz if last_attempt else "No Attempt",
            "new_quizzes_count": new_quizzes
        }

        message = format_report("templates/daily_reminder.html", user_data)
        send_email(u.email, subject="Daily Reminder - Quizo", message=message)

    return "Daily reminders sent"

@shared_task(ignore_results = False, name = "monthly_report")
def monthly_report():
    users = User.query.filter(User.id != 1).all()

    current_month = datetime.now().month
    current_year = datetime.now().year

    for u in users:
        total_attempts = Scores.query.filter(
            Scores.user_id == u.id,
            extract('month', Scores.date_of_quiz) == current_month,
            extract('year', Scores.date_of_quiz) == current_year
        ).count()

        total_quizzes_taken = (
            db.session.query(Scores.quiz_id)
            .filter(
                Scores.user_id == u.id,
                extract('month', Scores.date_of_quiz) == current_month,
                extract('year', Scores.date_of_quiz) == current_year
            )
            .distinct()
            .count()
        )

        average_score = get_user_monthly_average_score(u.id, current_month, current_year)

        last_attempt = Scores.query.filter(
            Scores.user_id == u.id,
            extract('month', Scores.date_of_quiz) == current_month,
            extract('year', Scores.date_of_quiz) == current_year
        ).order_by(desc(Scores.date_of_quiz)).first()


        user_data = {}
        user_data['username'] = u.username
        user_data['email'] = u.email
        user_data['num_of_new_quizzess_attempted'] = total_quizzes_taken
        user_data['total_quiz_attenpts'] = total_attempts
        user_data['average_score'] = average_score
        user_data['last_quiz_attempt'] = last_attempt.date_of_quiz if last_attempt else "No Attempt"

        message = format_report('templates/mail_details.html', user_data)
        send_email(u.email, subject = "Monthly Activity Report - Quizo", message = message)

    return "Monthly report sent"


def get_date_from_datetime_string(datetime_object):
    if isinstance(datetime_object, datetime):
        date_string = datetime_object.strftime('%Y-%m-%d')
        return date_string
    else:
        return None
    
def get_user_average_score(user_id):
    all_attempts = Scores.query.filter_by(user_id=user_id).all()

    if not all_attempts:
        return 0.0
    
    quiz_ids = [attempt.quiz_id for attempt in all_attempts]

    quizzes = {quiz.id: quiz for quiz in Quiz.query.filter(Quiz.id.in_(quiz_ids)).all()}

    quiz_total_marks = {
        quiz_id: db.session.query(db.func.sum(Question.marks))
                .filter(Question.quiz_id == quiz_id)
                .scalar() or 0
        for quiz_id in quiz_ids
    }

    attempt_details = [{
        "attempt_id": attempt.id,
        "quiz_name": quizzes[attempt.quiz_id].name,
        "score": attempt.score,
        "total_marks": quiz_total_marks.get(attempt.quiz_id, 0),
        "date_of_attempt": attempt.date_of_quiz
    } for attempt in all_attempts]

    total_score = sum(attempt["score"] for attempt in attempt_details)
    total_marks = sum(attempt["total_marks"] for attempt in attempt_details)

    avg_score = round(total_score / total_marks * 100, 2) if total_marks else 0.0

    return avg_score

def get_user_monthly_average_score(user_id, month, year):
    avg_score = (
        db.session.query(func.avg(Scores.score))
        .filter(
            Scores.user_id == user_id,
            extract('month', Scores.date_of_quiz) == month,
            extract('year', Scores.date_of_quiz) == year
        )
        .scalar()
    )
    
    return round(avg_score, 2) if avg_score is not None else 0