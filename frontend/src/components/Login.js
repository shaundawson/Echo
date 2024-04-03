import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // Hook for navigating to other routes

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission behavior

        try {
            const response = await axios.post('http://localhost:5000/login', { username, password });
            console.log(response.data); // Log the response from the server
            navigate('/dashboard'); // Navigate to dashboard upon successful login
        } catch (error) {
            console.error('Login failed:', error);
            // Handle login failure (e.g., showing an error message)
        }
    };

    return (
        <div>
            <header>
                <h1>Login to Your Account</h1>
            </header>
            <div id="main-content">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input type="text" id="username" name="username" required onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" name="password" required onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <button type="submit" className="button">Login</button>
                </form>
                <p>Don't have an account? <a href="/create-account">Create one now</a>.</p> {/* Update href as per routing */}
                <a href="/" className="button">Back to Homepage</a> {/* Use Link from react-router-dom for SPA navigation */}
            </div>
        </div>
    );
}

export default Login;