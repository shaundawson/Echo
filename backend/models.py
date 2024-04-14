from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Initialize SQLAlchemy db object
db = SQLAlchemy()

followers = db.Table('followers',
    db.Column('follower_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('followed_id', db.Integer, db.ForeignKey('user.id'), primary_key=True)
)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    profile = db.relationship('Profile', backref='user', uselist=False)
    playlists = db.relationship('Playlist', backref='user', lazy=True)
    posts = db.relationship('Post', backref='user', lazy=True)
    followed = db.relationship(
        'User', secondary=followers,
        primaryjoin=(followers.c.follower_id == id),
        secondaryjoin=(followers.c.followed_id == id),
        backref=db.backref('followers', lazy='dynamic'), lazy='dynamic')
    spotify_access_token = db.Column(db.String(255))  # Store Spotify access token
    spotify_refresh_token = db.Column(db.String(255))  # Store Spotify refresh token
    spotify_token_expiration = db.Column(db.DateTime)  # Store expiration time of the access token
    
    def follow(self, user):
        if not self.is_following(user):
            self.followed.append(user)

    def unfollow(self, user):
        if self.is_following(user):
            self.followed.remove(user)

    def is_following(self, user):
        return self.followed.filter(
            followers.c.followed_id == user.id).count() > 0
        
    def following_count(self):
        return self.followed.count()

    def followers_count(self):
        return self.followers.count()
    
class Profile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    bio = db.Column(db.String(255))
    profile_image = db.Column(db.String(255))
    
    
class Playlist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    songs = db.relationship('Song', backref='playlist', lazy=True)
    song_id = db.Column(db.Integer, db.ForeignKey('song.id'), nullable=False)


class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    song_recommendation = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)



class Artist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    albums = db.relationship('Album', backref='artist', lazy=True)


class Album(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    album_name = db.Column(db.String(100), nullable=False)
    artist_id = db.Column(db.Integer, db.ForeignKey(
        'artist.id'), nullable=False)
    songs = db.relationship('Song', backref='album', lazy=True)


class Song(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    artist = db.Column(db.String(100), nullable=False)
    length = db.Column(db.Integer, nullable=False)
    album_cover = db.Column(db.String(255))  # Assuming the image path
    genre = db.Column(db.String(100), nullable=False)
    album_id = db.Column(db.Integer, db.ForeignKey('album.id'), nullable=False)