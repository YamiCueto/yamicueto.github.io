// ==========================================================================
// VARIABLES GLOBALES
// ==========================================================================
let isMenuOpen = false;

// ==========================================================================
// INICIALIZACIÓN
// ==========================================================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupCursor();
    setupNavigation();
    setupShareButton();
    setupTypingEffect();
    setupScrollAnimations();
    setupAdvancedSectionAnimations();
    setupSkillBars();
    setupProjectFilters();
    setupSmoothScrolling();
    setupLoadingAnimations();
    setupScrollToTop();
    
    // Inicializar animaciones de página
    initPageAnimations();
}

// ==========================================================================
// CURSOR PERSONALIZADO
// ==========================================================================
function setupCursor() {
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    if (!cursor || !cursorFollower) return;
    
    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });
    
    // Animación suave para el follower
    function animateFollower() {
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;
        
        cursorFollower.style.left = followerX + 'px';
        cursorFollower.style.top = followerY + 'px';
        
        requestAnimationFrame(animateFollower);
    }
    animateFollower();
    
    // Efectos hover
    const hoverElements = document.querySelectorAll('a, button, .project-card, .skill-item');
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(2)';
            cursorFollower.style.transform = 'scale(1.5)';
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursorFollower.style.transform = 'scale(1)';
        });
    });
}

// ==========================================================================
// NAVEGACIÓN
// ==========================================================================
function setupNavigation() {
    const nav = document.querySelector('.nav');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Scroll effect para navegación
    window.addEventListener('scroll', () => {
        const root = document.documentElement;
        const navBgScroll = getComputedStyle(root).getPropertyValue('--nav-bg-scroll');
        const navBorderScroll = getComputedStyle(root).getPropertyValue('--nav-border-scroll');
        const navBg = getComputedStyle(root).getPropertyValue('--nav-bg');
        const navBorder = getComputedStyle(root).getPropertyValue('--nav-border');
        
        if (window.scrollY > 50) {
            nav.style.background = navBgScroll;
            nav.style.borderBottomColor = navBorderScroll;
        } else {
            nav.style.background = navBg;
            nav.style.borderBottomColor = navBorder;
        }
    });
    
    // Menu hamburguesa
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }
    
    // Cerrar menu al hacer click en enlace
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) {
                toggleMenu();
            }
        });
    });
    
    // Active link en scroll
    updateActiveLink();
    window.addEventListener('scroll', updateActiveLink);
}

function toggleMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    isMenuOpen = !isMenuOpen;
    
    if (isMenuOpen) {
        navMenu.classList.add('mobile-open');
        hamburger.classList.add('active');
    } else {
        navMenu.classList.remove('mobile-open');
        hamburger.classList.remove('active');
    }
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
// BOTÓN COMPARTIR
// ==========================================================================
function setupShareButton() {
    const shareBtn = document.getElementById('share-btn');
    if (!shareBtn) return;
    
    shareBtn.addEventListener('click', async () => {
        const shareData = {
            title: 'Yamid Cueto Mazo | Full Stack Developer',
            text: 'Full Stack Developer con 10+ años de experiencia en Angular, Java y tecnologías cloud. ¡Conoce mi trabajo!',
            url: window.location.href
        };
        
        try {
            // Verificar si el navegador soporta Web Share API
            if (navigator.share) {
                await navigator.share(shareData);
                trackEvent('profile_shared', { method: 'native_share' });
            } else {
                // Fallback: copiar al portapapeles
                await navigator.clipboard.writeText(window.location.href);
                showShareNotification('¡Enlace copiado al portapapeles!');
                trackEvent('profile_shared', { method: 'clipboard' });
            }
        } catch (error) {
            // Fallback adicional
            const textArea = document.createElement('textarea');
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showShareNotification('¡Enlace copiado al portapapeles!');
            trackEvent('profile_shared', { method: 'fallback' });
        }
    });
}

function showShareNotification(message) {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = 'share-notification';
    notification.textContent = message;
    
    // Estilos inline para la notificación
    Object.assign(notification.style, {
        position: 'fixed',
        top: '80px',
        right: '20px',
        background: 'var(--primary-color)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: '10000',
        fontSize: 'var(--font-sm)',
        fontWeight: '500',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '300px'
    });
    
    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ==========================================================================
// EFECTO DE ESCRITURA
// ==========================================================================
function setupTypingEffect() {
    const typingElement = document.getElementById('typing-text');
    if (!typingElement) return;
    
    const roles = [
        'Full Stack Developer',
        'Angular Expert',
        'Java Specialist',
        'Cloud Architect',
        'Problem Solver'
    ];
    
    let currentRoleIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function type() {
        const currentRole = roles[currentRoleIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentRole.substring(0, currentCharIndex - 1);
            currentCharIndex--;
            typingSpeed = 50;
        } else {
            typingElement.textContent = currentRole.substring(0, currentCharIndex + 1);
            currentCharIndex++;
            typingSpeed = 100;
        }
        
        if (!isDeleting && currentCharIndex === currentRole.length) {
            typingSpeed = 2000; // Pausa al final
            isDeleting = true;
        } else if (isDeleting && currentCharIndex === 0) {
            isDeleting = false;
            currentRoleIndex = (currentRoleIndex + 1) % roles.length;
            typingSpeed = 500;
        }
        
        setTimeout(type, typingSpeed);
    }
    
    // Agregar cursor parpadeante
    typingElement.style.borderRight = '2px solid var(--primary-color)';
    typingElement.style.animation = 'blink 1s infinite';
    
    // Agregar CSS para el cursor
    const style = document.createElement('style');
    style.textContent = `
        @keyframes blink {
            0%, 50% { border-color: var(--primary-color); }
            51%, 100% { border-color: transparent; }
        }
    `;
    document.head.appendChild(style);
    
    type();
}

// ==========================================================================
// ANIMACIONES EN SCROLL
// ==========================================================================
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observar elementos para animar
    const elementsToAnimate = document.querySelectorAll(
        '.section-header, .about-content, .skills-category, .project-card, .timeline-item, .contact-item'
    );
    
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
}

// ==========================================================================
// ANIMACIONES AVANZADAS DE SECCIONES
// ==========================================================================
function setupAdvancedSectionAnimations() {
    const sections = document.querySelectorAll('.section-animate');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Configuración del Intersection Observer para animaciones
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                
                // Agregar delay antes de la animación
                setTimeout(() => {
                    section.classList.add('animate-in');
                    
                    // Tracking de animación ejecutada
                    trackEvent('section_animated', { 
                        section: section.classList[0],
                        trigger: 'scroll'
                    });
                    
                    // Animar elementos hijos con delay escalonado
                    animateChildElements(section);
                }, 100);
                
                // No desconectar el observer para permitir re-animaciones
            } else {
                // Opcional: remover animación cuando sale del viewport
                entry.target.classList.remove('animate-in');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px'
    });
    
    // Observar todas las secciones
    sections.forEach(section => {
        animationObserver.observe(section);
    });
    
    // Mejorar navegación suave con animaciones
    enhanceSmoothNavigation();
}

function animateChildElements(section) {
    // Definir selectores de elementos hijos para cada sección
    const childSelectors = {
        'hero': ['.hero-text', '.hero-visual', '.hero-buttons a'],
        'about': ['.section-header', '.about-text', '.about-image', '.stat'],
        'skills': ['.section-header', '.skills-category'],
        'projects': ['.section-header', '.projects-filter', '.project-card'],
        'experience': ['.section-header', '.timeline-item'],
        'contact': ['.section-header', '.contact-item', '.social-link']
    };
    
    // Determinar el tipo de sección
    const sectionType = section.classList[0]; // primera clase es el tipo
    const selectors = childSelectors[sectionType];
    
    if (selectors) {
        selectors.forEach((selector, index) => {
            const elements = section.querySelectorAll(selector);
            elements.forEach((element, elementIndex) => {
                // Calcular delay basado en el índice
                const delay = (index * 100) + (elementIndex * 50);
                
                setTimeout(() => {
                    // Elegir animación según el tipo de elemento y sección
                    const animationClass = getAnimationClass(sectionType, selector);
                    element.classList.add(animationClass);
                }, delay);
            });
        });
    }
}

function getAnimationClass(sectionType, selector) {
    // Mapeo de animaciones específicas por sección y elemento
    const animationMap = {
        'hero': {
            '.hero-text': 'animate-slide-in-rotate',
            '.hero-visual': 'animate-fade-in-scale',
            '.hero-buttons a': 'animate-bounce-in'
        },
        'about': {
            '.section-header': 'animate-fade-in-up',
            '.about-text': 'animate-slide-in-bottom',
            '.about-image': 'animate-flip-in-y',
            '.stat': 'animate-zoom-in-left'
        },
        'skills': {
            '.section-header': 'animate-fade-in-up',
            '.skills-category': 'animate-slide-in-bottom'
        },
        'projects': {
            '.section-header': 'animate-fade-in-up',
            '.projects-filter': 'animate-slide-in-top',
            '.project-card': 'animate-fade-in-scale'
        },
        'experience': {
            '.section-header': 'animate-fade-in-up',
            '.timeline-item': 'animate-slide-in-rotate'
        },
        'contact': {
            '.section-header': 'animate-fade-in-up',
            '.contact-item': 'animate-slide-in-bottom',
            '.social-link': 'animate-bounce-in'
        }
    };
    
    return animationMap[sectionType]?.[selector] || 'animate-fade-in-up';
}

function enhanceSmoothNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Remover animaciones activas de todas las secciones
                document.querySelectorAll('.section-animate').forEach(section => {
                    section.classList.remove('animate-in');
                });
                
                // Scroll suave a la sección
                const offsetTop = targetSection.offsetTop - 70;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Activar animación de la sección objetivo después del scroll
                setTimeout(() => {
                    targetSection.classList.add('animate-in');
                    animateChildElements(targetSection);
                    
                    // Tracking de navegación con animación
                    trackEvent('section_animated', { 
                        section: targetSection.classList[0],
                        trigger: 'navigation'
                    });
                }, 400);
                
                // Tracking del evento
                trackEvent('navigation_click', { section: targetId.replace('#', '') });
            }
        });
    });
}

// Función para trigger animaciones manuales
function triggerSectionAnimation(sectionId) {
    const section = document.querySelector(sectionId);
    if (section) {
        section.classList.remove('animate-in');
        
        // Remover clases de animación de elementos hijos
        const animatedChildren = section.querySelectorAll('[class*="animate-"]');
        animatedChildren.forEach(child => {
            child.classList.remove(...Array.from(child.classList).filter(cls => cls.startsWith('animate-')));
        });
        
        setTimeout(() => {
            section.classList.add('animate-in');
            animateChildElements(section);
            
            // Tracking de animación manual
            trackEvent('section_animated', { 
                section: section.classList[0],
                trigger: 'manual'
            });
        }, 50);
    }
}

// Función para animar todas las secciones (útil para demos)
function animateAllSections() {
    const sections = document.querySelectorAll('.section-animate');
    sections.forEach((section, index) => {
        setTimeout(() => {
            triggerSectionAnimation(`#${section.classList[0]}`);
        }, index * 200);
    });
}

// ==========================================================================
// BARRAS DE HABILIDADES
// ==========================================================================
function setupSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.getAttribute('data-width');
                
                setTimeout(() => {
                    bar.style.width = width;
                }, 200);
                
                skillObserver.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });
    
    skillBars.forEach(bar => {
        skillObserver.observe(bar);
    });
}

// ==========================================================================
// FILTROS DE PROYECTOS
// ==========================================================================
function setupProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            
            // Actualizar botones activos
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filtrar proyectos
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.6s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ==========================================================================
// SCROLL SUAVE
// ==========================================================================
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    const heroButtons = document.querySelectorAll('.btn[href^="#"]');
    
    [...navLinks, ...heroButtons].forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Altura de la navegación
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ==========================================================================
// ANIMACIONES DE CARGA
// ==========================================================================
function setupLoadingAnimations() {
    // Agregar clase loading a elementos
    const elements = document.querySelectorAll(
        '.hero-text, .hero-visual, .section-header, .about-content, .skills-category'
    );
    
    elements.forEach(element => {
        element.classList.add('loading');
    });
    
    // Remover loading después de un delay
    setTimeout(() => {
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.remove('loading');
                element.classList.add('loaded');
            }, index * 100);
        });
    }, 300);
}

// ==========================================================================
// ANIMACIONES INICIALES DE PÁGINA
// ==========================================================================
function initPageAnimations() {
    // Animar el hero inmediatamente después de cargar
    setTimeout(() => {
        const heroSection = document.querySelector('.hero.section-animate');
        if (heroSection) {
            heroSection.classList.add('animate-in');
            animateChildElements(heroSection);
        }
    }, 500);
    
    // Precargar animaciones para mejor performance
    preloadAnimations();
    
    // Configurar observer para elementos ya visibles
    checkInitiallyVisibleSections();
}

function preloadAnimations() {
    // Forzar la carga de CSS animations creando elementos invisibles
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = `
        position: absolute;
        visibility: hidden;
        animation: slideInFromBottom 0.01s;
    `;
    document.body.appendChild(tempDiv);
    
    setTimeout(() => {
        document.body.removeChild(tempDiv);
    }, 100);
}

function checkInitiallyVisibleSections() {
    // Verificar secciones que ya están en viewport al cargar
    const sections = document.querySelectorAll('.section-animate');
    
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const isVisible = (rect.top < window.innerHeight * 0.8) && (rect.bottom > 0);
        
        if (isVisible && !section.classList.contains('animate-in')) {
            setTimeout(() => {
                section.classList.add('animate-in');
                animateChildElements(section);
            }, Math.random() * 300 + 200);
        }
    });
}

// ==========================================================================
// BOTÓN FLOTANTE VOLVER ARRIBA
// ==========================================================================
function setupScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (!scrollToTopBtn) return;
    
    // Mostrar/ocultar botón basado en scroll
    window.addEventListener('scroll', debounce(() => {
        const scrollPosition = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        if (scrollPosition > windowHeight * 0.3) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    }, 100));
    
    // Función para volver arriba suavemente
    scrollToTopBtn.addEventListener('click', () => {
        // Animación personalizada más suave que scroll-behavior
        const startPosition = window.pageYOffset;
        const startTime = performance.now();
        const duration = 800; // 800ms para la animación
        
        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        }
        
        function animateScroll(currentTime) {
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const easedProgress = easeInOutCubic(progress);
            
            window.scrollTo(0, startPosition * (1 - easedProgress));
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            } else {
                // Trigger animación del hero cuando llegue arriba
                const heroSection = document.querySelector('#home');
                if (heroSection) {
                    triggerSectionAnimation('#home');
                }
            }
        }
        
        requestAnimationFrame(animateScroll);
        
        // Tracking del evento
        trackEvent('scroll_to_top_clicked', { 
            scroll_position: startPosition,
            viewport_height: window.innerHeight 
        });
    });
    
    // Efecto hover mejorado
    scrollToTopBtn.addEventListener('mouseenter', () => {
        scrollToTopBtn.style.transform = 'translateY(-2px) scale(1.1)';
    });
    
    scrollToTopBtn.addEventListener('mouseleave', () => {
        scrollToTopBtn.style.transform = 'translateY(0) scale(1)';
    });
}

// ==========================================================================
// UTILIDADES
// ==========================================================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimizar scroll events
const optimizedScroll = debounce(() => {
    updateActiveLink();
}, 10);

window.addEventListener('scroll', optimizedScroll);

// ==========================================================================
// ESTADÍSTICAS ANIMADAS
// ==========================================================================
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalNumber = target.textContent;
                const number = parseInt(finalNumber.replace(/\D/g, ''));
                const suffix = finalNumber.replace(/[\d\s]/g, '');
                
                animateNumber(target, 0, number, 2000, suffix);
                statsObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => {
        statsObserver.observe(stat);
    });
}

function animateNumber(element, start, end, duration, suffix = '') {
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * easeOut);
        
        element.textContent = current + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Inicializar animación de estadísticas
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(animateStats, 1000);
});

// ==========================================================================
// PERFORMANCE OPTIMIZATIONS
// ==========================================================================

// Lazy loading para imágenes
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('loading');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Preload crítico
function preloadCriticalResources() {
    const criticalResources = [
        'css/style.css',
        'js/script.js'
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'script';
        document.head.appendChild(link);
    });
}

// ==========================================================================
// ERROR HANDLING
// ==========================================================================
window.addEventListener('error', (e) => {
    console.error('Error en la aplicación:', e.error);
});

// ==========================================================================
// ACCESSIBILITY
// ==========================================================================
function setupAccessibility() {
    // Manejo de teclado para navegación
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu();
        }
    });
    
    // Focus trap para menu móvil
    const focusableElements = document.querySelectorAll(
        'a, button, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', () => {
            element.style.outline = '2px solid var(--primary-color)';
            element.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', () => {
            element.style.outline = 'none';
        });
    });
}

// Inicializar accessibility
document.addEventListener('DOMContentLoaded', setupAccessibility);

// ==========================================================================
// ANALYTICS (OPCIONAL)
// ==========================================================================
function trackEvent(eventName, data = {}) {
    // Aquí puedes integrar Google Analytics, Mixpanel, etc.
    console.log('Event:', eventName, data);
}

// Track clicks en proyectos
document.addEventListener('click', (e) => {
    if (e.target.closest('.project-link')) {
        const projectCard = e.target.closest('.project-card');
        const projectTitle = projectCard.querySelector('.project-title').textContent;
        trackEvent('project_click', { project: projectTitle });
    }
});

console.log('🚀 Yamid Cueto - CV Web cargado exitosamente!');

// ==========================================================================
// PDF GENERATION
// ==========================================================================
function generatePDF() {
    // Check if jsPDF is loaded
    if (typeof window.jspdf === 'undefined') {
        alert('PDF generator is loading, please try again in a moment.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Colors
    const primaryColor = [52, 152, 219];
    const textColor = [44, 62, 80];
    const accentColor = [39, 174, 96];
    const grayColor = [100, 100, 100];
    
    let currentY = 30;
    const pageHeight = 280;
    const margin = 20;
    
    // Helper function to add new page if needed
    function checkPageBreak(additionalHeight = 0) {
        if (currentY + additionalHeight > pageHeight) {
            doc.addPage();
            currentY = 30;
        }
    }
    
    // Helper function to add section title
    function addSectionTitle(title, color = primaryColor) {
        checkPageBreak(20);
        doc.setFontSize(16);
        doc.setTextColor(...color);
        doc.text(title, margin, currentY);
        currentY += 15;
    }
    
    // Helper function to add text with wrapping
    function addWrappedText(text, fontSize = 11, color = textColor, maxWidth = 170) {
        doc.setFontSize(fontSize);
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, maxWidth);
        checkPageBreak(lines.length * 6);
        doc.text(lines, margin, currentY);
        currentY += lines.length * 6;
    }
    
    // PAGE 1: HEADER AND PROFILE
    // =========================
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.text('YAMID CUETO MAZO', margin, currentY);
    currentY += 15;
    
    doc.setFontSize(14);
    doc.setTextColor(...textColor);
    doc.text('Senior Software Engineer | Full Stack Developer', margin, currentY);
    currentY += 10;
    
    doc.setFontSize(10);
    doc.text('Medellín, Colombia | +57 300 279 2493', margin, currentY);
    currentY += 6;
    doc.text('yamid.cueto@gmail.com', margin, currentY);
    currentY += 6;
    doc.text('LinkedIn: linkedin.com/in/yamid-cueto-mazo', margin, currentY);
    currentY += 6;
    doc.text('GitHub: github.com/yamicueto', margin, currentY);
    currentY += 6;
    doc.text('Portfolio: yamicueto.github.io', margin, currentY);
    currentY += 20;
    
    // Professional Profile
    addSectionTitle('PERFIL PROFESIONAL');
    addWrappedText('Senior Software Engineer con más de 10 años de experiencia especializado en desarrollo full-stack y arquitecturas modernas. Expert en React, Node.js, TypeScript y AWS con sólida experiencia en liderazgo técnico y gestión de equipos multidisciplinarios.');
    currentY += 5;
    addWrappedText('Apasionado por crear soluciones escalables y eficientes que generen impacto real en los usuarios. Experiencia comprobada en optimización de rendimiento, implementación de mejores prácticas de desarrollo y mentoría de desarrolladores junior y semi-senior.');
    currentY += 15;
    
    // Key Strengths
    addSectionTitle('FORTALEZAS CLAVE');
    const strengths = [
        '• Arquitectura de software escalable y mantenible',
        '• Liderazgo técnico y gestión de equipos de desarrollo',
        '• Implementación de CI/CD y DevOps best practices',
        '• Optimización de rendimiento y experiencia de usuario',
        '• Mentoría y desarrollo de talento técnico',
        '• Comunicación efectiva con stakeholders técnicos y de negocio'
    ];
    
    strengths.forEach(strength => {
        checkPageBreak(8);
        doc.setFontSize(11);
        doc.setTextColor(...textColor);
        doc.text(strength, margin, currentY);
        currentY += 7;
    });
    
    currentY += 10;
    
    // PAGE 1-2: EXPERIENCE
    // ===================
    
    addSectionTitle('EXPERIENCIA LABORAL');
    
    // Current Job
    doc.setFontSize(13);
    doc.setTextColor(...primaryColor);
    doc.text('Senior Software Engineer', margin, currentY);
    currentY += 8;
    
    doc.setFontSize(11);
    doc.setTextColor(...accentColor);
    doc.text('EMPRESA CONFIDENCIAL | 2020 - Presente | Medellín, Colombia', margin, currentY);
    currentY += 12;
    
    const currentJobTasks = [
        '• Liderazgo técnico de equipos de 5+ desarrolladores en proyectos de alta complejidad',
        '• Desarrollo de aplicaciones web escalables utilizando React, Node.js y TypeScript',
        '• Implementación de arquitecturas en AWS con 99.9% de disponibilidad y auto-scaling',
        '• Diseño e implementación de APIs RESTful y GraphQL para servicios distribuidos',
        '• Optimización de rendimiento que resultó en 40% de mejora en tiempos de carga',
        '• Implementación de pipelines CI/CD con Docker, Jenkins y automatización de deploys',
        '• Mentoría de desarrolladores junior y semi-senior en mejores prácticas',
        '• Colaboración directa con Product Managers y stakeholders de negocio'
    ];
    
    currentJobTasks.forEach(task => {
        checkPageBreak(8);
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        const lines = doc.splitTextToSize(task, 170);
        doc.text(lines, margin, currentY);
        currentY += lines.length * 6;
    });
    
    currentY += 10;
    
    // Previous Job
    doc.setFontSize(13);
    doc.setTextColor(...primaryColor);
    doc.text('Full Stack Developer', margin, currentY);
    currentY += 8;
    
    doc.setFontSize(11);
    doc.setTextColor(...accentColor);
    doc.text('EMPRESA ANTERIOR | 2018 - 2020 | Medellín, Colombia', margin, currentY);
    currentY += 12;
    
    const prevJobTasks = [
        '• Desarrollo de aplicaciones web responsive con React, Vue.js y Angular',
        '• Implementación de APIs REST con Node.js, Express y bases de datos relacionales',
        '• Integración con servicios de terceros y APIs de pago (Stripe, PayPal)',
        '• Optimización de bases de datos PostgreSQL y MongoDB',
        '• Implementación de testing automatizado con Jest, Cypress y Selenium',
        '• Colaboración en metodologías ágiles (Scrum) y code reviews'
    ];
    
    prevJobTasks.forEach(task => {
        checkPageBreak(8);
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        const lines = doc.splitTextToSize(task, 170);
        doc.text(lines, margin, currentY);
        currentY += lines.length * 6;
    });
    
    currentY += 15;
    
    // PAGE 2-3: TECHNOLOGIES
    // ======================
    
    addSectionTitle('COMPETENCIAS TÉCNICAS');
    
    // Expert Level
    doc.setFontSize(12);
    doc.setTextColor(...accentColor);
    doc.text('NIVEL EXPERT (+7 años de experiencia)', margin, currentY);
    currentY += 10;
    
    const expertTechs = [
        'React: Desarrollo de SPAs complejas, hooks avanzados, Context API, Redux',
        'Node.js: APIs escalables, microservicios, real-time con Socket.io',
        'TypeScript: Tipado avanzado, interfaces, generics, decorators',
        'JavaScript: ES6+, programación funcional, patrones de diseño',
        'AWS: EC2, S3, Lambda, RDS, CloudFormation, Load Balancers',
        'Docker: Containerización, Docker Compose, orquestación'
    ];
    
    expertTechs.forEach(tech => {
        checkPageBreak(8);
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        const lines = doc.splitTextToSize(`• ${tech}`, 170);
        doc.text(lines, margin, currentY);
        currentY += lines.length * 6;
    });
    
    currentY += 8;
    
    // Advanced Level
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('NIVEL AVANZADO (4-6 años de experiencia)', margin, currentY);
    currentY += 10;
    
    const advancedTechs = [
        'Python: Django, Flask, data processing, scripting automatizado',
        'PostgreSQL: Queries complejas, optimización, stored procedures',
        'MongoDB: Agregaciones, indexing, replicación',
        'Git: Flujos avanzados, merge strategies, Git hooks',
        'Linux: Administración de servidores, bash scripting, nginx',
        'CI/CD: Jenkins, GitHub Actions, automatización de deploys'
    ];
    
    advancedTechs.forEach(tech => {
        checkPageBreak(8);
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        const lines = doc.splitTextToSize(`• ${tech}`, 170);
        doc.text(lines, margin, currentY);
        currentY += lines.length * 6;
    });
    
    currentY += 8;
    
    // Intermediate Level
    doc.setFontSize(12);
    doc.setTextColor(...grayColor);
    doc.text('NIVEL INTERMEDIO (2-3 años de experiencia)', margin, currentY);
    currentY += 10;
    
    const intermediateTechs = [
        'Angular: Componentes, servicios, routing, reactive forms',
        'Vue.js: Vuex, Vue Router, composición API',
        'GraphQL: Queries, mutations, Apollo Client',
        'Kubernetes: Pods, services, deployments básicos',
        'DevOps: Monitoring, logging, infrastructure as code'
    ];
    
    intermediateTechs.forEach(tech => {
        checkPageBreak(8);
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        const lines = doc.splitTextToSize(`• ${tech}`, 170);
        doc.text(lines, margin, currentY);
        currentY += lines.length * 6;
    });
    
    currentY += 15;
    
    // PAGE 3: PROJECTS
    // ===============
    
    addSectionTitle('PROYECTOS DESTACADOS');
    
    // Project 1
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('E-Commerce Platform Escalable', margin, currentY);
    currentY += 8;
    
    addWrappedText('Desarrollo completo de plataforma e-commerce con React, Node.js y AWS. Implementación de sistema de pagos, gestión de inventario y panel administrativo. Soporte para +10,000 usuarios concurrentes.');
    
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.text('Tecnologías: React, Node.js, PostgreSQL, AWS, Stripe API', margin, currentY);
    currentY += 12;
    
    // Project 2
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('Sistema de Gestión Empresarial (ERP)', margin, currentY);
    currentY += 8;
    
    addWrappedText('Desarrollo de ERP personalizado para PyME con módulos de inventario, facturación, CRM y reportes. Migración de sistema legacy y capacitación de usuarios.');
    
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.text('Tecnologías: Vue.js, Python Django, PostgreSQL, Docker', margin, currentY);
    currentY += 12;
    
    // Project 3
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('API Gateway y Microservicios', margin, currentY);
    currentY += 8;
    
    addWrappedText('Diseño e implementación de arquitectura de microservicios con API Gateway, autenticación JWT y rate limiting. Migración de monolito a microservicios.');
    
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.text('Tecnologías: Node.js, Docker, AWS Lambda, API Gateway', margin, currentY);
    currentY += 15;
    
    // PAGE 4: EDUCATION, CERTIFICATIONS, ETC.
    // =======================================
    
    addSectionTitle('EDUCACIÓN');
    
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('Tecnólogo en Análisis y Desarrollo de Sistemas de Información', margin, currentY);
    currentY += 8;
    
    doc.setFontSize(11);
    doc.setTextColor(...textColor);
    doc.text('Servicio Nacional de Aprendizaje - SENA', margin, currentY);
    currentY += 6;
    doc.text('Barranquilla, Atlántico', margin, currentY);
    currentY += 15;
    
    // Certifications
    addSectionTitle('CERTIFICACIONES');
    
    const certifications = [
        '• AWS Certified Solutions Architect - Associate',
        '• React Advanced Certification - Meta',
        '• Node.js Professional Certification',
        '• Scrum Master Certified (PSM I)',
        '• Docker Certified Associate'
    ];
    
    certifications.forEach(cert => {
        checkPageBreak(8);
        doc.setFontSize(11);
        doc.setTextColor(...textColor);
        doc.text(cert, margin, currentY);
        currentY += 7;
    });
    
    currentY += 10;
    
    // Languages
    addSectionTitle('IDIOMAS');
    doc.setFontSize(11);
    doc.setTextColor(...textColor);
    doc.text('Español: Nativo', margin, currentY);
    currentY += 15;
    
    // Soft Skills
    addSectionTitle('HABILIDADES BLANDAS');
    
    const softSkills = [
        '• Liderazgo técnico y gestión de equipos',
        '• Comunicación efectiva con stakeholders',
        '• Resolución de problemas complejos',
        '• Mentoría y desarrollo de talento',
        '• Adaptabilidad a nuevas tecnologías',
        '• Trabajo en equipo y colaboración'
    ];
    
    softSkills.forEach(skill => {
        checkPageBreak(8);
        doc.setFontSize(11);
        doc.setTextColor(...textColor);
        doc.text(skill, margin, currentY);
        currentY += 7;
    });
    
    // Footer in last page
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('CV generado automáticamente desde yamicueto.github.io', margin, 285);
    
    // Save the PDF
    doc.save('CV_Yamid_Cueto_Senior_Software_Engineer_Completo.pdf');
}