import React, { useState, useContext } from 'react';
import { useAuth } from '../AuthContext';
import RobotitoImage2 from '../images/Robotito2.png'; // Adjust the path to where you have saved Robotito.png


function CreatePost() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedSong, setSelectedSong] = useState(null);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { spotifyToken } = useAuth();

    const handleSearch = async (event) => {
        event.preventDefault();
        setError('');  // Clear previous errors
        if (!spotifyToken) {
            setError('Authentication token is missing.');
            return;
        }

        try {
            const response = await fetch(`/search?query=${encodeURIComponent(searchQuery)}`, {
                headers: { Authorization: `Bearer ${spotifyToken}` }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch results');
            }
            const data = await response.json();
            setSearchResults(data.tracks.items);
        } catch (error) {
            console.error('Search error:', error);
            setError('Failed to fetch search results.');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError('');  // Clear previous errors

        if (!spotifyToken) {
            setError('Authentication token is missing.');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch('/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${spotifyToken}`
                },
                body: JSON.stringify({
                    song_recommendation: selectedSong ? selectedSong.id : null, // Ensure you send the ID
                    description: description
                })
            });
            if (!response.ok) {
                throw new Error('Failed to create post');
            }
            // Optionally handle a successful response
            alert('Post created successfully!');
            // Reset form
            setSearchQuery('');
            setDescription('');
            setSelectedSong(null);
            setSearchResults([]);
        } catch (error) {
            console.error('Post error:', error);
            setError(`Failed to create post: ${error.message}`);
        }
        setIsSubmitting(false);
    };

    return (
        <div>
            <h1>Create Song Recommendation</h1>
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

            <div >
                <img src={RobotitoImage2} alt="Cute robot with headphones2" className="robot-image2"/>
            
            
            </div>


        </div>

        

        
    );
}

export default CreatePost;