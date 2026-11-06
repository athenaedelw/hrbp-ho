import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PERSISTED_FILE_PATH = path.resolve(__dirname, 'src/data/persistedState.json');

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large payloads including base64 logos and multi-year datasets
  app.use(express.json({ limit: '50mb' }));

  // API: Load shared persisted dashboard state
  app.get('/api/dashboard', (_req, res) => {
    try {
      if (fs.existsSync(PERSISTED_FILE_PATH)) {
        const raw = fs.readFileSync(PERSISTED_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.data && parsed.years) {
          res.json({ state: parsed });
          return;
        }
      }
      res.json({ state: null });
    } catch (err) {
      console.error('Error reading persisted dashboard state:', err);
      res.json({ state: null });
    }
  });

  // API: Save dashboard state directly to source file so it persists across sessions & republishing
  app.post('/api/dashboard', (req, res) => {
    try {
      const state = req.body;
      if (!state || !state.data || !state.years) {
        res.status(400).json({ error: 'Invalid dashboard state payload' });
        return;
      }

      const dir = path.dirname(PERSISTED_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(PERSISTED_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
      res.json({
        ok: true,
        savedAt: state.savedAt || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        updatedAt: state.updatedAt || new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error writing persisted dashboard state:', err);
      res.status(500).json({ error: 'Failed to persist state' });
    }
  });

  // Vite middleware for development; static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HRBP Nusaraya Server running on http://localhost:${PORT}`);
  });
}

startServer();
