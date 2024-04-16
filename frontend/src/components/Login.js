import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import './Login.css'; // Import the stylesheet
import RobotitoImage4 from '../images/Robotito4.png'; // Adjust the path to where you have saved Robotito.png



function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // Hook for navigating to other routes
    const { login } = useAuth(); // Destructure login from useAuth

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        try {
            const response = await axios.post('https://dry-dawn-86507-cc866b3e1665.herokuapp.com/login', { username, password }, {
                withCredentials: true
            });
            if (response.data.user_id) {
                login(response.data); // Update login state
                navigate(`/profile/${response.data.user_id}`); // Navigate to user's profile
            } else {
                console.error('User ID not found in response data');
            }
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    return (
        
           
            <div className="login-container">
            <header class = "login-header">
                <h1>Login to Your Account</h1>
                <img src={RobotitoImage4} alt="Cute robot with headphones4" className="robot-image4"/>


            </header>

            <main id="login-main-content">

                <form onSubmit={handleSubmit}>
                    <div className="login-form-group">
                        <label htmlFor="username">Username:</label>
                        <input type="text" id="username" name="username" required onChange={(e) => setUsername(e.target.value)} autoComplete="off" />
                    </div>
                    <div className="login-form-group">
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" name="password" required onChange={(e) => setPassword(e.target.value)} autoComplete="off" />
                    </div>
                    <button type="submit" className="login-button">Login</button>
                    <button type="button" onClick={handleBackToHome} className="login-button">Back to Homepage</button>

                </form>
                <div className="login-form-group">                <label>Don't have an account? <a href="/register">Create one now</a>.</label>
</div>
               
            
            </main>

            <footer><p>Copyright &#169; 2024 Echo. All Rights Reserved.</p></footer>
        </div>
    );
}

export default Login;