import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [token, setToken] = useState(localStorage.getItem('token'));

    const login = (userData, token) => {
        setCurrentUser(userData);
        setToken(token);
        localStorage.setItem('user', JSON.stringify(userData)); // Persist user data
        localStorage.setItem('token', token); // Persist token
    };

    const logout = () => {
        setCurrentUser(null);
        setToken(null);
        localStorage.removeItem('user'); // Clear user data
        localStorage.removeItem('token'); // Clear token
    };

    const value = {
        currentUser,
        token,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};