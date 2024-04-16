import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [spotifyToken, setSpotifyToken] = useState(localStorage.getItem('spotifyToken'));

    const login = (userData, token, spotifyToken) => {
        console.log("Logging in with:", { userData, token, spotifyToken });
        if (!spotifyToken) {
            console.error("Spotify token is undefined at login.");
        }
        setCurrentUser(userData);
        setToken(token);
        setSpotifyToken(spotifyToken);
        localStorage.setItem('user', JSON.stringify(userData)); // Persist user data
        localStorage.setItem('token', token); // Persist token
        localStorage.setItem('spotifyToken', spotifyToken);
    };

    const logout = () => {
        setCurrentUser(null);
        setToken(null);
        setSpotifyToken(null);
        localStorage.removeItem('user'); // Clear user data
        localStorage.removeItem('token'); // Clear token
        localStorage.removeItem('spotifyToken'); // Clear spotifyToken
    };

    const value = {
        currentUser,
        token,
        spotifyToken,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
