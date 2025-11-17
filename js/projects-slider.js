// Projects Slider - Custom implementation with GSAP
class ProjectsSlider {
    constructor() {
        this.container = document.querySelector('.projects-slider');
        this.track = document.querySelector('.projects-track');
        this.cards = Array.from(document.querySelectorAll('.project-card'));
        this.prevBtn = document.querySelector('.slider-btn.prev');
        this.nextBtn = document.querySelector('.slider-btn.next');
        this.dotsContainer = document.querySelector('.slider-dots');
        
        this.currentIndex = 0;
        this.cardsPerView = this.getCardsPerView();
        this.visibleCards = this.cards;
        this.isAnimating = false;
        this.autoplayInterval = null;
        this.autoplayDelay = 4000; // 4 segundos
        
        this.init();
        this.setupEventListeners();
        this.setupResizeObserver();
        this.startAutoplay();
    }
    
    init() {
        this.updateCardsPerView();
        this.createDots();
        this.updateSlider(false);
        this.updateButtonsState();
    }
    
    getCardsPerView() {
        const width = window.innerWidth;
        if (width >= 1024) return 3;
        if (width >= 640) return 2;
        return 1;
    }
    
    updateCardsPerView() {
        const newCardsPerView = this.getCardsPerView();
        if (newCardsPerView !== this.cardsPerView) {
            this.cardsPerView = newCardsPerView;
            this.currentIndex = 0;
            this.createDots();
        }
    }
    
    get maxIndex() {
        return Math.max(0, this.visibleCards.length - this.cardsPerView);
    }
    
    createDots() {
        if (!this.dotsContainer) return;
        
        this.dotsContainer.innerHTML = '';
        const totalDots = this.maxIndex + 1;
        
        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('button');
            dot.classList.add('slider-dot');
            dot.setAttribute('aria-label', `Ir a grupo ${i + 1}`);
            if (i === 0) dot.classList.add('active');
            
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsContainer.appendChild(dot);
        }
    }
    
    updateDots() {
        const dots = this.dotsContainer?.querySelectorAll('.slider-dot');
        if (!dots) return;
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    updateButtonsState() {
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentIndex === 0;
            this.prevBtn.style.opacity = this.currentIndex === 0 ? '0.5' : '1';
        }
        
        if (this.nextBtn) {
            this.nextBtn.disabled = this.currentIndex >= this.maxIndex;
            this.nextBtn.style.opacity = this.currentIndex >= this.maxIndex ? '0.5' : '1';
        }
    }
    
    updateSlider(animate = true) {
        if (!this.track || this.visibleCards.length === 0) return;
        
        // Calcular el offset basado en el ancho de las tarjetas + gap
        const cardWidth = this.visibleCards[0]?.offsetWidth || 0;
        const gap = 20; // 20px de gap entre tarjetas
        const offset = -(this.currentIndex * (cardWidth + gap));
        
        if (animate && !this.isAnimating) {
            this.isAnimating = true;
            
            gsap.to(this.track, {
                x: offset,
                duration: 0.6,
                ease: 'power2.out',
                onComplete: () => {
                    this.isAnimating = false;
                }
            });
        } else {
            gsap.set(this.track, { x: offset });
        }
        
        this.updateDots();
        this.updateButtonsState();
    }
    
    goToSlide(index) {
        if (this.isAnimating) return;
        
        this.currentIndex = Math.max(0, Math.min(index, this.maxIndex));
        this.updateSlider(true);
        this.resetAutoplay();
    }
    
    next() {
        if (this.currentIndex < this.maxIndex && !this.isAnimating) {
            this.currentIndex++;
            this.updateSlider(true);
        }
    }
    
    prev() {
        if (this.currentIndex > 0 && !this.isAnimating) {
            this.currentIndex--;
            this.updateSlider(true);
        }
    }
    
    filterProjects(category) {
        // Filtrar tarjetas visibles
        if (category === 'all') {
            this.visibleCards = this.cards;
        } else {
            this.visibleCards = this.cards.filter(card => 
                card.dataset.category === category
            );
        }
        
        // Mostrar/ocultar tarjetas con animación
        this.cards.forEach(card => {
            if (this.visibleCards.includes(card)) {
                gsap.to(card, {
                    opacity: 1,
                    scale: 1,
                    display: 'block',
                    duration: 0.3
                });
            } else {
                gsap.to(card, {
                    opacity: 0,
                    scale: 0.8,
                    duration: 0.3,
                    onComplete: () => {
                        card.style.display = 'none';
                    }
                });
            }
        });
        
        // Reset slider
        this.currentIndex = 0;
        this.createDots();
        
        // Pequeño delay para que las animaciones de display terminen
        setTimeout(() => {
            this.updateSlider(false);
        }, 350);
    }
    
    startAutoplay() {
        this.stopAutoplay(); // Limpiar cualquier interval existente
        
        this.autoplayInterval = setInterval(() => {
            if (this.currentIndex >= this.maxIndex) {
                this.goToSlide(0); // Volver al inicio
            } else {
                this.next();
            }
        }, this.autoplayDelay);
    }
    
    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
    
    resetAutoplay() {
        this.stopAutoplay();
        this.startAutoplay();
    }
    
    setupEventListeners() {
        // Pausar autoplay al hover
        this.container?.addEventListener('mouseenter', () => this.stopAutoplay());
        this.container?.addEventListener('mouseleave', () => this.startAutoplay());
        
        // Botones de navegación
        this.prevBtn?.addEventListener('click', () => {
            this.prev();
            this.resetAutoplay();
        });
        this.nextBtn?.addEventListener('click', () => {
            this.next();
            this.resetAutoplay();
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.container) return;
            
            if (e.key === 'ArrowLeft') {
                this.prev();
                this.resetAutoplay();
            }
            if (e.key === 'ArrowRight') {
                this.next();
                this.resetAutoplay();
            }
        });
        
        // Touch events para mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.track?.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        this.track?.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
            this.resetAutoplay();
        });
        
        const handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.next(); // Swipe left
                } else {
                    this.prev(); // Swipe right
                }
            }
        };
        
        this.handleSwipe = handleSwipe;
    }
    
    setupResizeObserver() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateCardsPerView();
                this.updateSlider(false);
            }, 150);
        });
    }
}

// Inicializar slider cuando GSAP y DOM estén listos
function initializeSlider() {
    // Verificar que GSAP esté disponible
    if (typeof gsap === 'undefined') {
        console.warn('⏳ GSAP no está listo, reintentando...');
        setTimeout(initializeSlider, 100);
        return;
    }
    
    console.log('✅ GSAP cargado, inicializando slider...');
    window.projectsSlider = new ProjectsSlider();
    
    // Conectar con los filtros
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Actualizar botones activos
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filtrar proyectos
            const category = btn.dataset.filter;
            if (window.projectsSlider) {
                window.projectsSlider.filterProjects(category);
            }
        });
    });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSlider);
} else {
    initializeSlider();
}
