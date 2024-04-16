import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Profile.css'; // This line imports the CSS from above


function Profile() {
    // Get current user from AuthContext
    const { currentUser } = useAuth();
    // State variables for user data, edit mode, and URL parameter
    const [userData, setUserData] = useState({ username: '', bio: '', profile_picture: '' });
    const [editMode, setEditMode] = useState(false);
    const { userId } = useParams(); // Get user ID from URL parameter

    // Fetch user data from API when component mounts or user ID changes
    useEffect(() => {
        // Check if currentUser exists inside useEffect
        if (!currentUser) {
            console.log("No authenticated user.");
            return;  // Return early if no user
        }

        const fetchUserData = async () => {
            try {
                const response = await axios.get(`https://dry-dawn-86507-cc866b3e1665.herokuapp.com/profile/${userId}`, {
                    withCredentials: true
                });

                if (response.data) {
                    // console.log("API Response:", response.data);  // Log to see what the API is returning
                    setUserData(response.data); // Set the whole user data object
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [userId, currentUser]); // Include currentUser in the dependency array

    // Render a message prompting to log in if there's no authenticated user
    if (!currentUser) {
        // Render this message outside of useEffect
        return <div>Please log in to view this page.</div>;
    }

    // Function to handle changes in user bio
    const handleBioChange = (event) => {
        setUserData({ ...userData, bio: event.target.value });
    };

    // Function to submit edited user bio
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
                // Update user data state with edited bio
                // console.log('Profile update response:', response.data);
                setUserData(prevState => ({
                    ...prevState,
                    bio: userData.bio
                }));
                setEditMode(false); // Exit edit mode after successful update
            } else {
                console.error('Profile update was not successful.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <div className="profile-container">
            <header className="profile-header">
                <h2 className="profile-username">{userData.username}</h2>
                
            </header>

             


            <div className="profile-bio">
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
            <footer><p>Copyright &#169; 2024 Echo. All Rights Reserved.</p></footer>
        </div>
    );
}

export default Profile;