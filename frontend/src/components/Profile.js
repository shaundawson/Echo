import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function Profile() {
    const [userData, setUserData] = useState({
        username: '',
        bio: '',
        profile_picture: '',
        followersCount: 0,
        followingCount: 0
    });

    const [editMode, setEditMode] = useState(false);
    // This state tracks whether the current user is following the profile user
    const [isFollowing, setIsFollowing] = useState(false);
    const { userId } = useParams();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`https://dry-dawn-86507-cc866b3e1665.herokuapp.com/profile/${userId}`);
                if (response.data) {
                    setUserData(response.data); // Set the whole user data object, including isFollowing
                    setIsFollowing(response.data.isFollowing); // Update based on the backend response
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [userId]);

    const handleFollow = async () => {
        try {
            // Assuming you have a mechanism to identify the current user on the backend, such as a session or token
            const response = await axios.post(`https://dry-dawn-86507-cc866b3e1665.herokuapp.com/follow/${userId}`);
            if (response.status === 200) {
                setIsFollowing(true);
                setUserData(prevState => ({
                    ...prevState,
                    followersCount: prevState.followersCount + 1 // Optimistically update the follower count
                }));
            }
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    const handleUnfollow = async () => {
        try {
            const response = await axios.post(`https://dry-dawn-86507-cc866b3e1665.herokuapp.com/unfollow/${userId}`);
            if (response.status === 200) {
                setIsFollowing(false);
                setUserData(prevState => ({
                    ...prevState,
                    followersCount: prevState.followersCount - 1 // update the follower count
                }));
            }
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };

    const handleBioChange = (event) => {
        setUserData({ ...userData, bio: event.target.value }); // Keep the rest of userData intact
    };

    const handleEditSubmit = async () => {
        try {
            // Set headers for the request
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            // Convert userData.bio to JSON and specify headers
            const body = JSON.stringify({ bio: userData.bio });

            // Attempt to update the user's bio on the backend
            const response = await axios.put(
                `https://dry-dawn-86507-cc866b3e1665.herokuapp.com/profile/${userId}`,
                body,
                config
            );

            // Check for a successful update response before updating local state
            if (response.status === 200) {
                console.log('Profile update response:', response.data);

                // Update the local state to reflect the new bio
                setUserData(prevState => ({
                    ...prevState,
                    bio: userData.bio // Update the bio in the state with the new value
                }));

                // Exit edit mode to show the updated profile view
                setEditMode(false);
                console.log("Exiting edit mode");
            } else {
                // Handle unsuccessful update (e.g., log or display an error message)
                console.error('Profile update was not successful.');
            }
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
                <h2>Username: {userData.username}</h2>
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
                <p>Followers: {userData.followersCount}</p>
                <p>Following: {userData.followingCount}</p>
                {isFollowing ? (
                    <button onClick={handleUnfollow}>Unfollow</button>
                ) : (
                    <button onClick={handleFollow}>Follow</button>
                )}
            </div>
        </div>
    );
}

export default Profile;