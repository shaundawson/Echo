import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Import useAuth
import './Register.css'; // Import the stylesheet
import RobotitoImage5 from '../images/Robotito5.png'; // Adjust the path to where you have saved Robotito.png



function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
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
        <div className="register-container">
            <header class = "register-header">
            
                <h1>Register</h1>
                <img src={RobotitoImage5} alt="Cute robot with headphones5" className="robot-image5"/>

            </header>

            <div id="register-main-content">
                <form onSubmit={handleSubmit}>
                    <div className="register-form-group">
                        <label htmlFor="username">Username:</label>
                        <input type="text" id="username" name="username" required value={formData.username} onChange={handleChange} />
                    </div>
                    <div className="register-form-group">
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" name="password" required value={formData.password} onChange={handleChange} />
                    </div>
                    <div className="register-form-group">
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} />
                    </div>
                    <button type="submit" className="register-button">Register</button>
                </form>
                <p>Already have an account? <a href="/login">Login here</a>.</p>
                <button><a href="/" className="register-button">Back to Homepage</a></button>
            </div>
        </div>
    );
}

export default Register;