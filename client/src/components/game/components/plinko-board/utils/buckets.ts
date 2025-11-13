import type { Board } from './board';

export function generateBucketPositions({
  board,
  buckets,
}: {
  board: Board;
  buckets: number[];
}) {
  const numBuckets = buckets.length;
  const bucketWidth = (numBuckets - 1) * board.spacing;
  const bucketStartX = board.centerX - bucketWidth / 2;

  return buckets.map((_, i) => {
    return {
      x: bucketStartX + i * board.spacing,
      y: board.height - board.spacing / 2,
    };
  });
}
