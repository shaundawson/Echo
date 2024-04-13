import os
from datetime import timedelta

import redis
from flask import Flask, request, jsonify, session, redirect, url_for
from flask_session import Session
from uuid import uuid4
from models import db, User, Profile
from flask_restful import Api, Resource, reqparse
from dotenv import load_dotenv
from services import login, register
from werkzeug.security import generate_password_hash
from flask_migrate import Migrate
from flask_cors import CORS, cross_origin

# Load environment variables
load_dotenv()

# Create the Flask application
app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY')

# Initialize Redis client for session management
redis_url = os.environ.get('REDIS_URL')
redis_client = redis.Redis.from_url(redis_url)

# Configure Redis for storing the session data on the server-side
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_REDIS'] = redis_client

server_session = Session(app)

# Configure database
database_url = os.environ.get('CLEARDB_DATABASE_URL').replace('mysql://', 'mysql+pymysql://')
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
migrate = Migrate(app, db)

# Configure CORS
CORS(app, support_credentials=True, origins=["http://localhost:3000"])

def create_redis_session(user_id):
    """Create a unique session ID and store it in Redis."""
    session_id = str(uuid4())
    redis_client.set(session_id, user_id, ex=3600)  # Expires in 3600 seconds = 1 hour
    return session_id

def get_redis_session_user_id(session_id):
    """Retrieve the user ID associated with the given session ID."""
    return redis_client.get(session_id)


@app.route('/login', methods=['GET','POST'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def login_route():
    username = request.json['username']
    password = request.json['password']
    user, status_code = login(username, password)
    if user:
        session_id = create_redis_session(user['user_id'])
        response = jsonify({"user_id": user['user_id']})
        print("Session ID created:", session_id)  # Log the session ID
        response.set_cookie('session_id', session_id, httponly=True, secure=True)  # Secure flag for HTTPS
        return response, 200
    else:
        return jsonify({"message": "Invalid username or password"}), status_code

@app.route('/logout', methods=['POST'])
def logout():
    session_id = request.cookies.get('session_id')
    if session_id:
        redis_client.delete(session_id)
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/register', methods=['POST', 'GET'])
@cross_origin()
def register_route():
    if request.method == 'POST':
        data = request.json
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        bio = data.get('bio')  # Extract bio data from the request
        response, status_code = register(username, password, email, bio)
        return jsonify(response), status_code
    elif request.method == 'GET':
        return jsonify({"message": "GET method for registration is not supported."}), 405


@app.route('/profile/<int:user_id>', methods=['PUT', 'GET'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def profile_route(user_id):
    if request.method == 'PUT':
        if not request.is_json:
            return jsonify({"message": "Invalid request format, JSON required."}), 400

        data = request.get_json()
        bio = data.get('bio', None)  # Default to None if 'bio' not provided
        profile_image = data.get('profile_image', None)  # Same for 'profile_image'

        try:
            user = User.query.get(user_id)
            if not user:
                return jsonify({"message": "User not found"}), 404

            if not user.profile:
                user.profile = Profile(user_id=user_id)

            if bio is not None:
                user.profile.bio = bio
            if profile_image is not None:
                user.profile.profile_image = profile_image

            db.session.commit()
            return jsonify({"message": "Profile updated successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Internal server error"}), 500

    elif request.method == 'GET':
        try:
            user = User.query.get(user_id)
            if not user:
                return jsonify({"message": "User not found"}), 404

            if not user.profile:
                return jsonify({"message": "Profile not found for this user"}), 404

            profile_data = {
                'username': user.username,
                'bio': user.profile.bio,
                'profile_image': user.profile.profile_image
            }
            return jsonify(profile_data), 200
        except Exception as e:
            return jsonify({"message": "Internal server error"}), 500

    else:
        return jsonify({"message": "Method not allowed"}), 405

        
@app.route('/follow/<int:followed_id>', methods=['GET','POST','OPTIONS'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def follow_user(followed_id):
    print("Session Data:", session)
    if 'user_id' not in session:
        return jsonify({"message": "Authentication required."}), 401

    current_user_id = session['user_id']
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({"message": "Current user not found."}), 404

    user_to_follow = User.query.get(followed_id)
    if not user_to_follow:
        return jsonify({"message": "User to follow not found."}), 404
    
    if current_user.is_following(user_to_follow):
        return jsonify({"message": "Already following."}), 400
    
    current_user.follow(user_to_follow)
    db.session.commit()
    return jsonify({"message": "Now following."}), 200

@app.route('/unfollow/<int:followed_id>', methods=['POST'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def unfollow_user(followed_id):
    if 'user_id' not in session:
        return jsonify({"message": "Authentication required."}), 401

    current_user_id = session['user_id']
    current_user = User.query.get(current_user_id)
    if not current_user:
        return jsonify({"message": "Current user not found."}), 404

    user_to_unfollow = User.query.get(followed_id)
    if not user_to_unfollow:
        return jsonify({"message": "User to unfollow not found."}), 404
    
    if not current_user.is_following(user_to_unfollow):
        return jsonify({"message": "Not following this user."}), 400
    
    current_user.unfollow(user_to_unfollow)
    db.session.commit()
    return jsonify({"message": "Unfollowed."}), 200


if __name__ == '__main__':
     app.run()