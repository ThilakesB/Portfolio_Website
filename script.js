/* ── Glassmorphism Custom Cursor ───────────────────────────────── */
(function () {
    // Only enable on pointer (non-touch) devices
    if (!window.matchMedia('(hover: hover)').matches) return;

    // Create DOM elements
    const orb = document.createElement('div');
    orb.id = 'cursor-orb';
    const dot = document.createElement('div');
    dot.id = 'cursor-dot';
    document.body.appendChild(orb);
    document.body.appendChild(dot);
    document.body.classList.add('custom-cursor-active');

    // Spring state for the orb (lagged)
    let orbX = -100, orbY = -100;
    let dotX = -100, dotY = -100;
    let mouseX = -100, mouseY = -100;
    const ORB_SPEED = 0.12;   // 0–1: lower = more lag
    const DOT_SPEED = 1.0;    // dot snaps instantly

    function lerp(a, b, t) { return a + (b - a) * t; }

    function tick() {
        orbX = lerp(orbX, mouseX, ORB_SPEED);
        orbY = lerp(orbY, mouseY, ORB_SPEED);
        dotX = lerp(dotX, mouseX, DOT_SPEED);
        dotY = lerp(dotY, mouseY, DOT_SPEED);

        orb.style.transform = `translate(calc(${orbX}px - 50%), calc(${orbY}px - 50%))`;
        dot.style.transform = `translate(calc(${dotX}px - 50%), calc(${dotY}px - 50%))`;

        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Hover effect on interactive elements
    const hoverTargets = 'a, button, [role="button"], input, textarea, select, label, .project-card, .timeline-item, .cert-timeline-item, .hackathon-card-showcase, .center-text, .nav-link';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverTargets)) {
            orb.classList.add('hovering');
            dot.classList.add('hovering');
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverTargets)) {
            orb.classList.remove('hovering');
            dot.classList.remove('hovering');
        }
    });

    // Click burst effect
    document.addEventListener('mousedown', () => {
        orb.classList.add('clicking');
        dot.classList.add('clicking');
    });
    document.addEventListener('mouseup', () => {
        orb.classList.remove('clicking');
        dot.classList.remove('clicking');
    });

    // Hide when pointer leaves window
    document.addEventListener('mouseleave', () => {
        orb.style.opacity = '0';
        dot.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        orb.style.opacity = '1';
        dot.style.opacity = '1';
    });
})();
/* ──────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Smart Smooth Motion Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Add scrolled background glass state
        if (currentScrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Smart motion: hide on scroll down, reveal on scroll up
        if (currentScrollY > 150 && currentScrollY > lastScrollY) {
            navbar.classList.add('nav-hidden');
        } else {
            navbar.classList.remove('nav-hidden');
        }

        lastScrollY = currentScrollY;
    });

    // 2. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Reset styles on resize
    window.addEventListener('resize', () => {
        if(window.innerWidth > 768) {
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        }
    });

    // 3. GSAP Scrolling Animations
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Hero Content fade and slide up
        gsap.from('.hero-content > *', {
            opacity: 0,
            y: 40,
            duration: 1,
            stagger: 0.12,
            ease: 'power3.out'
        });

        // Hero Image slide in from right
        gsap.from('.hero-avatar', {
            opacity: 0,
            scale: 0.85,
            duration: 1.2,
            ease: 'back.out(1.2)',
            delay: 0.4
        });

        // Projects Cards Animation grid stagger
        gsap.from('.project-card', {
            scrollTrigger: {
                trigger: '.projects-grid',
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 40,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out'
        });

        // Timeline Items staggered left fly-in
        gsap.from('.timeline-item', {
            scrollTrigger: {
                trigger: '.experience-timeline',
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            x: -30,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power2.out'
        });

        // Certifications Timeline Items staggered left fly-in
        gsap.from('.cert-timeline-item', {
            scrollTrigger: {
                trigger: '.certifications-timeline',
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            x: -30,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power2.out'
        });

        // Hackathons Showcase Animation
        gsap.from('.hackathon-card-showcase', {
            scrollTrigger: {
                trigger: '#hackathons',
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: 'power2.out'
        });
    }
});

