import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Import useAuth hook


function Profile() {
    const [userData, setUserData] = useState({ username: '', bio: '', profile_picture: '' });
    const [editMode, setEditMode] = useState(false);
    const { userId } = useParams();
    const { token } = useAuth(); // Use the token for authenticated requests


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`https://dry-dawn-86507-cc866b3e1665.herokuapp.com/profile/${userId}`);
                if (response.data) {
                    setUserData(response.data); // Set the whole user data object
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [userId]);

    const handleBioChange = (event) => {
        setUserData({ ...userData, bio: event.target.value });
    };

    const handleEditSubmit = async () => {
        try {
            const response = await axios.put(`https://dry-dawn-86507-cc866b3e1665.herokuapp.com/profile/${userId}`, {
                bio: userData.bio
            }, {
                headers: {
                    Authorization: `Bearer ${token}` // Include the token in the request
                }
            });
            console.log('Profile update response:', response.data);

            setUserData(prevState => ({
                ...prevState,
                bio: userData.bio
            }));

            setEditMode(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <div>
            <header>
            </header>
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