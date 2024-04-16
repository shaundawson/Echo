import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import RobotitoImage2 from '../images/Robotito2.png';
import './CreatePost.css';

function CreatePost() {
    const [songRecommendation, setSongRecommendation] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Handle the submission of the song recommendation and description
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const response = await axios.post('https://spotify-activity-app-274c06e33742.herokuapp.com/post', {
                song_recommendation: songRecommendation,
                description: description
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (response.status !== 201) {
                throw new Error('Failed to create post');
            }
            alert('Post created successfully!');
            setSongRecommendation('');
            setDescription('');
        } catch (error) {
            console.error('Post error:', error);
            setError(`Failed to create post: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="createPostContainer">
            <h1>Create a New Post</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={songRecommendation}
                    onChange={(e) => setSongRecommendation(e.target.value)}
                    placeholder="Enter a song recommendation"
                    required
                />
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    required
                ></textarea>
                <button type="submit" disabled={isSubmitting}>Post</button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <footer>
                <p>Copyright &#169; 2024 Echo. All Rights Reserved.</p>
            </footer>
        </div>
    );
}

export default CreatePost;