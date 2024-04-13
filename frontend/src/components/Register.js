import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
    });
    const [isConnected, setIsConnected] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the user is connected to Spotify
        axios.get('/api/check-spotify-connection')
            .then(response => {
                setIsConnected(response.data.isConnected);
            })
            .catch(error => console.log('Error checking Spotify connection', error));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isConnected) {
            alert('Please connect to Spotify before registering.');
            return;
        }
        // Proceed with registration using formData
        // Assuming you have a backend endpoint to handle registration
        axios.post('/api/register', formData)
            .then(response => {
                // Handle successful registration, navigate to profile or login
                navigate('/profile');
            })
            .catch(error => {
                console.error('Registration error:', error);
            });
    };

    const handleConnectSpotify = () => {
        window.location.href = '/register/spotify'; // Redirect to Spotify login
    };

    return (
        <div>
            <header><h1>Register</h1></header>
            <div id="main-content">
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
                    {isConnected ? (
                        <p>Connected to Spotify</p>
                    ) : (
                        <button type="button" onClick={handleConnectSpotify}>Connect to Spotify</button>
                    )}
                    <button type="submit" className="button">Register</button>
                </form>
            </div>
        </div>
    );
}

export default Register;