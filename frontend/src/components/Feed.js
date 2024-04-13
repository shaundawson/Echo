import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';


function Feed() {
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState(''); // State for new post content
    const { currentUser } = useAuth(); // Get currentUser from context

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get('https://dry-dawn-86507-cc866b3e1665.herokuapp.com/posts', { withCredentials: true });
            setPosts(response.data);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        }
    };

    const handleCreatePost = async (songRecommendation, description) => {
        if (!songRecommendation.trim()) return;
        try {
            await axios.post('https://dry-dawn-86507-cc866b3e1665.herokuapp.com/post', {
                song_recommendation: songRecommendation,
                description: description,
            }, { withCredentials: true });
            fetchPosts();  // Re-fetch posts after creation
        } catch (error) {
            console.error('Failed to create post:', error);
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await axios.delete(`https://dry-dawn-86507-cc866b3e1665.herokuapp.com/post/${postId}`, { withCredentials: true });
            setPosts(posts.filter(post => post.id !== postId)); // Update local state
        } catch (error) {
            console.error('Failed to delete post:', error);
        }
    };

    return (
        <div>
            <div>
                {/* Form to create a post */}
                <textarea placeholder="What's on your mind?" onChange={e => setNewPostContent(e.target.value)}></textarea>
                <button onClick={() => handleCreatePost(newPostContent)}>Post</button>
            </div>
            <div>
                {posts.map(post => (
                    <div key={post.id}>
                        <p>{post.song_recommendation}</p>
                        <p>{post.description}</p>
                        {currentUser && currentUser.user_id === post.user_id && (
                            <button onClick={() => handleDeletePost(post.id)}>Delete</button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Feed;