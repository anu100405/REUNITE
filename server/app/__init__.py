from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app(config_name='development'):
    """Application factory"""
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    jwt.init_app(app)
    
    # Initialize configuration
    config[config_name].init_app(app)
    
    # Register blueprints
    from app.routes import auth_bp, missing_persons_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(missing_persons_bp, url_prefix='/api')
    
    return app