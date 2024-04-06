import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Profile() {
    const [userData, setUserData] = useState(null);
    const [bio, setBio] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        // Fetch user profile data from the backend
        axios.get('http://127.0.0.1:5000/profile')
            .then(response => {
                setUserData(response.data);
                setBio(response.data.bio);
                setProfilePicture(response.data.profilePicture);
                setFollowersCount(response.data.followers.length);
                setFollowingCount(response.data.following.length);
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
    }, []);

    const handleBioChange = (event) => {
        setBio(event.target.value);
    };

    const handleProfilePictureChange = (event) => {
        setProfilePicture(event.target.files[0]);
    };

    const handleEditSubmit = () => {
        // Send updated bio and profile picture to the backend
        const formData = new FormData();
        formData.append('bio', bio);
        formData.append('profilePicture', profilePicture);

        axios.post('http://127.0.0.1:5000/update-profile', formData)
            .then(response => {
                // Handle success
                console.log('Profile updated successfully');
                setEditMode(false);
            })
            .catch(error => {
                console.error('Error updating profile:', error);
            });
    };

    return (
        <div>
            <header>
                <h1>User Profile</h1>
            </header>
            <div id="main-content">
                {userData && (
                    <div>
                        <h2>Welcome, {userData.username}!</h2>
                        <div>
                            <img src={profilePicture} alt="Profile" />
                            <p>Bio: {bio}</p>
                            <p>Followers: {followersCount}</p>
                            <p>Following: {followingCount}</p>
                            {editMode ? (
                                <div>
                                    <input type="file" onChange={handleProfilePictureChange} />
                                    <textarea value={bio} onChange={handleBioChange}></textarea>
                                    <button onClick={handleEditSubmit}>Save</button>
                                    <button onClick={() => setEditMode(false)}>Cancel</button>
                                </div>
                            ) : (
                                <button onClick={() => setEditMode(true)}>Edit Profile</button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;
