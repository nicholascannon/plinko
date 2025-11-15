import type { BoardConfig } from './board';
import type { Bucket } from './types';

export function generateBuckets({
  board,
  payouts,
}: {
  board: BoardConfig;
  payouts: number[];
}): Bucket[] {
  const numBuckets = payouts.length;
  const bucketWidth = (numBuckets - 1) * board.spacing;
  const bucketStartX = board.centerX - bucketWidth / 2;

  return payouts.map((payout, i) => {
    return {
      payout,
      position: {
        x: bucketStartX + i * board.spacing,
        y: board.height - board.spacing / 2,
      },
    };
  });
}
