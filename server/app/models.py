from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db


class User(db.Model):
    """User model for authentication"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    missing_persons = db.relationship('MissingPerson', backref='reporter', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verify password"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'phone': self.phone,
            'created_at': self.created_at.isoformat()
        }


class MissingPerson(db.Model):
    """Missing person model"""
    __tablename__ = 'missing_persons'
    
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(200), nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(20))
    height = db.Column(db.String(50))
    weight = db.Column(db.String(50))
    hair_color = db.Column(db.String(50))
    eye_color = db.Column(db.String(50))
    last_seen_location = db.Column(db.String(500))
    last_seen_date = db.Column(db.DateTime)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='missing')  # missing, found, closed
    
    # Reporter information
    reporter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    photos = db.relationship('Photo', backref='missing_person', lazy=True, cascade='all, delete-orphan')
    relatives = db.relationship('Relative', backref='missing_person', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'full_name': self.full_name,
            'age': self.age,
            'gender': self.gender,
            'height': self.height,
            'weight': self.weight,
            'hair_color': self.hair_color,
            'eye_color': self.eye_color,
            'last_seen_location': self.last_seen_location,
            'last_seen_date': self.last_seen_date.isoformat() if self.last_seen_date else None,
            'description': self.description,
            'status': self.status,
            'reporter': self.reporter.to_dict() if self.reporter else None,
            'photos': [photo.to_dict() for photo in self.photos],
            'relatives': [relative.to_dict() for relative in self.relatives],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Photo(db.Model):
    """Photo model for missing person images"""
    __tablename__ = 'photos'
    
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(500), nullable=False)
    missing_person_id = db.Column(db.Integer, db.ForeignKey('missing_persons.id'), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'filename': self.filename,
            'url': f'/api/uploads/{self.filename}',
            'uploaded_at': self.uploaded_at.isoformat()
        }


class Relative(db.Model):
    """Relative model for missing person contacts"""
    __tablename__ = 'relatives'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    relationship = db.Column(db.String(100))  # mother, father, sibling, etc.
    phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    address = db.Column(db.String(500))
    missing_person_id = db.Column(db.Integer, db.ForeignKey('missing_persons.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'relationship': self.relationship,
            'phone': self.phone,
            'email': self.email,
            'address': self.address,
            'created_at': self.created_at.isoformat()
        }