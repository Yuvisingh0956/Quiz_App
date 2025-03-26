# from flask_sqlalchemy import SQLAlchemy
from .database import db
from flask_security import UserMixin, RoleMixin
from datetime import datetime

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    name = db.Column(db.String(100))#, nullable=False)
    qualification = db.Column(db.String(200))#, nullable=False)
    dob = db.Column(db.String(20))#, nullable=False)
    fs_uniquifier = db.Column(db.String(255))#, unique=True, nullable=False)
    active  = db.Column(db.Boolean())#, nullable=False, default=True)
    roles = db.relationship('Role', secondary='users_roles', backref = 'bearer')
    # quizzes = db.relationship('Quiz', backref='taker')

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(200), nullable=False)

class UserRoles(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id', ondelete='CASCADE'))

users_roles = db.Table(
    "users_roles",
    db.Column("user_id", db.Integer, db.ForeignKey("user.id"), primary_key=True),
    db.Column("role_id", db.Integer, db.ForeignKey("role.id"), primary_key=True)
)

class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100),unique = True, nullable=False)
    description = db.Column(db.String(200), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description
        }

class Chapter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique = True, nullable=False)
    description = db.Column(db.String(200), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)

class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id'), nullable=False)
    name = db.Column(db.String(100), unique = True, nullable=False)
    start_date = db.Column(db.String(20), nullable=False)
    time_duration = db.Column(db.Integer, nullable=False)
    single_attempt = db.Column(db.String, nullable=False, default='No')
    type_of_quiz = db.Column(db.String(20), nullable=False, default='Free')
    end_date = db.Column(db.String(20))
    price = db.Column(db.Integer, nullable=False, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'start_date': self.start_date,
            'time_duration': self.time_duration,
            'single_attempt': self.single_attempt,
            'type_of_quiz': self.type_of_quiz,
            'end_date': self.end_date,
            'price': self.price,
            'chapter_id': self.chapter_id
        }

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    question = db.Column(db.String(200), nullable=False)
    option1 = db.Column(db.String(100), nullable=False)
    option2 = db.Column(db.String(100), nullable=False)
    option3 = db.Column(db.String(100), nullable=False)
    option4 = db.Column(db.String(100), nullable=False)
    correct_option = db.Column(db.Integer, nullable=False)
    explanation = db.Column(db.String(200), nullable=False)
    marks = db.Column(db.Integer, nullable=False, default=1)

class Scores(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    time_stamp = db.Column(db.String(20), nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    score = db.Column(db.Integer, nullable=False)
    date_of_quiz = db.Column(db.String(20), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'quiz_id': self.quiz_id,
            'time_stamp': self.time_stamp,
            'duration': self.duration,
            'score': self.score,
            'date_of_quiz': self.date_of_quiz
        }
    
class UserResponse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    attempt_id = db.Column(db.Integer, db.ForeignKey('scores.id'), nullable=False)
    selected_option = db.Column(db.Integer, nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False)
    attempt_score = db.Column(db.Integer, nullable=False)
    question_score = db.Column(db.Integer, nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    date_of_quiz = db.Column(db.String(20), nullable=False)
    

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="Pending")  # Pending, Completed, Failed
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    payment_method = db.Column(db.String(20), nullable=False)  # Credit Card, Debit Card, Net Banking, UPI, Wallet

    user = db.relationship('User', backref=db.backref('payments', lazy=True))
    quiz = db.relationship('Quiz', backref=db.backref('payments', lazy=True))

# class UserQuizAttempt(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
#     quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
#     total_score = db.Column(db.Integer, nullable=False, default=0)  # Total score obtained
#     max_score = db.Column(db.Integer, nullable=False, default=0)  # Maximum possible score
#     duration = db.Column(db.Integer, nullable=False)  # Time taken (in seconds)
#     timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())  # Attempt timestamp

#     user = db.relationship('User', backref='quiz_attempts')
#     quiz = db.relationship('Quiz', backref='quiz_attempts')

#     def to_dict(self):
#         return {
#             'id': self.id,
#             'user_id': self.user_id,
#             'quiz_id': self.quiz_id,
#             'total_score': self.total_score,
#             'max_score': self.max_score,
#             'duration': self.duration,
#             'timestamp': self.timestamp
#         }


# class UserResponse(db.Model):
    # id = db.Column(db.Integer, primary_key=True)
    # user_attempt_id = db.Column(db.Integer, db.ForeignKey('user_quiz_attempt.id'), nullable=False)
    # question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    # selected_option = db.Column(db.Integer, nullable=False)  # Stores user's selected option
    # is_correct = db.Column(db.Boolean, nullable=False)  # True if selected_option matches correct_option
    # score = db.Column(db.Integer, nullable=False, default=0)  # Score for this question
    # timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

    # user_attempt = db.relationship('UserQuizAttempt', backref='responses')
    # question = db.relationship('Question', backref='responses')

    # def to_dict(self):
    #     return {
    #         'id': self.id,
    #         'user_attempt_id': self.user_attempt_id,
    #         'question_id': self.question_id,
    #         'selected_option': self.selected_option,
    #         'is_correct': self.is_correct,
    #         'score': self.score,
    #         'timestamp': self.timestamp
    #     }
# from flask_sqlalchemy import SQLAlchemy
