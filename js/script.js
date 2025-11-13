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
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Legacy features
    setupLazyLoading();
    setupAnalytics();
    setupAnalytics();
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
                const category = card.getAttribute('data-category');
                const shouldShow = filter === 'all' || category === filter;
                
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
// PDF GENERATION (MANTIENE TU CÓDIGO)
// ==========================================================================
function generatePDF() {
    if (typeof window.jspdf === 'undefined') {
        // Cargar jsPDF si no está cargado
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
            setTimeout(generatePDF, 100);
        };
        document.head.appendChild(script);
        showNotification('Generando PDF...', 'info');
        return;
    }
    
    try {
        showNotification('Generando CV completo...', 'info');
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configuración
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 15;
        let currentY = 25;
        
        // Header con estilo
        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 100, 200);
        doc.text('YAMID CUETO MAZO', margin, currentY);
        
        currentY += 8;
        doc.setFontSize(14);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(50, 50, 50);
        doc.text('Senior Full Stack Developer | 10+ Años de Experiencia', margin, currentY);
        
        // Línea decorativa
        currentY += 5;
        doc.setDrawColor(0, 100, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 8;
        
        // Contacto en columnas
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        const col1 = margin;
        const col2 = pageWidth / 2;
        
        doc.text('Email: yamidcuetomazo@gmail.com', col1, currentY);
        doc.text('Web: yamicueto.github.io', col2, currentY);
        currentY += 4;
        doc.text('Telefono: +57 300 279 2493', col1, currentY);
        doc.text('LinkedIn: linkedin.com/in/yamid-cueto-mazo', col2, currentY);
        currentY += 4;
        doc.text('Ubicacion: Barranquilla, Colombia', col1, currentY);
        doc.text('GitHub: github.com/YamiCueto', col2, currentY);
        currentY += 10;
        
        // Resumen Profesional mejorado
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 100, 200);
        doc.text('PERFIL PROFESIONAL', margin, currentY);
        currentY += 6;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        const resumen = 'Senior Software Engineer con más de 10 años liderando transformaciones digitales en empresas enterprise. Especialista en migración de sistemas legacy críticos, habiendo migrado un sistema bancario de VB6 a Java/Spring que sirve a 500K+ usuarios con 99.9% uptime. Expert en arquitecturas escalables con Java, Spring Boot, Angular y AWS. Actualmente desarrollando herramientas de IA generativa en Tata Consultancy Services.';
        const resumenLines = doc.splitTextToSize(resumen, pageWidth - 2 * margin);
        doc.text(resumenLines, margin, currentY);
        currentY += resumenLines.length * 4 + 8;
        
        // Logros Destacados
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 100, 200);
        doc.text('LOGROS DESTACADOS', margin, currentY);
        currentY += 6;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        const logros = [
            '• Migracion exitosa de sistema bancario legacy (VB6 a Java) sirviendo 500K+ usuarios',
            '• Implementacion de arquitecturas cloud que mejoraron performance en 40%',
            '• Desarrollo de 15+ aplicaciones enterprise con alta disponibilidad',
            '• Liderazgo tecnico en equipos multidisciplinarios y transformacion digital'
        ];
        
        logros.forEach(logro => {
            const logroLines = doc.splitTextToSize(logro, pageWidth - 2 * margin - 5);
            doc.text(logroLines, margin, currentY);
            currentY += logroLines.length * 4 + 2;
        });
        currentY += 5;
        
        // Experiencia Profesional Completa
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 100, 200);
        doc.text('EXPERIENCIA PROFESIONAL', margin, currentY);
        currentY += 6;
        
        // TCS
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Senior Software Engineering', margin, currentY);
        currentY += 4;
        doc.setFontSize(9);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(0, 100, 200);
        doc.text('Tata Consultancy Services | Nov 2023 - Presente', margin, currentY);
        currentY += 4;
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        const tcsDesc = '• Desarrollo de soluciones enterprise con Java y herramientas de IA generativa\n• Liderazgo en proyectos de transformación digital y experiencia de usuario\n• Arquitectura de sistemas distribuidos con Kubernetes y microservicios\n• Implementación de mejores prácticas en desarrollo ágil (Scrum)';
        const tcsLines = doc.splitTextToSize(tcsDesc, pageWidth - 2 * margin);
        doc.text(tcsLines, margin, currentY);
        currentY += tcsLines.length * 4 + 6;
        
        // Intergrupo
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Senior Software Development Engineer', margin, currentY);
        currentY += 4;
        doc.setFontSize(9);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(0, 100, 200);
        doc.text('Intergrupo | Mar 2021 - Nov 2023', margin, currentY);
        currentY += 4;
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        const intergrupoDesc = '• Desarrollo de sistemas distribuidos escalables con Spring Framework\n• Implementación de arquitecturas cloud con alta disponibilidad\n• Liderazgo técnico en metodologías ágiles y mejores prácticas\n• Optimización de performance y seguridad en aplicaciones enterprise';
        const intergrupoLines = doc.splitTextToSize(intergrupoDesc, pageWidth - 2 * margin);
        doc.text(intergrupoLines, margin, currentY);
        currentY += intergrupoLines.length * 4 + 6;
        
        // SoftwareONE
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Software Development Engineer', margin, currentY);
        currentY += 4;
        doc.setFontSize(9);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(0, 100, 200);
        doc.text('SoftwareONE Colombia | Feb 2021 - Nov 2023', margin, currentY);
        currentY += 4;
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        const softwareOneDesc = '• Desarrollo de soluciones cloud con enfoque en arquitectura escalable\n• Implementación de seguridad y optimización de rendimiento\n• Trabajo con tecnologías Java, Kubernetes y APIs RESTful';
        const softwareOneLines = doc.splitTextToSize(softwareOneDesc, pageWidth - 2 * margin);
        doc.text(softwareOneLines, margin, currentY);
        currentY += softwareOneLines.length * 4 + 6;
        
        // GTS
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Full Stack Engineer', margin, currentY);
        currentY += 4;
        doc.setFontSize(9);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(0, 100, 200);
        doc.text('GTS Global Tax Services | Ene 2019 - Mar 2020', margin, currentY);
        currentY += 4;
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        const gtsDesc = '• Desarrollo full stack con Java/Spring Boot + Angular 8+\n• Implementación de soluciones completas para servicios fiscales globales\n• Integración de APIs RESTful y optimización de bases de datos';
        const gtsLines = doc.splitTextToSize(gtsDesc, pageWidth - 2 * margin);
        doc.text(gtsLines, margin, currentY);
        currentY += gtsLines.length * 4 + 8;
        
        // Comprobar si necesitamos nueva página
        if (currentY > pageHeight - 60) {
            doc.addPage();
            currentY = 25;
        }
        
        // Skills Técnicos Completos
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 100, 200);
        doc.text('COMPETENCIAS TÉCNICAS', margin, currentY);
        currentY += 6;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        
        const skills = [
            'Frontend: Angular (Expert), TypeScript (Advanced), JavaScript (Advanced), HTML5, CSS3',
            'Backend: Java (Expert), Spring Boot (Advanced), Node.js (Intermediate), REST APIs',
            'Cloud & DevOps: AWS (EC2, S3, Lambda), Docker, Kubernetes, Git (Expert)',
            'Bases de Datos: PostgreSQL, MySQL, MongoDB, JPA/Hibernate',
            'Herramientas: Maven, Jenkins, JIRA, IntelliJ IDEA, VS Code',
            'Metodologías: Scrum, Agile, TDD, Clean Architecture, Microservices'
        ];
        
        skills.forEach(skill => {
            const skillLines = doc.splitTextToSize(`• ${skill}`, pageWidth - 2 * margin);
            doc.text(skillLines, margin, currentY);
            currentY += skillLines.length * 4 + 2;
        });
        currentY += 6;
        
        // Proyectos Destacados
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 100, 200);
        doc.text('PROYECTOS DESTACADOS', margin, currentY);
        currentY += 6;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        
        const proyectos = [
            '• Promptly: Interfaz moderna para LLMs (Ollama/OpenAI) - JavaScript, AI APIs',
            '• RubberDuck Studio: Backend reflexivo para developers - Node.js, IA local/cloud',
            '• Cloud Cheatsheet: Dashboard interactivo de servicios AWS - TypeScript',
            '• Todo List App: Gestion de tareas con Angular Material - Angular, TypeScript',
            '• Academy.IA: Plataforma educativa SPA - JavaScript puro, HTML5, CSS3'
        ];
        
        proyectos.forEach(proyecto => {
            const proyectoLines = doc.splitTextToSize(proyecto, pageWidth - 2 * margin);
            doc.text(proyectoLines, margin, currentY);
            currentY += proyectoLines.length * 4 + 2;
        });
        currentY += 6;
        
        // Educación
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 100, 200);
        doc.text('EDUCACIÓN & CERTIFICACIONES', margin, currentY);
        currentY += 6;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('• Tecnologo en Desarrollo de Software - SENA', margin, currentY);
        currentY += 4;
        doc.text('• Certificaciones en tecnologias Java, Spring Boot y AWS', margin, currentY);
        currentY += 4;
        doc.text('• Formacion continua en IA Generativa y arquitecturas cloud', margin, currentY);
        currentY += 8;
        
        // Footer profesional
        currentY = pageHeight - 15;
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('CV generado desde yamicueto.github.io', margin, currentY);
        const fecha = new Date().toLocaleDateString('es-ES', { 
            year: 'numeric', month: 'long', day: 'numeric' 
        });
        doc.text(`Actualizado: ${fecha}`, pageWidth - margin - 50, currentY);
        
        // Descargar
        doc.save('Yamid_Cueto_CV_Completo.pdf');
        showNotification('✅ CV completo descargado exitosamente!', 'success');
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        showNotification('❌ Error generando PDF. Inténtalo de nuevo.', 'error');
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
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            trackEvent('contact_modal_open');
        });
    }

    // Close modal
    function closeModal() {
        modal.classList.remove('show');
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
        if (e.key === 'Escape' && modal.classList.contains('show')) {
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