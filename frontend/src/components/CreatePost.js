import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';


function CreatePost() {
    const [songRecommendation, setSongRecommendation] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState(''); // State to hold error message
    const [isSubmitting, setIsSubmitting] = useState(false); // State to manage submission status

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(''); // Reset error message
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            };
            const body = JSON.stringify({ song_recommendation: songRecommendation, description });
            alert('Post created successfully!');
            setSongRecommendation(''); // Clear fields on success
            setDescription('');
        } catch (error) {
            console.error('Failed to create post:', error.response?.data);
            setError('Failed to create post: ' + (error.response?.data?.message || error.message));
        }
        setIsSubmitting(false);
    };

    return (
        <div>
            <h2>Create a New Post</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Song Recommendation</label>
                    <input
                        type="text"
                        value={songRecommendation}
                        onChange={(e) => setSongRecommendation(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" disabled={isSubmitting}>Post</button>
            </form>
        </div>
    );
}

export default CreatePost;
