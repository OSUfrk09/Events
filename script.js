document.addEventListener('DOMContentLoaded', function() {
    const eventsContainer = document.getElementById('event-list-container');

    const API_URL = 'https://OSUfrk09.pythonanywhere.com/events';

    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(events => {
            if (eventsContainer) {
                eventsContainer.innerHTML = '';
            } else {
                console.error("Error: 'event-list-container' element not found during event processing.");
                return;
            }

            if (events.length === 0) {
                eventsContainer.innerHTML = '<p>No upcoming events found.</p>';
                return;
            }

            events.forEach(event => {
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
                    <p><strong>Location:</strong> ${event.location}</p>
                    ${event.registration_url ? `<p><a href="${event.registration_url}" target="_blank">Register Here</a></p>` : ''}
                `;
                eventsContainer.appendChild(eventElement);
            });
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            if (eventsContainer) {
                eventsContainer.innerHTML = `<p>Error loading events: ${error.message}. Please try again later.</p>`;
            } else {
                console.error("Could not display error message: 'event-list-container' not found in catch block.");
            }
        });
});
