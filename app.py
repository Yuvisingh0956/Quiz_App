from flask import Flask
from application.database import db
from application.models import User, Role
from application.config import LocalDevelopmentConfig
from flask_security import Security, SQLAlchemyUserDatastore, hash_password

def create_app():
    app = Flask(__name__, template_folder='templates')
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore)
    app.app_context().push()
    return app

app = create_app()

with app.app_context():
    db.create_all()

    # app.security.datastore.find_or_create_role = Role.query.filter_by(name='admin').first()
    app.security.datastore.find_or_create_role(name='admin', description='Super user of app')
    app.security.datastore.find_or_create_role(name='user', description='general user of app')
    db.session.commit()

    if not app.security.datastore.find_user(email = "user@admin.com"):
        app.security.datastore.create_user(
            email = "user@admin.com",
            username = "admin1",
            password = hash_password("admin"),
            name = "Admin",
            qualification = "B.Tech",
            dob = "1998-01-01",
            active = True,
            roles = ['admin']
        )

    if not app.security.datastore.find_user(email = "user1@user.com"):
        app.security.datastore.create_user(
            email = "user1@user.com",
            username = "user1",
            password = hash_password("user"),
            name = "Amit",
            qualification = "B.Tech",
            dob = "1998-01-01",
            active = True,
            roles = ['user']
        )
        
    db.session.commit()

# hashed_password = bycrypt(password,salt)

from application.routes import *

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
