import type { Application } from 'express';
import express from 'express';
import cors from 'cors';
import { loggingMiddleware } from './lib/logger.js';
import { genericErrorHandler } from './middleware/generic-error-handler.js';
import { zodErrorHandler } from './middleware/zod-error-handler.js';
import { PlinkoController } from './services/plinko/plinko-controller.js';
import type { PlinkoModel } from './services/plinko/model.js';
import type { WalletClient } from './clients/wallet/wallet-client.js';
import { walletClientErrorHandler } from './clients/wallet/error-handler.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { CONFIG } from './config/env.js';
import { PlayService } from './services/play/play-service.js';
import type { PlayRepository } from './services/play/play-repo.js';
import { PlinkoService } from './services/plinko/plinko-service.js';
import { PlayController } from './services/play/play-controller.js';

export function createApp({
  plinkoModel,
  enableLogging = true,
  walletClient,
  playRepo,
}: {
  enableLogging?: boolean;
  plinkoModel: PlinkoModel;
  walletClient: WalletClient;
  playRepo: PlayRepository;
}): Application {
  const app = express();

  const playService = new PlayService(playRepo);
  const plinkoService = new PlinkoService(
    plinkoModel,
    walletClient,
    playService
  );

  const plinkoController = new PlinkoController(plinkoService);
  const playController = new PlayController(playService);

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
  app.use('/v1/play', playController.router);

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
