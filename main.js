/* ============================================
   SHAEN — MAIN JAVASCRIPT
   Particles, Scroll Animations, Interactions
   ============================================ */

const initWebsite = () => {

    // --- LOADER ---
    const loader = document.getElementById('loader');

    // Simulate loading time for effect (hide after 2.5s)
    setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
    }, 2500);

    // --- PARTICLE SYSTEM ---
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = 0, mouseY = 0;
    let animationId;

    let lastWidth = window.innerWidth;
    function resizeCanvas() {
        if (window.innerWidth !== lastWidth || canvas.width === 0) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            lastWidth = window.innerWidth;
        }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * 0.4 - 0.2;
            // Warm amber/orange particles
            const isOrange = Math.random() > 0.5;
            this.color = isOrange ? `rgba(240, 160, 48, ${Math.random() * 0.3})` : `rgba(255, 106, 0, ${Math.random() * 0.2})`;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 20) + 1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Wrap around edges
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;

            // Mouse interaction
            let dx = mouseX - this.x;
            let dy = mouseY - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;

            // Interaction radius
            const maxDistance = 150;
            let force = (maxDistance - distance) / maxDistance;

            if (distance < maxDistance) {
                this.x -= forceDirectionX * force * this.density * 0.5;
                this.y -= forceDirectionY * force * this.density * 0.5;
            }
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }

    // Create particles
    const particleCount = Math.min(40, Math.floor(window.innerWidth * 0.02));
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(240, 160, 48, ${0.05 - distance / 2000})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        drawLines();
        animationId = requestAnimationFrame(animateParticles);
    }

    animateParticles();

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // --- NAVIGATION ---
    const nav = document.getElementById('nav');
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const desktopLinks = document.querySelectorAll('.nav-link');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu on link click
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // --- SCROLL REVEAL ANIMATIONS ---
    const revealElements = document.querySelectorAll(
        '.section-label, .section-title, .about-description, .podcast-image-container, .creative-hero-content, .creative-section-title, .creative-body, .masonry-item, .creative-pillar, .behance-link, .creative-tagline, .nike-header-content, .nike-block, .nike-flow-arrow'
    );

    // Initial state
    revealElements.forEach(el => {
        el.classList.add('reveal');
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add staggered delay for masonry items
                if (entry.target.classList.contains('masonry-item')) {
                    const items = document.querySelectorAll('.masonry-item');
                    const index = Array.from(items).indexOf(entry.target);
                    entry.target.style.transitionDelay = `${index * 0.1}s`;
                }
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- ACTIVE NAV LINK ON SCROLL ---
    const sections = document.querySelectorAll('section');

    let isScrollThrottled = false;
    window.addEventListener('scroll', () => {
        if (isScrollThrottled) return;
        isScrollThrottled = true;

        setTimeout(() => {
            let current = '';
            const scrollY = window.pageYOffset;

            sections.forEach(section => {
                const sectionHeight = section.offsetHeight;
                const sectionTop = section.offsetTop - 150;

                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });

            desktopLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href === '#' && (scrollY < 100 || !current)) {
                    link.classList.add('active');
                } else if (href && !href.startsWith('http') && href.includes(current) && current) {
                    link.classList.add('active');
                }
            });

            mobileLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href === '#' && (scrollY < 100 || !current)) {
                    link.classList.add('active');
                } else if (href && !href.startsWith('http') && href.includes(current) && current) {
                    link.classList.add('active');
                }
            });

            isScrollThrottled = false;
        }, 150);
    });

    // --- DYNAMIC YEAR IN FOOTER ---
    const yearEl = document.querySelector('.footer-copy span');
    if (yearEl) {
        const year = new Date().getFullYear();
        yearEl.textContent = `© ${year} SHAEN. ALL RIGHTS RESERVED.`;
    }

};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWebsite);
} else {
    initWebsite();
}
