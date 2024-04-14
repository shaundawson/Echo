from flask import Flask, request, jsonify, session, url_for, redirect
from flask_cors import CORS, cross_origin
from backend.models import db, User, Profile, Post
from backend.services import login, register, save_spotify_tokens
import os
from flask_migrate import Migrate
import requests

# Create the Flask application
app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY')

# Configure database
database_url = os.environ.get('CLEARDB_DATABASE_URL').replace('mysql://', 'mysql+pymysql://')
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['SESSION_COOKIE_NAME'] = 'session'
app.config['SESSION_COOKIE_SECURE'] = True # True for prod, False for dev
app.config['REMEMBER_COOKIE_SECURE'] = True # True for prod, False for dev
app.config['SESSION_COOKIE_HTTPONLY'] = True  # Prevents JavaScript access to session cookie
app.config['SESSION_COOKIE_SAMESITE'] = 'None' # 'None' if cookies should be sent in all cross-origin requests


# Configure SQLAlchemy engine options
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_recycle': 299,  
    'pool_pre_ping': True
}

db.init_app(app)
migrate = Migrate(app, db)

# Configure CORS
CORS(app, support_credentials=True, origins=["http://localhost:3000"])

# App Routes
@app.route('/')
def home():
    return 'Welcome to the Echo App!'

@app.route('/config')
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def get_config():
    client_id = os.environ.get('SPOTIFY_CLIENT_ID')
    redirect_uri = os.environ.get('SPOTIFY_REDIRECT_URI')
    scopes = os.environ.get('SPOTIFY_REQUIRED_SCOPES')

    if not client_id or not redirect_uri or not scopes:
        app.logger.error("Spotify configuration environment variables are not set correctly.")
        return jsonify({
            "error": "Configuration is incomplete. Check server logs for details."
        }), 500
    return jsonify({
        "spotifyClientId": os.environ.get('SPOTIFY_CLIENT_ID'),
        "spotifyRedirectUri": os.environ.get('SPOTIFY_REDIRECT_URI'),
        "spotifyScopes": os.environ.get('SPOTIFY_REQUIRED_SCOPES')
    })

@app.route('/spotify_callback')
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def spotify_callback():
    if 'user_id' not in session:
        return "User not logged in", 401

    user_id = session['user_id']
    code = request.args.get('code')
    redirect_uri = url_for('spotify_callback', _external=True)
    token_url = 'https://accounts.spotify.com/api/token'
    
    response = requests.post(token_url, data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirect_uri,
        'client_id': os.getenv('SPOTIFY_CLIENT_ID'),
        'client_secret': os.getenv('SPOTIFY_CLIENT_SECRET')
    })
    
    tokens = response.json()

    # Save tokens securely associated with user_id
    save_spotify_tokens(user_id, tokens['access_token'], tokens['refresh_token'], tokens['expires_in'])

    # Redirect to user's profile page
    return redirect(f'/profile/{user_id}')

@app.route('/login', methods=['GET', 'POST', 'OPTIONS'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def login_route():
    if request.method == 'POST':
        username = request.json['username']
        password = request.json['password']
        user, status_code = login(username, password)
        if user:
            session['user_id'] = user['user_id']  # Store the user's ID in the session
            print("Logged in user_id:", session['user_id'])  # Debug print
            return jsonify({"user_id": user['user_id']}), 200
        else:
            return jsonify({"message": "Invalid username or password"}), status_code
    elif request.method == 'GET':
        return jsonify({"message": "GET method is not supported for /login."}), 405
    else:
        return '', 204
    
@app.route('/register', methods=['POST'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def register_route():
    if request.method == 'POST':
        data = request.json
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        spotify_access_token = data.get('spotifyAccessToken')
        spotify_refresh_token = data.get('spotifyRefreshToken')
        spotify_expires_in = data.get('spotifyExpiresIn')

        response, status_code = register(username, password, email, bio)
        if status_code == 201:
            user_id = response.get('user_id')
            save_spotify_tokens(user_id, spotify_access_token, spotify_refresh_token, spotify_expires_in)
            return jsonify(response), status_code
        else:
            return jsonify(response), status_code


@app.route('/profile/<int:user_id>', methods=['PUT', 'GET'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def profile_route(user_id):
    if request.method == 'PUT':
        if not request.is_json:
            return jsonify({"message": "Invalid request format, JSON required."}), 400

        data = request.get_json()
        bio = data.get('bio', None)  # Default to None if 'bio' not provided

        try:
            user = User.query.get(user_id)
            if not user:
                return jsonify({"message": "User not found"}), 404

            if not user.profile:
                user.profile = Profile(user_id=user_id)

            if bio is not None:
                user.profile.bio = bio

            db.session.commit()
            return jsonify({"message": "Profile updated successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Internal server error"}), 500

    elif request.method == 'GET':
        try:
            user = User.query.get(user_id)
            if not user:
                return jsonify({"message": "User not found"}), 404

            if not user.profile:
                return jsonify({"message": "Profile not found for this user"}), 404

            profile_data = {
                'username': user.username,
                'bio': user.profile.bio
            }
            return jsonify(profile_data), 200
        except Exception as e:
            return jsonify({"message": "Internal server error"}), 500

    else:
        return jsonify({"message": "Method not allowed"}), 405
    
@app.route('/post', methods=['POST'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def create_post():
    print("Session user_id at /post:", session.get('user_id'))  # Debug print
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"message": "Authentication required."}), 401
    data = request.json
    new_post = Post(
        user_id=session['user_id'],
        song_recommendation=data['song_recommendation'],
        description=data.get('description', '')
    )
    db.session.add(new_post)
    try:
        db.session.commit()
        return jsonify({"message": "Post created successfully", "post_id": new_post.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to create post", "error": str(e)}), 500

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

if __name__ == '__main__':
     app.run()