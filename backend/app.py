from flask import Flask, request, jsonify, session
from flask_cors import CORS, cross_origin
from flask_session import Session  
from redis import Redis
from backend.models import db, User, Profile, Post
from dotenv import load_dotenv
from backend.services import login, register
import os
from werkzeug.security import generate_password_hash
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta


# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
# Configure CORS. This allows all origins. For development only!
CORS(app, support_credentials=True,origins=["http://localhost:3000"])


app.secret_key = os.environ.get('FLASK_SECRET_KEY')
app.config['SESSION_TYPE'] = 'redis'  # Use Redis for session storage
app.config['SESSION_REDIS'] = Redis.from_url(os.environ.get('REDIS_URL'))  # Configure Redis URL
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
app.config['SESSION_USE_SIGNER'] = True

app.config.from_object(__name__)
Session(app)  # Initialize session management

# Get the database URL from the environment variable
database_url = os.environ.get('CLEARDB_DATABASE_URL').replace('mysql://', 'mysql+pymysql://')

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SECURE'] = True # True for prod, False for dev
app.config['REMEMBER_COOKIE_SECURE'] = True # True for prod, False for dev

# Configure SQLAlchemy engine options
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_recycle': 299,  # Adjust with your requirements
    'pool_pre_ping': True
}

db.init_app(app)
migrate = Migrate(app, db)



@app.cli.command('create_tables')
def create_tables():
    """Create database tables from SQLAlchemy models."""
    db.create_all()
    print('Tables created.')


@app.route('/')
def home():
    return 'Welcome to Echo'


@app.route('/show-session', methods=['GET'])
def show_session():
    """Route to show session data for debugging."""
    session_data = dict(session)  # Convert session ImmutableDict to a regular dict
    return jsonify(session_data)


@app.route('/login', methods=['GET', 'POST', 'OPTIONS'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def login_route():
    if request.method == 'POST':
        username = request.json['username']
        password = request.json['password']
        user, status_code = login(username, password)
        if user:
            session['user_id'] = user['user_id']  # Store the user's ID in the session
            return jsonify({"user_id": user['user_id']}), 200
        else:
            return jsonify({"message": "Invalid username or password"}), status_code
    elif request.method == 'GET':
        return jsonify({"message": "GET method is not supported for /login."}), 405
    else:
        return '', 204
    
@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)  # Remove the user ID from the session
    return jsonify({"message": "You have been logged out."}), 200


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
    
    
@app.route('/post', methods=['POST'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def create_post():
    if 'user_id' not in session:
        return jsonify({"message": "Authentication required."}), 401

    user_id = session['user_id']
    data = request.get_json()
    song_recommendation = data.get('song_recommendation')
    description = data.get('description')

    try:
        post = Post(song_recommendation=song_recommendation, description=description, user_id=user_id)
        db.session.add(post)
        db.session.commit()
        return jsonify({"message": "Post created successfully", "post_id": post.id}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to create post", "error": str(e)}), 500
    
@app.route('/post/<int:post_id>', methods=['DELETE'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def delete_post(post_id):
    if 'user_id' not in session:
        return jsonify({"message": "Authentication required."}), 401

    user_id = session['user_id']
    post = Post.query.filter_by(id=post_id, user_id=user_id).first()

    if not post:
        return jsonify({"message": "Post not found or you do not have permission to delete this post"}), 404

    try:
        db.session.delete(post)
        db.session.commit()
        return jsonify({"message": "Post deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to delete post", "error": str(e)}), 500
    
@app.route('/feed', methods=['GET', 'POST', 'OPTIONS'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def get_feed():
    if 'user_id' not in session:
        return jsonify({"message": "Authentication required."}), 401
    user_id = session['user_id']
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    followed_users_ids = [u.id for u in user.followed.all()]
    posts = Post.query.filter(Post.user_id.in_(followed_users_ids)).all()

    feed = [{
        "id": post.id,
        "song_recommendation": post.song_recommendation,
        "description": post.description,
        "user_id": post.user_id
    } for post in posts]

    return jsonify(feed), 200

        
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