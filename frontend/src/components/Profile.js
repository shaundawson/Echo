import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function Profile() {
    const [userData, setUserData] = useState(null);
    const [bio, setBio] = useState('');
    const [editMode, setEditMode] = useState(false);
    const { userId } = useParams();

    useEffect(() => {
        if (userId) {
            axios.get(`http://127.0.0.1:5000/profile/${userId}`)
                .then(response => {
                    setUserData(response.data);
                    setBio(response.data.bio || '');
                })
                .catch(error => console.error('Error fetching user data:', error));
        }
    }, [userId]);

    const handleBioChange = (event) => {
        setBio(event.target.value);
    };

    const handleEditSubmit = async () => {
        try {
            // Assume your API expects a PUT request to update the profile
            const response = await axios.put(`http://127.0.0.1:5000/profile/${userId}`, { bio });
            console.log('Profile update response:', response.data);
            setEditMode(false); // Exit edit mode on successful save
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
                <h2>Welcome, {userData && userData.username}!</h2>
                <div>
                    {editMode ? (
                        <>
                            <textarea value={bio} onChange={handleBioChange}></textarea>
                            <button onClick={handleEditSubmit}>Save</button>
                            <button onClick={() => setEditMode(false)}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <p>Bio: {bio}</p>
                            <button onClick={() => setEditMode(true)}>Edit Profile</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;
