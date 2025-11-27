import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, desc, eq } from 'drizzle-orm';
import type { PersistedPlay, Play, PlayStatus } from './types.js';
import type { Metadata } from '../../lib/types.js';
import { playsTable } from '../../data/schema.js';

export interface PlayRepository {
  getPlayEventById(
    id: bigint,
    status?: PlayStatus
  ): Promise<PersistedPlay | undefined>;
  insertPlayEvent(play: Play): Promise<PersistedPlay>;
  getPlays(
    walletId: string,
    options: {
      limit: number;
      filter?: { game: string; status: PlayStatus } | { status: PlayStatus };
    }
  ): Promise<PersistedPlay[]>;
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

  public async getPlays(
    walletId: string,
    options: {
      limit: number;
      filter?: { game: string; status: PlayStatus } | { status: PlayStatus };
    }
  ): Promise<PersistedPlay[]> {
    const { limit, filter } = options;

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
        and(
          eq(playsTable.wallet_id, walletId),
          ...(filter && 'game' in filter
            ? [eq(playsTable.game, filter.game)]
            : []),
          ...(filter?.status ? [eq(playsTable.status, filter.status)] : [])
        )
      )
      .orderBy(desc(playsTable.created_at))
      .limit(limit);

    return rows.map((row) => ({
      ...row,
      winAmount: row.winAmount ?? undefined,
      metadata: row.metadata as Metadata,
    }));
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

  public async getPlays(
    walletId: string,
    options: {
      limit: number;
      filter?: { game?: string; status?: PlayStatus };
    }
  ): Promise<PersistedPlay[]> {
    const { limit, filter } = options;

    return this.playEvents
      .filter(
        (play) =>
          play.walletId === walletId &&
          (filter?.game ? play.game === filter.game : true) &&
          (filter?.status ? play.status === filter.status : true)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, options.limit);
  }
}
