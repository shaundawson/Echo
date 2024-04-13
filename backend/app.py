from flask import Flask, request, jsonify, session, url_for, redirect,json,send_from_directory
from flask_cors import CORS, cross_origin
from backend.models import db, User, Profile, Post
from backend.services import login, register, spotify_callback_handler
import os
from flask_migrate import Migrate
from authlib.integrations.flask_client import OAuth

# Initialize Flask and OAuth
app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY')
oauth = OAuth(app)

# Spotify OAuth configuration
spotify = oauth.register(
    'spotify',
    client_id=os.getenv('SPOTIFY_CLIENT_ID'),
    client_secret=os.getenv('SPOTIFY_CLIENT_SECRET'),
    authorize_url='https://accounts.spotify.com/authorize',
    access_token_url='https://accounts.spotify.com/api/token',
    redirect_uri=url_for('spotify_callback', _external=True),
    client_kwargs={'scope': 'user-read-private user-read-email'},
)

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
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

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
    
# @app.route('/logout', methods=['POST'])
# def logout():
#     session.pop('user_id', None)  # Clear the session
#     return jsonify({"message": "Logged out successfully"}), 200

@app.route('/register', methods=['POST'])
def register_route():
    data = request.json
    result, status = register(data['username'], data['password'], data['email'], data.get('bio', ''))
    if status == 200:
        return redirect(url_for('register_spotify'))
    return jsonify(result), status
    
@app.route('/register/spotify')
def register_spotify():
    redirect_uri = url_for('spotify_callback', _external=True)
    return spotify.authorize_redirect(redirect_uri)

@app.route('/spotify_callback')
def spotify_callback():
    token = spotify.authorize_access_token()
    if not token:
        return jsonify({"message": "Failed to authenticate with Spotify"}), 401
    
    # Retrieve user details from session or where it was stored
    user_details = json.loads(session.get('userDetails'))
    
    # Register user in the database
    response, status = register(user_details['username'], user_details['password'], user_details['email'], '')
    
    if status != 201:
        return jsonify(response), status
    
    # Assuming the user ID is returned on successful registration
    user_id = response.get('user_id')
    return redirect(f"http://localhost:3000/profile/{user_id}")

@app.route('/profile/<int:user_id>', methods=['PUT', 'GET'])
@cross_origin(supports_credentials=True, origins=["http://localhost:3000"])
def profile_route(user_id):
    if request.method == 'PUT':
        if not request.is_json:
            return jsonify({"message": "Invalid request format, JSON required."}), 400

        data = request.get_json()
        bio = data.get('bio', None)  # Default to None if 'bio' not provided
        profile_image = data.get('profile_image', None)  # Same for 'profile_image'

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
                return jsonify({"message": "User not found"}), 404

            if not user.profile:
                return jsonify({"message": "Profile not found for this user"}), 404

            profile_data = {
                'username': user.username,
                'bio': user.profile.bio,
                'profile_image': user.profile.profile_image
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