import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import SpotifyConnection from './SpotifyConnection'; // Adjust the path as necessary


function Profile() {
    const { currentUser } = useAuth();
    const [userData, setUserData] = useState({
        username: '',
        bio: '',
        profile_picture: '',
        spotifyPlaylistsCount: 0,
        spotifyFollowersCount: 0,
        spotifyFollowingCount: 0,
    });
    const { userId } = useParams();

    useEffect(() => {
        if (!currentUser) {
            console.log("No authenticated user.");
            return;
        }

        const fetchUserData = async () => {
            try {
                const response = await axios.get(`https://dry-dawn-86507-cc866b3e1665.herokuapp.com/profile/${userId}`, {
                    withCredentials: true
                });

                if (response.data) {
                    setUserData(response.data); // Assumes response.data includes Spotify data
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [userId, currentUser]);

    return (
        <div>
            <header></header>
            <div id="main-content">
                <h2>{userData.username}</h2>
                <SpotifyConnection />
                <div>
                    {/* Profile information and edit form */}
                </div>
            </div>
        </div>
    );
}

export default Profile;