from flask import Flask
from backend.auth import init_auth
from flask_cors import CORS
from backend.models import db, User, Profile, Post
from auth import auth
from flask_restful import Api, Resource, reqparse
from dotenv import load_dotenv
import os
from werkzeug.security import generate_password_hash
from flask_migrate import Migrate


# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY')

# Initialize authentication
init_auth(app)


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

# Configure CORS. This allows all origins. For development only!
CORS(app, support_credentials=True,origins=["http://localhost:3000"])

@app.route('/')
def home():
    return 'Welcome to the Flask App!'


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
def add_post():
    if 'user_id' not in session:
        return jsonify({"message": "Authentication required"}), 401

    data = request.json
    song_recommendation = data.get('song_recommendation')
    description = data.get('description')
    if not song_recommendation:
        return jsonify({"message": "Song recommendation is required"}), 400

    new_post = Post(
        song_recommendation=song_recommendation,
        description=description,
        user_id=session['user_id']
    )
    db.session.add(new_post)
    db.session.commit()
    return jsonify({"message": "Post added successfully"}), 201

@app.route('/post/<int:post_id>', methods=['DELETE'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def delete_post(post_id):
    if 'user_id' not in session:
        return jsonify({"message": "Authentication required"}), 401

    post = Post.query.get_or_404(post_id)
    if post.user_id != session['user_id']:
        return jsonify({"message": "Unauthorized"}), 403

    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": "Post deleted successfully"}), 200

if __name__ == '__main__':
     app.run()