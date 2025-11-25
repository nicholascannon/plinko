import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq } from 'drizzle-orm';
import type { PersistedPlay, Play, PlayStatus } from './types.js';
import type { Metadata } from '../../lib/types.js';
import { playsTable } from '../../data/schema.js';

export interface PlayRepository {
  getPlayEventById(
    id: bigint,
    status?: PlayStatus
  ): Promise<PersistedPlay | undefined>;
  insertPlayEvent(play: Play): Promise<PersistedPlay>;
}

export class PgPlayRepository implements PlayRepository {
  constructor(private readonly db: NodePgDatabase) {}

  public async getPlayEventById(
    id: bigint,
    status?: PlayStatus
  ): Promise<PersistedPlay | undefined> {
    const rows = await this.db
      .select({
        id: playsTable.id,
        createdAt: playsTable.created_at,
        playId: playsTable.play_id,
        walletId: playsTable.wallet_id,
        game: playsTable.game,
        betAmount: playsTable.bet_amount,
        winAmount: playsTable.win_amount,
        status: playsTable.status,
        metadata: playsTable.metadata,
      })
      .from(playsTable)
      .where(
        status
          ? and(eq(playsTable.id, id), eq(playsTable.status, status))
          : eq(playsTable.id, id)
      )
      .limit(1);
    const row = rows[0]!;

    return {
      ...row,
      winAmount: row.winAmount ?? undefined,
      metadata: row.metadata as Metadata,
    };
  }

  public async insertPlayEvent(play: Play): Promise<PersistedPlay> {
    const rows = await this.db
      .insert(playsTable)
      .values({
        play_id: play.playId,
        wallet_id: play.walletId,
        game: play.game,
        bet_amount: play.betAmount,
        win_amount: play.winAmount,
        status: play.status,
        metadata: play.metadata,
      })
      .returning();
    const row = rows[0]!;

    return {
      id: row.id,
      createdAt: row.created_at,
      ...play,
    };
  }
}

export class MockPlayRepository implements PlayRepository {
  private playEvents: PersistedPlay[] = [];

  public async getPlayEventById(
    id: bigint,
    status?: PlayStatus
  ): Promise<PersistedPlay | undefined> {
    if (status)
      return this.playEvents.find(
        (play) => play.id === id && play.status === status
      );
    return this.playEvents.find((play) => play.id === id);
  }

  public async insertPlayEvent(play: Play): Promise<PersistedPlay> {
    const id = BigInt(this.playEvents.length + 1);
    const persistedPlay: PersistedPlay = {
      id,
      createdAt: new Date(),
      ...play,
    };
    this.playEvents.push(persistedPlay);
    return persistedPlay;
  }
}
