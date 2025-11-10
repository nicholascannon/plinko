import * as z from 'zod';

export const CONFIG = z
  .object({
    env: z.enum(['development', 'production', 'test']),
    port: z.string().transform(Number),
    plinko: z.object({
      targetRtp: z.string().transform(Number),
      rows: z.string().transform(Number),
      p: z.string().transform(Number),
      middlePayout: z.string().transform(Number),
      edgePayout: z.string().transform(Number),
    }),
  })
  .parse({
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    plinko: {
      targetRtp: process.env.PLINKO_TARGET_RTP,
      rows: process.env.PLINKO_ROWS,
      p: process.env.PLINKO_P,
      middlePayout: process.env.PLINKO_MIDDLE_PAYOUT,
      edgePayout: process.env.PLINKO_EDGE_PAYOUT,
    },
  });

export type Config = typeof CONFIG;
