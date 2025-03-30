from flask import Flask
from application.database import db
from application.models import User, Role
from application.config import LocalDevelopmentConfig
from flask_security import Security, SQLAlchemyUserDatastore
from werkzeug.security import generate_password_hash
from application.celery_init import celery_init_app
from celery.schedules import crontab
from application.task import monthly_report, daily_report
from flask_caching import Cache

def create_app():
    app = Flask(__name__, template_folder='templates')
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    cache = Cache(app)
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.cache = cache
    app.security = Security(app, datastore)
    app.app_context().push()

    from application.resources import api
    api.init_app(app)

    return app

app = create_app()
celery = celery_init_app(app)
celery.autodiscover_tasks()


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
            password = generate_password_hash("admin"),
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
            password = generate_password_hash("user"),
            name = "Amit",
            qualification = "B.Tech",
            dob = "1998-01-01",
            active = True,
            roles = ['user']
        )
        
    db.session.commit()

from application.routes import *

@celery.on_after_finalize.connect
def setup_periodic_tasks(sender, ** kwargs):
    sender.add_periodic_task(
        # crontab(hour=7, minute=30, day_of_week=1),
        crontab(minute="*/1"), # every 1 minute
        # crontab(0,0, day_of_month='1'), # 1st day of every month
        monthly_report.s(),
    )
    sender.add_periodic_task(
        crontab(hour=21, minute=40), 
        # crontab(minute="*/1"),
        daily_report.s(),
    )

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
