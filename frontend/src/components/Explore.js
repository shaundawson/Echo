import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// import './styles.css'; // Ensure you have the correct path to your CSS

function Explore() {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate(); // For navigation after actions, if needed

    const handleSearch = (event) => {
        event.preventDefault();
        // Handle search logic here. For example:
        console.log(`Searching for: ${searchTerm}`);
        // After search logic, you might want to navigate or update state with search results
        // navigate('/search-results'); // Navigate to a route displaying search results
    };

    return (
        <div>
            <header>
                <h1>Explore Music</h1>
            </header>
            <div id="main-content">
                <form onSubmit={handleSearch}>
                    <div className="form-group">
                        <label htmlFor="search">Search for Music:</label>
                        <input type="text" id="search" name="search" placeholder="Enter song, artist, or genre" onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button type="submit" className="button">Search</button>
                </form>
                <div id="search-results">
                    {/* Search results would be displayed here */}
                </div>
                <Link to="/" className="button">Back to Homepage</Link> {/* Use Link for SPA internal navigation */}
            </div>
        </div>
    );
}

export default Explore;