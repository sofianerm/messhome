import type { Plugin } from 'vite';

/**
 * Plugin Vite pour forcer le Content-Type correct des fichiers CSS
 * Chrome bloque les fichiers CSS si le MIME type est incorrect
 */
export function fixCssMimeType(): Plugin {
  return {
    name: 'fix-css-mime-type',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const originalSetHeader = res.setHeader.bind(res);

        res.setHeader = function(name: string, value: any) {
          // Seulement pour les fichiers .css qui ne sont PAS importés comme modules
          // (les imports Vite ont ?import ou ?direct dans l'URL)
          if (
            req.url?.endsWith('.css') &&
            !req.url.includes('?') && // Pas un import Vite
            name.toLowerCase() === 'content-type' &&
            value !== 'text/css; charset=utf-8'
          ) {
            return originalSetHeader('Content-Type', 'text/css; charset=utf-8');
          }
          return originalSetHeader(name, value);
        };

        next();
      });
    },
  };
}
