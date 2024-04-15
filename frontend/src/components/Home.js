import React, { useEffect, useState } from 'react'; // Import useEffect and useState
import { Link } from 'react-router-dom';
import './Home.css'; // Import the stylesheet





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

                {/* ... other components ... */}
            
            {/* ... rest of your component ... */}
                

      <p>Copyright &#169; 2024 Echo. All Rights Reserved.</p>

<div>

<img src = "./images/Robotito.png" alt="" />

</div>

      




      


            </div>

            
        </div>
    );
}




export default Home;
