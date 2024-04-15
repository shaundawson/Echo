import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import RobotitoImage2 from '../images/Robotito2.png';
import './CreatePost.css';

function CreatePost() {
    const [songRecommendation, setSongRecommendation] = useState('');
    const [songUrl, setSongUrl] = useState('');  // State to store the song URL
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedSong, setSelectedSong] = useState(null);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { spotifyToken } = useAuth();

    useEffect(() => {
        console.log("Spotify Token updated in component:", spotifyToken);
    }, [spotifyToken]);

    // Function to handle song search using your backend as a proxy
    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const spotifyToken = localStorage.getItem('spotifyToken'); // Retrieve from localStorage
        if (!spotifyToken) {
            setError('No Spotify access token available.');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axios.get('https://api.spotify.com/v1/search', {
                withCredentials: true,
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
            setSearchResults(response.data.tracks.items);
        } catch (error) {
            console.error('Search error:', error);
            setError('Failed to fetch search results: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Function to handle the selection of a song from search results
    const handleSelectSong = (track) => {
        setSelectedSong(track);
        setSongUrl(track.external_urls.spotify); // Store the Spotify URL
    };

    // Function to handle the submission of the selected song and description
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError('');

        if (!spotifyToken) {
            setError('Authentication token is missing.');
            setIsSubmitting(false);
            return;
        }

        if (!selectedSong) {
            setError('Please select a song first.');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axios.post('https:/dry-dawn-86507-cc866b3e1665.herokuapp.com/post', {
                song_recommendation: selectedSong.id,
                song_url: songUrl,  // Include the song URL in the POST request
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
            setSearchQuery('');
            setDescription('');
            setSelectedSong(null);
            setSongUrl('');
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
                        <li key={track.id} onClick={() => handleSelectSong(track)}>
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
                <img src={RobotitoImage2} alt="Cute robot with headphones" className="robot-image" />
            </div>

            <footer><p>Copyright &#169; 2024 Echo. All Rights Reserved.</p></footer>
        </div>
    );
}

export default CreatePost;
