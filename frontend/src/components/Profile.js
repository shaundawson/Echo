import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';


function Profile() {
    const { currentUser } = useAuth();
    const [userData, setUserData] = useState({ username: '', bio: '', profile_picture: '' });
    const [editMode, setEditMode] = useState(false);
    const { userId } = useParams();

    useEffect(() => {
        if (!currentUser) {
            console.log("No authenticated user.");
            return;
        }

        const fetchUserData = async () => {
            console.log("Fetching data for user:", userId);  // Additional logging
            try {
                const response = await axios.get(`https://dry-dawn-86507-cc866b3e1665.herokuapp.com/profile/${userId}`, {
                    withCredentials: true
                });

                console.log("Profile data fetched:", response.data);  // Log fetched data
                if (response.data) {
                    setUserData(response.data);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [userId, currentUser]);  // Dependency on userId and currentUser


    if (!currentUser) {
        // Render this message outside of useEffect
        return <div>Please log in to view this page.</div>;
    }

    const handleBioChange = (event) => {
        setUserData({ ...userData, bio: event.target.value });
    };

    const handleEditSubmit = async () => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            const body = JSON.stringify({ bio: userData.bio });
            const response = await axios.put(
                `https://dry-dawn-86507-cc866b3e1665.herokuapp.com/profile/${userId}`,
                body,
                config
            );

            if (response.status === 200) {
                console.log('Profile update response:', response.data);
                setUserData(prevState => ({
                    ...prevState,
                    bio: userData.bio
                }));
                setEditMode(false);
            } else {
                console.error('Profile update was not successful.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <div>
            <header></header>
            <div id="main-content">
                <h2>{userData.username}</h2>
                <div>
                    {editMode ? (
                        <>
                            <textarea value={userData.bio} onChange={handleBioChange}></textarea>
                            <button onClick={handleEditSubmit}>Save</button>
                            <button onClick={() => setEditMode(false)}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <p>Bio: {userData.bio}</p>
                            <button onClick={() => setEditMode(true)}>Edit Bio</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;