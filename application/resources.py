from flask_restful import Resource, Api, reqparse, request
from flask import jsonify
from flask_security import auth_required, roles_required, roles_accepted, current_user
from datetime import datetime
from .models import *
api = Api()

# ===== Common Parsers =====
subject_parser = reqparse.RequestParser()
subject_parser.add_argument('name', type=str, required=True)
subject_parser.add_argument('description', type=str, required=True)

chapter_parser = reqparse.RequestParser()
chapter_parser.add_argument('name', type=str, required=True)
chapter_parser.add_argument('description', type=str, required=True)
# chapter_parser.add_argument('subject_id', type=int, required=True)

quiz_parser = reqparse.RequestParser()
# quiz_parser.add_argument('chapter_id', type=int, required=True)
quiz_parser.add_argument('name', type=str, required=True)
quiz_parser.add_argument('start_date', type=str, required=True)
quiz_parser.add_argument('time_duration', type=int, required=True)
quiz_parser.add_argument('single_attempt', type=str, required=True)
quiz_parser.add_argument('type_of_quiz', type=str, default='Free')
quiz_parser.add_argument('end_date', type=str, required=True)
quiz_parser.add_argument('price', type=int, required=True)

question_parser = reqparse.RequestParser()
# question_parser.add_argument('quiz_id', type=int, required=True)
question_parser.add_argument('question', type=str, required=True)
question_parser.add_argument('option1', type=str, required=True)
question_parser.add_argument('option2', type=str, required=True)
question_parser.add_argument('option3', type=str, required=True)
question_parser.add_argument('option4', type=str, required=True)
question_parser.add_argument('correct_option', type=str, required=True)
question_parser.add_argument('explanation', type=str, required=True)
question_parser.add_argument('marks', type=int, required=True)

scores_parser = reqparse.RequestParser()
scores_parser.add_argument('quiz_id', type=int, required=True)
scores_parser.add_argument('time_stamp', type=str, required=True)
scores_parser.add_argument('duration', type=int, required=True)
scores_parser.add_argument('score', type=int, required=True)
scores_parser.add_argument('date_of_quiz', type=str, required=True)

response_parser = reqparse.RequestParser()
response_parser.add_argument('quiz_id', type=int, required=True)
response_parser.add_argument('question_id', type=int, required=True)
response_parser.add_argument('selected_option', type=int, required=True)
response_parser.add_argument('is_correct', type=bool, required=True)
response_parser.add_argument('score', type=int, required=True)
response_parser.add_argument('total_score', type=int, required=True)
response_parser.add_argument('duration', type=int, required=True)
response_parser.add_argument('date_of_quiz', type=str, required=True)

# ===== SubjectApi =====
class SubjectApi(Resource):
    def get(self):
        return [subject.to_dict() for subject in Subject.query.all()]

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        args = subject_parser.parse_args()
        subject = Subject(**args)
        db.session.add(subject)
        db.session.commit()
        return {'message': 'Subject created', 'subject': subject.to_dict()}

    @auth_required('token')
    @roles_required('admin')
    def put(self, id):
        subject = Subject.query.get(id)
        if not subject:
            return {'message': 'Subject not found'}, 404
        args = subject_parser.parse_args()
        for key, value in args.items():
            setattr(subject, key, value)
        db.session.commit()
        return {'message': 'Subject updated'}

    @auth_required('token')
    @roles_required('admin')
    def delete(self, id):
        subject = Subject.query.get(id)
        if not subject:
            return {'message': 'Subject not found'}, 404
        db.session.delete(subject)
        db.session.commit()
        return {'message': 'Subject deleted'}


# ===== ChapterApi =====
class ChapterApi(Resource):
    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self, subject_id):
        chapters = Chapter.query.filter_by(subject_id=subject_id).all()
        return [{'id': c.id, 'name': c.name, 'description': c.description} for c in chapters]

    @auth_required('token')
    @roles_required('admin')
    def post(self, subject_id):
        args = chapter_parser.parse_args()
        chapter = Chapter(name=args['name'], description=args['description'], subject_id=subject_id)
        
        db.session.add(chapter)
        db.session.commit()

        return {"message": "Chapter created"}, 201

    @auth_required('token')
    @roles_required('admin')
    def put(self, id):
        chapter = Chapter.query.get(id)
        if not chapter:
            return {'message': 'Chapter not found'}, 404
        args = chapter_parser.parse_args()
        for key, value in args.items():
            setattr(chapter, key, value)
        db.session.commit()
        return {'message': 'Chapter updated'}

    @auth_required('token')
    @roles_required('admin')
    def delete(self, id):
        chapter = Chapter.query.get(id)
        if not chapter:
            return {'message': 'Chapter not found'}, 404
        db.session.delete(chapter)
        db.session.commit()
        return {'message': 'Chapter deleted'}


# ===== QuizApi =====
class QuizApi(Resource):

    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self, chapter_id):
        quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all()
        user_id = current_user.id
        current_time = datetime.utcnow()
        quiz_list = []

        for quiz in quizzes:
            quiz_dict = quiz.to_dict()
            yet_to_start = False
            is_expired = False

            if quiz.start_date:
                start_date_datetime = datetime.strptime(quiz.start_date, "%Y-%m-%d")
                if start_date_datetime > current_time:
                    yet_to_start = True

            if quiz.end_date:
                end_date_datetime = datetime.strptime(quiz.end_date, "%Y-%m-%d") 
                if end_date_datetime < current_time:
                    is_expired = True

            attempted = Scores.query.filter_by(user_id=user_id, quiz_id=quiz.id).first() is not None
            quiz_dict['attempted'] = attempted

            quiz_dict['yet_to_start'] = yet_to_start
            quiz_dict['is_expired'] = is_expired

            # Check if the quiz is paid and if the user has paid
            if quiz.type_of_quiz == "Paid":
                has_paid = Payment.query.filter_by(user_id=user_id, quiz_id=quiz.id, status="Completed").first() is not None
                quiz_dict['is_paid'] = has_paid
            else:
                quiz_dict['is_paid'] = True  # Free quizzes are considered already paid
            quiz_list.append(quiz_dict)

        return jsonify(quiz_list)

    @auth_required('token')
    @roles_required('admin')
    def post(self, chapter_id):
        args = quiz_parser.parse_args()
        quiz = Quiz(**args, chapter_id=chapter_id)
        db.session.add(quiz)
        db.session.commit()
        return {'message': 'Quiz created'}

    @auth_required('token')
    @roles_required('admin')
    def put(self, id):
        quiz = Quiz.query.get(id)
        if not quiz:
            return {'message': 'Quiz not found'}, 404
        args = quiz_parser.parse_args()
        for key, value in args.items():
            setattr(quiz, key, value)
        db.session.commit()
        return {'message': 'Quiz updated'}

    @auth_required('token')
    @roles_required('admin')
    def delete(self, id):
        quiz = Quiz.query.get(id)
        if not quiz:
            return {'message': 'Quiz not found'}, 404
        db.session.delete(quiz)
        db.session.commit()
        return {'message': 'Quiz deleted'}

class getQuizApi(Resource):
    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {'message': 'Quiz not found'}, 404
        return jsonify(quiz.to_dict())  # Return single quiz as dict


# ===== QuestionApi =====
class QuestionApi(Resource):
    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {'message': 'Quiz not found'}, 404

        questions = Question.query.filter_by(quiz_id=quiz_id).all()

        return [{
            'id': question.id,
            'quiz_id': question.quiz_id,
            'question': question.question,
            'option1': question.option1,
            'option2': question.option2,
            'option3': question.option3,
            'option4': question.option4,
            'explanation': question.explanation,
            'correct_option': question.correct_option,
            'marks': question.marks
        } for question in questions]

    @auth_required('token')
    @roles_required('admin')
    def post(self, quiz_id):
        if (quiz_id not in [q.id for q in Quiz.query.all()]):
            return {'message': 'Quiz not found'}, 404
        args = question_parser.parse_args()
        question = Question(**args, quiz_id=quiz_id)
        db.session.add(question)
        db.session.commit()
        return {
            'message': 'Question added successfully',
            'question': {
                'id': question.id,
                'quiz_id': question.quiz_id,
                'question': question.question,
                'option1': question.option1,
                'option2': question.option2,
                'option3': question.option3,
                'option4': question.option4,
                'correct_option': question.correct_option,
                'explanation': question.explanation,
                'marks': question.marks,
            }
        }, 201
    
    @auth_required('token')
    @roles_required('admin')
    def put(self, id):
        """Update an existing question (admin only)."""
        args = question_parser.parse_args()
        question = Question.query.get(id)

        if not question:
            return {'message': 'Question not found'}, 404

        question.question = args['question']
        question.option1 = args['option1']
        question.option2 = args['option2']
        question.option3 = args['option3']
        question.option4 = args['option4']
        question.correct_option = args['correct_option']
        question.explanation = args['explanation']
        question.marks = args['marks']

        db.session.commit()

        return {'message': 'Question updated successfully'}

    @auth_required('token')
    @roles_required('admin')
    def delete(self, id):
        question = Question.query.get(id)
        if not question:
            return {'message': 'Question not found'}, 404
        db.session.delete(question)
        db.session.commit()
        return {'message': 'Question deleted'}


# ===== ScoresApi =====
class ScoresApi(Resource):

    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self, quiz_id=None):
        """
        GET all scores for a quiz (admin only)
        OR
        GET current user's scores across all quizzes (user only)
        """

        if 'admin' in [role.name for role in current_user.roles]:
            # Admin can view all scores for a specific quiz
            if quiz_id:
                scores = Scores.query.filter_by(quiz_id=quiz_id).all()
                return [score.to_dict() for score in scores]
            # Admin can also view all scores (optional)
            scores = Scores.query.all()
            return [score.to_dict() for score in scores]

        else:
            # Regular user can only see their own scores
            scores = Scores.query.filter_by(user_id=current_user.id).all()
            return [score.to_dict() for score in scores]

    @auth_required('token')
    @roles_required('user')
    def post(self):
        """
        Submit a new score (user only)
        """
        args = scores_parser.parse_args()

        quiz = Quiz.query.get(args['quiz_id'])
        if not quiz:
            return {'message': 'Quiz not found'}, 404

        new_score = Scores(
            user_id=current_user.id,
            quiz_id=args['quiz_id'],
            time_stamp=args['time_stamp'],
            duration=args['duration'],
            score=args['score'],
            date_of_quiz=args['date_of_quiz']
        )

        db.session.add(new_score)
        db.session.commit()

        return {
            'message': 'Score submitted successfully',
            'score': new_score.to_dict()
        }, 201

    @auth_required('token')
    @roles_required('admin')
    def put(self, score_id):
        """
        Update a score (admin only)
        """
        args = scores_parser.parse_args()

        score = Scores.query.get(score_id)
        if not score:
            return {'message': 'Score not found'}, 404

        score.quiz_id = args['quiz_id']
        score.time_stamp = args['time_stamp']
        score.duration = args['duration']
        score.score = args['score']
        score.date_of_quiz = args['date_of_quiz']

        db.session.commit()

        return {'message': 'Score updated successfully'}

    @auth_required('token')
    @roles_required('admin')
    def delete(self, score_id):
        """
        Delete a score (admin only)
        """
        score = Scores.query.get(score_id)
        if not score:
            return {'message': 'Score not found'}, 404

        db.session.delete(score)
        db.session.commit()

        return {'message': 'Score deleted successfully'}

class AttemptQuizApi(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self, quiz_id):
        """Retrieve quiz questions for a given quiz ID"""
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {'message': 'Quiz not found'}, 404

        questions = Question.query.filter_by(quiz_id=quiz_id).all()

        return [{
            'id': question.id,
            'question': question.question,
            'options': [question.option1, question.option2, question.option3, question.option4]
        } for question in questions]

    @auth_required('token')
    @roles_accepted('user')
    def post(self):
        """Handle quiz submission and score calculation"""
        args = reqparse.RequestParser()
        args.add_argument('quiz_id', type=int, required=True)
        args.add_argument('answers', type=dict, required=True)  # {question_id: chosen_option}
        args.add_argument('duration', type=int, required=True)  # Time taken by the user

        data = args.parse_args()
        quiz_id = data['quiz_id']
        user_answers = data['answers']
        duration = data['duration']
        print(f"Received answers: {user_answers}")

        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {'message': 'Quiz not found'}, 404

        questions = Question.query.filter_by(quiz_id=quiz_id).all()
        correct_answers = {q.id: q.correct_option for q in questions}
        explanations = {q.id: q.explanation for q in questions}
        total_marks = sum(q.marks for q in questions)

        # Calculate score
        score = 0
        feedback = {}
        is_correct_array = []

        for q_id, chosen_option in user_answers.items():
            print(f"Question ID: {q_id}, Chosen Option: {chosen_option}")
            q_id = int(q_id)
            if q_id in correct_answers:
                is_correct = correct_answers[q_id] == chosen_option
                is_correct_array.append(is_correct)
                feedback[q_id] = {'correct': is_correct, 'correct_option': correct_answers[q_id], 'explanation': explanations[q_id]}
                if is_correct:
                    score += next(q.marks for q in questions if q.id == q_id)
            else:
                print(f"Question ID {q_id} not found in the quiz.")

        # Store the score
        new_score = Scores(
            user_id=current_user.id,
            quiz_id=quiz_id,
            time_stamp=str(datetime.utcnow()),
            duration=duration,
            score=score,
            date_of_quiz=str(datetime.utcnow().date())
        )

        db.session.add(new_score)
        db.session.flush()

        # args = response_parser.parse_args()
        i = len(user_answers)
        j = 0

        while (j < i):
            for q_id, chosen_option in user_answers.items():
                q_id = int(q_id)
                attempt_score = 0
                question_score = next((q.marks for q in questions if q.id == q_id), 0)
                if (is_correct_array[j]):
                    attempt_score = question_score
                else:
                    attempt_score = 0
                user_response = UserResponse(user_id=current_user.id, 
                                            quiz_id=quiz_id, 
                                            attempt_id = new_score.id, 
                                            question_id=q_id, 
                                            selected_option=chosen_option, 
                                            is_correct=is_correct_array[j], 
                                            attempt_score=attempt_score,
                                            question_score=question_score,
                                            duration=duration,
                                            date_of_quiz=str(datetime.utcnow().date()))
                db.session.add(user_response)
                j += 1
        db.session.commit()

        return {
            'message': 'Quiz submitted successfully',
            'quiz_id': quiz_id,
            'score': score,
            'total_marks': total_marks,
            'feedback': feedback,
            'user_answers': user_answers,
            'attempt_id': new_score.id,
        }, 201


class ResultsApi(Resource):
    @auth_required('token')
    @roles_accepted('admin','user')
    def get(self, attempt_id):
        """
        Retrieve quiz results for a given attempt_id, including detailed question evaluation.
        """
        score_entry = Scores.query.get(attempt_id)
        if not score_entry:
            return {'message': 'Attempt not found'}, 404

        responses = UserResponse.query.filter_by(attempt_id=attempt_id).all()
        # user_id = score_entry.user_id
        # user_role = UserRoles.query.filter_by(user_id=user_id).first()
        # is_admin = False

        # if user_role == 1:
        #     is_admin = True
        # print(f"User Role: {user_role}, Is Admin: {is_admin}")
        if not responses:
            return {'message': 'No responses found for this attempt'}, 404

        quiz = Quiz.query.get(score_entry.quiz_id)
        questions = {q.id: q for q in Question.query.filter_by(quiz_id=quiz.id).all()}

        result_details = []
        for response in responses:
            question = questions.get(response.question_id)
            if question:
                evaluation = {
                    'question_id': response.question_id,
                    'question_text': question.question,
                    'options': [question.option1, question.option2, question.option3, question.option4],
                    'selected_option': response.selected_option,
                    'correct_option': question.correct_option,
                    'is_correct': response.is_correct,
                    'explanation': question.explanation,
                    'question_score': response.question_score,
                    'attempt_score': response.attempt_score,
                }
                
                # Add evaluation details
                evaluation['evaluation'] = "Correct" if response.is_correct else "Incorrect"
                evaluation['score_awarded'] = response.attempt_score
                evaluation['max_score'] = response.question_score

                result_details.append(evaluation)

        return {
            'message': 'Results retrieved successfully',
            'attempt_id': attempt_id,
            'quiz_id': score_entry.quiz_id,
            'total_score': score_entry.score,
            'total_marks': sum(q.marks for q in questions.values()),
            'duration': score_entry.duration,
            'date_of_quiz': score_entry.date_of_quiz,
            'details': result_details,
            # 'is_admin': is_admin
        }, 200

class PastAttemptsApi(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self):
        """
        Retrieve all past quiz attempts for the logged-in user.
        """
        user_attempts = Scores.query.filter_by(user_id=current_user.id).order_by(Scores.date_of_quiz.desc()).all()
        
        if not user_attempts:
            return {'message': 'No past attempts found'}, 404
        
        attempts_data = []
        for attempt in user_attempts:
            quiz = Quiz.query.get(attempt.quiz_id)
            attempts_data.append({
                'attempt_id': attempt.id,
                'quiz_id': attempt.quiz_id,
                'quiz_name': quiz.name if quiz else 'Unknown Quiz',
                'score': attempt.score,
                'total_marks': sum(q.marks for q in Question.query.filter_by(quiz_id=attempt.quiz_id).all()),
                'duration': attempt.duration,
                'date_of_quiz': attempt.date_of_quiz
            })
        
        return {
            'message': 'Past attempts retrieved successfully',
            'attempts': attempts_data
        }, 200

class UserSummaryApi(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self):
        """Fetch user's quiz summary with subject-wise performance and recent attempts"""

        user_id = current_user.id

        # Fetch scores for each chapter and group by subject
        chapter_scores = db.session.query(
            Chapter.subject_id,  
            Subject.name,        
            db.func.avg(Scores.score).label('avg_score')
        ).join(Quiz, Quiz.chapter_id == Chapter.id
        ).join(Scores, Scores.quiz_id == Quiz.id
        ).join(Subject, Subject.id == Chapter.subject_id
        ).filter(Scores.user_id == user_id
        ).group_by(Chapter.subject_id, Subject.name).all()

        subject_performance = [
            {"subject": row.name, "avg_score": round(row.avg_score, 2)} for row in chapter_scores
        ]

        # Fetch last 10 quizzes with names
        recent_scores = db.session.query(
            Scores.score,
            Quiz.name.label("quiz_name")  # Fetch quiz name
        ).join(Quiz, Scores.quiz_id == Quiz.id
        ).filter(Scores.user_id == user_id
        ).order_by(Scores.date_of_quiz.desc())\
        .limit(10).all()

        recent_performance = [
            {"quiz_name": row.quiz_name, "score": row.score} for row in recent_scores
        ]

        return {
            "subject_performance": subject_performance,
            "recent_performance": recent_performance
        }, 200


class AdminSummaryApi(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        """Fetch summary statistics and charts data for admin overview"""

        # Fetch total counts
        total_users = User.query.count() - 1
        total_subjects = Subject.query.count()
        total_chapters = Chapter.query.count()
        total_quizzes = Quiz.query.count()

        # Subject-wise performance (average score per subject)
        subject_performance = db.session.query(
            Subject.name, db.func.avg(Scores.score)
        ).join(Chapter, Chapter.subject_id == Subject.id) \
        .join(Quiz, Quiz.chapter_id == Chapter.id) \
        .join(Scores, Scores.quiz_id == Quiz.id) \
        .group_by(Subject.id).all()

        
        subject_data = {
            subject: round(avg_score, 2) if avg_score else 0
            for subject, avg_score in subject_performance
        }

        # User qualification distribution (pie chart)
        qualification_distribution = db.session.query(
            User.qualification, db.func.count(User.id)
        ).group_by(User.qualification).all()

        qualification_data = {
            qualification: count for qualification, count in qualification_distribution
        }

        # Recent quiz participation trend (line chart)
        recent_attempts = db.session.query(
            Quiz.name, db.func.count(Scores.id)
        ).join(Scores, Scores.quiz_id == Quiz.id)\
        .group_by(Quiz.name).order_by(db.func.count(Scores.id).desc()).limit(10).all()
        
        recent_quiz_data = {
            quiz_name: attempt_count for quiz_name, attempt_count in recent_attempts
        }

        return {
            "total_users": total_users,
            "total_subjects": total_subjects,
            "total_chapters": total_chapters,
            "total_quizzes": total_quizzes,
            "subject_performance": subject_data,
            "qualification_distribution": qualification_data,
            "recent_quiz_attempts": recent_quiz_data,
        }, 200

class AdminUsersApi(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        """Retrieve a list of all users"""
        users = User.query.all()

        user_list = [{
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.roles[0].name if user.roles else "User",
            "dob": user.dob,
        } for user in users]

        return {"users": user_list}, 200

class UserDetailApi(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self, user_id):
        """Retrieve detailed information for a specific user"""

        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404

        total_attempts = Scores.query.filter_by(user_id=user_id).count()
        
        # avg_score = db.session.query(db.func.avg(Scores.score)).filter_by(user_id=user_id).scalar()
        # avg_score = round(avg_score, 2) * 10 if avg_score else 0

        # Get last 10 quiz attempts for the user
        last_10_attempts = Scores.query.filter_by(user_id=user_id) \
            .order_by(Scores.date_of_quiz.desc()) \
            .limit(10).all()

        # Fetch all quiz IDs in last 10 attempts
        quiz_ids = [attempt.quiz_id for attempt in last_10_attempts]

        # Fetch all quizzes in one query
        quizzes = {quiz.id: quiz for quiz in Quiz.query.filter(Quiz.id.in_(quiz_ids)).all()}

        # Fetch total marks per quiz using Question table
        quiz_total_marks = {
            quiz_id: db.session.query(db.func.sum(Question.marks))
                    .filter(Question.quiz_id == quiz_id)
                    .scalar() or 0  # If no questions exist, default to 0
            for quiz_id in quiz_ids
        }

        # Extract attempt details
        attempt_details = [{
            "attempt_id": attempt.id,
            "quiz_name": quizzes[attempt.quiz_id].name,
            "score": attempt.score,
            "total_marks": quiz_total_marks.get(attempt.quiz_id, 0),  # Fetch computed total marks
            "date_of_attempt": attempt.date_of_quiz
        } for attempt in last_10_attempts]

        total_score = sum(attempt["score"] for attempt in attempt_details)
        total_marks = sum(attempt["total_marks"] for attempt in attempt_details)

        avg_score = round(total_score / total_marks * 100, 2) if total_marks else 0


        return {
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.roles[0].name if user.roles else "User",
            "dob": user.dob,
            "total_attempts": total_attempts,
            "average_score": avg_score,
            "last_attempts": attempt_details
        }, 200

class PaymentApi(Resource):
    @auth_required('token')
    @roles_required('user')
    def post(self):
        data = request.get_json()
        user_id = current_user.id
        quiz_id = data.get('quiz_id')
        amount = data.get('amount')
        payment_method = data.get('payment_method')

        if not payment_method:
            return {"message": "Payment method required", "success": False}, 400  # ✅ Returning a dict

        # Check if payment already exists
        existing_payment = Payment.query.filter_by(user_id=user_id, quiz_id=quiz_id, status="Completed").first()
        if existing_payment:
            return {"message": "Quiz already purchased", "success": False}, 400  # ✅ Returning a dict

        # Simulate payment processing
        new_payment = Payment(user_id=user_id, quiz_id=quiz_id, amount=amount, status="Completed", payment_method=payment_method)
        db.session.add(new_payment)
        db.session.commit()

        return {"message": "Payment successful", "success": True}, 200  # ✅ Returning a dict
    
class UserTransactionsApi(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self):
        user_id = current_user.id

        # Fetch transactions of the logged-in user
        transactions = Payment.query.filter_by(user_id=user_id).all()

        # Convert transactions to JSON format
        transactions_list = []
        for transaction in transactions:
            transactions_list.append({
                "id": transaction.id,
                "quiz_id": transaction.quiz_id,
                "quiz_name": transaction.quiz.name,  # Fetching quiz name from related Quiz model
                "amount": transaction.amount,
                "payment_method": transaction.payment_method,
                "status": transaction.status,
                "timestamp": transaction.payment_date.strftime("%Y-%m-%d")
            })

        return jsonify(transactions_list)

class AdminTransactionsApi(Resource):
    @auth_required('token')
    @roles_accepted('admin')
    def get(self):
        transactions = Payment.query.all()
        transactions_list = [
            {
                "id": t.id,
                "user_name": t.user.name,  
                "quiz_name": t.quiz.name,  
                "amount": t.amount,
                "payment_method": t.payment_method,
                "status": t.status,
                "timestamp": t.payment_date.strftime("%Y-%m-%d") 
            }
            for t in transactions
        ]
        return jsonify(transactions_list)



# ===== Resource Registration =====
api.add_resource(SubjectApi, '/api/subject', '/api/subject/<int:id>')
api.add_resource(ChapterApi, '/api/subject/<int:subject_id>/chapters', '/api/chapter/<int:id>')
api.add_resource(QuizApi, '/api/chapter/<int:chapter_id>/quizzes', '/api/quiz/<int:id>')
api.add_resource(getQuizApi, '/api/quizzes/quiz/<int:quiz_id>')
api.add_resource(QuestionApi, '/api/quiz/<int:quiz_id>/questions', '/api/question/<int:id>')
api.add_resource(ScoresApi, '/api/quiz/<int:quiz_id>/scores', '/api/user/scores', '/api/score', '/api/score/<int:score_id>')
api.add_resource(AttemptQuizApi, '/api/attempt-quiz', '/api/attempt-quiz/<int:quiz_id>')
api.add_resource(ResultsApi, '/api/results/<int:attempt_id>')
api.add_resource(PastAttemptsApi, '/api/past-attempts')
api.add_resource(UserSummaryApi, '/api/summary')
api.add_resource(AdminSummaryApi, "/api/admin-summary")
api.add_resource(AdminUsersApi, "/api/admin/users")
api.add_resource(UserDetailApi, "/api/admin/user/<int:user_id>")
api.add_resource(PaymentApi, '/api/payments')
api.add_resource(UserTransactionsApi, "/api/user/transactions")
api.add_resource(AdminTransactionsApi, "/api/admin/transactions")


# class AttemptResultsApi(Resource):
#     @auth_required('token')
#     @roles_required('user')
#     def get(self, quiz_id):
#         """Retrieve quiz results for the logged-in user"""
#         user_id = current_user.id  # Get logged-in user ID

#         # Fetch the user's score record for the given quiz
#         score_record = Scores.query.filter_by(user_id=user_id, quiz_id=quiz_id).first()
#         if not score_record:
#             return {'message': 'No attempt found for this quiz'}, 404

#         # Fetch the quiz and related questions
#         quiz = Quiz.query.get(quiz_id)
#         if not quiz:
#             return {'message': 'Quiz not found'}, 404

#         questions = Question.query.filter_by(quiz_id=quiz_id).all()
#         correct_answers = {q.id: q.correct_option for q in questions}
#         explanations = {q.id: q.explanation for q in questions}

#         # Fetch user's submitted answers from the request payload
#         user_answers = request.args.get('user_answers')
#         if not user_answers:
#             return {'message': 'User answers missing'}, 400

#         user_answers = json.loads(user_answers)  # Convert JSON string to dictionary

#         # Prepare feedback for each question
#         feedback = []
#         for q in questions:
#             q_feedback = {
#                 'question_id': q.id,
#                 'question': q.question,
#                 'options': [q.option1, q.option2, q.option3, q.option4],
#                 'chosen_option': user_answers.get(str(q.id), None),
#                 'correct_option': correct_answers[q.id],
#                 'is_correct': user_answers.get(str(q.id)) == correct_answers[q.id],
#                 'explanation': explanations[q.id]
#             }
#             feedback.append(q_feedback)

#         return {
#             'quiz_id': quiz_id,
#             'quiz_name': quiz.name,
#             'score': score_record.score,
#             'total_marks': sum(q.marks for q in questions),
#             'date_of_attempt': score_record.date_of_quiz,
#             'duration_taken': score_record.duration,
#             'feedback': feedback
#         }, 200

# class UserResponseApi(Resource):
# api.add_resource(AttemptResultsApi, "/api/quiz-results/<int:quiz_id>")
# api.add_resource(UserResponseApi, '/api/user-response')

#     @auth_required('token')
#     @roles_required('user')
#     def post(self):
#         args = parser.parse_args()
        
#         user_response = UserResponse(
#             user_id=current_user.id,
#             question_id=args['question_id'],
#             attempt_id=args['attempt_id'],
#             selected_option=args['selected_option'],
#             is_correct=args['is_correct'],
#             score=args['score'],
#             total_score=args['total_score'],
#             duration=args['duration'],
#             date_of_quiz=args['date_of_quiz']
#         )

#         db.session.add(user_response)
#         db.session.commit()

#         return {'message': 'User response recorded successfully'}, 201



# class AttemptQuizApi(Resource):
#     @auth_required('token')
#     @roles_accepted('admin', 'user')
#     def get(self, quiz_id, attempt_id=None):
#         """
#         Retrieve quiz attempts.
#         - Admin can view all attempts for a quiz.
#         - Users can view their own attempts.
#         """
#         if 'admin' in [role.name for role in current_user.roles]:
#             if attempt_id:
#                 attempt = Scores.query.filter_by(id=attempt_id, quiz_id=quiz_id).first()
#             else:
#                 attempt = Scores.query.filter_by(quiz_id=quiz_id).all()
#         else:
#             if attempt_id:
#                 attempt = Scores.query.filter_by(user_id=current_user.id, id=attempt_id, quiz_id=quiz_id).first()
#             else:
#                 attempt = Scores.query.filter_by(user_id=current_user.id, quiz_id=quiz_id).all()

#         if not attempt:
#             return {'message': 'No attempts found'}, 404

#         if isinstance(attempt, list):
#             result = [{
#                 'attempt_id': a.id,
#                 'user_id': a.user_id,
#                 'quiz_id': a.quiz_id,
#                 'score': a.score,
#                 'date_of_quiz': a.date_of_quiz,
#                 'duration': a.duration,
#                 'time_stamp': a.time_stamp
#             } for a in attempt]
#         else:
#             result = {
#                 'attempt_id': attempt.id,
#                 'user_id': attempt.user_id,
#                 'quiz_id': attempt.quiz_id,
#                 'score': attempt.score,
#                 'date_of_quiz': attempt.date_of_quiz,
#                 'duration': attempt.duration,
#                 'time_stamp': attempt.time_stamp
#             }

#         return jsonify(result)
    
#     @auth_required('token')
#     @roles_accepted('user')
#     def post(self, quiz_id):
#         """
#         Endpoint for a user to attempt a quiz.
#         Records responses and calculates scores.
#         """
#         args = request.get_json()
#         quiz = Quiz.query.get(quiz_id)
#         if not quiz:
#             return {'message': 'Quiz not found'}, 404

#         # Convert single_attempt from string to boolean
#         is_single_attempt = quiz.single_attempt.lower() == 'yes'

#         # Check if user has already attempted the quiz
#         if is_single_attempt:
#             existing_attempt = Scores.query.filter_by(user_id=current_user.id, quiz_id=quiz_id).first()
#             if existing_attempt:
#                 return {'message': 'You have already attempted this quiz'}, 403

#         total_score = 0
#         max_score = 0
#         start_time = datetime.utcnow()

#         # Record score first
#         new_attempt = Scores(
#             user_id=current_user.id,
#             quiz_id=quiz_id,
#             score=0,  # Will be updated later
#             duration=0,  # Will be calculated later
#             time_stamp=datetime.utcnow(),
#             date_of_quiz=datetime.utcnow().date()
#         )
#         db.session.add(new_attempt)
#         db.session.commit()

#         for response in args.get('responses', []):
#             question = Question.query.get(response.get('question_id'))
#             if not question:
#                 return {'message': f"Question ID {response.get('question_id')} not found"}, 404

#             selected_option = response.get('selected_option')
#             is_correct = selected_option is not None and int(selected_option) == question.correct_option

#             user_response = UserResponse(
#                 user_id=current_user.id,
#                 quiz_id=quiz_id,
#                 question_id=question.id,
#                 selected_option=selected_option,
#                 is_correct=is_correct,
#                 score=question.marks if is_correct else 0,
#                 total_score=total_score + (question.marks if is_correct else 0),
#                 duration=0,  # Updated later
#                 date_of_quiz=datetime.utcnow().date(),
#                 attempt_id=new_attempt.id  # Link attempt_id to Scores entry
#             )
#             db.session.add(user_response)

#             if is_correct:
#                 total_score += question.marks
#             max_score += question.marks

#         db.session.commit()

#         end_time = datetime.utcnow()
#         duration = (end_time - start_time).seconds

#         # Update score entry
#         new_attempt.score = total_score
#         new_attempt.duration = duration
#         db.session.commit()

#         return {
#             'message': 'Quiz attempt recorded successfully',
#             'attempt_id': new_attempt.id,
#             'total_score': total_score,
#             'max_score': max_score,
#             'duration': duration
#         }, 201

