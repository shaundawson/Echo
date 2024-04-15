import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AllPosts() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('https://dry-dawn-86507-cc866b3e1665.herokuapp.co/all-posts');
                setPosts(response.data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div>
            <h1>All Posts</h1>
            {posts.map(post => (
                <div key={post.post_id}>
                    <h2>{post.username}</h2>
                    <p>{post.song_recommendation}</p>
                    <p>{post.description}</p>
                    <p>Posted on: {new Date(post.created_at).toLocaleDateString()}</p>
                </div>
            ))}
        </div>
    );
}

export default AllPosts;
