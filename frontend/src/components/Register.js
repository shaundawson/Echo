import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Import useAuth


function Register() {
    // State variable to hold form data
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
    });
    // Navigate function from React Router for redirection
    const navigate = useNavigate();
    const { login } = useAuth(); // Destructure login from useAuth

    // Function to handle changes in form inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Update form data state with new input values
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Make POST request to register a new user
            const response = await axios.post('https://dry-dawn-86507-cc866b3e1665.herokuapp.com/register', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // If registration is successful, update login state and navigate to profile page
            if (response.data.user_id) {
                login(response.data);
                navigate(`/profile/${response.data.user_id}`);
            } else {
                console.log(response.data.message);
            }
        } catch (error) {
            // Log and handle registration failure
            console.error('Registration failed:', error?.response?.data?.message || error.message);
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
                <p>Already have an account? <a href="/login">Login here</a>.</p>
                <a href="/" className="button">Back to Homepage</a>
            </div>
        </div>
    );
}

export default Register;