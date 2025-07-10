document.addEventListener('DOMContentLoaded', () => {
    const featuredEventsContainer = document.getElementById('featured-events-container');
    const upcomingEventsContainer = document.getElementById('event-list-container'); // Renamed for clarity

    const API_URL = 'https://osufrk09.pythonanywhere.com/events';

    // Helper function to render a list of events into a container
    const renderEvents = (container, eventsToRender, isFeaturedSection = false) => {
        if (!container) {
            console.error(`Error: Element not found: ${isFeaturedSection ? 'featured-events-container' : 'event-list-container'}`);
            return;
        }

        container.innerHTML = ''; // Clear loading message

        if (eventsToRender.length > 0) {
            eventsToRender.forEach(event => {
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
                    <p class='event-location'>${event.location}</p>
                    ${signupStatus}
                `;
                container.appendChild(eventDiv);
            });
        } else {
            container.innerHTML = `<p>No ${isFeaturedSection ? 'featured' : 'upcoming'} events found.</p>`;
        }
    };

    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(events => {
            // Filter events into featured and non-featured
            const featuredEvents = events.filter(event => event.featured === true); // Assuming 'featured' attribute exists and is boolean
            const upcomingEvents = events.filter(event => event.featured !== true);

            // Render events into their respective sections
            renderEvents(featuredEventsContainer, featuredEvents, true);
            renderEvents(upcomingEventsContainer, upcomingEvents);
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            if (featuredEventsContainer) {
                featuredEventsContainer.innerHTML = '<p>Failed to load featured events. Please try again later.</p>';
            }
            if (upcomingEventsContainer) {
                upcomingEventsContainer.innerHTML = '<p>Failed to load upcoming events. Please try again later.</p>';
            }
        });
});
