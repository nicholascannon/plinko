import type { Application } from 'express';
import express from 'express';
import { loggingMiddleware } from './lib/logger.js';
import { genericErrorHandler } from './middleware/generic-error-handler.js';
import { zodErrorHandler } from './middleware/zod-error-handler.js';
import { PlinkoController } from './services/plinko/controller.js';
import { PlinkoModel } from './services/plinko/model.js';

export function createApp({
  plinkoModel,
  enableLogging = true,
}: {
  enableLogging?: boolean;
  plinkoModel: PlinkoModel;
}): Application {
  const app = express();

  const plinkoController = new PlinkoController(plinkoModel);

  app.use(express.json({ limit: '100kb', strict: true }));
  if (enableLogging) app.use(loggingMiddleware);

  app.get('/health', (_req, res) => {
    return res.json({ status: 'ok' });
  });

  app.use('/v1/plinko', plinkoController.router);

  app.use((req, res) => {
    return res.status(404).json({
      message: 'Resource not found',
      path: req.originalUrl,
      method: req.method,
    });
  });
  app.use(zodErrorHandler);
  app.use(genericErrorHandler);

  return app;
}
