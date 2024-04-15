import os
import requests
from flask import jsonify, request, make_response, redirect
from urllib.parse import urlencode
from backend.models import db, User


def create_spotify_oauth_url():
    # Constructs the URL for OAuth authentication with Spotify using query parameters.
    query_params = {
        'client_id': os.environ['SPOTIFY_CLIENT_ID'],
        'response_type': 'code',
        'redirect_uri': os.environ['SPOTIFY_REDIRECT_URI'],
        'scope': os.environ['SPOTIFY_REQUIRED_SCOPES'],
        'show_dialog': 'true'
    }
    return f"https://accounts.spotify.com/authorize?{urlencode(query_params)}"


def handle_spotify_callback(request):
    # Handles the callback from Spotify authentication, checking for errors and exchanging the code for tokens.
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

    # Successful authentication redirects to application and sets cookies with tokens.
    resp = make_response(redirect('http://localhost:3000/'))
    resp.set_cookie(
        'spotifyToken', response_data['access_token'], httponly=True, secure=True, samesite='None')
    resp.set_cookie('spotifyRefreshToken',
                    response_data['refresh_token'], httponly=True, secure=True, samesite='None')
    return resp


def refresh_spotify_token():
    # Refreshes the Spotify token using the stored refresh token.
    spotify_refresh_token = request.cookies.get('spotifyRefreshToken')
    if not spotify_refresh_token:
        return {"error": "Refresh token missing"}, 400

    token_data = {
        'grant_type': 'refresh_token',
        'refresh_token': spotify_refresh_token,
        'client_id': os.environ['SPOTIFY_CLIENT_ID'],
        'client_secret': os.environ['SPOTIFY_CLIENT_SECRET'],
    }
    response = requests.post(
        'https://accounts.spotify.com/api/token', data=token_data)
    response_data = response.json()

    if response.status_code == 200:
        response.set_cookie(
            'spotifyToken', response_data['access_token'], httponly=True, secure=True, samesite='None')
        return response_data['access_token']
    else:
        return None


def search_spotify(query):
    # Searches Spotify's API for tracks based on the provided query and handles token refresh if needed.
    spotify_access_token = request.cookies.get('spotifyToken')
    if not spotify_access_token:
        return jsonify({"error": "Access token missing"}), 401

    headers = {'Authorization': f'Bearer {spotify_access_token}'}
    params = {'q': query, 'type': 'track'}
    response = requests.get(
        'https://api.spotify.com/v1/search', headers=headers, params=params)

    if response.status_code == 401:  # Token may be expired
        new_token = refresh_spotify_token()
        if new_token:
            headers['Authorization'] = f'Bearer {new_token}'
            response = requests.get(
                'https://api.spotify.com/v1/search', headers=headers, params=params)
            if response.status_code == 200:
                return response.json()
        return {"error": "Failed to refresh token", "status": 401}

    elif response.status_code == 200:
        return response.json()
    else:
        return {"error": "Failed to fetch data", "status": response.status_code, "message": response.text}
