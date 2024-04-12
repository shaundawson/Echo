from flask import Blueprint, request, jsonify, session
from flask_bcrypt import Bcrypt
from .models import db, User
from flask_restful import Resource, Api

auth_blueprint = Blueprint('auth', __name__)
api = Api(auth_blueprint)
bcrypt = Bcrypt()

class Register(Resource):
    def post(self):
        data = request.get_json()
        username = data['username']
        password = data['password']
        email = data['email']

        # Check if user already exists
        if User.query.filter_by(username=username).first():
            return jsonify(message='Username already exists'), 400

        # Hash password and create new user
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(username=username, email=email, password_hash=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify(message='User registered'), 201

class Login(Resource):
    def post(self):
        data = request.get_json()
        username = data['username']
        password = data['password']

        user = User.query.filter_by(username=username).first()
        if user and bcrypt.check_password_hash(user.password_hash, password):
            session['user_id'] = user.id  # Store the user's ID in the session
            return jsonify(message='Login successful', user_id=user.id), 200
        else:
            return jsonify(message='Login failed'), 401

class Logout(Resource):
    def post(self):
        session.pop('user_id', None)  # Remove the user ID from the session
        return jsonify(message='Logged out'), 200

api.add_resource(Register, '/register')
api.add_resource(Login, '/login')
api.add_resource(Logout, '/logout')

def init_auth(app):
    app.register_blueprint(auth_blueprint, url_prefix='/auth')
    bcrypt.init_app(app)
