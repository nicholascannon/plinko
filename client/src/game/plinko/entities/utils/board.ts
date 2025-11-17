export type PegConfig = {
  x: number;
  y: number;
  radius: number;
};

export type BoardConfig = {
  pegs: PegConfig[];
  width: number;
  height: number;
  centerX: number;
  rows: number;
  spacing: number;
};

const PEG_RADIUS = 7;

export function generateBoardConfig({
  rows,
  spacing,
  pegRadius = PEG_RADIUS,
}: {
  rows: number;
  spacing: number;
  pegRadius?: number;
}): BoardConfig {
  const pegs: PegConfig[] = [];

  // first row always has 2 pegs
  const pegsInRow = (row: number) => 3 + (row - 1);

  const width = pegsInRow(rows) * spacing;
  const centerX = width / 2;

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

  return {
    pegs,
    width,
    spacing,
    height: rows * spacing,
    centerX,
    rows,
  };
}
