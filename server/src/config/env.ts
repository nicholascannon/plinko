import * as z from 'zod';

export const CONFIG = z
  .object({
    env: z.enum(['development', 'production', 'test']),
    port: z.string().transform(Number),
    wallet: z.object({
      url: z.string(),
    }),
    cors: z.object({
      hosts: z
        .string()
        .transform((val) => val.split(',').map((s) => s.trim()))
        .pipe(z.array(z.string())),
    }),
    plinko: z.object({
      targetRtp: z.string().transform(Number),
      rows: z.string().transform(Number),
      p: z.string().transform(Number),
      middlePayout: z.string().transform(Number),
      edgePayout: z.string().transform(Number),
    }),
    db: z.object({
      host: z.string(),
      port: z.string().transform(Number),
      database: z.string(),
      user: z.string(),
      password: z.string(),
      logger: z
        .enum(['true', 'false'])
        .transform((val) => val === 'true')
        .default(false),
    }),
  })
  .parse({
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    wallet: {
      url: process.env.WALLET_URL,
    },
    cors: {
      hosts: process.env.CORS_HOSTS,
    },
    plinko: {
      targetRtp: process.env.PLINKO_TARGET_RTP,
      rows: process.env.PLINKO_ROWS,
      p: process.env.PLINKO_P,
      middlePayout: process.env.PLINKO_MIDDLE_PAYOUT,
      edgePayout: process.env.PLINKO_EDGE_PAYOUT,
    },
    db: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      logger: process.env.DB_LOGGER,
    },
  });

export type Config = typeof CONFIG;
