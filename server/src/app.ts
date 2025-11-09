import type { Application } from 'express';
import express from 'express';
import { loggingMiddleware } from './lib/logger.js';
import { genericErrorHandler } from './middleware/generic-error-handler.js';
import { zodErrorHandler } from './middleware/zod-error-handler.js';

export function createApp({
  enableLogging = true,
}: {
  enableLogging?: boolean;
}): Application {
  const app = express();

  app.use(express.json({ limit: '100kb', strict: true }));
  if (enableLogging) app.use(loggingMiddleware);

  app.get('/', (_req, res) => {
    res.json({ message: 'Hello World' });
  });

  app.use(zodErrorHandler);
  app.use(genericErrorHandler);

  return app;
}
