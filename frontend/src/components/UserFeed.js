import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

    return (
        <div>
            <h1>User Feed</h1>
            <ul>
                {users.map(user => (
                    <li key={user.username}>
                        <h2>{user.username}</h2>
                        <p>{user.bio}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UserFeed;
