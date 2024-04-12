from flask_restful import Resource
from flask import request, jsonify, session
from flask_bcrypt import Bcrypt
from .models import db, User

bcrypt = Bcrypt()

class AuthResource(Resource):
    def post(self):
        data = request.json
        username = data.get('username')
        password = data.get('password')
        user = User.query.filter_by(username=username).first()
        if user and bcrypt.check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            return jsonify(message='Login successful'), 200
        else:
            return jsonify(message='Login failed'), 401

    def delete(self):
        session.pop('user_id', None)
        return jsonify(message='Logged out'), 200

    def get(self):
        if 'user_id' in session:
            return jsonify(message='Protected data'), 200
        else:
            return jsonify(message='Unauthorized access'), 401

def setup_resources(api):
    api.add_resource(AuthResource, '/auth')
