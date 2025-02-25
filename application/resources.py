from flask_restful import Resource, Api, reqparse
from .models import *
from flask_security import auth_required, roles_required, current_user,roles_accepted, current_user

api = Api()

def roles_list(roles):
    return [role.name for role in roles]

class SubjectApi(Resource):
    @auth_required('token')
    @roles_accepted('admin')
    def get(self):
        subjects = Subject.query.all()
        return [subject.to_dict() for subject in subjects]
    