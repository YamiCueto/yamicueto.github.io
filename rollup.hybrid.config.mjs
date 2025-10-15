import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    input: 'js/script.js',
    output: {
        file: 'js/script.hybrid.js',
        format: 'iife',
        name: 'Portfolio',
        sourcemap: false
    },
    plugins: [
        nodeResolve()
    ],
    // Solo incluir GSAP core (no ScrollTrigger por ahora)
    external: [],
    onwarn(warning, warn) {
        // Suprimir warnings menores
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        warn(warning);
    }
};