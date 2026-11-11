import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the project under /<repo>/; the dev server stays at the root
const PAGES_BASE = '/landscape-pwa-game/';

// https://vitejs.dev/config/
export default defineConfig(({ command, isPreview }) => ({
    base: command === 'build' || isPreview ? PAGES_BASE : '/',
    plugins: [react(), VitePWA({
        registerType: 'prompt',
        injectRegister: false,

        pwaAssets: {
            disabled: false,
            config: true,
        },

        manifest: {
            name: 'Landscape',
            short_name: 'Landscape',
            lang: 'fr',
            description: 'Jeu solo de pose de jetons sur un plateau hexagonal',
            theme_color: '#7a9e6e',
        },

        workbox: {
            globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
            cleanupOutdatedCaches: true,
            clientsClaim: true,
        },

        devOptions: {
            enabled: false,
            navigateFallback: 'index.html',
            suppressWarnings: true,
            type: 'module',
        },
    })],
}))