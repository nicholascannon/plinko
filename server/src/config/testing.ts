import { vi } from 'vitest';

vi.mock('../lib/logger.js', () => ({
  LOGGER: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('../config/env.js', () => ({
  CONFIG: {
    env: 'test',
    port: 3000,
    wallet: { url: 'http://wallet-service.test' },
    plinko: {
      targetRtp: 0.95,
      rows: 8,
      p: 0.5,
      middlePayout: 2,
      edgePayout: 0.2,
    },
  },
}));
