import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import RobotitoImage2 from '../images/Robotito2.png'; // Adjust the path to where you have saved Robotito.png
import './CreatePost.css'; // Import the stylesheet


function CreatePost() {
    // State variables to manage form inputs, search results, submission status, and errors
    const [songRecommendation, setSongRecommendation] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedSong, setSelectedSong] = useState(null);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { spotifyToken } = useAuth(); // Get Spotify authentication token from context

    // Function to handle song search
    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Make GET request to Spotify API to search for tracks
            const response = await axios.get('https://api.spotify.com/v1/search', {
                headers: {
                    'Authorization': `Bearer ${spotifyToken}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    q: searchQuery,
                    type: 'track',
                    limit: 10
                }
            });
            setSearchResults(response.data.tracks.items);  // Update search results state
        } catch (error) {
            console.error('Search error:', error);
            setError('Failed to fetch search results: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Function to handle the submission of the selected song and description
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError('');

        // Check if Spotify token is available
        if (!spotifyToken) {
            setError('Authentication token is missing.');
            setIsSubmitting(false);
            return;
        }

        try {
            // Make POST request to create a new post with selected song and description
            const response = await axios.post('https://dry-dawn-86507-cc866b3e1665.herokuapp.com/post', {
                song_recommendation: selectedSong ? selectedSong.id : null,  // Ensure you send the ID
                description: description
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${spotifyToken}`
                }
            });
            if (response.status !== 201) {
                throw new Error('Failed to create post');
            }
            alert('Post created successfully!');
            // Clear form inputs and reset state
            setSearchQuery('');
            setDescription('');
            setSelectedSong(null);
            setSearchResults([]);
        } catch (error) {
            console.error('Post error:', error);
            setError(`Failed to create post: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="createPostContainer">

            <h1>It's time to recommend a song</h1>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a song"
                />
                <button type="submit" disabled={isSubmitting}>Search</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {searchResults.length > 0 && (
                <ul>
                    {searchResults.map((track) => (
                        <li key={track.id} onClick={() => setSelectedSong(track)}>
                            {track.name} - {track.artists.map(artist => artist.name).join(', ')}
                        </li>
                    ))}
                </ul>
            )}
            <form onSubmit={handleSubmit}>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                ></textarea>
                <button type="submit" disabled={isSubmitting}>Post Recommendation</button>
            </form>

            <div className="robotContainer">
                <img src={RobotitoImage2} alt="Cute robot with headphones2" className="robot-image2" />
            </div>

            <footer ><p>Copyright &#169; 2024 Echo. All Rights Reserved.</p></footer>
        </div>
    );
}

export default CreatePost;