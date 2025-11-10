import 'dotenv/config';
import { createApp } from './app.js';
import { CONFIG } from './config/env.js';
import { lifecycle } from './lib/lifecycle.js';
import { LOGGER, setupProcessLogging } from './lib/logger.js';
import { PlinkoModel } from './services/plinko/model.js';

setupProcessLogging();

const plinkoModel = new PlinkoModel(CONFIG.plinko);

const app = createApp({ enableLogging: true, plinkoModel }).listen(
  CONFIG.port,
  () => {
    LOGGER.info('Server started', { port: CONFIG.port });

    lifecycle.on('close', async () => {
      app.close(() => {
        LOGGER.info('Server closed');
      });
    });
  }
);
