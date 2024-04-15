import React, { useEffect, useState } from 'react'; // Import useEffect and useState
import { Link } from 'react-router-dom';
import './Home.css'; // Import the stylesheet
import RobotitoImage from '../images/Robotito.png'; // Adjust the path to where you have saved Robotito.png


function Home() {
    return (
        <div className = "home-container">
            <header className="home-header">
                <h1>Welcome to Echo Our Music Player App</h1>
            </header>
            <div id="main-content">
                <h2>Discover and Enjoy Music</h2>
                <p>Get started by exploring our vast library of songs!</p>
                <Link to="/explore" className="button">Explore Music</Link>
                <br />
                <Link to="/login" className="button">Login/Create Account</Link>

 <div>
                <img src={RobotitoImage} alt="Cute robot with headphones" className="robot-image"/>
            </div>


            </div>

            <footer><p>Copyright &#169; 2024 Echo. All Rights Reserved.</p></footer>
      
            
        </div>
    );
}

export default Home;
