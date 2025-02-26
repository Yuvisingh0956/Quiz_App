from flask import current_app as app, jsonify, request
from flask_security import hash_password ,auth_required, roles_required, current_user
from .database import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_security.decorators import unauth_csrf

@app.route('/', methods = ['GET'])
def home():
    return "<h1>This is my home page</h1>"

@app.route('/api/admin')
@auth_required('token') #Authentication
@roles_required('admin') # Authorization / RBAC
def admin_home():
    return jsonify({
        'message': 'Welcome to the admin dashboard'
    })

@app.route('/api/home')
@auth_required('token') #Authentication
@roles_required('user') # Authorization
def user_home():
    user = current_user
    return jsonify({
        "username": user.username,
        "email": user.email,
        "password": user.password
    })

@app.route('/api/login', methods = ['POST'])
# @unauth_csrf
def login():
    credentials = request.get_json()
    if not credentials['email']:
        return jsonify({
            'message': 'Email is required'
        }), 400
    user = app.security.datastore.find_user(email = credentials['email'])
    
    if user:
        if check_password_hash(user.password, credentials['password']):
            return jsonify({
                'message': 'Login successful',
                'auth_token': user.get_auth_token(),
                # 'token': app.security.generate_token(user),
                'welcome message' : 'Welcome ' + user.username
            })
        else:
            return jsonify({
                'message': 'Invalid password'
            }), 401
    
    else:
        return jsonify({
            "message": "User not found"
        }), 400

@app.route('/api/register', methods = ['POST'])
def create_user():
    credentials = request.get_json()
    if not app.security.datastore.find_user(email = credentials['email']):
        app.security.datastore.create_user(
            email = credentials['email'],
            username = credentials['username'],
            password = hash_password(credentials['password']),
            roles = ['user']
        )
        db.session.commit()
        return jsonify({
            'message': 'User created successfully'
        }), 201
    
    else:
        return jsonify({
            'message': 'User already exists'
        }), 400