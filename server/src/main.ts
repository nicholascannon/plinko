import 'dotenv/config';
import { createApp } from './app.js';
import { CONFIG } from './config/env.js';
import { lifecycle } from './lib/lifecycle.js';
import { LOGGER, setupProcessLogging } from './lib/logger.js';
import { PlinkoModel } from './services/plinko/model.js';
import { HttpWalletClient } from './clients/wallet/http-wallet-client.js';
import { createDb } from './data/db.js';
import { PgPlayRepository } from './services/play/play-repo.js';

setupProcessLogging();

const { db } = createDb(CONFIG.db);

const plinkoModel = new PlinkoModel(CONFIG.plinko);
const walletClient = new HttpWalletClient(CONFIG.wallet.url);
const playRepo = new PgPlayRepository(db);

const app = createApp({
  enableLogging: true,
  plinkoModel,
  walletClient,
  playRepo,
}).listen(CONFIG.port, () => {
  LOGGER.info('Server started', { port: CONFIG.port });

  lifecycle.on('close', async () => {
    app.close(() => {
      LOGGER.info('Server closed');
    });
  });
});
