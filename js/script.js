// ==========================================================================
// PORTFOLIO - VERSIÓN LEGACY ESTABLE 
// ==========================================================================

// ==========================================================================
// VARIABLES GLOBALES
// ==========================================================================
let isMenuOpen = false;
let observerInstances = [];

// ==========================================================================
// PROJECT GALLERY DATA & LOGIC
// ==========================================================================
const projectGallery = {
    'case-os': [
        { file: 'case-os-01.webp', title: 'Dashboard Principal', description: 'Visión general del workspace y herramientas AI.' },
        { file: 'case-os-02.webp', title: 'Terminal Interactiva', description: 'Ejecución de agentes y gestión del contexto.' }
    ],
    'code-agent-arena': [
        { file: 'code-agent-arena-01.webp', title: 'Leaderboard', description: 'Tabla principal de puntuación de agentes.' },
        { file: 'code-agent-arena-02.webp', title: 'Arena de Batalla', description: 'Entorno interactivo de evaluación.' }
    ],
    'flowly': [
        { file: 'flowly-01.webp', title: 'Lienzo de Diagramación', description: 'Espacio de trabajo visual interactivo.' },
        { file: 'flowly-02.webp', title: 'Edición de Nodos', description: 'Configuración y conexión de componentes.' }
    ],
    'academy-ia': [
        { file: 'academy-ia-01.webp', title: 'Plataforma LMS', description: 'Vista principal de cursos y progreso.' },
        { file: 'academy-ia-02.webp', title: 'Reproductor', description: 'Módulo de lecciones interactivas.' }
    ],
    'cloud-cheatsheet': [
        { file: 'cloud-cheatsheet-01.webp', title: 'Arquitectura Cloud', description: 'Catálogo de servicios y patrones.' },
        { file: 'cloud-cheatsheet-02.webp', title: 'Detalle de Componente', description: 'Exploración de la configuración de un servicio.' }
    ],
    'fotomultaslab': [
        { file: 'fotomultaslab-01.webp', title: 'Mapa Interactivo', description: 'Geolocalización principal de marcadores.' },
        { file: 'fotomultaslab-02.webp', title: 'Explorador de Filtros', description: 'Búsqueda e interacción con el dataset.' }
    ]
};

let currentGallery = [];
let currentGalleryIndex = 0;
let lastFocusedElement = null;

function setupProjectGallery() {
    const modal = document.getElementById('gallery-modal');
    if (!modal) return;
    
    const closeBtn = document.getElementById('gallery-close');
    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');
    const imgEl = document.getElementById('gallery-image');
    const titleEl = document.getElementById('gallery-title');
    const descEl = document.getElementById('gallery-desc');
    const counterEl = document.getElementById('gallery-counter');

    // Make project images interactive
    document.querySelectorAll('.projects-grid .project-card').forEach(card => {
        const dataId = card.getAttribute('data-id');
        if (!dataId || !projectGallery[dataId]) return;
        
        const pic = card.querySelector('picture');
        if (pic) {
            pic.style.cursor = 'pointer';
            pic.addEventListener('click', (e) => {
                e.preventDefault();
                openGallery(dataId, pic);
            });
            pic.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openGallery(dataId, pic);
                }
            });
        }
    });

    function openGallery(id, triggerElement) {
        currentGallery = projectGallery[id];
        currentGalleryIndex = 0;
        lastFocusedElement = triggerElement;
        updateGalleryView();
        modal.showModal();
        closeBtn.focus();
    }

    function updateGalleryView() {
        if (!currentGallery || currentGallery.length === 0) return;
        const view = currentGallery[currentGalleryIndex];
        imgEl.src = 'assets/project-captures/' + view.file;
        titleEl.textContent = view.title;
        descEl.textContent = view.description;
        counterEl.textContent = `${currentGalleryIndex + 1} / ${currentGallery.length}`;
        
        // Handle extremities logic (no circular navigation based on requirements unless documented, let's disable buttons)
        prevBtn.disabled = currentGalleryIndex === 0;
        nextBtn.disabled = currentGalleryIndex === currentGallery.length - 1;
        
        // Ensure image fits without stretching
        imgEl.style.objectFit = 'contain';
    }

    function nextImage() {
        if (currentGalleryIndex < currentGallery.length - 1) {
            currentGalleryIndex++;
            updateGalleryView();
        }
    }

    function prevImage() {
        if (currentGalleryIndex > 0) {
            currentGalleryIndex--;
            updateGalleryView();
        }
    }

    function closeGallery() {
        modal.close();
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    }

    closeBtn.addEventListener('click', closeGallery);
    nextBtn.addEventListener('click', nextImage);
    prevBtn.addEventListener('click', prevImage);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modal.open) {
            if (e.key === 'ArrowRight') {
                nextImage();
            } else if (e.key === 'ArrowLeft') {
                prevImage();
            }
        }
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        const dialogDimensions = modal.getBoundingClientRect();
        if (
            e.clientX < dialogDimensions.left ||
            e.clientX > dialogDimensions.right ||
            e.clientY < dialogDimensions.top ||
            e.clientY > dialogDimensions.bottom
        ) {
            closeGallery();
        }
    });
}


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
    setupProjectGallery();
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

    // Efectos hover: solo clase CSS, el scale lo maneja style.css (.is-hovering)
    const hoverElements = document.querySelectorAll('a, button, .project-card');
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('is-hovering');
            cursorFollower.classList.add('is-hovering');
        });
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('is-hovering');
            cursorFollower.classList.remove('is-hovering');
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

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            const projectCards = document.querySelectorAll('.project-card');

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
// LAZY LOADING
// Nota: Las imágenes usan loading="lazy" nativo. Esta función ya no es necesaria.
// ==========================================================================

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
// FUNCIONES LEGACY DE EMERGENCIA
// ==========================================================================

function setupTypingEffectLegacy() {
    const typingElement = document.getElementById('typing-text');
    if (!typingElement) return;
    typingElement.textContent = window.professionalProfile?.headline || 'Full Stack Engineer';
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

// Add to initialization (wrapped to ensure DOM is ready)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupContactForm);
} else {
    setupContactForm();
}

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
        'case-os',
        'code-agent-arena',
        'Flowly',
        'academy.ia',
        'cloud-cheatsheet',
        'fotomultaslab'
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
        const searchable = [repo.name, repo.description, repo.language, ...(repo.topics || [])]
            .filter(Boolean).join(' ').toLowerCase();
        const categories = new Set(['web']);
        if (/\b(java|spring|spring-boot)\b/.test(searchable)) categories.add('java');
        if (/\b(angular|angularjs|rxjs)\b/.test(searchable)) categories.add('angular');
        if (/\b(ai|ia|llm|rag|openai|ollama|agentic)\b/.test(searchable)) categories.add('ai');
        card.setAttribute('data-category', [...categories].join(' '));

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
