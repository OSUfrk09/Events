document.addEventListener('DOMContentLoaded', () => {
    const eventListContainer = document.getElementById('event-list-container');
    const API_URL = 'https://osufrk09.pythonanywhere.com/events'; // Ensure this is the correct HTTPS URL

    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(events => {
            eventListContainer.innerHTML = ''; // Clear the loading message
            if (events.length > 0) {
                events.forEach(event => {
                    // Create Date objects from the ISO strings returned by your API
                    const startDate = new Date(event.starts_at);
                    const endDate = new Date(event.ends_at);

                    // Format Day and Month (e.g., "Jul 9")
                    const formattedDate = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }).format(startDate);

                    // Format Time (e.g., "04:30 PM")
                    const formattedStartTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(startDate);
                    const formattedEndTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(endDate);

                    const eventDiv = document.createElement('div');
                    eventDiv.className = 'event-item';
                    eventDiv.innerHTML = `
                        <h3>${event.name}</h3>
                        <p class='event-date'>${formattedDate}</p>
                        <p class='event-time-start'>Starts: ${formattedStartTime}</p>
                        <p class='event-time-end'>Ends: ${formattedEndTime}</p>
                        <p class='event-location'>Location: ${event.location}</p>
                    `;
                    eventListContainer.appendChild(eventDiv);
                });
            } else {
                eventListContainer.innerHTML = '<p>No upcoming events found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            eventListContainer.innerHTML = '<p>Failed to load events. Please try again later.</p>';
        });
});
