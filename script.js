// script.js (JavaScript Version 1.7.2 - Refined Continuous Loop Scrolling)

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

    const startAutoScroll = () => {
        const scrollSpeed = 1; // Pixels to scroll per step
        const scrollDelay = 300; // Milliseconds between scroll steps

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

            // --- IMPORTANT CHANGE: Duplicate the content inside a temporary wrapper ---
            // This ensures we get the *exact* height of the first set of elements correctly.
            const originalContentWrapper = document.createElement('div');
            originalContentWrapper.className = 'original-events-wrapper'; // Add a class for potential debugging/styling

            const eventItems = Array.from(upcomingEventsContainer.children); // Get all current items
            eventItems.forEach(item => {
                originalContentWrapper.appendChild(item); // Move existing items into the wrapper
            });

            upcomingEventsContainer.appendChild(originalContentWrapper); // Add the wrapper back

            // Capture the height of the original content wrapper
            // This needs to be done *after* it's in the DOM
            originalContentHeight = originalContentWrapper.offsetHeight; // Use offsetHeight for total height including padding/border

            // Now clone the entire wrapper and append it
            const clonedContentWrapper = originalContentWrapper.cloneNode(true);
            clonedContentWrapper.className = 'cloned-events-wrapper'; // Add a class for potential debugging/styling
            upcomingEventsContainer.appendChild(clonedContentWrapper);

            // --- END IMPORTANT CHANGE ---

            const scrollStep = () => {
                // Check if we have scrolled past the original content height
                if (upcomingEventsContainer.scrollTop >= originalContentHeight) {
                    // Reset to the equivalent position at the beginning of the duplicated content
                    // By subtracting originalContentHeight, we effectively loop back without a jump.
                    upcomingEventsContainer.scrollTop = upcomingEventsContainer.scrollTop - originalContentHeight;
                } else {
                    upcomingEventsContainer.scrollTop += scrollSpeed; // Continue scrolling down
                }

                if (scrollIntervalId !== null) {
                    animationFrameId = requestAnimationFrame(scrollStep);
                }
            };

            animationFrameId = requestAnimationFrame(scrollStep);

            scrollIntervalId = setInterval(() => {
                if (scrollIntervalId !== null) {
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

                // Python backend already limits to 30 events, so no need to slice here.

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
                setTimeout(startAutoScroll, 100);
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
