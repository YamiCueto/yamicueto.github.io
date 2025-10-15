import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
    input: 'js/script.js',
    output: {
        file: 'js/script.bundle.js',
        format: 'iife',
        name: 'Portfolio',
        sourcemap: true
    },
    plugins: [
        nodeResolve(),
        terser({
            compress: {
                drop_console: false // Mantener console.log para desarrollo
            }
        })
    ]
};