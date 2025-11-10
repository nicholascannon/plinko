import { Router } from 'express';
import type { Request, Response } from 'express';
import type { PlinkoModel } from './model.js';
import { z } from 'zod';

export class PlinkoController {
  public readonly router: Router;

  constructor(private readonly plinkoModel: PlinkoModel) {
    this.router = Router();

    this.router.post('/play', this.play);
  }

  private playSchema = z.object({
    bet: z.number().min(1).max(1_000_000),
  });

  private play = async (req: Request, res: Response): Promise<Response> => {
    const { bet } = this.playSchema.parse(req.body);

    const { payout, slot } = this.plinkoModel.play(bet);

    return res.json({ payout, slot });
  };
}
