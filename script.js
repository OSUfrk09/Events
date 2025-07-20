// script.js (JavaScript Version 1.5 - Continuous Loop Scrolling, hide N/A Location, seamless loop fix)

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

                const locationHtml = (event.location && event.location.trim() !== '' && event.location !== 'N/A Location') ?
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

            // Add a spacer to the end of the scrollable list
            if (!isFeaturedSection) { // Only add to the scrollable upcoming events list
                const spacerDiv = document.createElement('div');
                spacerDiv.className = 'end-of-list-spacer';
                spacerDiv.style.height = '15px';
                spacerDiv.style.backgroundColor = '#2C2D2E'; // Match body background
                container.appendChild(spacerDiv);
            }

        } else {
            container.innerHTML = `<p>No ${isFeaturedSection ? 'featured' : 'upcoming'} events found.</p>`;
        }
    };

    let scrollIntervalId;
    let animationFrameId;
    // Renamed for clarity: this is the height of one set of (events + spacer)
    let heightOfFirstContentBlockWithSpacer = 0; 
    let isPausedAtLoopEnd = false;

    const startAutoScroll = () => {
        const scrollSpeed = 1; // Pixels to scroll per step
        const scrollDelay = 300; // Milliseconds between scroll steps
        const loopEndPause = 5000; // 5 seconds delay at the end of the loop
        const spacerHeight = 15; // Define the spacer height as a constant

        if (scrollIntervalId) {
            clearInterval(scrollIntervalId);
        }
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        isPausedAtLoopEnd = false;

        if (!upcomingEventsContainer) {
            console.warn("Upcoming events container not found, cannot start auto-scroll.");
            return;
        }

        if (upcomingEventsContainer.scrollHeight > upcomingEventsContainer.clientHeight) {

            // Capture the height of the original content *before* duplication
            // This is the height of the first full set of events + spacer
            heightOfFirstContentBlockWithSpacer = upcomingEventsContainer.scrollHeight; 

            // Duplicate the content directly within the container
            // Now the content looks like: (Events1 + Spacer1) + (Events2 + Spacer2)
            const clonedContent = upcomingEventsContainer.innerHTML;
            upcomingEventsContainer.innerHTML += clonedContent;

            const scrollStep = () => {
                if (isPausedAtLoopEnd) {
                    animationFrameId = requestAnimationFrame(scrollStep);
                    return;
                }

                // Check if we've scrolled past the first full set of events (including its spacer)
                if (upcomingEventsContainer.scrollTop >= heightOfFirstContentBlockWithSpacer) {
                    isPausedAtLoopEnd = true;
                    clearInterval(scrollIntervalId);
                    cancelAnimationFrame(animationFrameId);

                    setTimeout(() => {
                        // CRITICAL CHANGE: Reset scroll position to *just past the first spacer*
                        // This moves the scrollbar to the beginning of the *second set of events*,
                        // creating the seamless loop.
                        upcomingEventsContainer.scrollTop = spacerHeight; 
                        isPausedAtLoopEnd = false;
                        startAutoScroll();
                    }, loopEndPause);

                } else {
                    upcomingEventsContainer.scrollTop += scrollSpeed;
                }

                if (!isPausedAtLoopEnd) {
                    animationFrameId = requestAnimationFrame(scrollStep);
                }
            };

            animationFrameId = requestAnimationFrame(scrollStep);

            scrollIntervalId = setInterval(() => {
                if (!isPausedAtLoopEnd && scrollIntervalId !== null) {
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
                setTimeout(startAutoScroll, 2000); // Critical delay for accurate height
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
