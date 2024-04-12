from flask import Blueprint, request, jsonify, session

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    # Here, implement your authentication logic against your user storage
    if username == 'user' and password == 'password':  # Example condition
        session['username'] = username
        return jsonify(message='Login successful'), 200
    else:
        return jsonify(message='Login failed'), 401

@auth.route('/logout', methods=['POST'])
def logout():
    session.pop('username', None)
    return jsonify(message='Logged out'), 200

@auth.route('/protected', methods=['GET'])
def protected():
    if 'username' in session:
        return jsonify(message='Protected data'), 200
    else:
        return jsonify(message='Unauthorized access'), 401
