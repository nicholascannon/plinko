import type { Metadata } from '../../lib/types.js';

export type Play = {
  playId: string;
  walletId: string;
  game: string;
  betAmount: string;
  winAmount: string | undefined;
  status: PlayStatus;
  metadata: Metadata | undefined;
};

export type PlayStatus = 'initiated' | 'completed' | 'failed';

export type PersistedPlay = Play & {
  id: bigint;
  createdAt: Date;
};
