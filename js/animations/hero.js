// ==========================================================================
// HERO ANIMATIONS WITH GSAP
// ==========================================================================

import { gsap } from 'gsap';

/**
 * Inicializa todas las animaciones del hero
 */
export function initHeroAnimations() {
    // Verificar que el hero existe
    const heroSection = document.querySelector('.hero');
    if (!heroSection) {
        console.warn('Hero section not found, skipping hero animations');
        return;
    }

    // EMERGENCIA: Asegurar que todo sea visible primero
    gsap.set([".hero-text .greeting", ".hero-text .name", ".hero-text .role", ".hero-description", ".hero-metrics .metric", ".hero-buttons .btn", ".code-window"], { 
        opacity: 1, 
        visibility: "visible" 
    });

    // Timeline principal del hero con animaciones suaves
    const heroTL = gsap.timeline({ delay: 0.2 });
    
    // Verificar elementos antes de animar
    const greeting = document.querySelector(".hero-text .greeting");
    const name = document.querySelector(".hero-text .name");
    const role = document.querySelector(".hero-text .role");
    const description = document.querySelector(".hero-description");
    
    if (greeting) {
        heroTL.fromTo(greeting, 
            { y: 20, opacity: 0.5 },
            { duration: 0.6, y: 0, opacity: 1, ease: "power2.out" }
        );
    }
    
    if (name) {
        heroTL.fromTo(name, 
            { y: 30, opacity: 0.5 },
            { duration: 0.8, y: 0, opacity: 1, ease: "back.out(1.7)" }, 
            "-=0.3"
        );
    }
    
    if (role) {
        heroTL.fromTo(role, 
            { y: 15, opacity: 0.5 },
            { duration: 0.4, y: 0, opacity: 1, ease: "power2.out" }, 
            "-=0.2"
        );
    }
    
    if (description) {
        heroTL.fromTo(description, 
            { y: 20, opacity: 0.5 },
            { duration: 0.6, y: 0, opacity: 1, ease: "power2.out" }, 
            "-=0.2"
        );
    }

    // Animación de métricas con stagger
    const metrics = document.querySelectorAll(".hero-metrics .metric");
    if (metrics.length > 0) {
        heroTL.fromTo(metrics, 
            { scale: 0.9, opacity: 0.5 },
            { duration: 0.5, scale: 1, opacity: 1, stagger: 0.1, ease: "back.out(1.7)" }, 
            "-=0.3"
        );
    }

    // Animación de botones
    const buttons = document.querySelectorAll(".hero-buttons .btn");
    if (buttons.length > 0) {
        heroTL.fromTo(buttons, 
            { y: 15, opacity: 0.5 },
            { duration: 0.4, y: 0, opacity: 1, stagger: 0.08, ease: "power2.out" }, 
            "-=0.2"
        );
    }

    // Animación del código window (si existe)
    const codeWindow = document.querySelector('.code-window');
    if (codeWindow) {
        heroTL.fromTo(codeWindow, 
            { scale: 0.95, opacity: 0.5 },
            { duration: 0.8, scale: 1, opacity: 1, ease: "power2.out" }, 
            "-=0.4"
        );
    }

    return heroTL;
}

/**
 * Animación de typing mejorada con GSAP
 */
export function initTypingAnimation() {
    const typingElement = document.getElementById('typing-text');
    if (!typingElement) return;

    const roles = [
        'Senior Full Stack Developer',
        'Java & Spring Boot Expert',
        'Angular Specialist',
        'AWS Solutions Architect',
        'System Migration Expert'
    ];

    let currentRole = 0;

    function typeRole() {
        const role = roles[currentRole];
        typingElement.textContent = '';
        
        // Timeline para typing effect
        const typingTL = gsap.timeline({
            onComplete: () => {
                // Pausa antes de borrar
                gsap.delayedCall(2, () => {
                    eraseRole();
                });
            }
        });

        // Animar cada letra
        for (let i = 0; i < role.length; i++) {
            typingTL.call(() => {
                typingElement.textContent = role.substring(0, i + 1);
            }, null, i * 0.05);
        }
    }

    function eraseRole() {
        const currentText = typingElement.textContent;
        
        const eraseTL = gsap.timeline({
            onComplete: () => {
                currentRole = (currentRole + 1) % roles.length;
                gsap.delayedCall(0.5, typeRole);
            }
        });

        // Animar borrado
        for (let i = currentText.length; i >= 0; i--) {
            eraseTL.call(() => {
                typingElement.textContent = currentText.substring(0, i);
            }, null, (currentText.length - i) * 0.03);
        }
    }

    // Iniciar después de la animación del hero
    gsap.delayedCall(2, typeRole);
}

/**
 * Animaciones de hover para botones del hero
 */
export function initHeroInteractions() {
    const buttons = document.querySelectorAll('.hero-buttons .btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            gsap.to(btn, {
                duration: 0.3,
                scale: 1.05,
                y: -3,
                ease: "power2.out"
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                duration: 0.3,
                scale: 1,
                y: 0,
                ease: "power2.out"
            });
        });
    });

    // Animación especial para el botón primary
    const primaryBtn = document.querySelector('.btn-primary');
    if (primaryBtn) {
        primaryBtn.addEventListener('mouseenter', () => {
            gsap.to(primaryBtn, {
                duration: 0.3,
                boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)",
                ease: "power2.out"
            });
        });

        primaryBtn.addEventListener('mouseleave', () => {
            gsap.to(primaryBtn, {
                duration: 0.3,
                boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
                ease: "power2.out"
            });
        });
    }
}