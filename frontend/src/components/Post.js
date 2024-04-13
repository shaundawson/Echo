import React from 'react';

function Post({ postData }) {
    // Early return pattern for loading state
    if (!postData) {
        return <div>Loading...</div>;
    }

    // Destructure postData for cleaner access to properties
    const { song_recommendation, description } = postData;

    return (
        <div>
            <h2>{song_recommendation}</h2>
            <p>{description}</p>
        </div>
    );
}

export default Post;