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

    // 3. Three.js Particle Constellation Background
    class ConstellationBackground {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;

            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                alpha: true,
                antialias: true
            });

            this.particleCount = 60;
            this.maxDistance = 2.5; // Max distance for lines connecting
            this.particles = [];
            
            // Mouse coordinates
            this.mouse = { x: 0, y: 0 };
            this.targetMouse = { x: 0, y: 0 };

            this.init();
        }

        init() {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.camera.position.z = 8;

            // Initialize Particles
            const particleGeometry = new THREE.BufferGeometry();
            const positions = new Float32Array(this.particleCount * 3);

            for (let i = 0; i < this.particleCount; i++) {
                const x = (Math.random() - 0.5) * 14;
                const y = (Math.random() - 0.5) * 14;
                const z = (Math.random() - 0.5) * 8;

                positions[i * 3] = x;
                positions[i * 3 + 1] = y;
                positions[i * 3 + 2] = z;

                this.particles.push({
                    x: x, y: y, z: z,
                    vx: (Math.random() - 0.5) * 0.012,
                    vy: (Math.random() - 0.5) * 0.012,
                    vz: (Math.random() - 0.5) * 0.008
                });
            }

            particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            // Sig color matching --blurple (#5865F2)
            const particleMaterial = new THREE.PointsMaterial({
                color: 0x5865F2,
                size: 0.12,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });

            this.pointsMesh = new THREE.Points(particleGeometry, particleMaterial);
            this.scene.add(this.pointsMesh);

            // Connective Line segments setup
            this.lineGeometry = new THREE.BufferGeometry();
            this.maxLines = 250;
            this.linePositions = new Float32Array(this.maxLines * 2 * 3);
            this.lineColors = new Float32Array(this.maxLines * 2 * 3);

            this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(this.linePositions, 3));
            this.lineGeometry.setAttribute('color', new THREE.BufferAttribute(this.lineColors, 3));

            const lineMaterial = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.25,
                blending: THREE.AdditiveBlending
            });

            this.lineMesh = new THREE.LineSegments(this.lineGeometry, lineMaterial);
            this.scene.add(this.lineMesh);

            // Event bindings
            window.addEventListener('resize', () => this.onResize());
            window.addEventListener('mousemove', (e) => this.onMouseMove(e));

            this.animate();
        }

        onMouseMove(e) {
            this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        }

        onResize() {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }

        animate() {
            requestAnimationFrame(() => this.animate());

            // Smooth interpolation (Lerp)
            this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
            this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

            // Move particles
            const positions = this.pointsMesh.geometry.attributes.position.array;

            for (let i = 0; i < this.particleCount; i++) {
                const p = this.particles[i];
                
                p.x += p.vx;
                p.y += p.vy;
                p.z += p.vz;

                // Screen-edge warp resets
                if (p.x > 9) p.x = -9;
                else if (p.x < -9) p.x = 9;

                if (p.y > 9) p.y = -9;
                else if (p.y < -9) p.y = 9;

                if (p.z > 4) p.z = -4;
                else if (p.z < -4) p.z = 4;

                // Warp on mouse proximity
                const mx = this.mouse.x * 6;
                const my = this.mouse.y * 6;
                const dx = mx - p.x;
                const dy = my - p.y;
                const distToMouse = Math.sqrt(dx*dx + dy*dy);

                if (distToMouse < 2.5) {
                    const force = (2.5 - distToMouse) * 0.008;
                    p.x -= (dx / distToMouse) * force;
                    p.y -= (dy / distToMouse) * force;
                }

                positions[i * 3] = p.x;
                positions[i * 3 + 1] = p.y;
                positions[i * 3 + 2] = p.z;
            }
            this.pointsMesh.geometry.attributes.position.needsUpdate = true;

            // Update connected lines
            let lineIndex = 0;
            const linePosArray = this.lineGeometry.attributes.position.array;
            const lineColorArray = this.lineGeometry.attributes.color.array;

            const colorPoints = new THREE.Color('#5865F2'); // Blurple
            const colorFade = new THREE.Color('#090916'); // Matches --dark-blue background

            for (let i = 0; i < this.particleCount; i++) {
                for (let j = i + 1; j < this.particleCount; j++) {
                    if (lineIndex >= this.maxLines) break;

                    const p1 = this.particles[i];
                    const p2 = this.particles[j];

                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dz = p1.z - p2.z;
                    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

                    if (dist < this.maxDistance) {
                        const idx = lineIndex * 6;

                        linePosArray[idx] = p1.x;
                        linePosArray[idx + 1] = p1.y;
                        linePosArray[idx + 2] = p1.z;

                        linePosArray[idx + 3] = p2.x;
                        linePosArray[idx + 4] = p2.y;
                        linePosArray[idx + 5] = p2.z;

                        const alpha = 1.0 - (dist / this.maxDistance);
                        const finalColor = colorPoints.clone().lerp(colorFade, 1 - alpha);

                        lineColorArray[idx] = finalColor.r;
                        lineColorArray[idx + 1] = finalColor.g;
                        lineColorArray[idx + 2] = finalColor.b;

                        lineColorArray[idx + 3] = finalColor.r;
                        lineColorArray[idx + 4] = finalColor.g;
                        lineColorArray[idx + 5] = finalColor.b;

                        lineIndex++;
                    }
                }
            }

            // Zero out unused slots
            for (let i = lineIndex; i < this.maxLines; i++) {
                const idx = i * 6;
                linePosArray[idx] = 0;
                linePosArray[idx + 1] = 0;
                linePosArray[idx + 2] = 0;
                linePosArray[idx + 3] = 0;
                linePosArray[idx + 4] = 0;
                linePosArray[idx + 5] = 0;
            }

            this.lineGeometry.attributes.position.needsUpdate = true;
            this.lineGeometry.attributes.color.needsUpdate = true;

            this.renderer.render(this.scene, this.camera);
        }
    }

    // Spawn constellation
    new ConstellationBackground('hero-canvas');

    // 4. GSAP Scrolling Animations
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
    }
});

