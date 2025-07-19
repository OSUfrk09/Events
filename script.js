// script.js (JavaScript Version 1.6 - Fixing Auto-Scroll Restart Offset with scrollIntoView())

document.addEventListener('DOMContentLoaded', () => {
    const featuredEventsH1 = document.getElementById('featured-events-title');
    const featuredEventsContainer = document.getElementById('featured-events-container');
    const upcomingEventsContainer = document.getElementById('event-list-container');

    const API_URL = 'https://osufrk09.pythonanywhere.com/events';

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

                const locationHtml = (event.location && event.location.trim() !== '') ?
                                     `<p class='event-location'>${event.location}</p>` : '';

                const eventDiv = document.createElement('div');
                eventDiv.className = 'event-item';

                eventDiv.innerHTML = `
                    <div class="event-date-box">
                        <p>${formattedDate}</p>
                    </div>
                    <div class="event-info-box">
                        <h3>${event.name}</h3>
                        <p class='event-time'>${timeRange}</p>
                        ${locationHtml}
                        ${signupStatus}
                    </div>
                `;
                container.appendChild(eventDiv);
            });
        } else {
            container.innerHTML = `<p>No ${isFeaturedSection ? 'featured' : 'upcoming'} events found.</p>`;
        }
    };

    let scrollIntervalId; // Variable to hold the interval for scrolling
    let animationFrameId; // Variable to hold the requestAnimationFrame ID

    const startAutoScroll = () => {
        const scrollSpeed = 1; // Pixels to scroll per step
        const scrollDelay = 300; // Milliseconds between scroll steps

        // No longer strictly needed with scrollIntoView(), but can be kept as a small buffer if desired.
        // const restartThreshold = 5;

        // Clear any existing scroll intervals and animation frames
        if (scrollIntervalId) {
            clearInterval(scrollIntervalId);
        }
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        if (!upcomingEventsContainer) {
            console.warn("Upcoming events container not found, cannot start auto-scroll.");
            return;
        }

        if (upcomingEventsContainer.scrollHeight > upcomingEventsContainer.clientHeight) {
            const scrollStep = () => {
                // Check if we are near or at the bottom. Using a small buffer is still good practice.
                const scrolledToBottom = (upcomingEventsContainer.scrollTop + upcomingEventsContainer.clientHeight) >= (upcomingEventsContainer.scrollHeight - scrollSpeed); // Use scrollSpeed as a small threshold

                if (scrolledToBottom) {
                    // *** SOLUTION 1: Use scrollIntoView() to reset to the first event item ***
                    const firstEventItem = upcomingEventsContainer.querySelector('.event-item');
                    if (firstEventItem) {
                        firstEventItem.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Smoothly scroll to the top of the first item
                    } else {
                        // Fallback if somehow no items found (unlikely after render)
                        upcomingEventsContainer.scrollTop = 0;
                    }
                } else {
                    upcomingEventsContainer.scrollTop += scrollSpeed; // Scroll down
                }

                // Continue the animation loop if not paused
                if (scrollIntervalId !== null) {
                    animationFrameId = requestAnimationFrame(scrollStep);
                }
            };

            // Start the first scroll step
            animationFrameId = requestAnimationFrame(scrollStep);

            // Set an interval to trigger the next scroll step after a delay, allowing time for readability
            scrollIntervalId = setInterval(() => {
                // Only request a new frame if the interval is still active (not cleared by hover)
                if (scrollIntervalId !== null) {
                    animationFrameId = requestAnimationFrame(scrollStep);
                }
            }, scrollDelay);


            // Pause scrolling on hover
            upcomingEventsContainer.addEventListener('mouseenter', () => {
                clearInterval(scrollIntervalId);
                cancelAnimationFrame(animationFrameId);
                scrollIntervalId = null;
                animationFrameId = null;
            });

            // Resume scrolling on mouse leave
            upcomingEventsContainer.addEventListener('mouseleave', () => {
                // Only restart if currently paused
                if (scrollIntervalId === null && animationFrameId === null) {
                    startAutoScroll();
                }
            });
        }
    };


    const fetchAndRenderEvents = () => {
        fetch(API_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(events => {
                if (featuredEventsContainer) featuredEventsContainer.innerHTML = '';
                if (upcomingEventsContainer) upcomingEventsContainer.innerHTML = '';

                const featuredEvents = events.filter(event => event.featured === true);
                let upcomingEvents = events.filter(event => event.featured !== true);

                // Limit upcoming events to 30
                if (upcomingEvents.length > 30) {
                    upcomingEvents = upcomingEvents.slice(0, 30);
                }

                renderEvents(featuredEventsContainer, featuredEvents, true);
                renderEvents(upcomingEventsContainer, upcomingEvents);

                if (featuredEvents.length === 0) {
                    if (featuredEventsH1) featuredEventsH1.style.display = 'none';
                    if (featuredEventsContainer) featuredEventsContainer.style.display = 'none';
                } else {
                    if (featuredEventsH1) featuredEventsH1.style.display = '';
                    if (featuredEventsContainer) featuredEventsContainer.style.display = '';
                }

                // IMPORTANT: Ensure the container is fully rendered and measured before starting scroll.
                // A small timeout here can sometimes help if rendering isn't immediate.
                // If the issue persists, try uncommenting the following line and adjusting the delay.
                // setTimeout(startAutoScroll, 50); // Give browser a moment to lay out elements
                startAutoScroll();
            })
            .catch(error => {
                console.error('Error fetching events:', error);
                if (featuredEventsContainer) {
                    featuredEventsContainer.innerHTML = '<p>Failed to load featured events. Please try again later.</p>';
                }
                if (upcomingEventsContainer) {
                    upcomingEventsContainer.innerHTML = '<p>Failed to load upcoming events. Please try again later.</p>';
                }
                if (scrollIntervalId) {
                    clearInterval(scrollIntervalId);
                    scrollIntervalId = null;
                }
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
            });
    };

    // Initial fetch when the page loads
    fetchAndRenderEvents();

    // Refresh every 15 minutes (15 * 60 * 1000 milliseconds)
    setInterval(fetchAndRenderEvents, 15 * 60 * 1000);
});
