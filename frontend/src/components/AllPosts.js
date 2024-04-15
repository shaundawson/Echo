import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AllPosts.css'; // Import the stylesheet


function AllPosts() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('https://dry-dawn-86507-cc866b3e1665.herokuapp.com/all-posts', {
                    withCredentials: true
                });
                setPosts(response.data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className="custom-container">
            <h1 className="custom-heading">All Posts</h1>
            {posts.map(post => (
                <div className="custom-post-box" key={post.post_id}>
                    <h2 className="custom-post-title">{post.username}</h2>
                    <p className="custom-post-content">{post.song_recommendation}</p>
                    <p className="custom-post-content">{post.description}</p>
                    <p className="custom-post-timestamp">Posted on: {new Date(post.created_at).toLocaleDateString()}</p>
                </div>
            ))}
        </div>
    );
}

export default AllPosts;
