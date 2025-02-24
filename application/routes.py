from flask import current_app as app
from flask_security import auth_required

@app.route('/admin')
@auth_required('token')
def admin_home():
    return "<h1>This is admin</h1>"