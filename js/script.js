// ==========================================================================
// MEJORAS CRÍTICAS Y OPTIMIZACIONES
// ==========================================================================

// ✅ REMOVED: setupAdvancedSectionAnimations() - Código duplicado/innecesario
// ✅ REMOVED: Multiple animation functions - Simplificado a uno
// ✅ ADDED: Intersection Observer más eficiente
// ✅ ADDED: Lazy loading real para imágenes
// ✅ ADDED: Performance monitoring

// ==========================================================================
// VARIABLES GLOBALES
// ==========================================================================
let isMenuOpen = false;
let observerInstances = [];

// ==========================================================================
// INICIALIZACIÓN MEJORADA
// ==========================================================================
document.addEventListener('DOMContentLoaded', function() {
    // Medir performance
    const perfStart = performance.now();
    
    initializeApp();
    
    // Log performance
    const perfEnd = performance.now();
    console.log(`🚀 Portfolio cargado en ${(perfEnd - perfStart).toFixed(2)}ms`);
});

function initializeApp() {
    // Features core
    setupNavigation();
    setupTypingEffect();
    setupShareButton();
    setupSmoothScrolling();
    setupScrollToTop();
    
    // Features opcionales (solo desktop)
    if (window.innerWidth > 768) {
        setupCursor();
    }
    
    // Animations
    setupScrollAnimations();
    
    // Lazy loading
    setupLazyLoading();
    
    // Analytics
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
// TYPING EFFECT MEJORADO
// ==========================================================================
function setupTypingEffect() {
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

// ==========================================================================
// SCROLL ANIMATIONS SIMPLIFICADO Y EFICIENTE
// ==========================================================================
function setupScrollAnimations() {
    const sections = document.querySelectorAll('.section-animate');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // Opcional: desconectar después de animar
                // observer.unobserve(entry.target);
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
    
    // Tu código de generación PDF aquí...
    // (mantén tu implementación actual)
    
    trackEvent('pdf_download');
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

console.log('🚀 Portfolio de Yamid Cueto cargado exitosamente!');