function Post({ postData }) {
    // Check if postData exists before trying to access its properties
    if (!postData) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {/* Corrected property name to match backend response */}
            <h2>{postData.song_recommendation}</h2>
            {/* Assuming you want to show the description as well */}
            <p>{postData.description}</p>
        </div>
    );
}

export default Post;
