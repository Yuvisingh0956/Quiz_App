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

parser = reqparse.RequestParser()
parser.add_argument('quiz_id', type=int, required=True)
parser.add_argument('question_id', type=int, required=True)
parser.add_argument('selected_option', type=int, required=True)
parser.add_argument('is_correct', type=bool, required=True)
parser.add_argument('score', type=int, required=True)
parser.add_argument('total_score', type=int, required=True)
parser.add_argument('duration', type=int, required=True)
parser.add_argument('date_of_quiz', type=str, required=True)
parser.add_argument('attempt_id', type=int, required=True)

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
        return jsonify([quiz.to_dict() for quiz in quizzes])

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
    @roles_accepted('admin', 'user')
    def get(self, quiz_id, attempt_id=None):
        """
        Retrieve quiz attempts.
        - Admin can view all attempts for a quiz.
        - Users can view their own attempts.
        """
        if 'admin' in [role.name for role in current_user.roles]:
            if attempt_id:
                attempt = UserResponse.query.filter_by(quiz_id=quiz_id, attempt_id=attempt_id).all()
            else:
                attempt = UserResponse.query.filter_by(quiz_id=quiz_id).all()
        else:
            if attempt_id:
                attempt = UserResponse.query.filter_by(user_id=current_user.id, quiz_id=quiz_id, attempt_id=attempt_id).all()
            else:
                attempt = UserResponse.query.filter_by(user_id=current_user.id, quiz_id=quiz_id).all()

        if not attempt:
            return {'message': 'No attempts found'}, 404

        return jsonify([{
            'attempt_id': a.attempt_id,
            'user_id': a.user_id,
            'quiz_id': a.quiz_id,
            'question_id': a.question_id,
            'selected_option': a.selected_option,
            'is_correct': a.is_correct,
            'score': a.score,
            'date_of_quiz': a.date_of_quiz
        } for a in attempt])
    
    @auth_required('token')
    @roles_accepted('user')
    def post(self, quiz_id):
        """
        Endpoint for a user to attempt a quiz.
        Records responses and calculates scores.
        """
        args = request.get_json()
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {'message': 'Quiz not found'}, 404
        
        # Check if user has already attempted the quiz (if single_attempt is true)
        if quiz.single_attempt.lower() == 'yes':
            existing_attempt = UserQuizAttempt.query.filter_by(user_id=current_user.id, quiz_id=quiz_id).first()
            if existing_attempt:
                return {'message': 'You have already attempted this quiz'}, 403
        
        # Create a new attempt
        attempt = UserQuizAttempt(
            user_id=current_user.id,
            quiz_id=quiz_id,
            total_score=0,  # Will be updated later
            max_score=0,
            duration=0,
            timestamp=datetime.utcnow()
        )
        db.session.add(attempt)
        db.session.commit()
        
        total_score = 0
        max_score = 0
        start_time = datetime.utcnow()
        
        for response in args.get('responses', []):
            question = Question.query.get(response['question_id'])
            if not question:
                return {'message': f"Question ID {response['question_id']} not found"}, 404
            
            is_correct = (response['selected_option'] == int(question.correct_option))
            user_response = UserResponse(
                user_id=current_user.id,
                quiz_id=quiz_id,
                question_id=question.id,
                selected_option=response['selected_option'],
                is_correct=is_correct
            )
            db.session.add(user_response)
            
            if is_correct:
                total_score += question.marks
            max_score += question.marks
        
        end_time = datetime.utcnow()
        duration = (end_time - start_time).seconds
        
        # Update attempt details
        attempt.total_score = total_score
        attempt.max_score = max_score
        attempt.duration = duration
        db.session.commit()
        
        # Record score
        score_record = Scores(
            user_id=current_user.id,
            quiz_id=quiz_id,
            score=total_score,
            time_stamp=datetime.utcnow(),
            duration=duration,
            date_of_quiz=datetime.utcnow().date()
        )
        db.session.add(score_record)
        db.session.commit()
        
        return {
            'message': 'Quiz attempt recorded successfully',
            'attempt_id': attempt.id,
            'total_score': total_score,
            'max_score': max_score,
            'duration': duration
        }, 201

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


# ===== Resource Registration =====
api.add_resource(SubjectApi, '/api/subject', '/api/subject/<int:id>')
api.add_resource(ChapterApi, '/api/subject/<int:subject_id>/chapters', '/api/chapter/<int:id>')
api.add_resource(QuizApi, '/api/chapter/<int:chapter_id>/quizzes', '/api/quiz/<int:id>')
api.add_resource(getQuizApi, '/api/quizzes/quiz/<int:quiz_id>')
api.add_resource(QuestionApi, '/api/quiz/<int:quiz_id>/questions', '/api/question/<int:id>')
api.add_resource(ScoresApi, '/api/quiz/<int:quiz_id>/scores', '/api/user/scores', '/api/score', '/api/score/<int:score_id>')
api.add_resource(AttemptQuizApi, '/api/attempt-quiz', '/api/attempt-quiz/<int:quiz_id>', '/api/attempt-quiz/<int:quiz_id>/<int:attempt_id>')


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