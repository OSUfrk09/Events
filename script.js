document.addEventListener('DOMContentLoaded', function() {
    const eventsContainer = document.getElementById('events-container');

    // Replace with your actual PythonAnywhere domain for the Flask backend
    // Example: const API_URL = 'https://yourusername.pythonanywhere.com/events';
    const API_URL = 'YOUR_PYTHONANYWHERE_FLASK_APP_URL/events'; // <<-- Remember to change this!

    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(events => {
            if (events.length === 0) {
                eventsContainer.innerHTML = '<p>No upcoming events found.</p>';
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
                        <p>${event.location}</p> <!-- Removed '<strong>Location:</strong> ' label -->
                        ${event.registration_url ? `<p><a href="${event.registration_url}" target="_blank">Register Here</a></p>` : ''}
                    `;
                    eventsContainer.appendChild(eventElement);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            eventsContainer.innerHTML = `<p>Error loading events: ${error.message}. Please try again later.</p>`;
        });
});
