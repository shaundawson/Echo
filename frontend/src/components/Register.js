import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Import useAuth


function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        spotifyAccessToken: '',
        spotifyRefreshToken: '',
        spotifyExpiresIn: ''
    });
    const navigate = useNavigate();
    const { login } = useAuth(); // Destructure login from useAuth

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSpotifyAuth = async () => {
        window.location = `https://accounts.spotify.com/authorize?client_id=SPOTIFY_CLIENT_ID&response_type=code&redirect_uri=SPOTIFY_REDIRECT_URI&scope=SPOTIFY_REQUIRED_SCOPES`;
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