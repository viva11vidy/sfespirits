document.addEventListener('DOMContentLoaded', function () {

    // --- Mobile Navigation ---
    const hamburger = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.navbar-nav');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    // Function to close the mobile menu and reset icon
    function closeMobileMenu() {
        if (navMenu.classList.contains('mobile-active')) {
            navMenu.classList.remove('mobile-active');
            hamburger.setAttribute('aria-expanded', 'false');
            // Ensure correct icon is shown (fa-bars is the closed state)
            const icon = hamburger.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            const isOpened = navMenu.classList.toggle('mobile-active');
            hamburger.setAttribute('aria-expanded', isOpened);

            // Toggle hamburger icon for visual feedback
            const icon = hamburger.querySelector('i');
            if (isOpened) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });


    // --- Single Page Application (SPA) Navigation ---
    const pageLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page-content');

    // General function to handle page switching, used by both nav links and the logo
    function switchToPage(targetPageId) {
        // Hide all pages
        pages.forEach(page => {
            page.style.display = 'none';
        });

        // Show the target page
        const targetPage = document.getElementById(targetPageId);
        if (targetPage) {
            targetPage.style.display = 'block';
        }

        // Update active link in navigation
        pageLinks.forEach(nav => nav.classList.remove('active-link'));
        const activeLink = document.querySelector(`.nav-link[data-page="${targetPageId}"]`);
        if (activeLink) {
            activeLink.classList.add('active-link');
        }

        // Scroll to top and trigger animations for the new page
        window.scrollTo(0, 0);
        observeSections();
    }


    pageLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetPageId = this.getAttribute('data-page');
            switchToPage(targetPageId);
            closeMobileMenu(); // Ensure mobile menu closes after clicking a link
        });
    });

    // --- NEW: Logo Click Functionality (Go to Home) ---
    const headerLogo = document.querySelector('.header-logo');
    const homePageId = 'home-page';

    if (headerLogo) {
        headerLogo.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default anchor behavior

            const currentPage = document.querySelector('.page-content[style*="display: block"]');

            // Only switch page if we are not already on the home page
            if (currentPage && currentPage.id !== homePageId) {
                switchToPage(homePageId);
                closeMobileMenu(); // Close menu if clicking the logo while mobile menu is open
            }
        });
    }
    // --- END NEW FUNCTIONALITY ---


    // --- Home Page Image Slider Logic (New) ---
    const imageSlider = document.querySelector('.image-slider');
    if (imageSlider) {
        const slides = imageSlider.querySelectorAll('.slide');
        const prevButton = imageSlider.querySelector('.prev-btn');
        const nextButton = imageSlider.querySelector('.next-btn');
        let currentSlide = 0;

        function showSlide(index) {
            // Remove active class from all slides
            slides.forEach(slide => {
                slide.classList.remove('active-slide');
                // FIX: Removed dynamic position change
            });

            // Handle wrapping (looping)
            if (index < 0) {
                index = slides.length - 1;
            } else if (index >= slides.length) {
                index = 0;
            }

            // Update current slide index and set active class
            currentSlide = index;
            slides[currentSlide].classList.add('active-slide');
            // FIX: Removed dynamic position change


            // Update Aria label for accessibility (e.g., "1 of 2")
            slides[currentSlide].setAttribute('aria-label', `${currentSlide + 1} of ${slides.length}`);
        }

        // Initialize the first slide
        setTimeout(() => showSlide(currentSlide), 0);

        // Event listeners for navigation
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                showSlide(currentSlide - 1);
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                showSlide(currentSlide + 1);
            });
        }
    }
    // --- End Home Page Image Slider Logic ---


    // --- Scoped Tabs Functionality ---
    const tabContainers = document.querySelectorAll('.tabs-container');
    tabContainers.forEach(container => {
        const tabButtons = container.querySelectorAll('.tab-button');
        const parentSection = container.closest('section');
        const tabContents = parentSection.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', function () {
                const tabId = this.getAttribute('data-tab');

                tabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                tabContents.forEach(content => {
                    // Get the spirit section inside the tab content
                    const spiritSection = content.querySelector('.spirit-section');

                    content.classList.remove('active');

                    // FIX: Remove 'is-visible' from the old content to reset it for animation
                    if (spiritSection) {
                        spiritSection.classList.remove('is-visible');
                    }

                    if (content.id === tabId) {
                        content.classList.add('active');

                        // FIX: Immediately add 'is-visible' to the new content on click
                        if (spiritSection) {
                            spiritSection.classList.add('is-visible');
                        }
                    }
                });
            });
        });
    });

    // --- Testimonial Slider (Fixed for Responsiveness & Swipe) ---
    const slider = document.querySelector('.testimonial-slider');
    if (slider) {
        const slidesContainer = slider.querySelector('.slides-container');
        const slides = Array.from(slider.querySelectorAll('.slide'));
        const prevBtn = slider.querySelector('.prev-btn');
        const nextBtn = slider.querySelector('.next-btn');
        const dotsContainer = slider.querySelector('.dots-container');
        let currentIndex = 0;
        let slideInterval;

        // Swipe/Touch variables
        let startX = 0;
        let endX = 0;
        let isDragging = false;
        let startTransform = 0;
        const SWIPE_THRESHOLD = 50; // Minimum pixels to swipe to trigger change

        if (slides.length > 0) {
            let dots = [];

            // Create navigation dots
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.classList.add('dot');
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                dot.setAttribute('role', 'tab');
                dot.addEventListener('click', () => goToSlide(i));
                if (dotsContainer) dotsContainer.appendChild(dot);
                dots.push(dot);
            });

            function updateSlider() {
                // Ensure we only proceed if slides exist and have a measurable width
                if (slides.length === 0 || slides[0].offsetWidth === 0) return;

                const slideWidth = slides[0].offsetWidth;

                // CRITICAL ALIGNMENT FIX: Use Math.round() or force pixel alignment
                // to prevent sub-pixel issues causing partial content visibility.
                const newTransform = -Math.round(slideWidth * currentIndex);
                slidesContainer.style.transform = `translateX(${newTransform}px)`;

                if(dots.length > 0) {
                    dots.forEach(dot => {
                        dot.classList.remove('active');
                        dot.removeAttribute('aria-selected');
                    });
                    dots[currentIndex].classList.add('active');
                    dots[currentIndex].setAttribute('aria-selected', 'true');

                    slides.forEach((slide, index) => {
                       const label = `${index + 1} of ${slides.length}`;
                       slide.setAttribute('aria-label', label);
                    });
                }
            }

            function goToSlide(index) {
                currentIndex = (index + slides.length) % slides.length;
                updateSlider();
                resetInterval();
            }

            function startInterval() {
                clearInterval(slideInterval);
                slideInterval = setInterval(() => {
                    goToSlide(currentIndex + 1);
                }, 5000);
            }

            function resetInterval() {
                startInterval();
            }

            // --- Touch/Swipe Handlers ---

            function getTouchCoord(e) {
                return e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
            }

            // Starts the drag/swipe operation (Mouse and Touch Down)
            const handleDragStart = (e) => {
                isDragging = true;
                // Determine start position based on event type
                startX = e.type.startsWith('touch') ? getTouchCoord(e.touches) : e.clientX;

                // Temporarily disable CSS transition for smoother dragging
                slidesContainer.style.transition = 'none';

                // Parse current transform value
                const currentTransform = slidesContainer.style.transform;
                const match = currentTransform.match(/translateX\(([-.\d]+)px\)/);
                startTransform = match ? parseFloat(match[1]) : 0;
            };

            slidesContainer.addEventListener('mousedown', handleDragStart);
            slidesContainer.addEventListener('touchstart', handleDragStart);

            // Moves the slide while dragging/swiping (Mouse and Touch Move)
            const handleDragMove = (e) => {
                if (!isDragging) return;
                // Prevent vertical scrolling interference
                if (e.cancelable) e.preventDefault();

                endX = e.type.startsWith('touch') ? getTouchCoord(e.touches) : e.clientX;
                const moveDistance = endX - startX;
                slidesContainer.style.transform = `translateX(${startTransform + moveDistance}px)`;
            };

            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('touchmove', handleDragMove, { passive: false }); // Use non-passive for preventDefault

            // Ends the drag/swipe operation (Mouse and Touch Up)
            const handleDragEnd = () => {
                if (!isDragging) return;
                isDragging = false;

                // Re-enable transition after processing the drag
                slidesContainer.style.transition = 'transform 0.5s ease-in-out';

                const moveDistance = endX - startX;

                // If the movement was significant, change slide
                if (moveDistance > SWIPE_THRESHOLD) {
                    goToSlide(currentIndex - 1); // Swipe right (previous slide)
                } else if (moveDistance < -SWIPE_THRESHOLD) {
                    goToSlide(currentIndex + 1); // Swipe left (next slide)
                } else {
                    // Force snap back to the EXACT current slide position
                    updateSlider();
                }

                // Reset drag values
                startX = 0;
                endX = 0;
                resetInterval();
            };

            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchend', handleDragEnd);
            window.addEventListener('mouseleave', handleDragEnd);

            // --- Initialization and Events ---

            if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
            if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));

            // CRITICAL: Re-run updateSlider on window resize to instantly fix slide position
            let resizeTimeout;
            window.addEventListener('resize', () => {
                // Throttle the resize event for performance
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    slidesContainer.style.transition = 'none';
                    updateSlider();
                    // Re-enable transition
                    setTimeout(() => slidesContainer.style.transition = 'transform 0.5s ease-in-out', 50);
                }, 100);
            });

            // Pause on hover
            slider.addEventListener('mouseenter', () => clearInterval(slideInterval));
            slider.addEventListener('mouseleave', startInterval);

            // Initialize slider
            goToSlide(0);
        }
    }


    // --- Fade-in sections on scroll ---
    let observer;
    function observeSections() {
        const sections = document.querySelectorAll('.fade-in-section');

        if (observer) observer.disconnect();

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        sections.forEach(section => {
            // Note: We intentionally DO NOT remove 'is-visible' here
            // because we want sections that have been clicked (tabs)
            // to remain visible. Only observe sections that need scrolling
            // to be triggered.

            // Re-apply observation to home page sections and any other content
            // not controlled by the tabs.
            if (!section.closest('.tab-content')) {
                 section.classList.remove('is-visible');
                 observer.observe(section);
            }
        });
    }

    observeSections();

// --- Initial Tab Load Fix ---
    function initializeDefaultTab() {
        const defaultTabContent = document.getElementById('whiskey-content');
        if (defaultTabContent) {
            // Note: 'active' class is already in the HTML, but we ensure the spirit section loads
            // defaultTabContent.classList.add('active');
            const spiritSection = defaultTabContent.querySelector('.spirit-section');
            if (spiritSection) {
                spiritSection.classList.add('is-visible');
            }
        }
    }

    // Call the function once all other setup is done
    initializeDefaultTab();
// --- End Initial Tab Load Fix ---
});