from flask import Flask, request, jsonify, make_response
from flask_cors import CORS, cross_origin
from models import db, User
from dotenv import load_dotenv
import os
from werkzeug.security import check_password_hash, generate_password_hash

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
def login():
    if request.method == 'POST':
        username = request.json['username']
        password = request.json['password']
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            return jsonify({"message": "Login successful", "user": user.username}), 200
        else:
            return jsonify({"message": "Invalid username or password"}), 401
    else:
        # Handle GET request or return a default message for OPTIONS
        return 'Login Page' if request.method == 'GET' else ('', 204)


@app.route('/register', methods=['POST', 'GET'])
@cross_origin()
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    # Check if username or email already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"message": "An account with this username already exists."}), 409

    # Hash the password
    hashed_password = generate_password_hash(password)

    # Create a new user instance
    new_user = User(username=username, password=hashed_password, email=email)

    # Add the new user to the database
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Registration successful."}), 201


if __name__ == '__main__':
    app.run(debug=True, port=5000)
