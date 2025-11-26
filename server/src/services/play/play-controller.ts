import { Router } from 'express';
import type { Request, Response } from 'express';
import type { PlayService } from './play-service.js';
import { z } from 'zod';

export class PlayController {
  public readonly router: Router;

  constructor(private readonly playService: PlayService) {
    this.router = Router();

    this.router.get('/history', this.getPlayHistory);
  }

  private getPlayHistorySchema = z.object({
    walletId: z.string(),
    game: z.string().optional(),
  });

  private getPlayHistory = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const { walletId, game } = this.getPlayHistorySchema.parse(req.query);

    const playHistory = await this.playService.getCompletedPlayHistory(
      walletId,
      game
    );

    return res.json({ plays: playHistory });
  };
}
