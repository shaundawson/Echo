import React, { useState } from 'react';
import axios from 'axios';
//import { useAuth } from '../AuthContext';
import './CreatePost.css'; // Assuming the CSS file is in the same directory
import RobotitoImage2 from '../images/Robotito2.png'; // Adjust the path to where you have saved Robotito.png



function CreatePost() {
    const [songRecommendation, setSongRecommendation] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        };

        const body = JSON.stringify({ song_recommendation: songRecommendation, description });

        try {
            const response = await axios.post('https://dry-dawn-86507-cc866b3e1665.herokuapp.com/post', body, config);
            if (response.status === 201) {
                alert('Post created successfully!');
                setSongRecommendation('');
                setDescription('');
            } else {
                throw new Error('Failed to create post');
            }
        } catch (error) {
            console.error('Failed to create post:', error.response?.data);
            setError('Failed to create post: ' + (error.response?.data?.message || error.message));
        }

        setIsSubmitting(false);
    };

    return (
            <div className="createPostContainer">
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

            <div >
                <img src={RobotitoImage2} alt="Cute robot with headphones2" className="robot-image2"/>
            
            
            </div>


        </div>

        

        
    );
}

export default CreatePost;