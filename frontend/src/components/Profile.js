import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function Profile() {
    const [userData, setUserData] = useState({ username: '', bio: '' });
    const [editMode, setEditMode] = useState(false);
    const { userId } = useParams();

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
        setUserData({ ...userData, bio: event.target.value }); // Keep the rest of userData intact
    };

    const handleEditSubmit = async () => {
        try {
            const response = await axios.put(`https://dry-dawn-86507-cc866b3e1665.herokuapp.com/profile/${userId}`, { bio: userData.bio });
            console.log('Profile update response:', response.data);
            setEditMode(false); // Exit edit mode on successful save
            console.log("Exiting edit mode");
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <div>
            <header>
                <h1>User Profile</h1>
            </header>
            <div id="main-content">
                <h2>Welcome, {userData.username}</h2>
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
