# seed_database.py
from app import app, db
from models import User
from werkzeug.security import generate_password_hash


def seed_users():
    # List of sample users to add
    users = [
        {"username": "user1", "password": "password1", "email": "user1@example.com"},
        {"username": "user2", "password": "password2", "email": "user2@example.com"},
        # Add more users as needed
    ]

    for user in users:
        hashed_password = generate_password_hash(user["password"])
        new_user = User(username=user["username"],
                        password=hashed_password, email=user["email"])
        db.session.add(new_user)
