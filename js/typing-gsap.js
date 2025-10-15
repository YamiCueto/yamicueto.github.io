// ==========================================================================
// TYPING EFFECT MEJORADO CON GSAP
// ==========================================================================

import { gsap } from 'gsap';

/**
 * Versión híbrida: Solo typing effect con GSAP
 */
export function setupTypingEffectGSAP() {
    const typingElement = document.getElementById('typing-text');
    if (!typingElement) return;

    const roles = [
        'Senior Full Stack Developer',
        'Java & Spring Boot Expert', 
        'Angular Specialist',
        'AWS Solutions Architect',
        'Legacy System Transformer'
    ];

    let currentRole = 0;

    function typeRole() {
        const role = roles[currentRole];
        typingElement.textContent = '';
        
        // Timeline para typing effect suave
        const typingTL = gsap.timeline({
            onComplete: () => {
                // Pausa antes de borrar
                gsap.delayedCall(2.5, () => {
                    eraseRole();
                });
            }
        });

        // Animar cada letra con GSAP
        const letters = role.split('');
        letters.forEach((letter, index) => {
            typingTL.call(() => {
                typingElement.textContent += letter;
                // Efecto de cursor parpadeante suave
                gsap.to(typingElement, {
                    duration: 0.05,
                    opacity: 0.7,
                    yoyo: true,
                    repeat: 1,
                    ease: "none"
                });
            }, null, index * 0.08); // Velocidad más natural
        });
    }

    function eraseRole() {
        const currentText = typingElement.textContent;
        
        const eraseTL = gsap.timeline({
            onComplete: () => {
                currentRole = (currentRole + 1) % roles.length;
                gsap.delayedCall(0.8, typeRole);
            }
        });

        // Animar borrado más rápido
        for (let i = currentText.length; i >= 0; i--) {
            eraseTL.call(() => {
                typingElement.textContent = currentText.substring(0, i);
            }, null, (currentText.length - i) * 0.04);
        }
    }

    // Iniciar con un delay
    console.log('🎬 Iniciando typing effect con GSAP');
    gsap.delayedCall(1, typeRole);
}

/**
 * Fallback en caso de error
 */
export function setupTypingEffectFallback() {
    const typingElement = document.getElementById('typing-text');
    if (!typingElement) return;
    
    const roles = ['Senior Full Stack Developer', 'Java Expert', 'Angular Specialist'];
    let index = 0;
    
    function simpleType() {
        typingElement.textContent = roles[index];
        index = (index + 1) % roles.length;
    }
    
    setInterval(simpleType, 3000);
    simpleType();
}