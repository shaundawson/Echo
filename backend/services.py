from backend.models import db, User, Profile
from flask import jsonify, session
from werkzeug.security import check_password_hash, generate_password_hash
import logging 
import os


def login(username, password):
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        return {"message": "Login successful", "user_id": user.id}, 200
    else:
        return {"message": "Invalid username or password"}, 401


def register(username, password, email, bio):
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return {"message": "An account with this username already exists."}, 409

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, password=hashed_password, email=email)
    db.session.add(new_user)
    db.session.commit()

    new_profile = Profile(user_id=new_user.id, bio=bio)
    db.session.add(new_profile)
    db.session.commit()
    return {"message": "Registration successful.", "user_id": new_user.id}, 201

def complete_registration(spotify_data):
    reg_data = session.pop('reg_data', None)
    if not reg_data:
        return {"message": "Registration timeout or unauthorized access"}, 400

    # Create new user with both form and Spotify data
    new_user = User(
        username=reg_data['username'],
        password=reg_data['password'],
        email=reg_data['email']
    )
    db.session.add(new_user)
    
    new_profile = Profile(
        user_id=new_user.id,
        bio=reg_data['bio'],
        profile_image=spotify_data.get('images')[0]['url'] if spotify_data.get('images') else None
    )
    db.session.add(new_profile)
    try:
        db.session.commit()
        logging.info(f"New user registered with Spotify integration: {new_user.username}")
        return {"message": "User registered successfully.", "user_id": new_user.id}, 201
    except Exception as e:
        db.session.rollback()
        logging.error(f"Failed to complete registration for {new_user.username}: {e}")
        return {"message": "Registration failed", "error": str(e)}, 500

def spotify_callback_handler(code):
    # Assume `spotify` is your OAuth client set up elsewhere in your services
    token = spotify.authorize_access_token(code)
    spotify_data = spotify.get('https://api.spotify.com/v1/me').json()
    return complete_registration(spotify_data)

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