# spotify.py
import os
import requests
from flask import jsonify, session, redirect
from urllib.parse import urlencode
from backend.models import db, User


def create_spotify_oauth_url():
    query_params = {
        'client_id': os.environ['SPOTIFY_CLIENT_ID'],
        'response_type': 'code',
        'redirect_uri': os.environ['SPOTIFY_REDIRECT_URI'],
        'scope': os.environ['SPOTIFY_REQUIRED_SCOPES'],
        'show_dialog': 'true'
    }
    return f"https://accounts.spotify.com/authorize?{urlencode(query_params)}"


def handle_spotify_callback(request):
    error = request.args.get('error')
    code = request.args.get('code')
    if error:
        return jsonify({'message': 'Authorization with Spotify failed.'}), 400

    token_data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': os.environ['SPOTIFY_REDIRECT_URI'],
        'client_id': os.environ['SPOTIFY_CLIENT_ID'],
        'client_secret': os.environ['SPOTIFY_CLIENT_SECRET'],
    }
    response = requests.post(
        'https://accounts.spotify.com/api/token', data=token_data)
    response_data = response.json()

    if response.status_code != 200:
        return jsonify({'message': 'Failed to retrieve access token from Spotify.'}), response.status_code

    user_id = session.get('user_id')
    user = User.query.get(user_id)
    user.spotify_access_token = response_data['access_token']
    user.spotify_refresh_token = response_data['refresh_token']
    db.session.commit()

    # Redirect back to a main or profile page
    return redirect('http://localhost:3000/')
