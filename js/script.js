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
        navMenu.style.display = 'flex';
        navMenu.style.flexDirection = 'column';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '100%';
        navMenu.style.left = '0';
        navMenu.style.width = '100%';
        navMenu.style.padding = '1rem';
        navMenu.classList.add('mobile-open');
        hamburger.classList.add('active');
    } else {
        navMenu.style.display = '';
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