import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import type { PlinkoService } from './plinko-service.js';
import { toValidMoney } from '../../lib/utils/number.js';

export class PlinkoController {
  public readonly router: Router;

  constructor(private readonly plinkoService: PlinkoService) {
    this.router = Router();

    this.router.get('/init', this.init);
    this.router.post('/play', this.play);
  }

  private init = async (_req: Request, res: Response): Promise<Response> => {
    const config = this.plinkoService.init();

    return res.json({
      payouts: config.payouts,
      p: config.p,
      rows: config.rows,
    });
  };

  private playSchema = z.object({
    walletId: z.string(),
    bet: z.number().min(1).max(1_000_000).transform(toValidMoney),
  });

  private play = async (req: Request, res: Response): Promise<Response> => {
    const { bet, walletId } = this.playSchema.parse(req.body);
    const requestId = req.requestId;

    const completedPlay = await this.plinkoService.play(
      walletId,
      bet,
      requestId
    );

    return res.json({
      playId: completedPlay.playId,
      winAmount: completedPlay.winAmount,
      bucket: completedPlay.bucket,
      balance: completedPlay.balance,
      requestId: completedPlay.requestId,
      transactionId: completedPlay.transactionId,
    });
  };
}
