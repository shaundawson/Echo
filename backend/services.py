from models import db, User, Profile
from flask import jsonify
from werkzeug.security import check_password_hash, generate_password_hash


def login(username, password):
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        return {"message": "Login successful", "user": user.username}, 200
    else:
        return {"message": "Invalid username or password"}, 401


def register(username, password, email):
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return {"message": "An account with this username already exists."}, 409

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, password=hashed_password, email=email)

    try:
        db.session.add(new_user)
        db.session.commit()
        return {"message": "Registration successful."}, 201
    except Exception as e:
        print(f"Failed to add user {username}. Error: {e}")
        db.session.rollback()
        return {"message": "Failed to register user."}, 500


def get_profile(user_id):
    # Retrieve user profile data from the database
    user = User.query.get(user_id)
    if user:
        # Construct the user profile JSON response
        profile_data = {
            'username': user.username,
            'email': user.email,
            # Assuming profile_picture is a field in the User model
            'profile_picture': user.profile_picture,
            'bio': user.bio,  # Assuming bio is a field in the User model
            # Assuming followers is a relationship in the User model
            'followers': len(user.followers),
            # Assuming following is a relationship in the User model
            'following': len(user.following),
        }
        return jsonify(profile_data), 200
    else:
        return jsonify({"message": "User not found"}), 404
