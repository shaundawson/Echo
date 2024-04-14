from backend.models import db, User, Profile
from flask import jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timedelta, timezone
from cryptography.fernet import Fernet

# Generate and save the key in a secure location only once during the setup
def generate_key():
    key = Fernet.generate_key()
    with open("secret.key", "wb") as key_file:
        key_file.write(key)
print(generate_key())

def load_key():
    return open("secret.key", "rb").read()

# Function to create a cipher object
def create_cipher():
    key = load_key()
    return Fernet(key)

# Encrypt data
def encrypt_data(data):
    cipher = create_cipher()
    return cipher.encrypt(data.encode())

# Decrypt data
def decrypt_data(encrypted_data):
    cipher = create_cipher()
    return cipher.decrypt(encrypted_data).decode()

def save_spotify_tokens(user_id, access_token, refresh_token, expires_in):
    encrypted_access_token = encrypt_data(access_token)
    encrypted_refresh_token = encrypt_data(refresh_token)
    user = User.query.get(user_id)
    if user:
        user.spotify_access_token = encrypted_access_token
        user.spotify_refresh_token = encrypted_refresh_token
        # Store the token expiration with explicit UTC timezone
        user.spotify_token_expiration = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
        db.session.commit()

def get_spotify_tokens(user_id):
    user = User.query.get(user_id)
    if user:
        decrypted_access_token = decrypt_data(user.spotify_access_token)
        decrypted_refresh_token = decrypt_data(user.spotify_refresh_token)
        return decrypted_access_token, decrypted_refresh_token, user.spotify_token_expiration
    return None, None, None

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

        # Create a new Profile instance for the user.
        new_profile = Profile(user_id=new_user.id)
        db.session.add(new_profile)
        db.session.commit()

        return {"message": "Registration successful.", "user_id": new_user.id}, 201
    except Exception as e:
        print(f"Failed to add user {username}. Error: {e}")
        db.session.rollback()
        return {"message": "Failed to register user."}, 500


def get_profile(user_id):
    user = User.query.get(user_id)
    if user and user.profile:
        profile_data = {
            'username': user.username,
            'email': user.email,
            'bio': user.profile.bio,
            'user_id': user.profile.user_id
        }
        return profile_data, 200  # Return a dictionary, not jsonify
    else:
        return None, 404


def update_profile(user_id, bio, profile_image):
    profile = Profile.query.filter_by(user_id=user_id).first()
    if profile:
        if bio is not None:
            profile.bio = bio

        # Check if any update was made
        if bio is None and profile_image is None:
            return jsonify({"message": "No changes detected in the profile data"}), 200

        db.session.commit()
        return jsonify({"message": "Profile updated successfully"}), 200
    else:
        return jsonify({"message": "Profile not found for the user"}), 404