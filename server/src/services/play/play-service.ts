import { LOGGER } from '../../lib/logger.js';
import type { PlayRepository } from './play-repo.js';
import type { PersistedPlay, Play } from './types.js';
import type { Metadata } from '../../lib/types.js';

export class PlayService {
  constructor(private readonly gameRepo: PlayRepository) {}

  public async initPlay({
    game,
    walletId,
    betAmount,
    metadata,
  }: {
    game: string;
    walletId: string;
    betAmount: string;
    metadata?: Metadata;
  }): Promise<PersistedPlay> {
    return this.gameRepo.insertPlayEvent({
      playId: crypto.randomUUID(),
      walletId,
      game,
      betAmount,
      winAmount: undefined,
      status: 'initiated',
      metadata,
    });
  }

  public async completePlay(
    id: bigint,
    winAmount: string,
    metadata?: Metadata
  ): Promise<PersistedPlay> {
    // ensure we have an init play with this playId
    const initPlay = await this.gameRepo.getPlayEventById(id, 'initiated');
    if (!initPlay) {
      // TODO: custom error class here?
      throw new Error('Play init not found when completing play');
    }

    const completedPlay: Play = {
      playId: initPlay.playId,
      walletId: initPlay.walletId,
      game: initPlay.game,
      betAmount: initPlay.betAmount,
      winAmount,
      status: 'completed',
      metadata,
    };

    return this.gameRepo.insertPlayEvent(completedPlay);
  }

  public async failPlay(
    id: bigint,
    metadata?: Metadata
  ): Promise<PersistedPlay | undefined> {
    // ensure we have an init play with this playId
    const initPlay = await this.gameRepo.getPlayEventById(id, 'initiated');
    if (!initPlay) {
      LOGGER.warn('Play init not found when failing play', { id, metadata });
      return undefined;
    }

    const failedPlay: Play = {
      playId: initPlay.playId,
      walletId: initPlay.walletId,
      game: initPlay.game,
      betAmount: initPlay.betAmount,
      winAmount: undefined,
      status: 'failed',
      metadata,
    };

    return this.gameRepo.insertPlayEvent(failedPlay);
  }
}
