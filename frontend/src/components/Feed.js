import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';

function Feed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get('https://dry-dawn-86507-cc866b3e1665.herokuapp.com/posts', {
                    withCredentials: true
                });
                setPosts(response.data);
            } catch (error) {
                setError('Failed to fetch posts: ' + (error.response?.data?.message || error.message));
            }
            setLoading(false);
        };

        fetchPosts();
    }, []);

    return (
        <div>
            <h1>Your Posts</h1>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && posts.length === 0 && <p>No posts to show.</p>}
            {!loading && posts.length > 0 && (
                <ul>
                    {posts.map(post => (
                        <li key={post.id}>
                            <strong>{post.song_recommendation}</strong>
                            <p>{post.description}</p>
                            <small>Posted on: {new Date(post.created_at).toLocaleDateString()}</small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Feed;