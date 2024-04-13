from backend.models import db, User, Profile
from flask import jsonify
from werkzeug.security import check_password_hash, generate_password_hash
import logging 


def login(username, password):
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        return {"message": "Login successful", "user_id": user.id}, 200
    else:
        return {"message": "Invalid username or password"}, 401


def register(username, password, email, bio):
    try:
        # Check if user already exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            logging.error(f"Registration attempt for existing username: {username}")
            return {"message": "An account with this username already exists."}, 409

        # Hash the password before storing it
        hashed_password = generate_password_hash(password)

        # Create new user instance
        new_user = User(username=username, password=hashed_password, email=email)
        db.session.add(new_user)
        db.session.commit()

        # Optionally create a profile for the new user
        new_profile = Profile(user_id=new_user.id, bio=bio)
        db.session.add(new_profile)
        db.session.commit()
        logging.info(f"New user registered successfully: {username}")
        return {"message": "Registration successful.", "user_id": new_user.id}, 201

    except Exception as e:
        db.session.rollback()
        logging.error(f"Failed to register user {username}: {e}")
        return {"message": "Failed to register user.", "error": str(e)}, 500


def get_profile(user_id):
    user = User.query.get(user_id)
    if user and user.profile:
        profile_data = {
            'username': user.username,
            'email': user.email,
            'bio': user.profile.bio,
            'user_id': user.profile.user_id,
            'profile_image': user.profile.profile_image,
        }
        return profile_data, 200  # Return a dictionary, not jsonify
    else:
        return None, 404


def update_profile(user_id, bio, profile_image):
    profile = Profile.query.filter_by(user_id=user_id).first()
    if profile:
        if bio is not None:
            profile.bio = bio
        if profile_image is not None:
            profile.profile_image = profile_image

        # Check if any update was made
        if bio is None and profile_image is None:
            return jsonify({"message": "No changes detected in the profile data"}), 200

        db.session.commit()
        return jsonify({"message": "Profile updated successfully"}), 200
    else:
        return jsonify({"message": "Profile not found for the user"}), 404