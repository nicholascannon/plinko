import type { Application } from 'express';
import express from 'express';
import cors from 'cors';
import { loggingMiddleware } from './lib/logger.js';
import { genericErrorHandler } from './middleware/generic-error-handler.js';
import { zodErrorHandler } from './middleware/zod-error-handler.js';
import { PlinkoController } from './services/plinko/controller.js';
import { PlinkoModel } from './services/plinko/model.js';
import type { WalletClient } from './clients/wallet/client.js';
import { walletClientErrorHandler } from './clients/wallet/error-handler.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { CONFIG } from './config/env.js';

export function createApp({
  plinkoModel,
  enableLogging = true,
  walletClient,
}: {
  enableLogging?: boolean;
  plinkoModel: PlinkoModel;
  walletClient: WalletClient;
}): Application {
  const app = express();

  const plinkoController = new PlinkoController(plinkoModel, walletClient);

  app.use(requestIdMiddleware);
  app.use(
    cors({
      origin: CONFIG.cors.hosts,
    })
  );
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

  app.use(walletClientErrorHandler);
  app.use(zodErrorHandler);
  app.use(genericErrorHandler);

  return app;
}
