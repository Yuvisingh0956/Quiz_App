# from flask_sqlalchemy import SQLAlchemy
from .database import db
from flask_security import UserMixin, RoleMixin

class User(db.model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    qualification = db.Column(db.String(200), nullable=False)
    dob = db.Column(db.String(20), nullable=False)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    active  = db.Column(db.Boolean(), nullable=False, default=True)
    roles = db.relationship('Role', secondary='users_roles', backref = 'bearer')

class Role(db.model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(200), nullable=False)

class UserRoles(db.model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id', ondelete='CASCADE'))