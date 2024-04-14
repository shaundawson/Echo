import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: ''
    });
    const [spotifyConfig, setSpotifyConfig] = useState({
        clientId: '',
        redirectUri: '',
        scopes: 'user-read-private user-read-email'
    });
    const navigate = useNavigate();
    const { login } = useAuth(); // Destructure login from useAuth

    useEffect(() => {
        axios.get('https://dry-dawn-86507-cc866b3e1665.herokuapp.com/config')
            .then(response => {
                setSpotifyConfig({
                    clientId: response.data.spotifyClientId,
                    redirectUri: response.data.spotifyRedirectUri,
                    scopes: response.data.spotifyScopes  // Use the scopes from the backend
                });
            })
            .catch(error => console.error('Error fetching Spotify config:', error));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSpotifyAuth = () => {
        if (!spotifyConfig.clientId || !spotifyConfig.redirectUri) {
            console.error('Spotify config not loaded properly');
            return;
        }
        // Redirect to Spotify for authorization
        const scopeUrlEncoded = encodeURIComponent(spotifyConfig.scopes);
        window.location = `https://accounts.spotify.com/authorize?client_id=${spotifyConfig.clientId}&response_type=code&redirect_uri=${encodeURIComponent(spotifyConfig.redirectUri)}&scope=${scopeUrlEncoded}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('https://dry-dawn-86507-cc866b3e1665.herokuapp.com/register', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.user_id) {
                login(response.data); // Update login state
                navigate(`/profile/${response.data.user_id}`);
            } else {
                console.log(response.data.message);
            }
        } catch (error) {
            console.error('Registration failed:', error?.response?.data?.message || error.message);
        }
    };

    return (
        <div>
            <header>
                <h1>Register</h1>
            </header>
            <div id="main-content">
                <button onClick={handleSpotifyAuth}>Connect to Spotify</button>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input type="text" id="username" name="username" required value={formData.username} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" name="password" required value={formData.password} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} />
                    </div>
                    <button type="submit" className="button">Register</button>
                </form>
            </div>
        </div>
    );
}

export default Register;
