// ==========================================================================
// PORTFOLIO - VERSIÓN LEGACY ESTABLE 
// ==========================================================================

// ==========================================================================
// VARIABLES GLOBALES
// ==========================================================================
let isMenuOpen = false;
let observerInstances = [];

// ==========================================================================
// INICIALIZACIÓN HÍBRIDA
// ==========================================================================
document.addEventListener('DOMContentLoaded', function () {
    // Medir performance
    const perfStart = performance.now();

    initializeApp();

    // Log performance
    const perfEnd = performance.now();
    console.log(`🚀 Portfolio híbrido cargado en ${(perfEnd - perfStart).toFixed(2)}ms`);
});

function initializeApp() {
    // VERSIÓN HÍBRIDA: GSAP solo para typing, resto legacy
    console.log('🛡️ Modo legacy estable: sin GSAP imports');

    // Core features (legacy y estables)
    setupNavigation();
    setupTypingEffectLegacy(); // Usar versión legacy directa
    setupShareButton();
    setupSmoothScrolling();
    setupScrollToTop();

    // Features opcionales (solo desktop)
    if (window.innerWidth > 768) {
        setupCursor();
    }

    // Animations legacy (probadas y funcionando)
    setupScrollAnimationsLegacy();

    // Legacy features
    setupLazyLoading();
    setupAnalytics();
    setupProjectFilters();
    setupLoadMoreProjects();
}

// ==========================================================================
// CURSOR PERSONALIZADO (SOLO DESKTOP)
// ==========================================================================
function setupCursor() {
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');

    if (!cursor || !cursorFollower) return;

    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;

    // Usar requestAnimationFrame para mejor performance
    let rafId;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

        if (!rafId) {
            rafId = requestAnimationFrame(animateFollower);
        }
    });

    function animateFollower() {
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;

        cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;

        rafId = requestAnimationFrame(animateFollower);
    }

    // Efectos hover optimizados
    const hoverElements = document.querySelectorAll('a, button, .project-card');
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.style.transform += ' scale(2)';
            cursorFollower.style.transform += ' scale(1.5)';
        });

        element.addEventListener('mouseleave', () => {
            cursor.style.transform = cursor.style.transform.replace(' scale(2)', '');
            cursorFollower.style.transform = cursorFollower.style.transform.replace(' scale(1.5)', '');
        });
    });
}

// ==========================================================================
// NAVEGACIÓN MEJORADA
// ==========================================================================
function setupNavigation() {
    const nav = document.querySelector('.nav');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Throttled scroll handler
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) return;

        scrollTimeout = setTimeout(() => {
            const scrolled = window.scrollY > 50;
            nav.style.background = scrolled ?
                'var(--nav-bg-scroll)' :
                'var(--nav-bg)';

            updateActiveLink();
            scrollTimeout = null;
        }, 100);
    });

    // Menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }

    // Close menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) toggleMenu();
        });
    });
}

function toggleMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    isMenuOpen = !isMenuOpen;
    hamburger?.classList.toggle('active');
    navMenu?.classList.toggle('mobile-open');
    hamburger?.setAttribute('aria-expanded', isMenuOpen);
}

function updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;

        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// ==========================================================================
// SHARE BUTTON MEJORADO
// ==========================================================================
function setupShareButton() {
    const shareBtn = document.getElementById('share-btn');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', async () => {
        const shareData = {
            title: 'Yamid Cueto | Full Stack Developer',
            text: '10+ años transformando sistemas legacy. Expert en Java, Spring Boot, Angular.',
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                trackEvent('share', { method: 'native' });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                showNotification('¡Enlace copiado!', 'success');
                trackEvent('share', { method: 'clipboard' });
            }
        } catch (error) {
            console.error('Error sharing:', error);
            showNotification('Error al compartir', 'error');
        }
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '80px',
        right: '20px',
        background: type === 'success' ? 'var(--accent-color)' : 'var(--primary-color)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==========================================================================
// PROJECT FILTERS
// ==========================================================================
function setupProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');

            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category') || '';
                const shouldShow = filter === 'all' || category.split(' ').includes(filter);

                card.style.display = shouldShow ? 'block' : 'none';

                if (shouldShow) {
                    card.style.animation = 'slideUp 0.6s ease-out';
                }
            });

            trackEvent('project_filter', { filter });
        });
    });
}

// ==========================================================================
// SMOOTH SCROLLING
// ==========================================================================
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetSection = document.querySelector(targetId);
            if (!targetSection) return;

            const offsetTop = targetSection.offsetTop - 70;

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });

            trackEvent('navigation', { section: targetId });
        });
    });
}

// ==========================================================================
// SCROLL TO TOP MEJORADO
// ==========================================================================
function setupScrollToTop() {
    const scrollBtn = document.getElementById('scrollToTop');
    if (!scrollBtn) return;

    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) return;

        scrollTimeout = setTimeout(() => {
            const shouldShow = window.pageYOffset > window.innerHeight * 0.3;
            scrollBtn.classList.toggle('show', shouldShow);
            scrollTimeout = null;
        }, 100);
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        trackEvent('scroll_to_top');
    });
}

// ==========================================================================
// LAZY LOADING REAL
// ==========================================================================
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px'
    });

    images.forEach(img => imageObserver.observe(img));
    observerInstances.push(imageObserver);
}

// ==========================================================================
// ANALYTICS SIMPLIFICADO
// ==========================================================================
function setupAnalytics() {
    // Track project clicks
    document.addEventListener('click', (e) => {
        const projectLink = e.target.closest('.project-link');
        if (projectLink) {
            const card = projectLink.closest('.project-card');
            const title = card?.querySelector('.project-title')?.textContent;
            trackEvent('project_click', { project: title });
        }
    });

    // Track time on page
    let startTime = Date.now();
    window.addEventListener('beforeunload', () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        trackEvent('time_on_page', { seconds: timeSpent });
    });
}

function trackEvent(eventName, data = {}) {
    // Integración con Google Analytics si existe
    if (window.gtag) {
        gtag('event', eventName, data);
    }

    // Log para desarrollo
    if (window.location.hostname === 'localhost') {
        console.log('📊 Event:', eventName, data);
    }
}

// ==========================================================================
// PDF GENERATION — VERSIÓN PROFESIONAL CON FOTO, PREMIOS Y CERTS TCS
// ==========================================================================

async function loadGitHubPhoto() {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const timeout = setTimeout(() => resolve(null), 5000);
        img.onload = function () {
            clearTimeout(timeout);
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 200;
                canvas.height = 200;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, 200, 200);
                resolve(canvas.toDataURL('image/jpeg', 0.92));
            } catch (e) { resolve(null); }
        };
        img.onerror = () => { clearTimeout(timeout); resolve(null); };
        img.src = 'https://github.com/YamiCueto.png?size=200';
    });
}

async function generatePDF() {
    showNotification('Generando CV profesional...', 'info');

    if (typeof window.jspdf === 'undefined') {
        await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            s.onload = res; s.onerror = rej;
            document.head.appendChild(s);
        }).catch(() => null);
    }
    if (typeof window.jspdf === 'undefined') {
        showNotification('Error cargando libreria PDF. Intentalo de nuevo.', 'error');
        return;
    }

    const photoBase64 = await loadGitHubPhoto();

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        const pageWidth = doc.internal.pageSize.width;   // 210
        const pageHeight = doc.internal.pageSize.height; // 297
        const ml = 15;
        let y = 0;

        // ── HEADER AZUL ───────────────────────────────────────────────────────
        const headerH = 52;
        doc.setFillColor(26, 86, 219);
        doc.rect(0, 0, pageWidth, headerH, 'F');

        // Foto de perfil
        if (photoBase64) {
            doc.addImage(photoBase64, 'JPEG', ml, 11, 29, 29);
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.8);
            doc.roundedRect(ml, 11, 29, 29, 1.5, 1.5, 'S');
        } else {
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(ml, 11, 29, 29, 3, 3, 'F');
            doc.setFontSize(16); doc.setFont(undefined, 'bold');
            doc.setTextColor(26, 86, 219);
            doc.text('YC', ml + 14.5, 29, { align: 'center' });
        }

        // Nombre y título
        const tx = ml + 34;
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(19); doc.setFont(undefined, 'bold');
        doc.text('YAMID CUETO MAZO', tx, 21);
        doc.setFontSize(10.5); doc.setFont(undefined, 'normal');
        doc.text('Senior Full Stack Developer  |  10+ Anos de Experiencia', tx, 29);
        doc.setFontSize(8.5); doc.setTextColor(180, 210, 255);
        doc.text('Java E3  .  Spring Boot E1  .  Angular E2  .  Generative AI E2  .  Cloud Architecture', tx, 37);
        doc.setFontSize(8); doc.setTextColor(220, 235, 255);
        doc.text('Barranquilla, Colombia  |  Disponible para trabajo remoto  |  GMT-5', tx, 44);

        // ── BARRA DE CONTACTO ─────────────────────────────────────────────────
        doc.setFillColor(235, 245, 255);
        doc.rect(0, headerH, pageWidth, 13, 'F');
        const cy = headerH + 8.5;
        doc.setFontSize(7.5); doc.setTextColor(26, 86, 219);
        doc.textWithLink('yamidcuetomazo@gmail.com', ml, cy, { url: 'mailto:yamidcuetomazo@gmail.com' });
        doc.setTextColor(160, 160, 160); doc.text('|', 68, cy);
        doc.setTextColor(26, 86, 219);
        doc.text('+57 300 279 2493', 71, cy);
        doc.setTextColor(160, 160, 160); doc.text('|', 101, cy);
        doc.setTextColor(26, 86, 219);
        doc.textWithLink('yamicueto.github.io', 104, cy, { url: 'https://yamicueto.github.io' });
        doc.setTextColor(160, 160, 160); doc.text('|', 132, cy);
        doc.setTextColor(26, 86, 219);
        doc.textWithLink('linkedin.com/in/yamid-cueto-mazo', 135, cy, { url: 'https://linkedin.com/in/yamid-cueto-mazo' });
        doc.setTextColor(160, 160, 160); doc.text('|', 181, cy);
        doc.setTextColor(26, 86, 219);
        doc.textWithLink('github.com/YamiCueto', 184, cy, { url: 'https://github.com/YamiCueto' });

        y = headerH + 19;

        // ── HELPERS ───────────────────────────────────────────────────────────
        const checkBreak = (needed = 30) => {
            if (y + needed > pageHeight - 14) { doc.addPage(); y = 18; }
        };

        const addSection = (title) => {
            checkBreak(18);
            doc.setFillColor(26, 86, 219);
            doc.rect(ml, y - 4.5, 3, 7.5, 'F');
            doc.setFontSize(10.5); doc.setFont(undefined, 'bold'); doc.setTextColor(26, 86, 219);
            doc.text(title, ml + 5, y);
            y += 1.5;
            doc.setDrawColor(190, 220, 255); doc.setLineWidth(0.25);
            doc.line(ml + 5, y, pageWidth - ml, y);
            y += 5; doc.setTextColor(30, 41, 59);
        };

        const addBullets = (lines, w) => {
            const width = w || (pageWidth - 2 * ml);
            doc.setFont(undefined, 'normal'); doc.setFontSize(8.5); doc.setTextColor(30, 41, 59);
            lines.forEach(line => {
                const wrapped = doc.splitTextToSize(line, width);
                checkBreak(wrapped.length * 3.8 + 2);
                doc.text(wrapped, ml, y);
                y += wrapped.length * 3.8 + 0.8;
            });
        };

        const addJob = (title, company, dates, bullets, note) => {
            checkBreak(38);
            doc.setFontSize(9.5); doc.setFont(undefined, 'bold'); doc.setTextColor(30, 41, 59);
            doc.text(title, ml, y);
            const titleWidth = doc.getTextWidth(title);
            doc.setFontSize(8.5); doc.setFont(undefined, 'normal'); doc.setTextColor(26, 86, 219);
            doc.text(company, ml + titleWidth + 5, y);
            doc.setTextColor(100, 116, 139);
            doc.text(dates, pageWidth - ml, y, { align: 'right' });
            y += 2;
            doc.setDrawColor(220, 230, 248); doc.setLineWidth(0.15);
            doc.line(ml, y, pageWidth - ml, y);
            y += 4;
            addBullets(bullets);
            if (note) {
                checkBreak(8);
                doc.setFontSize(7.5); doc.setFont(undefined, 'italic'); doc.setTextColor(180, 120, 30);
                const noteLines = doc.splitTextToSize(note, pageWidth - 2 * ml);
                doc.text(noteLines, ml, y);
                y += noteLines.length * 3.5 + 1;
            }
            y += 5;
        };

        // ── PERFIL PROFESIONAL ────────────────────────────────────────────────
        addSection('PERFIL PROFESIONAL');
        doc.setFontSize(8.5); doc.setFont(undefined, 'normal'); doc.setTextColor(30, 41, 59);
        const resumen = 'Senior Software Engineer con mas de 10 anos liderando transformaciones digitales en empresas enterprise. Especialista en migracion de sistemas legacy criticos, habiendo liderado la migracion de un sistema bancario de VB6 a Java/Spring sirviendo 500K+ usuarios con 99.9% uptime. Expert en arquitecturas escalables con Java (E3), Spring Boot (E1) y Generative AI (E2) segun evaluacion TCS iEvolve. Reconocido con 5 premios en Tata Consultancy Services incluyendo "Star of the Month" (x2), "Best Team Award" y "Beyond Performance Xcelerate Awards" (x2). Actualmente desarrollando herramientas de IA generativa que automatizan 40% del trabajo repetitivo en equipos enterprise.';
        const resLines = doc.splitTextToSize(resumen, pageWidth - 2 * ml);
        doc.text(resLines, ml, y);
        y += resLines.length * 3.8 + 8;

        // ── EXPERIENCIA PROFESIONAL ───────────────────────────────────────────
        addSection('EXPERIENCIA PROFESIONAL');

        addJob('Senior Software Engineering', 'Tata Consultancy Services', 'Nov 2023 - Presente', [
            '- Lidere migracion de sistema bancario legacy (VB6 -> Java/Spring) sirviendo 500K+ usuarios con 99.9% uptime',
            '- Desarrolle 8+ microservicios con Spring Boot procesando 2M+ transacciones/dia en entorno Kubernetes',
            '- Implemente soluciones de IA Generativa (LLMs/RAG) automatizando 40% del trabajo repetitivo del equipo',
            '- Reduci costos de infraestructura en 35% mediante optimizacion de arquitectura cloud con Kubernetes'
        ], 'Reconocimientos TCS: Star of the Month (Dic 2025, Jun 2024)  |  Best Team Award (Ago 2024)  |  Beyond Performance Xcelerate Warrior & Victor (Oct 2024)');

        addJob('Senior Software Development Engineer', 'Intergrupo', 'Mar 2021 - Nov 2023', [
            '- Reduci tiempo de deployment en 60% implementando CI/CD con Jenkins + Docker + Kubernetes',
            '- Desarrolle sistema distribuido con Spring Cloud procesando 1M+ requests/dia',
            '- Optimice APIs criticas mejorando response time en 40% mediante analisis de profiling JVM',
            '- Lidere adopcion de metodologias agiles (Scrum E2) en equipo de 12 personas'
        ]);

        addJob('Software Development Engineer', 'SoftwareONE Colombia', 'Ago 2020 - Mar 2021', [
            '- Implemente soluciones cloud con AWS (EC2, S3, Lambda) mejorando escalabilidad de plataforma',
            '- Desarrolle APIs RESTful con Spring Boot siguiendo principios de Clean Architecture',
            '- Integre sistemas legacy con arquitecturas modernas usando patrones de diseno'
        ]);

        addJob('Full Stack Engineer', 'GTS Global Tax Services', 'Ene 2019 - Mar 2020', [
            '- Desarrolle aplicaciones full stack con Java/Spring Boot + Angular 8+ para servicios fiscales globales',
            '- Optimice queries SQL reduciendo tiempo de respuesta en 50%'
        ]);

        // ── COMPETENCIAS TECNICAS ─────────────────────────────────────────────
        checkBreak(55);
        addSection('COMPETENCIAS TECNICAS');

        const colW = (pageWidth - 2 * ml) / 2 - 4;
        const col2X = ml + colW + 8;
        const skillsLeft = [
            { cat: 'Backend', val: 'Java E3 - Spring Boot E1 - Node.js - Python' },
            { cat: 'Frontend', val: 'Angular E2 - TypeScript - JavaScript - React' },
            { cat: 'Cloud', val: 'AWS (EC2/S3/Lambda) - Kubernetes - Docker' },
        ];
        const skillsRight = [
            { cat: 'IA & Data', val: 'Generative AI E2 - LLMs - RAG - Ollama/OpenAI' },
            { cat: 'DevOps', val: 'CI/CD - Git - Jenkins - IBM Rational ClearCase E2' },
            { cat: 'Bases de Datos', val: 'PostgreSQL - MySQL - MongoDB - JPA/Hibernate' },
        ];

        const startSkillY = y; let maxSkillY = y;
        skillsLeft.forEach(s => {
            checkBreak(8);
            doc.setFontSize(8.5); doc.setFont(undefined, 'bold'); doc.setTextColor(26, 86, 219);
            doc.text(s.cat + ':', ml, y);
            doc.setFont(undefined, 'normal'); doc.setTextColor(30, 41, 59);
            const lines = doc.splitTextToSize(s.val, colW - 22);
            doc.text(lines, ml + 26, y);
            y += lines.length * 3.8 + 2.5;
            if (y > maxSkillY) maxSkillY = y;
        });

        y = startSkillY;
        skillsRight.forEach(s => {
            doc.setFontSize(8.5); doc.setFont(undefined, 'bold'); doc.setTextColor(26, 86, 219);
            doc.text(s.cat + ':', col2X, y);
            doc.setFont(undefined, 'normal'); doc.setTextColor(30, 41, 59);
            const lines = doc.splitTextToSize(s.val, colW - 22);
            doc.text(lines, col2X + 26, y);
            y += lines.length * 3.8 + 2.5;
            if (y > maxSkillY) maxSkillY = y;
        });
        y = maxSkillY + 2;

        doc.setFontSize(8.5); doc.setFont(undefined, 'bold'); doc.setTextColor(26, 86, 219);
        doc.text('Metodologias:', ml, y);
        doc.setFont(undefined, 'normal'); doc.setTextColor(30, 41, 59);
        const metLines = doc.splitTextToSize('Scrum E2 - Agile Way of Working - Clean Architecture - Microservices - Event-Driven Architecture - TDD - Design Thinking', pageWidth - ml - 40);
        doc.text(metLines, ml + 38, y);
        y += metLines.length * 3.8 + 8;

        // ── CERTIFICACIONES ───────────────────────────────────────────────────
        checkBreak(55);
        addSection('CERTIFICACIONES');

        const certs = [
            { name: 'Generative AI Foundation Curriculum', org: 'TCS iEvolve', date: 'Sep 2025' },
            { name: 'Domain Advisory: Foundation Generative AI', org: 'TCS iEvolve', date: 'Sep 2025' },
            { name: 'Tech Foundation: DevOps Foundation Curriculum', org: 'TCS iEvolve', date: 'Mar 2026' },
            { name: 'Tech Foundation: Design Thinking Foundation', org: 'TCS iEvolve', date: 'Abr 2026' },
            { name: 'Oracle DBA Foundation', org: 'TCS iEvolve', date: 'Abr 2026' },
            { name: 'TCS FrescoPlay OSS Intermediate (E2)', org: 'TCS FrescoPlay', date: 'Jul 2025' },
            { name: 'Tecnologo en Analisis y Desarrollo de Software', org: 'SENA', date: '2015' },
        ];

        certs.forEach(cert => {
            checkBreak(10);
            doc.setFontSize(8.5); doc.setFont(undefined, 'bold'); doc.setTextColor(30, 41, 59);
            doc.text('- ' + cert.name, ml, y);
            doc.setFont(undefined, 'normal'); doc.setTextColor(100, 116, 139);
            doc.text(cert.org + '  |  ' + cert.date, ml + 4, y + 3.8);
            y += 8.5;
        });
        y += 3;

        // ── PROYECTOS DESTACADOS ──────────────────────────────────────────────
        checkBreak(45);
        addSection('PROYECTOS DESTACADOS');
        const proyectos = [
            '- Code Agent Arena (Dic 2025): Plataforma gamificada de aprendizaje sobre AI Agents - HTML5, JavaScript',
            '- FotoMultasLab (Nov 2025): Mapa interactivo de camaras en Barranquilla - JavaScript, Maps API',
            '- Flowly (Oct 2025): Herramienta para diagramas ER/UML con exportacion SVG/PDF - JavaScript, Konva.js',
            '- Promptly (Oct 2025): Interfaz de chat para LLMs (Ollama/OpenAI) - JavaScript, AI APIs',
            '- Cloud Cheatsheet (Oct 2025): Dashboard interactivo de servicios AWS - TypeScript',
            '- Academy.IA (Sep 2025): Plataforma educativa con generacion de cursos por IA - React, Python'
        ];
        doc.setFontSize(8.5); doc.setFont(undefined, 'normal'); doc.setTextColor(30, 41, 59);
        proyectos.forEach(p => {
            const lines = doc.splitTextToSize(p, pageWidth - 2 * ml);
            checkBreak(lines.length * 3.8 + 2);
            doc.text(lines, ml, y);
            y += lines.length * 3.8 + 1.5;
        });
        y += 4;

        // ── RECONOCIMIENTOS Y PREMIOS ─────────────────────────────────────────
        checkBreak(45);
        addSection('RECONOCIMIENTOS Y PREMIOS');

        const awards = [
            { title: 'Star of the Month - Awards for Excellence', co: 'Tata Consultancy Services', date: 'Dic 2025' },
            { title: 'Beyond Performance Awards - Xcelerate Warrior', co: 'Tata Consultancy Services', date: 'Oct 2024' },
            { title: 'Beyond Performance Awards - Xcelerate Victor', co: 'Tata Consultancy Services', date: 'Oct 2024' },
            { title: 'Best Team Award - Awards for Excellence', co: 'Tata Consultancy Services', date: 'Ago 2024' },
            { title: 'Star of the Month - Awards for Excellence', co: 'Tata Consultancy Services', date: 'Jun 2024' },
        ];

        awards.forEach(a => {
            checkBreak(11);
            doc.setFontSize(8.5); doc.setFont(undefined, 'bold'); doc.setTextColor(180, 120, 30);
            doc.text('* ' + a.title, ml, y);
            doc.setFont(undefined, 'normal'); doc.setTextColor(100, 116, 139);
            doc.text(a.co + '  |  ' + a.date, ml + 4, y + 3.8);
            y += 9;
        });
        y += 3;

        // ── IDIOMAS ───────────────────────────────────────────────────────────
        checkBreak(18);
        addSection('IDIOMAS');
        doc.setFontSize(8.5); doc.setFont(undefined, 'normal'); doc.setTextColor(30, 41, 59);
        doc.text('- Espanol: Nativo', ml, y); y += 4.5;
        doc.text('- Ingles: Intermedio-Avanzado (lectura tecnica avanzada, comunicacion profesional)', ml, y); y += 4.5;

        // ── FOOTER EN CADA PAGINA ─────────────────────────────────────────────
        const totalPages = doc.internal.getNumberOfPages();
        for (let p = 1; p <= totalPages; p++) {
            doc.setPage(p);
            doc.setFontSize(7); doc.setTextColor(160, 160, 160);
            doc.setDrawColor(210, 210, 210); doc.setLineWidth(0.2);
            doc.line(ml, pageHeight - 10, pageWidth - ml, pageHeight - 10);
            const fecha = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
            doc.text('Yamid Cueto Mazo  |  yamicueto.github.io', ml, pageHeight - 6);
            doc.text('Actualizado: ' + fecha + '  |  Pagina ' + p + '/' + totalPages, pageWidth - ml, pageHeight - 6, { align: 'right' });
        }

        doc.save('Yamid_Cueto_CV_' + new Date().getFullYear() + '.pdf');
        showNotification('CV profesional descargado!', 'success');

    } catch (error) {
        console.error('Error generando PDF:', error);
        showNotification('Error generando PDF. Intentalo de nuevo.', 'error');
    }

    trackEvent('pdf_download');
}

// ==========================================================================
// FUNCIONES LEGACY DE EMERGENCIA
// ==========================================================================

function setupTypingEffectLegacy() {
    const typingElement = document.getElementById('typing-text');
    if (!typingElement) return;

    const roles = [
        'Full Stack Developer',
        'Legacy System Transformer',
        'Java/Spring Expert',
        'Cloud Architect',
        'Problem Solver'
    ];

    let currentRoleIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;

    function type() {
        const currentRole = roles[currentRoleIndex];

        if (isDeleting) {
            typingElement.textContent = currentRole.substring(0, currentCharIndex - 1);
            currentCharIndex--;
        } else {
            typingElement.textContent = currentRole.substring(0, currentCharIndex + 1);
            currentCharIndex++;
        }

        let typingSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && currentCharIndex === currentRole.length) {
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && currentCharIndex === 0) {
            isDeleting = false;
            currentRoleIndex = (currentRoleIndex + 1) % roles.length;
            typingSpeed = 500;
        }

        setTimeout(type, typingSpeed);
    }

    type();
}

function setupScrollAnimationsLegacy() {
    const sections = document.querySelectorAll('.section-animate');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    sections.forEach(section => observer.observe(section));
    observerInstances.push(observer);
}

// ==========================================================================
// CLEANUP ON PAGE UNLOAD
// ==========================================================================
window.addEventListener('beforeunload', () => {
    // Limpiar observers
    observerInstances.forEach(observer => observer.disconnect());
    observerInstances = [];
});

// ==========================================================================
// ERROR HANDLING GLOBAL
// ==========================================================================
window.addEventListener('error', (e) => {
    console.error('💥 Error:', e.error);
    trackEvent('javascript_error', {
        message: e.error?.message,
        file: e.filename,
        line: e.lineno
    });
});

// ==========================================================================
// CONTACT FORM VALIDATION & SUBMISSION
// ==========================================================================
function setupContactForm() {
    const modal = document.getElementById('contactModal');
    const openBtn = document.getElementById('openContactModal');
    const closeBtn = document.getElementById('closeContactModal');
    const overlay = document.getElementById('modalOverlay');
    const form = document.getElementById('contactForm');

    if (!modal || !form) return;

    // Open modal
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            trackEvent('contact_modal_open');
        });
    }

    // Close modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        trackEvent('contact_modal_close');
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectInput = document.getElementById('subject');
    const messageTextarea = document.getElementById('message');
    const charCount = document.getElementById('char-count');
    const charCounter = document.querySelector('.char-counter');
    const submitBtn = document.getElementById('submitBtn');
    const formStatus = document.getElementById('formStatus');

    // Character counter for message
    if (messageTextarea && charCount) {
        messageTextarea.addEventListener('input', () => {
            const count = messageTextarea.value.length;
            charCount.textContent = count;

            charCounter.classList.remove('limit-warning', 'limit-danger');
            if (count > 800) {
                charCounter.classList.add('limit-danger');
            } else if (count > 600) {
                charCounter.classList.add('limit-warning');
            }
        });
    }

    // Real-time validation messages
    const validationMessages = {
        name: 'Ingresa tu nombre completo (solo letras y espacios)',
        email: 'Ingresa un email válido (ejemplo@dominio.com)',
        subject: 'El asunto debe tener al menos 5 caracteres',
        message: 'El mensaje debe tener entre 20 y 1000 caracteres'
    };

    // Add validation on blur
    [nameInput, emailInput, subjectInput, messageTextarea].forEach(input => {
        if (!input) return;

        input.addEventListener('blur', () => {
            const errorEl = document.getElementById(`${input.id}-error`);
            if (!errorEl) return;

            if (!input.validity.valid && input.value) {
                errorEl.textContent = validationMessages[input.id] || 'Campo inválido';
            } else {
                errorEl.textContent = '';
            }
        });

        input.addEventListener('input', () => {
            const errorEl = document.getElementById(`${input.id}-error`);
            if (errorEl && input.validity.valid) {
                errorEl.textContent = '';
            }
        });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Check if all fields are valid
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Disable submit button and show loading
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        formStatus.className = 'form-status';
        formStatus.textContent = '';

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                formStatus.className = 'form-status success';
                formStatus.textContent = '✓ ¡Mensaje enviado con éxito! Te responderé pronto.';
                form.reset();
                if (charCount) charCount.textContent = '0';

                trackEvent('contact_form_submit', { success: true });

                // Close modal and show notification after 2 seconds
                setTimeout(() => {
                    closeModal();
                    showNotification('¡Mensaje enviado! Revisa tu email 📧', 'success');
                    formStatus.className = 'form-status';
                    formStatus.textContent = '';
                }, 2000);
            } else {
                throw new Error('Error en el servidor');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            formStatus.className = 'form-status error';
            formStatus.textContent = '✗ Hubo un error al enviar el mensaje. Por favor, intenta de nuevo o contáctame por WhatsApp.';

            trackEvent('contact_form_submit', { success: false, error: error.message });
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    });
}

// Add to initialization
setupContactForm();

console.log('🚀 Portfolio de Yamid Cueto cargado exitosamente!');

// ==========================================================================
// LOAD MORE PROJECTS (GitHub API Integration)
// ==========================================================================
function setupLoadMoreProjects() {
    const projectsGrid = document.querySelector('.projects-grid');
    const loadMoreBtn = document.getElementById('load-more-projects');
    const FEATURED_COUNT = 6; // Los 6 proyectos destacados con imágenes
    let additionalProjects = [];
    let currentlyShowing = FEATURED_COUNT;

    if (!projectsGrid || !loadMoreBtn) return;

    // Nombres de los proyectos destacados (ya en el HTML)
    const featuredRepos = [
        'code-agent-arena',
        'fotomultaslab',
        'Flowly',
        'promptly',
        'cloud-cheatsheet',
        'academy.ia'
    ];

    // Fetch de repos adicionales desde GitHub
    // Mostrar loading en botón
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
    loadMoreBtn.disabled = true;

    fetch('https://api.github.com/users/YamiCueto/repos?sort=updated&per_page=100')
        .then(response => response.json())
        .then(repos => {
            // Filtrar: solo públicos, no forks, no los destacados
            additionalProjects = repos.filter(repo =>
                !repo.fork &&
                !repo.private &&
                !featuredRepos.includes(repo.name) &&
                repo.name !== 'yamicueto.github.io'
            );

            // Restaurar botón
            loadMoreBtn.innerHTML = 'Ver más proyectos <i class="fas fa-chevron-down"></i>';
            loadMoreBtn.disabled = false;

            // Si hay proyectos adicionales, mostrar botón
            if (additionalProjects.length > 0) {
                loadMoreBtn.style.display = 'block';
            } else {
                loadMoreBtn.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching GitHub repos:', error);
            loadMoreBtn.innerHTML = 'Ver más proyectos <i class="fas fa-chevron-down"></i>';
            loadMoreBtn.disabled = false;
            loadMoreBtn.style.display = 'none';
        });

    // Función para crear una card de proyecto
    function createProjectCard(repo) {
        const card = document.createElement('div');
        card.className = 'project-card fade-in-up';
        card.setAttribute('data-category', 'web'); // Categoría por defecto

        // Detectar tecnologías principales
        const language = repo.language || 'Code';
        const techTags = [language];
        if (repo.topics && repo.topics.length > 0) {
            techTags.push(...repo.topics.slice(0, 2));
        }

        card.innerHTML = `
            <div class="project-image">
                <div style="
                    width: 100%;
                    height: 200px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 3rem;
                ">
                    <i class="fab fa-github"></i>
                </div>
                <div class="project-overlay">
                    <div class="project-links">
                        ${repo.homepage ? `
                            <a rel="noopener noreferrer" title="${repo.name} demo" 
                               href="${repo.homepage}" target="_blank" class="project-link">
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                        ` : ''}
                        <a rel="noopener noreferrer" title="${repo.name} repository" 
                           href="${repo.html_url}" target="_blank" class="project-link">
                            <i class="fab fa-github"></i>
                        </a>
                    </div>
                </div>
            </div>
            <div class="project-content">
                <h3 class="project-title">${repo.name}</h3>
                <p class="project-description">${repo.description || 'Proyecto de código abierto'}</p>
                <div class="project-tech">
                    ${techTags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
                </div>
                <div class="project-meta">
                    <span class="project-date">${new Date(repo.updated_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' })}</span>
                    ${repo.stargazers_count > 0 ? `<span>⭐ ${repo.stargazers_count}</span>` : ''}
                </div>
            </div>
        `;

        return card;
    }

    // Definir función global para el onclick
    window.loadMoreProjects = function () {
        const BATCH_SIZE = 3;
        const projectsToShow = additionalProjects.slice(currentlyShowing - FEATURED_COUNT, currentlyShowing - FEATURED_COUNT + BATCH_SIZE);

        projectsToShow.forEach(repo => {
            const card = createProjectCard(repo);
            projectsGrid.appendChild(card);
        });

        currentlyShowing += projectsToShow.length;

        // Ocultar botón si ya no hay más
        if (currentlyShowing >= FEATURED_COUNT + additionalProjects.length) {
            loadMoreBtn.style.display = 'none';
        }
    };
}