from flask import current_app as app, jsonify
from flask_security import auth_required, roles_required, current_user

@app.route('/admin')
@auth_required('token') #Authentication
@roles_required('admin') # Authorization
def admin_home():
    return jsonify({
        'message': 'Welcome to the admin dashboard'
    })

@app.route('/user')
@auth_required('token') #Authentication
@roles_required('user') # Authorization
def user_home():
    user = current_user
    return jsonify({
        "username": user.username,
        "email": user.email,
        "password": user.password
    })