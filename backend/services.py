from models import db, User, Profile
from flask import jsonify
from werkzeug.security import check_password_hash, generate_password_hash


def login(username, password):
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        return {"message": "Login successful", "user_id": user.id}, 200
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
        # After successfully saving the new user, return the user's ID along with the success message
        return {"message": "Registration successful.", "user_id": new_user.id}, 201
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


def update_profile(user_id, bio, profile_picture):
    # Retrieve user's profile from the database
    profile = Profile.query.filter_by(user_id=user_id).first()
    if profile:
        # Update the user's profile information
        if bio:
            profile.bio = bio
        if profile_picture:
            profile.profile_picture = profile_picture
        db.session.commit()
        return {"message": "Profile updated successfully"}, 200
    else:
        return {"message": "Profile not found for the user"}, 404
