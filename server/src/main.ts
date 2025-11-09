import 'dotenv/config';
import { createApp } from './app.js';
import { CONFIG } from './config/env.js';
import { lifecycle } from './lib/lifecycle.js';
import { LOGGER, setupProcessLogging } from './lib/logger.js';

setupProcessLogging();

const app = createApp({ enableLogging: true }).listen(CONFIG.port, () => {
  LOGGER.info('Server started', { port: CONFIG.port });

  lifecycle.on('close', async () => {
    app.close(() => {
      LOGGER.info('Server closed');
    });
  });
});
