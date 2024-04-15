document.getElementById('search-form').addEventListener('submit', function(e) {
    e.preventDefault();  // Prevent the default form submission behavior

    const searchText = document.getElementById('search').value;  // Get the value from the input
    const resultsContainer = document.getElementById('search-results');  // Get the container for search results

    // Clear previous results
    resultsContainer.innerHTML = '';

    // Check if search text is not empty
    if (!searchText.trim()) {
        resultsContainer.innerHTML = '<p>Please enter a valid search query.</p>';
        return;
    }

    // Fetching from Spotify's API as an example
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchText)}&type=track`;

    // You need to replace 'your_access_token' with a valid token
    fetch(url, {
        headers: {
            'Authorization': 'Bearer your_access_token'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.tracks && data.tracks.items.length > 0) {
            const tracks = data.tracks.items;
            const list = document.createElement('ul');

            // Loop through the tracks and create list items for each track
            tracks.forEach(track => {
                const listItem = document.createElement('li');
                listItem.textContent = `${track.name} by ${track.artists.map(artist => artist.name).join(', ')}`;
                list.appendChild(listItem);
            });

            resultsContainer.appendChild(list);
        } else {
            resultsContainer.innerHTML = '<p>No results found. Try a different search query.</p>';
        }
    })
    .catch(error => {
        console.error('Error fetching search results:', error);
        resultsContainer.innerHTML = '<p>Error fetching search results. Please try again.</p>';
    });
});
