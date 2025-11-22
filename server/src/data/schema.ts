import {
  bigserial,
  index,
  jsonb,
  numeric,
  pgSchema,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// don't export as this is already created by drizzle
const gameSchema = pgSchema('game');

export const playStatus = gameSchema.enum('play_status', [
  'initiated',
  'completed',
  'failed',
]);

export const playsTable = gameSchema.table(
  'plays',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey(),

    play_id: uuid().notNull(),
    wallet_id: uuid().notNull(),

    bet_amount: numeric({ precision: 10, scale: 2 }).notNull(),
    win_amount: numeric({ precision: 10, scale: 2 }),

    game: varchar({ length: 30 }).notNull(),

    status: playStatus().notNull(),

    created_at: timestamp('created_at').notNull().defaultNow(),
    metadata: jsonb().notNull().default({}),
  },
  (table) => [
    unique('plays_walletId_playId_status_unique').on(
      table.wallet_id,
      table.play_id,
      table.status
    ),
    index('plays_play_id_index').on(table.play_id),
    index('plays_wallet_id_created_at_idx').on(
      table.wallet_id,
      table.created_at.desc()
    ),
    index('plays_wallet_id_game_created_at_idx').on(
      table.wallet_id,
      table.game,
      table.created_at.desc()
    ),
  ]
);
