from app import app
from services import register
from models import db  # Import the db instance


def seed_database():
    # Define your user data here
    users = [
        {"username": "john_doe", "password": "password",
            "email": "john@example.com"},
        {"username": "jane_doe", "password": "password",
            "email": "jane@example.com"},
        # Add more users as needed
    ]

    # Iterate over users and add them using the add_user function
    for user in users:
        if register(user['username'], user['password'], user['email']):
            print(f"User {user['username']} added successfully.")
        else:
            print(f"Failed to add user {user['username']}.")


if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Create all database tables based on models
        seed_database()  # Seed the database with initial data
