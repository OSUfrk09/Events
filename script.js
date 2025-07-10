document.addEventListener('DOMContentLoaded', function() {
    const eventsContainer = document.getElementById('event-list-container');

    // Your PythonAnywhere domain for the Flask backend
    // This has been updated based on previous messages.
    const API_URL = 'https://OSUfrk09.pythonanywhere.com/events'; 

    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(events => {
            if (events.length === 0) {
                if (eventsContainer) { // Defensive check
                    eventsContainer.innerHTML = '<p>No upcoming events found.</p>';
                } else {
                    console.error("Error: 'event-list-container' element not found to display message.");
                }
                return;
            }

            // Group events by month for better display
            const eventsByMonth = events.reduce((acc, event) => {
                const startDate = new Date(event.starts_at);
                const monthYear = startDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                if (!acc[monthYear]) {
                    acc[monthYear] = [];
                }
                acc[monthYear].push(event);
                return acc;
            }, {});

            for (const monthYear in eventsByMonth) {
                if (eventsContainer) { // Defensive check
                    const monthHeader = document.createElement('h3');
                    monthHeader.textContent = monthYear;
                    eventsContainer.appendChild(monthHeader);

                    eventsByMonth[monthYear].forEach(event => {
                        const eventElement = document.createElement('div');
                        eventElement.classList.add('event-card');

                        const startsAt = new Date(event.starts_at);
                        const endsAt = new Date(event.ends_at);

                        const startDateFormatted = startsAt.toLocaleString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
                        });
                        const endDateFormatted = endsAt.toLocaleString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
                        });

                        eventElement.innerHTML = `
                            <h4>${event.name}</h4>
                            <p><strong>Starts:</strong> ${startDateFormatted}</p>
                            <p><strong>Ends:</strong> ${endDateFormatted}</p>
                            <p>${event.location}</p> <!-- Location label removed here -->
                            ${event.registration_url ? `<p><a href="${event.registration_url}" target="_blank">Register Here</a></p>` : ''}
                        `;
                        eventsContainer.appendChild(eventElement);
                    });
                } else {
                    console.error("Error: 'event-list-container' element not found to append events.");
                    break; // Exit the loop if container is missing
                }
            }
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            if (eventsContainer) { // Defensive check
                eventsContainer.innerHTML = `<p>Error loading events: ${error.message}. Please try again later.</p>`;
            } else {
                console.error("Could not display error message: 'event-list-container' not found.");
            }
        });
});
