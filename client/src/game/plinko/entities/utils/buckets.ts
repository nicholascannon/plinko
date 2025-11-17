import type { BoardConfig } from './board';
import type { Position } from './types';

export function getBucketPositions({
  board,
  payouts,
}: {
  board: BoardConfig;
  payouts: number[];
}): Position[] {
  const numBuckets = payouts.length;
  const bucketWidth = (numBuckets - 1) * board.spacing;
  const bucketStartX = board.centerX - bucketWidth / 2;

  return payouts.map((_, i) => ({
    x: bucketStartX + i * board.spacing,
    y: board.height - board.spacing / 2,
  }));
}
