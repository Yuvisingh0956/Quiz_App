class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = True

class LocalDevelopmentConfig(Config):
    # Configuration
    SQLALCHEMY_DATABASE_URI = 'sqlite:///quma.sqlite3'
    DEBUG = True

    # config for security
    SECRET_KEY = "1234567890" # hash user creds in session
    SECURITY_PASSWORD_HASH = "bcrypt" # mechanism for hashing password
    SECURITY_PASSWORD_SALT = "1234567890" # salt for hashing password
    WTF_CSRF_ENABLED = False
    # SECURITY_CSRF_PROTECT = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"
    # SECURITY_TOKEN_MAX_AGE = 300  # 5 minutes