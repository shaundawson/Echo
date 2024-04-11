import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Feed() {
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get('https://dry-dawn-86507-cc866b3e1665.herokuapp.com/feed', { withCredentials: true });
            setPosts(response.data);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;

        try {
            await axios.post(`https://dry-dawn-86507-cc866b3e1665.herokuapp.com/post`, {
                song_recommendation: newPostContent,
            }, { withCredentials: true });

            setNewPostContent('');
            fetchPosts();
        } catch (error) {
            console.error('Failed to create post:', error);
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await axios.delete(`https://dry-dawn-86507-cc866b3e1665.herokuapp.com/post/${postId}`, { withCredentials: true });
            fetchPosts(); // Refresh the posts to remove the deleted post
        } catch (error) {
            console.error('Failed to delete post:', error);
        }
    };

    return (
        <div>
            <div className="post-creation">
                <textarea
                    placeholder="What's on your mind?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                ></textarea>
                <button onClick={handleCreatePost}>Post</button>
            </div>
            <div className="posts">
                {posts.map((post) => (
                    <div key={post.id} className="post">
                        <p>{post.song_recommendation}</p>
                        <p>{post.description}</p>
                        <button onClick={() => handleDeletePost(post.id)}>Delete</button> {/* Add a Delete button for each post */}
                    </div>
                ))}
            </div>
        </div>
    );
}
export default Feed;