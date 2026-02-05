import { defineConfig } from 'vite';

export default defineConfig({
    base: '/smacthat/', // Use relative paths for GitHub Pages
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    }
});
