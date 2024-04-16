import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UserFeed.css'; // This line imports the CSS from above


function UserFeed() {
    // State variable to hold the user data
    const [users, setUsers] = useState([]);

    // useEffect hook to fetch user data when component mounts
    useEffect(() => {
        // Fetch user data from the backend API
        axios.get('https://dry-dawn-86507-cc866b3e1665.herokuapp.com/users', { withCredentials: true })
            .then(response => {
                // Update users state with fetched data
                setUsers(response.data);
            })
            .catch(error => {
                // Log and handle any errors that occur during fetching
                console.error('There was an error fetching the user data:', error);
            });
    }, []); // Empty dependency array to make sure this effect runs only once on mount

    return (
        <div className="user-feed-container">
            <h1 className="user-feed-heading">User Feed</h1>
            <ul>
                {users.map(user => (
                    <li key={user.username} className="user-card">
                        <h2 className="user-name">{user.username}</h2>
                        <p className="user-bio">{user.bio}</p>
                    </li>
                ))}
            </ul>
            <footer><p>Copyright &#169; 2024 Echo. All Rights Reserved.</p></footer>
        </div>
    );
}
export default UserFeed;
