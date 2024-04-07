from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from models import db, User
from dotenv import load_dotenv
from services import login, get_profile, update_profile, register
import os
from werkzeug.security import generate_password_hash


# Load environment variables from .env file
load_dotenv()


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)


# Configure CORS. This allows all origins. For development only!
CORS(app, support_credentials=True)


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
            # Return JSON with user_id for the client to redirect
            return jsonify({"user_id": user['user_id']}), 200
        else:
            return jsonify({"message": "Invalid username or password"}), status_code
        return 'Login Page' if request.method == 'GET' else ('', 204)


@app.route('/register', methods=['POST', 'GET'])
@cross_origin()
def register_route():
    if request.method == 'POST':
        data = request.json
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')

        # Use the register function from services.py
        response, status_code = register(username, password, email)
        return jsonify(response), status_code


@app.route('/profile/<int:user_id>', methods=['PUT'])
@cross_origin()
def update_user_profile(user_id):
    data = request.json
    bio = data.get('bio')
    profile_picture = data.get('profile_picture')
    message, status_code = update_profile(user_id, bio, profile_picture)
    return jsonify({"message": message}), status_code


if __name__ == '__main__':
    app.run(debug=True, port=5000)
