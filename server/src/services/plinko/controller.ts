import { Router } from 'express';
import type { Request, Response } from 'express';
import type { PlinkoModel } from './model.js';
import { z } from 'zod';
import type { WalletClient } from '../../clients/wallet/client.js';

export class PlinkoController {
  public readonly router: Router;

  constructor(
    private readonly plinkoModel: PlinkoModel,
    private readonly walletClient: WalletClient
  ) {
    this.router = Router();

    this.router.get('/init', this.init);
    this.router.post('/play', this.play);
  }

  private init = async (_req: Request, res: Response): Promise<Response> => {
    return res.json({
      payouts: this.plinkoModel.payouts,
      p: this.plinkoModel.p,
      rows: this.plinkoModel.rows,
    });
  };

  private playSchema = z.object({
    walletId: z.string(),
    bet: z.number().min(1).max(1_000_000),
  });

  private play = async (req: Request, res: Response): Promise<Response> => {
    const { bet, walletId } = this.playSchema.parse(req.body);

    await this.walletClient.debit(walletId, bet);

    const { payout, slot } = this.plinkoModel.play(bet);

    // there should be a retry mechanism here with a DLQ to ensure we end up paying out
    const { balance } = await this.walletClient.credit(walletId, payout);

    return res.json({ payout, slot, balance });
  };
}
