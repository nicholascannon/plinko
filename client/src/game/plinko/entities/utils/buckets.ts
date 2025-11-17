import type { Position } from './types';

export type BucketConfig = {
  position: Position;
  payout: number;
};

export function generateBucketConfig({
  boardSpacing,
  boardHeight,
  boardCenterX,
  payouts,
}: {
  boardSpacing: number;
  boardHeight: number;
  boardCenterX: number;
  payouts: number[];
}): BucketConfig[] {
  const numBuckets = payouts.length;
  const bucketWidth = (numBuckets - 1) * boardSpacing;
  const bucketStartX = boardCenterX - bucketWidth / 2;

  return payouts.map((payout, i) => ({
    position: {
      x: bucketStartX + i * boardSpacing,
      y: boardHeight - boardSpacing / 2,
    },
    payout,
  }));
}
