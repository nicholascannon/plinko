import * as z from 'zod';

export const CONFIG = z
  .object({
    env: z.enum(['development', 'production', 'test']),
    port: z.string().transform(Number),
  })
  .parse({
    env: process.env.NODE_ENV,
    port: process.env.PORT,
  });

export type Config = typeof CONFIG;
