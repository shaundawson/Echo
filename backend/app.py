from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from backend.models import db, User, Profile
from dotenv import load_dotenv
from backend.services import login, get_profile, update_profile, register
import os
from werkzeug.security import generate_password_hash
from flask_migrate import Migrate

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Get the database URL from the environment variable
database_url = os.environ.get('CLEARDB_DATABASE_URL').replace('mysql://', 'mysql+pymysql://')

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure SQLAlchemy engine options
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_recycle': 299,  # Adjust with your requirements
    'pool_pre_ping': True
}

db.init_app(app)
migrate = Migrate(app, db)

# Configure CORS. This allows all origins. For development only!
CORS(app, support_credentials=True)

@app.cli.command('create_tables')
def create_tables():
    """Create database tables from SQLAlchemy models."""
    db.create_all()
    print('Tables created.')


@app.route('/')
def home():
    return 'Welcome to the Flask App!'


@app.route('/login', methods=['GET', 'POST', 'OPTIONS'])
@cross_origin(supports_credentials=True)
def login_route():
    if request.method == 'POST':
        username = request.json['username']
        password = request.json['password']
        user, status_code = login(username, password)
        if user:
            return jsonify({"user_id": user['user_id']}), 200
        else:
            return jsonify({"message": "Invalid username or password"}), status_code
    elif request.method == 'GET':
        # Providing a message for GET request or you might want to redirect
        return jsonify({"message": "GET method is not supported for /login."}), 405
    else:
        return '', 204


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
    # If you have a specific message or data you want to return for GET requests
        return jsonify({"message": "GET method for registration is not supported."}), 405


@app.route('/profile/<int:user_id>', methods=['PUT', 'GET'])
@cross_origin()
def update_user_profile(user_id):
    if request.method == 'GET':
        # Fetching and returning user profile data
        profile_data, status_code = get_profile(user_id)
        if profile_data:
            return jsonify(profile_data), status_code
        else:
            return jsonify({"message": "Profile not found"}), 404
    elif request.method == 'PUT':
        if not request.is_json:
            return jsonify({"message": "Invalid request format, JSON required."}), 400

        data = request.get_json()
        bio = data.get('bio')
        # Assuming 'profile_picture' is optional, hence the use of .get()
        profile_picture = data.get('profile_picture')

        try:
            # Ensure the user exists
            user = User.query.get(user_id)
            if not user:
                return jsonify({"message": "User not found"}), 404

            if not user.profile:
                user.profile = Profile(user_id=user_id)
            user.profile.bio = bio
            # Handle 'profile_picture' if necessary
            db.session.commit()

            return jsonify({"message": "Profile updated successfully"}), 200
        except Exception as e:
            # Log the exception to understand what went wrong
            print(f"Error updating profile: {e}")
            db.session.rollback()
            return jsonify({"message": "Internal server error"}), 500


if __name__ == '__main__':
     app.run()