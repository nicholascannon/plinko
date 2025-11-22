import type { Application } from 'express';
import express from 'express';
import cors from 'cors';
import { loggingMiddleware } from './lib/logger.js';
import { genericErrorHandler } from './middleware/generic-error-handler.js';
import { zodErrorHandler } from './middleware/zod-error-handler.js';
import { PlinkoController } from './services/plinko/plinko-controller.js';
import type { PlinkoModel } from './services/plinko/model.js';
import type { WalletClient } from './clients/wallet/client.js';
import { walletClientErrorHandler } from './clients/wallet/error-handler.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { CONFIG } from './config/env.js';
import { GameService } from './services/game/game-service.js';
import type { GameRepository } from './services/game/game-repo.js';
import { PlinkoService } from './services/plinko/plinko-service.js';

export function createApp({
  plinkoModel,
  enableLogging = true,
  walletClient,
  gameRepo,
}: {
  enableLogging?: boolean;
  plinkoModel: PlinkoModel;
  walletClient: WalletClient;
  gameRepo: GameRepository;
}): Application {
  const app = express();

  const gameService = new GameService(gameRepo);
  const plinkoService = new PlinkoService(
    plinkoModel,
    walletClient,
    gameService
  );

  const plinkoController = new PlinkoController(plinkoService);

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
