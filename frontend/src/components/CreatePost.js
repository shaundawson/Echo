import React, { useState } from 'react';
import axios from 'axios';

function CreatePost() {
    const [songRecommendation, setSongRecommendation] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            };
            const body = JSON.stringify({ song_recommendation: songRecommendation, description });
            await axios.post('https://dry-dawn-86507-cc866b3e1665.herokuapp.com/post', body, config);
            // Handle success
            alert('Post created successfully!');
        } catch (error) {
            console.error('Failed to create post:', error.response?.data);
        }
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
                <button type="submit">Post</button>
            </form>
        </div>
    );
}

export default CreatePost;
