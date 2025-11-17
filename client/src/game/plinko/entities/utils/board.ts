import { generateBucketConfig, type BucketConfig } from './buckets';

export type PegConfig = {
  x: number;
  y: number;
  radius: number;
};

export type BoardConfig = {
  pegs: PegConfig[];
  buckets: BucketConfig[];

  width: number;
  height: number;
};

const PEG_RADIUS = 7;

const pegsInRow = (row: number) => row + 2;

export function generateBoardConfig({
  payouts,
  spacing,
  pegRadius = PEG_RADIUS,
}: {
  payouts: number[];
  spacing: number;
  pegRadius?: number;
}): BoardConfig {
  const rows = payouts.length;
  const height = rows * spacing;
  const width = pegsInRow(rows) * spacing;
  const centerX = width / 2;

  const pegs: PegConfig[] = [];
  for (let row = 0; row < rows; row++) {
    const numPegs = pegsInRow(row);
    const rowWidth = (numPegs - 1) * spacing;
    const rowStartX = centerX - rowWidth / 2;

    for (let peg = 0; peg < numPegs; peg++) {
      pegs.push({
        x: rowStartX + peg * spacing,
        y: row * spacing,
        radius: pegRadius,
      });
    }
  }

  const buckets = generateBucketConfig({
    boardSpacing: spacing,
    boardHeight: height,
    boardCenterX: centerX,
    payouts,
  });

  return {
    pegs,
    buckets,
    width,
    height,
  };
}
