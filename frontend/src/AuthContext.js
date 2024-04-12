import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);


    const login = async (userData) => {
        // Make a request to your backend to handle authentication
        try {
            const response = await axios.post('https://dry-dawn-86507-cc866b3e1665.herokuapp.com/login', userData, {
                withCredentials: true // Include credentials for cross-origin requests
            });
            setUser(response.data); // Update user state if login is successful
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error('Login failed'); // Handle login failure gracefully
        }
    };

    // Function to handle logout
    const logout = async () => {
        // Make a request to your backend to handle logout
        try {
            await axios.post('https://dry-dawn-86507-cc866b3e1665.herokuapp.com/logout', null, {
                withCredentials: true // Include credentials for cross-origin requests
            });
            setUser(null); // Clear user state if logout is successful
        } catch (error) {
            console.error('Logout failed:', error);
            throw new Error('Logout failed'); // Handle logout failure gracefully
        }
    };

    // Value object to provide to consumers of the AuthContext
    const value = {
        user,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};