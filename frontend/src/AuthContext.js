import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')));

    const login = (userData) => {
        setCurrentUser(userData);
        localStorage.setItem('user', JSON.stringify(userData)); // Persist user data
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('user'); // Clear user data
    };

    const value = {
        currentUser,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};