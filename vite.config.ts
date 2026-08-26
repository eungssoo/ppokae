import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';

function geminiServerProxyPlugin(apiKey: string): Plugin {
  return {
    name: 'gemini-server-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/gemini/')) {
          return next();
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        }

        // Read request body
        let bodyStr = '';
        req.on('data', chunk => {
          bodyStr += chunk;
        });

        req.on('end', async () => {
          try {
            const body = JSON.parse(bodyStr || '{}');
            const { model = 'gemini-2.5-flash', payload } = body;

            if (!payload) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Payload is required' }));
            }

            const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            const googleRes = await fetch(targetUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            const googleData = await googleRes.json();

            res.statusCode = googleRes.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(googleData));
          } catch (error: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message || 'Internal Server Proxy Error' }));
          }
        });
      });
    }
  };
}
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const geminiApiKey = env.GEMINI_API_KEY || '';

  return {
    plugins: [
      react(),
      geminiServerProxyPlugin(geminiApiKey)
    ],
    server: {
      port: 5173,
      host: true,
    },
    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/lucide-react') || id.includes('node_modules/canvas-confetti')) {
              return 'vendor-ui';
            }
          }
        }
      }
    }
  };
});
