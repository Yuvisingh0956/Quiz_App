from flask_restful import Resource, Api, reqparse
from .models import *
from flask_security import auth_required, roles_required, current_user,roles_accepted, current_user

api = Api()

def roles_list(roles):
    return [role.name for role in roles]

parser = reqparse.RequestParser()
parser.add_argument('name', type=str, help='Name of the subject')
parser.add_argument('description', type=str, help='Description of the subject')

class SubjectApi(Resource):
    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self):
        subjects = Subject.query.all()
        return [subject.to_dict() for subject in subjects]
    
    @auth_required('token')
    @roles_required('admin')
    def post(self):
        args = parser.parse_args()
        try:
            subject = Subject(name=args['name'], description=args['description'])
            db.session.add( subject )
            db.session.commit()

            return{
                'message': 'Subject created successfully',
                'subject': subject.to_dict()
            }
        except:
            return {'message': 'One or more required fields are missing.'}, 400

    @auth_required('token')
    @roles_required('admin')
    def put(self, id):
        args = parser.parse_args()
        subject = Subject.query.get(id)
        if not subject:
            return {'message': 'Subject not found'}, 404
        subject.name = args['name']
        subject.description = args['description']
        db.session.commit()
        return {'message': 'Subject updated successfully'}, 200
    
    @auth_required('token')
    @roles_required('admin')
    def delete(self, id):
        subject = Subject.query.get(id)
        if not subject:
            return {'message': 'Subject not found'}, 404
        db.session.delete(subject)
        db.session.commit()
        return {'message': 'Subject deleted successfully'}, 200
    
api.add_resource(SubjectApi, '/api/subjects', '/api/create_subject', '/api/update_subject/<int:id>', '/api/delete_subject/<int:id>')