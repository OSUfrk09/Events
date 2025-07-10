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
            if (eventListContainer) { // Defensive check
                eventListContainer.innerHTML = ''; // Clear the loading message
            } else {
                console.error("Error: 'event-list-container' element not found after fetch success.");
                return; // Stop if container not found
            }

            if (events.length > 0) {
                events.forEach(event => {
                    const startDate = new Date(event.starts_at);
                    const endDate = new Date(event.ends_at);

                    const isValidStartDate = !isNaN(startDate.getTime());
                    const isValidEndDate = !isNaN(endDate.getTime());

                    let formattedDate = 'N/A Date';
                    let timeRange = 'N/A Time';

                    if (isValidStartDate) {
                        formattedDate = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }).format(startDate);
                        const formattedStartTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(startDate);

                        if (isValidEndDate) {
                            const formattedEndTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(endDate);
                            timeRange = `${formattedStartTime} - ${formattedEndTime}`;
                        } else {
                            timeRange = `Starts: ${formattedStartTime}`;
                        }
                    } else if (isValidEndDate) {
                        const formattedEndTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(endDate);
                        timeRange = `Ends: ${formattedEndTime}`;
                    }

                    let signupStatus = '';
                    if (event.registration_url && event.registration_url.trim() !== '') {
                        signupStatus = `<p class='event-signup'>Signup Available</p>`;
                    }

                    const eventDiv = document.createElement('div');
                    eventDiv.className = 'event-item';
                    eventDiv.innerHTML = `
                        <h3>${event.name}</h3>
                        <p class='event-date'>${formattedDate}</p>
                        <p class='event-time'>${timeRange}</p>
                        <p class='event-location'>${event.location}</p> <!-- ONLY THIS LINE WAS CHANGED -->
                        ${signupStatus}
                    `;
                    eventListContainer.appendChild(eventDiv);
                });
            } else {
                eventListContainer.innerHTML = '<p>No upcoming events found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            if (eventListContainer) { // Defensive check
                eventListContainer.innerHTML = '<p>Failed to load events. Please try again later.</p>';
            } else {
                console.error("Could not display error message: 'event-list-container' not found in catch block.");
            }
        });
});
