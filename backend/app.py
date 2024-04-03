from flask import Flask, request, jsonify
from flask_cors import CORS
from models import User, db
from werkzeug.security import check_password_hash
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:password@localhost/echo_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
CORS(app)


@app.route('/')
def home():
    return 'Welcome to the Flask App!'


@app.route('/login', methods=['POST'])
def login():
    username = request.json['username']
    password = request.json['password']
    user = User.query.filter_by(username=username, password=password).first()
    if user:
        return jsonify({"message": "Login successful", "user": user.username}), 200
    else:
        return jsonify({"message": "Invalid username or password"}), 401


if __name__ == '__main__':
    app.run(debug=True)
