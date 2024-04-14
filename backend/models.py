from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Initialize SQLAlchemy db object
db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    profile = db.relationship('Profile', backref='user', uselist=False)
    posts = db.relationship('Post', backref='user', lazy=True)
    spotify_access_token = db.Column(db.String(255))  # Store Spotify access token
    spotify_refresh_token = db.Column(db.String(255))  # Store Spotify refresh token
    spotify_token_expiration = db.Column(db.DateTime)  # Store expiration time of the access token
    
class Profile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    bio = db.Column(db.String(255))
    
class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    song_recommendation = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

