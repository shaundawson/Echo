import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UserFeed.css'; // This line imports the CSS from above
import { useNavigate } from 'react-router-dom'; // Import useNavigate


function UserFeed() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        axios.get('https://dry-dawn-86507-cc866b3e1665.herokuapp.com/users', { withCredentials: true })
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the user data:', error);
            });
    }, []);

    const handleFollowToggle = (userId, isCurrentlyFollowing) => {
        const endpoint = isCurrentlyFollowing ? 'unfollow' : 'follow';
        axios.post(`https://dry-dawn-86507-cc866b3e1665.herokuapp.com/${endpoint}/${userId}`, {}, { withCredentials: true })
            .then(() => {
                // Update the local state to reflect the new follow status
                const updatedUsers = users.map(user => {
                    if (user.id === userId) {
                        return { ...user, is_following: !isCurrentlyFollowing };
                    }
                    return user;
                });
                setUsers(updatedUsers);
            })
            .catch(error => {
                console.error(`Error ${isCurrentlyFollowing ? 'unfollowing' : 'following'} user:`, error);
            });

            

    };

    return (
        <div className="user-feed-container">
            <h1 className="user-feed-heading">User Feed</h1>
            <ul>
                {users.map(user => (
                    <li key={user.username} className="user-card">
                        <h2 className="user-name">{user.username}</h2>
                        <p className="user-bio">{user.bio}</p>
                        <button onClick={() => handleFollowToggle(user.id, user.is_following)}>
                            {user.is_following ? 'Unfollow' : 'Follow'}
                        </button>
                    </li>
                ))}
            </ul>
            <footer>
                © 2024 Your Company. All rights reserved.
            </footer>
        </div>
    );
}

export default UserFeed;
