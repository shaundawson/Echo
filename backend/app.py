from flask import Flask, request, jsonify, session
from flask_cors import CORS, cross_origin
from backend.models import db, User, Profile, Post, Follow
from backend.services import login, register
import os
from backend.spotify import search_spotify, refresh_spotify_token
import requests

# Create the Flask application
app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY')

# Configure database
database_url = os.environ.get('CLEARDB_DATABASE_URL').replace(
    'mysql://', 'mysql+pymysql://')
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['SESSION_COOKIE_NAME'] = 'session'
app.config['SESSION_COOKIE_SECURE'] = True  # True for prod, False for dev
app.config['REMEMBER_COOKIE_SECURE'] = True  # True for prod, False for dev
# Prevents JavaScript access to session cookie
app.config['SESSION_COOKIE_HTTPONLY'] = True
# 'None' if cookies should be sent in all cross-origin requests
app.config['SESSION_COOKIE_SAMESITE'] = 'None'


# Configure SQLAlchemy engine options
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_recycle': 299,
    'pool_pre_ping': True
}

db.init_app(app)


# Configure CORS
CORS(app, support_credentials=True, origins=["http://localhost:3000"])


# App Routes
@app.route('/')
def home():
    return 'Welcome to the Echo App!'


# Handles user login functionality
@app.route('/login', methods=['GET', 'POST', 'OPTIONS'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def login_route():
    if request.method == 'POST':
        username = request.json['username']
        password = request.json['password']
        user, status_code = login(username, password)
        if user.get('user_id'):  # Check if 'user_id' is in the dictionary
            # Store the user's ID in the session
            session['user_id'] = user['user_id']
            print("Logged in user_id:", session['user_id'])  # Debug print
            return jsonify({"user_id": user['user_id']}), 200
        else:
            return jsonify({"message": "Invalid username or password"}), status_code
    elif request.method == 'GET':
        return jsonify({"message": "GET method is not supported for /login."}), 405
    else:
        return '', 204

 # Handles user registration functionality


@app.route('/register', methods=['POST', 'GET'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def register_route():
    if request.method == 'POST':
        data = request.json
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        bio = data.get('bio')  # Extract bio data from the request
        response, status_code = register(username, password, email, bio)
        return jsonify(response), status_code
    elif request.method == 'GET':
        return jsonify({"message": "GET method for registration is not supported."}), 405


@app.route('/users')
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def get_users():
    current_user_id = session.get('user_id')
    if not current_user_id:
        return jsonify({"message": "Authentication required."}), 401

    users = User.query.all()
    user_list = []
    for user in users:
        profile = Profile.query.filter_by(user_id=user.id).first()
        bio = profile.bio if profile else "No bio available"
        is_following = Follow.query.filter_by(
            follower_id=current_user_id, followed_id=user.id).first() is not None
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'bio': bio,
            'is_following': is_following
        }
        user_list.append(user_data)

    return jsonify(user_list), 200


# User Profile Route
@app.route('/profile/<int:user_id>', methods=['PUT', 'GET'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def profile_route(user_id):
    if request.method == 'PUT':
        if not request.is_json:
            return jsonify({"message": "Invalid request format, JSON required."}), 400

        data = request.get_json()
        bio = data.get('bio', None)  # Default to None if 'bio' not provided
        # Same for 'profile_image'
        profile_image = data.get('profile_image', None)

        try:
            user = User.query.get(user_id)
            if not user:
                return jsonify({"message": "User not found"}), 404

            if not user.profile:
                user.profile = Profile(user_id=user_id)

            if bio is not None:
                user.profile.bio = bio
            if profile_image is not None:
                user.profile.profile_image = profile_image

            db.session.commit()
            return jsonify({"message": "Profile updated successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Internal server error"}), 500

    elif request.method == 'GET':
        try:
            user = User.query.get(user_id)
            if not user:
                # Log for debugging
                print(f"User with ID {user_id} not found.")
                return jsonify({"message": "User not found"}), 404

            profile_data = {
                'username': user.username,
                'bio': user.profile.bio if user.profile else ""
            }
            return jsonify(profile_data), 200
        except Exception as e:
            print(f"Error fetching profile for user {
                  user_id}: {e}")  # Log detailed error
            return jsonify({"message": "Internal server error"}), 500

    else:
        return jsonify({"message": "Method not allowed"}), 405


# Used to fetch posts only from followed users
@app.route('/all-posts', methods=['GET'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def get_all_posts():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"message": "Authentication required."}), 401

    followed_users = [follow.followed_id for follow in Follow.query.filter_by(
        follower_id=user_id).all()]
    posts = Post.query.filter(Post.user_id.in_(followed_users)).all()
    print("Followed Users:", followed_users)

    all_posts = [{
        "post_id": post.id,
        "username": post.user.username,
        "song_recommendation": post.song_recommendation,
        "description": post.description,
        "created_at": post.created_at.isoformat()
    } for post in posts]
    print("Posts being returned:", all_posts)

    return jsonify(all_posts), 200


# Used to fetch posts created by a specific user.
@app.route('/posts', methods=['GET'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def get_posts():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"message": "Authentication required."}), 401

    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        posts = [
            {
                "id": post.id,
                "song_recommendation": post.song_recommendation,
                "description": post.description,
                "created_at": post.created_at.isoformat()
            } for post in user.posts
        ]
        return jsonify(posts), 200
    except Exception as e:
        return jsonify({"message": "Internal server error", "error": str(e)}), 500


# Route to create a new post
@app.route('/post', methods=['POST'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def create_post():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"message": "Authentication required."}), 401

    data = request.get_json()
    song_recommendation = data['song_recommendation']
    description = data.get('description', '')

    new_post = Post(
        user_id=user_id,
        song_recommendation=song_recommendation,
        description=description
    )
    db.session.add(new_post)
    try:
        db.session.commit()
        return jsonify({"message": "Post created successfully", "post_id": new_post.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to create post", "error": str(e)}), 500


# Route to delete a post
@app.route('/post/<int:post_id>', methods=['DELETE'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def delete_post(post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"message": "Post not found"}), 404
    if post.user_id != session.get('user_id'):
        return jsonify({"message": "Unauthorized"}), 403
    db.session.delete(post)
    db.session.commit()
    return jsonify({"message": "Post deleted successfully"}), 200

 # This acts as a proxy to the Spotify API.


@app.route('/api/search')
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def spotify_search_proxy():
    token = request.headers.get('Authorization')
    if not token or not token.startswith('Bearer '):
        return jsonify({"error": "No authorization token provided"}), 401
    token = token.split(' ')[1]
    query = request.args.get('q')
    spotify_response = requests.get(
        'https://api.spotify.com/v1/search',
        headers={'Authorization': f'Bearer {token}'},
        params={'q': query, 'type': 'track', 'limit': 10}
    )
    return jsonify(spotify_response.json()), spotify_response.status_code


# Spotify Search Route
@app.route('/search')
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def search():
    token = request.cookies.get('spotifyToken')
    if token:
        query = request.args.get('query')
        # Ensure user_id is also correctly managed
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "User session not found"}), 401

        results = search_spotify(query, token, user_id)
        return jsonify(results)
    else:
        # Refresh Spotify token if necessary
        refreshed_token = refresh_spotify_token()
        if refreshed_token:
            query = request.args.get('query')
            user_id = session.get('user_id')
            results = search_spotify(query, refreshed_token, user_id)
            return jsonify(results)
        else:
            return jsonify({"error": "Authentication required"}), 401


# Route for follow
@app.route('/follow/<int:user_id>', methods=['POST'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def follow(user_id):
    current_user_id = session.get('user_id')
    if not current_user_id:
        return jsonify({"message": "Authentication required."}), 401
    if current_user_id == user_id:
        return jsonify({"message": "Cannot follow yourself."}), 400

    # Check if already followed
    if not Follow.query.filter_by(follower_id=current_user_id, followed_id=user_id).first():
        follow_relation = Follow(
            follower_id=current_user_id, followed_id=user_id)
        db.session.add(follow_relation)
        db.session.commit()
        return jsonify({"message": "Followed successfully"}), 200
    return jsonify({"message": "Already following"}), 409


# Route for unfollow
@app.route('/unfollow/<int:user_id>', methods=['POST'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def unfollow(user_id):
    current_user_id = session.get('user_id')
    if not current_user_id:
        return jsonify({"message": "Authentication required."}), 401

    follow_relation = Follow.query.filter_by(
        follower_id=current_user_id, followed_id=user_id).first()
    if follow_relation:
        db.session.delete(follow_relation)
        db.session.commit()
        return jsonify({"message": "Unfollowed successfully"}), 200
    return jsonify({"message": "Not following"}), 404


if __name__ == '__main__':
    app.run()
