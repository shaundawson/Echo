# services.py
from models import User, db
from werkzeug.security import generate_password_hash


def add_user(username, plain_text_password, email):
    # Check if a user with the given username or email already exists
    existing_user = User.query.filter(
        (User.username == username) | (User.email == email)).first()
    if existing_user:
        print(f"User {username} already exists.")
        return False

    hashed_password = generate_password_hash(plain_text_password)
    new_user = User(username=username, password=hashed_password, email=email)
    try:
        db.session.add(new_user)
        db.session.commit()
        return True
    except Exception as e:
        print(f"Failed to add user {username}. Error: {e}")
        db.session.rollback()
        return False
