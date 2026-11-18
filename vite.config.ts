import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

import fsSite from 'node:fs';
import pathSite from 'node:path';
import type { Plugin as PluginSite } from 'vite';

// Domaine du site, lu au build : SITE_URL (https://hylst.fr par defaut). Il remplace %SITE_URL% dans index.html
// et dans les fichiers publics listes, pour que l'app change de domaine sans toucher au code.
const SITE_URL = (process.env.SITE_URL || 'https://hylst.fr').replace(/\/+$/, '');
const siteUrl = (fichiersPublics: string[]): PluginSite => {
  let outDir = '';
  return {
    name: 'site-url',
    configResolved(config) {
      outDir = pathSite.resolve(config.root, config.build.outDir);
    },
    transformIndexHtml: { order: 'pre', handler: (html) => html.replaceAll('%SITE_URL%', SITE_URL) },
    writeBundle: {
      order: 'pre',
      sequential: true,
      handler() {
        for (const f of fichiersPublics) {
          const p = pathSite.join(outDir, f);
          fsSite.writeFileSync(p, fsSite.readFileSync(p, 'utf8').replaceAll('%SITE_URL%', SITE_URL));
        }
      },
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/hdtb/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [siteUrl(['sitemap.xml']),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'HylstDevToolBox',
        short_name: 'DevToolBox',
        description: 'La boîte à outils ultime pour les développeurs web',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
