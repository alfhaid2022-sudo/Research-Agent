import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import cors from 'cors';
import { appRoot, config } from './config.js';
import { errorHandler } from './lib/http.js';
import { committeeRouter } from './routes/committee.js';
import { dashboardRouter } from './routes/dashboard.js';
import { dossierRouter } from './routes/dossier.js';
import { intakeRouter } from './routes/intake.js';
import { demoRouter } from './routes/demo.js';
import { minutesRouter } from './routes/minutes.js';
import { requestsRouter } from './routes/requests.js';
import { requirementsRouter } from './routes/requirements.js';
import { settingsRouter } from './routes/settings.js';
import { sourcesRouter } from './routes/sources.js';
import { studiesRouter } from './routes/studies.js';

export function createApp(): express.Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(
    cors({
      // Local single-user tool: only the dev web server on this machine may call the API.
      origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
    }),
  );
  app.use(express.json({ limit: '2mb' }));
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, version: '0.1.0', time: new Date().toISOString() });
  });

  app.use('/api', settingsRouter);
  app.use('/api', sourcesRouter);
  app.use('/api', requirementsRouter);
  app.use('/api', requestsRouter);
  app.use('/api', studiesRouter);
  app.use('/api', minutesRouter);
  app.use('/api', intakeRouter);
  app.use('/api', dossierRouter);
  app.use('/api', committeeRouter);
  app.use('/api', dashboardRouter);
  app.use('/api', demoRouter);

  // Serve the built front-end when it exists, so `npm run build && npm start` is one process.
  const webDist = path.join(appRoot, 'web', 'dist');
  if (fs.existsSync(webDist)) {
    app.use(express.static(webDist));
    app.get(/^\/(?!api\/).*/, (_req, res) => {
      res.sendFile(path.join(webDist, 'index.html'));
    });
  }

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'المسار غير موجود.' });
  });

  app.use(errorHandler);
  return app;
}

export { config };
