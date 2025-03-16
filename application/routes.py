from flask import current_app as app, jsonify, request, render_template
from flask_security import auth_required, roles_required, current_user, login_user, logout_user, login_required, roles_accepted
from werkzeug.security import check_password_hash, generate_password_hash
from .database import db
from datetime import datetime
import jwt, os
import sqlite3
from .models import *


@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

# @app.route('/api/subjects', methods=['GET'])
# def get_subjects():
#     try:
#         instance_folder = "instance"  # Name of your instance folder
#         database_file = "quma.sqlite3"
#         database_path = os.path.join(instance_folder, database_file)

#         conn = sqlite3.connect(database_path)
#         cursor = conn.cursor()
#         cursor.execute('SELECT name, description FROM subject')
#         subjects = [{'name': row[0], 'description': row[1]} for row in cursor.fetchall()]
#         conn.close()
#         return jsonify(subjects)
#         # subjects = Subject.query.all()
#         # return jsonify [subject.to_dict() for subject in subjects]
        
#     except sqlite3.Error as e:
#         return jsonify({'error': str(e)}), 500 

@app.route('/api/admin')
@auth_required('token')
@roles_required('admin')
def admin_home():
    return jsonify({'message': 'Welcome to the admin dashboard'})

@app.route('/api/home')
@auth_required('token')
@roles_required('user')
def user_home():
    user = current_user
    return jsonify({
        "username": user.username,
        "email": user.email,
        "password": user.password
    })

# @app.route('/api/login', methods=['POST'])
# def login():
#     credentials = request.get_json()

#     if not credentials:
#         return jsonify({'message': 'Email and password are required'}), 400
#     if 'email' not in credentials or 'password' not in credentials:
#         return jsonify({'message': 'Email and password are required'}), 400

#     user = app.security.datastore.find_user(email=credentials['email'])
    
#     if user and check_password_hash(user.password, credentials['password']):
#         # Handle if already logged in (optional check — you can remove this if not needed)
#         if current_user.is_authenticated:
#             return jsonify({'message': 'User already logged in'}), 400
        
#         login_user(user)  # Establish session (useful if you want hybrid auth - token + session)

#         # Generate token (you may need to customize this to match your actual token logic)
#         auth_token = user.get_auth_token()

#         return jsonify({
#             'message': 'Login successful',
#             'id' : user.id,
#             'username' : user.username,
#             'auth_token': auth_token,
#             'role': user.roles[0].name,
#             'welcome_message': f'Welcome {user.username}'
#         })

#     return jsonify({'message': 'Invalid email or password'}), 401

@app.route('/api/login', methods=['POST'])
def login():
    credentials = request.get_json()

    if not credentials or 'email' not in credentials or 'password' not in credentials:
        return jsonify({'message': 'Email and password are required'}), 400

    user = app.security.datastore.find_user(email=credentials['email'])
    
    if user and check_password_hash(user.password, credentials['password']):
        # Generate token
        token = user.get_auth_token()

        return jsonify({
            'message': 'Login successful',
            'id': user.id,
            'username': user.username,
            'auth_token': token,
            'role': user.roles[0].name,
            'welcome_message': f'Welcome {user.username}'
        })

    return jsonify({'message': 'Invalid email or password'}), 401

@app.route('/api/register', methods=['POST'])
def create_user():
    credentials = request.get_json()

    if not credentials or 'email' not in credentials or 'password' not in credentials or 'username' not in credentials:
        return jsonify({'message': 'Email, username, and password are required'}), 400

    # Only check for existing user if required fields are present
    if app.security.datastore.find_user(email=credentials['email']):
        return jsonify({'message': 'User already exists'}), 400

    app.security.datastore.create_user(
        email=credentials['email'],
        username=credentials['username'],
        password=generate_password_hash(credentials['password']),
        roles=['user']
    )
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201

# @app.route('/api/logout', methods=['POST'])
# @auth_required('token')
# def logout():
#     logout_user()

#     # Construct response
#     response = make_response(jsonify({'message': 'Logout successful'}))

#     # Clear session and remember_token cookies for all relevant paths
#     cookie_paths = ['/', '/api']
#     for path in cookie_paths:
#         response.set_cookie('session', '', expires=0, path=path)
#         response.set_cookie('remember_token', '', expires=0, path=path)

#     # Optional: handle domain-level cookies (use if deploying on a subdomain setup)
#     response.set_cookie('session', '', expires=0, path='/', domain=None, secure=False, httponly=True)
#     response.set_cookie('remember_token', '', expires=0, path='/', domain=None, secure=False, httponly=True)

#     return response, 200

@app.route('/api/logout', methods=['POST'])
def logout():
    logout_user()  # This clears Flask-Login's session
    response = jsonify({'message': 'Successfully logged out'})
    
    # Clear the session cookie to be safe
    response.set_cookie('session', '', expires=0)

    return response



