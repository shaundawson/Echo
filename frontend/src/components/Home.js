import React, { useEffect, useState } from 'react'; // Import useEffect and useState
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div>
            <header>
                <h1>Welcome to Our Music Player App</h1>
            </header>
            <div id="main-content">
                <h2>Discover and Enjoy Music</h2>
                <p>Get started by exploring our vast library of songs!</p>
                <Link to="/explore" className="button">Explore Music</Link>
                <br />
                <Link to="/login" className="button">Login/Create Account</Link>
            </div>
        </div>
    );
}

export default Home;
