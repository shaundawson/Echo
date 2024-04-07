import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://127.0.0.1:5000/register', {
                username,
                password,
                email,
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // If registration is successful and a user_id is returned, redirect to the profile page
            if (response.data.user_id) {
                navigate(`/profile/${response.data.user_id}`);
            } else {
                console.log(response.data.message);
                // Handle the case where registration is successful but no user_id is returned
            }
        } catch (error) {
            console.error('Registration failed:', error.response.data.message);
            // Here you can handle and display registration errors, e.g., username already exists
        }
    };

    return (
        <div>
            <header>
                <h1>Register</h1>
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
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" required onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <button type="submit" className="button">Register</button>
                </form>
                <p>Already have an account? <a href="/login">Login here</a>.</p>
                <a href="/" className="button">Back to Homepage</a>
            </div>
        </div>
    );
}

export default Register;
