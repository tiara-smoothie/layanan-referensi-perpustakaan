import dotenv from 'dotenv';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();
dotenv.config({ path: '.env.local', override: true });
import {
  runGeminiAssistant,
  type AssistantRequestPayload,
} from './src/lib/geminiAssistant.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    const hasKey = Boolean(
      process.env.GEMINI_API_KEY &&
        process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
    );
    res.json({
      status: 'ok',
      service: 'LibraMind API',
      geminiConfigured: hasKey,
    });
  });

  app.post('/api/assistant', async (req, res) => {
    const body = (req.body || {}) as AssistantRequestPayload;
    const result = await runGeminiAssistant(body, process.env.GEMINI_API_KEY);
    if (!result.ok) {
      return res.status(result.error.status).json({ error: result.error.error });
    }
    return res.json(result.data);
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LibraMind server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
