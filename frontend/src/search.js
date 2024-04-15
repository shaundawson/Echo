document.getElementById('search-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const searchText = document.getElementById('search').value;
    fetch(`/search?query=${encodeURIComponent(searchText)}`)
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById('search-results');
            resultsContainer.innerHTML = ''; // Clear previous results
            data.tracks.items.forEach(item => {
                const div = document.createElement('div');
                div.textContent = `Name: ${item.name}, Artist: ${item.artists[0].name}`;
                resultsContainer.appendChild(div);
            });
        })
        .catch(error => console.error('Error:', error));
});
