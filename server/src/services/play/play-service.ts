import { LOGGER } from '../../lib/logger.js';
import type { PlayRepository } from './play-repo.js';
import type { PersistedPlay, Play, PlayHistory } from './types.js';
import type { Metadata } from '../../lib/types.js';

export class PlayService {
  constructor(private readonly playRepo: PlayRepository) {}

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
    return this.playRepo.insertPlayEvent({
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
    const initPlay = await this.playRepo.getPlayEventById(id, 'initiated');
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

    return this.playRepo.insertPlayEvent(completedPlay);
  }

  public async failPlay(
    id: bigint,
    metadata?: Metadata
  ): Promise<PersistedPlay | undefined> {
    // ensure we have an init play with this playId
    const initPlay = await this.playRepo.getPlayEventById(id, 'initiated');
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

    return this.playRepo.insertPlayEvent(failedPlay);
  }

  public async getCompletedPlayHistory(
    walletId: string,
    game?: string
  ): Promise<PlayHistory[]> {
    const plays = await this.playRepo.getPlays(walletId, {
      filter: { game, status: 'completed' },
      limit: 100,
    });
    return plays.map((play) => ({
      playId: play.playId,
      walletId: play.walletId,
      game: play.game,
      betAmount: play.betAmount,
      winAmount: play.winAmount,
      createdAt: play.createdAt,
      metadata: play.metadata,
    }));
  }
}
