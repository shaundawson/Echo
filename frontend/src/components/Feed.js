import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Feed.css'; // Import the stylesheet


function Feed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

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

    const deletePost = async (id) => {
        try {
            await axios.delete(`https://dry-dawn-86507-cc866b3e1665.herokuapp.com/post/${id}`, {
                withCredentials: true
            });
            // Filter out the deleted post from the state
            setPosts(posts.filter(post => post.id !== id));
            alert('Post deleted successfully');
        } catch (error) {
            setError('Failed to delete post: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="feed-container">
            <h1 className="feed-heading">Your Posts</h1>
            {loading && <p className="loading-message">Loading...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && posts.length === 0 && <p>No posts to show.</p>}
            {!loading && posts.length > 0 && (
                <ul>
                    {posts.map(post => (
                        <li key={post.id}>
                            <div className="post-box">
                                <strong className="post-title">{post.song_recommendation}</strong>
                                <p className="post-content">{post.description}</p>
                                <small className="post-timestamp">Posted on: {new Date(post.created_at).toLocaleDateString()}</small>
                                <button className="delete-button" onClick={() => deletePost(post.id)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
                        <footer><p>Copyright &#169; 2024 Echo. All Rights Reserved.</p></footer>
        </div>
    );
}

export default Feed;
