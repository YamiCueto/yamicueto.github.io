// ==========================================================================
// SCROLL ANIMATIONS WITH GSAP + ScrollTrigger
// ==========================================================================

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registrar el plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * Inicializa todas las animaciones de scroll
 */
export function initScrollAnimations() {
    // Configuración global de ScrollTrigger
    ScrollTrigger.defaults({
        toggleActions: "play none none reverse"
    });

    // Animaciones por sección
    initAboutAnimations();
    initSkillsAnimations();
    initProjectsAnimations();
    initExperienceAnimations();
    initContactAnimations();
    
    // Parallax effects
    initParallaxEffects();
}

/**
 * Animaciones de la sección About
 */
function initAboutAnimations() {
    const aboutContent = document.querySelector(".about-content");
    if (aboutContent) {
        gsap.from(".about-content", {
            scrollTrigger: {
                trigger: ".about",
                start: "top 80%",
                end: "bottom 20%"
            },
            duration: 1,
            y: 100,
            opacity: 0,
            ease: "power2.out"
        });
    }

    const aboutStats = document.querySelectorAll(".about-stats .stat");
    if (aboutStats.length > 0) {
        gsap.from(".about-stats .stat", {
            scrollTrigger: {
                trigger: ".about-stats",
                start: "top 80%"
            },
            duration: 0.6,
            y: 50,
            opacity: 0,
            stagger: 0.2,
            ease: "back.out(1.7)"
        });
    }
}

/**
 * Animaciones de la sección Skills
 */
function initSkillsAnimations() {
    const skillsCategories = document.querySelectorAll(".skills-category");
    if (skillsCategories.length > 0) {
        gsap.from(".skills-category", {
            scrollTrigger: {
                trigger: ".skills",
                start: "top 70%"
            },
            duration: 0.8,
            y: 80,
            opacity: 0,
            stagger: 0.3,
            ease: "power2.out"
        });
    }

    // Animación de las barras de skills
    const skillItems = document.querySelectorAll(".skill-item");
    if (skillItems.length > 0) {
        gsap.from(".skill-item", {
            scrollTrigger: {
                trigger: ".skills-content",
                start: "top 60%"
            },
            duration: 0.5,
            x: -50,
            opacity: 0,
            stagger: 0.1,
            ease: "power2.out"
        });
    }
}

/**
 * Animaciones de la sección Projects
 */
function initProjectsAnimations() {
    const projectCards = document.querySelectorAll(".project-card");
    if (projectCards.length > 0) {
        gsap.from(".project-card", {
            scrollTrigger: {
                trigger: ".projects",
                start: "top 70%"
            },
            duration: 0.8,
            y: 60,
            opacity: 0,
            stagger: 0.2,
            ease: "power2.out"
        });

        // Animación de hover para project cards
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    duration: 0.3,
                    y: -10,
                    scale: 1.02,
                    ease: "power2.out"
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    duration: 0.3,
                    y: 0,
                    scale: 1,
                    ease: "power2.out"
                });
            });
        });
    }
}

/**
 * Animaciones de la sección Experience
 */
function initExperienceAnimations() {
    gsap.from(".timeline-item", {
        scrollTrigger: {
            trigger: ".experience",
            start: "top 70%"
        },
        duration: 0.8,
        x: -100,
        opacity: 0,
        stagger: 0.3,
        ease: "power2.out"
    });
}

/**
 * Animaciones de la sección Contact
 */
function initContactAnimations() {
    gsap.from(".contact-method", {
        scrollTrigger: {
            trigger: ".contact",
            start: "top 70%"
        },
        duration: 0.6,
        y: 50,
        opacity: 0,
        stagger: 0.2,
        ease: "power2.out"
    });

    gsap.from(".value-card", {
        scrollTrigger: {
            trigger: ".value-cards",
            start: "top 80%"
        },
        duration: 0.8,
        scale: 0.8,
        opacity: 0,
        stagger: 0.2,
        ease: "back.out(1.7)"
    });
}

/**
 * Efectos parallax
 */
function initParallaxEffects() {
    // Parallax en el contenido del hero (no el pseudo-elemento)
    const heroElements = document.querySelectorAll('.hero-content, .hero-visual');
    heroElements.forEach(element => {
        if (element) {
            gsap.to(element, {
                scrollTrigger: {
                    trigger: ".hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: 1
                },
                y: -30,
                ease: "none"
            });
        }
    });

    // Parallax suave en secciones
    const sections = document.querySelectorAll('.about, .skills, .projects, .experience');
    sections.forEach(section => {
        if (section) {
            gsap.to(section, {
                scrollTrigger: {
                    trigger: section,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                },
                y: -20,
                ease: "none"
            });
        }
    });
}

/**
 * Refresh ScrollTrigger cuando cambie el contenido
 */
export function refreshScrollTrigger() {
    ScrollTrigger.refresh();
}

/**
 * Limpia todos los ScrollTriggers
 */
export function killScrollTriggers() {
    ScrollTrigger.killAll();
}