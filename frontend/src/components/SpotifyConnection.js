import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SpotifyConnection() {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Check if the user is connected to Spotify
        axios.get('https://dry-dawn-86507-cc866b3e1665.herokuapp.com/api/check-spotify-connection')
            .then(response => {
                setIsConnected(response.data.isConnected);
            })
            .catch(error => console.log('Error checking Spotify connection', error));
    }, []);

    const handleConnectSpotify = () => {
        window.location.href = '/register/spotify'; // Redirect to Spotify login
    };

    return (
        <div>
            {isConnected ? (
                <p>Connected to Spotify</p>
            ) : (
                <button onClick={handleConnectSpotify}>Connect to Spotify</button>
            )}
        </div>
    );
}

export default SpotifyConnection;
