import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Explore.css'; // Import the stylesheet
import RobotitoImage3 from '../images/Robotito3.png'; // Adjust the path to where you have saved Robotito.png


function Explore() {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate(); // For navigation after actions, if needed

    const handleSearch = (event) => {
        event.preventDefault();
        console.log(`Searching for: ${searchTerm}`);
    };

    return (
        <div className="explore-container">
            <header>
                <h1>Explore Music</h1>
                <img src={RobotitoImage3} alt="Cute robot with headphones3" className="robot-image3"/>

            </header>
            <main id="Explore-main-content">
                <form onSubmit={handleSearch}>
                    <div className="Explore-form-group">
                        <label htmlFor="search">Search for Music:</label>
                        <input
                            type="text"
                            id="search"
                            name="search"
                            placeholder="Enter song, artist, or genre"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="Explore-button">Search</button>
                </form>
                <div id="search-results">
                    {/* Place for displaying search results */}
                </div>
                <Link to="/" className="Explore-button">Back to Homepage</Link>
 <div >
               
            
            
            </div>

            </main>
        </div>
    );
}

export default Explore;