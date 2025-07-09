document.addEventListener('DOMContentLoaded', () => {
    const eventListContainer = document.getElementById('event-list-container');
    const API_URL = 'https://OSUfrk09.pythonanywhere.com/events'; // **REPLACE WITH YOUR ACTUAL PYTHONANYWHERE URL**

    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`); // Handle potential HTTP errors
            }
            return response.json(); // Parse the response as JSON
        })
        .then(events => {
            eventListContainer.innerHTML = ''; // Clear the loading message
            if (events.length > 0) {
                events.forEach(event => {
                    const eventDiv = document.createElement('div'); // Create a div for each event
                    eventDiv.className = 'event-item'; // Assign a CSS class for styling
                    eventDiv.innerHTML = `
                        <h3>${event.name}</h3>
                        <p class='event-time'>Starts: ${event.starts_at} | Ends: ${event.ends_at}</p>
                        <p class='event-location'>Location: ${event.location}</p>
                    `;
                    eventListContainer.appendChild(eventDiv); // Add the event to the container
                });
            } else {
                eventListContainer.innerHTML = '<p>No upcoming events found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching events:', error); // Log any errors during the fetch or parsing process
            eventListContainer.innerHTML = '<p>Failed to load events. Please try again later.</p>'; // Display an error message to the user
        });
});
