document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Intersection Observer for Scroll Animations
    // This handles elements that should fade/slide in as they scroll into view
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Unobserve after animating once
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all elements that need to be animated
    const animatedElements = document.querySelectorAll('.fade-in-up, .slide-in-right, .reveal-text');
    animatedElements.forEach(el => animationObserver.observe(el));

    // 3. Parallax Effect for Feature Images (Subtle mouse interaction)
    const parallaxImages = document.querySelectorAll('.parallax-img');
    
    document.addEventListener('mousemove', (e) => {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
        
        parallaxImages.forEach(img => {
            // Only apply parallax if element is roughly in viewport
            const rect = img.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                img.style.transform = `translate(${xAxis}px, ${yAxis}px)`;
            }
        });
    });

    // Reset parallax on mouse out
    document.addEventListener('mouseleave', () => {
        parallaxImages.forEach(img => {
            img.style.transform = `translate(0px, 0px)`;
            img.style.transition = 'transform 0.5s ease';
        });
        
        setTimeout(() => {
            parallaxImages.forEach(img => {
                img.style.transition = 'transform 0.1s linear';
            });
        }, 500);
    });

    // 4. Stream Thumbnail click logic for the mockup
    const streamThumbs = document.querySelectorAll('.stream-thumb');
    streamThumbs.forEach(thumb => {
        thumb.addEventListener('click', function() {
            streamThumbs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 5. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', () => {
        // Simple toggle logic (would be expanded in a full implementation)
        const isExpanded = mobileMenuBtn.classList.toggle('active');
        if(isExpanded) {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '80px';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.backgroundColor = '#1e1f2b';
            navLinks.style.padding = '20px';
        } else {
            navLinks.style.display = 'none';
        }
    });

    // Reset inline styles on resize
    window.addEventListener('resize', () => {
        if(window.innerWidth > 768) {
            navLinks.style = '';
            mobileMenuBtn.classList.remove('active');
        }
    });
});
