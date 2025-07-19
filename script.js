// script.js (JavaScript Version 1.8 - Continuous Loop Scrolling with 5-second delay)

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
    let originalContentHeight = 0; // Store the height of the original set of events
    let isPausedAtLoopEnd = false; // New flag to manage the delay state

    const startAutoScroll = () => {
        const scrollSpeed = 1; // Pixels to scroll per step
        const scrollDelay = 300; // Milliseconds between scroll steps
        const loopEndPause = 5000; // 5 seconds delay at the end of the loop

        if (scrollIntervalId) {
            clearInterval(scrollIntervalId);
        }
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        isPausedAtLoopEnd = false; // Reset the pause flag when starting auto-scroll

        if (!upcomingEventsContainer) {
            console.warn("Upcoming events container not found, cannot start auto-scroll.");
            return;
        }

        if (upcomingEventsContainer.scrollHeight > upcomingEventsContainer.clientHeight) {

            // Capture the height of the original content *before* duplication
            originalContentHeight = upcomingEventsContainer.scrollHeight;

            // Duplicate the content directly within the container
            const clonedContent = upcomingEventsContainer.innerHTML;
            upcomingEventsContainer.innerHTML += clonedContent;

            const scrollStep = () => {
                if (isPausedAtLoopEnd) { // If paused, just return and wait for setTimeout
                    animationFrameId = requestAnimationFrame(scrollStep); // Keep the rAF loop alive
                    return;
                }

                if (upcomingEventsContainer.scrollTop >= originalContentHeight) {
                    // Stop scrolling for the delay
                    isPausedAtLoopEnd = true;
                    clearInterval(scrollIntervalId); // Stop the interval that triggers animation frames
                    cancelAnimationFrame(animationFrameId); // Stop the current animation frame

                    setTimeout(() => {
                        upcomingEventsContainer.scrollTop -= originalContentHeight; // Reset position
                        isPausedAtLoopEnd = false; // Release the pause
                        startAutoScroll(); // Restart the auto-scroll completely
                    }, loopEndPause);

                } else {
                    upcomingEventsContainer.scrollTop += scrollSpeed; // Continue scrolling down
                }

                if (!isPausedAtLoopEnd) { // Only request next frame if not paused
                    animationFrameId = requestAnimationFrame(scrollStep);
                }
            };

            animationFrameId = requestAnimationFrame(scrollStep);

            scrollIntervalId = setInterval(() => {
                if (!isPausedAtLoopEnd && scrollIntervalId !== null) { // Only trigger if not paused and active
                    animationFrameId = requestAnimationFrame(scrollStep);
                }
            }, scrollDelay);


            upcomingEventsContainer.addEventListener('mouseenter', () => {
                clearInterval(scrollIntervalId);
                cancelAnimationFrame(animationFrameId);
                scrollIntervalId = null;
                animationFrameId = null;
            });

            upcomingEventsContainer.addEventListener('mouseleave', () => {
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

                renderEvents(featuredEventsContainer, featuredEvents, true);
                renderEvents(upcomingEventsContainer, upcomingEvents);

                if (featuredEvents.length === 0) {
                    if (featuredEventsH1) featuredEventsH1.style.display = 'none';
                    if (featuredEventsContainer) featuredEventsContainer.style.display = 'none';
                } else {
                    if (featuredEventsH1) featuredEventsH1.style.display = '';
                    if (featuredEventsContainer) featuredEventsContainer.style.display = '';
                }

                // Delay scrolling start to allow DOM to settle and heights to be calculated
                setTimeout(startAutoScroll, 200); // Critical delay for accurate height
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

    fetchAndRenderEvents();
    setInterval(fetchAndRenderEvents, 15 * 60 * 1000);
});
