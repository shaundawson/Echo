from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from backend.models import db, User, Profile
from dotenv import load_dotenv
from backend.services import login as login_service, register
import os
from flask_migrate import Migrate

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY') 
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('CLEARDB_DATABASE_URL').replace('mysql://', 'mysql+pymysql://')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SECURE'] = True  # True for prod, False for dev
app.config['REMEMBER_COOKIE_SECURE'] = True  # True for prod, False for dev
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_COOKIE_SECURE'] = False  # Set to True in production
app.config['JWT_COOKIE_CSRF_PROTECT'] = True
app.config['JWT_ACCESS_COOKIE_PATH'] = '/'
app.config['JWT_REFRESH_COOKIE_PATH'] = '/token/refresh'

jwt = JWTManager(app)
db.init_app(app)
migrate = Migrate(app, db)

# Configure CORS. This allows all origins. For development only!
CORS(app, support_credentials=True,origins=["http://localhost:3000"])

@app.cli.command('create_tables')
def create_tables():
    """Create database tables from SQLAlchemy models."""
    db.create_all()
    print('Tables created.')


@app.route('/')
def home():
    return 'Welcome to the Flask App!'


@app.route('/login', methods=['POST'])
def login():
    if request.method == 'POST':
        username = request.json.get('username', None)
        password = request.json.get('password', None)
        user, status_code = login_service(username, password)
        if user:
            access_token = create_access_token(identity=username)
            response = jsonify({"login": True, "user_id": user['user_id']})
            response.set_cookie('access_token_cookie', access_token)
            return response, 200
        else:
            return jsonify({"message": "Invalid username or password"}), status_code
    
@app.route('/logout', methods=['POST'])
def logout():
    response = jsonify({"logout": True})
    response.delete_cookie('access_token_cookie')
    return response


@app.route('/register', methods=['POST', 'GET'])
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
@jwt_required()  # Require authentication
def profile_route(user_id):
    current_user_username = get_jwt_identity()  # Get the username of the current user
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
@jwt_required()  # Require authentication
def follow_user(followed_id):
    current_user_username = get_jwt_identity()  # Get the username of the current user from JWT

    # Find the current user by their username instead of session
    current_user = User.query.filter_by(username=current_user_username).first()
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
@jwt_required()  # Require authentication
def unfollow_user(followed_id):
    current_user_username = get_jwt_identity()  # Get the username of the current user from JWT

    # Find the current user by their username instead of session
    current_user = User.query.filter_by(username=current_user_username).first()
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