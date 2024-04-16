import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AllPosts.css'; // Import the stylesheet


function AllPosts() {
    // State variable to hold the posts data
    const [posts, setPosts] = useState([]);

    // useEffect hook to fetch posts data when component mounts
    useEffect(() => {
        // Function to fetch posts data
        const fetchPosts = async () => {
            try {
                // Make GET request to fetch all posts data
                const response = await axios.get('https://spotify-activity-app-274c06e33742.herokuapp.com/all-posts', {
                    // Include credentials in the request for session management
                    withCredentials: true
                });
                // Update posts state with fetched data
                setPosts(response.data);
            } catch (error) {
                // Log and handle any errors that occur during fetching
                console.error('Error fetching posts:', error);
            }
        };
        // Call the fetchPosts function when component mounts
        fetchPosts();
    }, []);

    return (
        <>
            <div className="custom-container">
                <h1 className="custom-heading">Friend Activity</h1>
                {posts.map(post => (
                    <div className="custom-post-box" key={post.post_id}>
                        <h2 className="custom-post-title">{post.username}</h2>
                        <p className="custom-post-content">{post.song_recommendation}</p>
                        <p className="custom-post-content">{post.description}</p>
                        <p className="custom-post-timestamp">Posted on: {new Date(post.created_at).toLocaleDateString()}</p>


                    </div>
                ))}



            </div>
            <footer><p>Copyright &#169; 2024 Echo. All Rights Reserved.</p></footer>


        </>

    );
}

export default AllPosts;
