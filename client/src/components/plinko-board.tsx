interface PlinkoBoardProps {
  buckets: number[];
  spacing: number;
  x: number;
  y: number;
}

type Position = {
  x: number;
  y: number;
};

function generateBoard({
  rows,
  spacing,
}: {
  rows: number;
  spacing: number;
}): Position[] {
  const positions: Position[] = [];

  // first row always has 2 pegs
  const pegsInRow = (row: number) => 3 + (row - 1);

  const width = pegsInRow(rows) * spacing;
  const centerX = width / 2;

  for (let row = 0; row < rows; row++) {
    const numPegs = pegsInRow(row);
    const rowWidth = (numPegs - 1) * spacing;
    const rowStartX = centerX - rowWidth / 2;

    for (let peg = 0; peg < numPegs; peg++) {
      positions.push({
        x: rowStartX + peg * spacing,
        y: row * spacing,
      });
    }
  }

  return positions;
}

export function PlinkoBoard({ buckets, spacing, x, y }: PlinkoBoardProps) {
  const board = generateBoard({ rows: buckets.length, spacing });

  return (
    <pixiContainer x={x} y={y}>
      {board.map((peg, i) => (
        <pixiGraphics
          key={`peg-${i}`}
          draw={(graphics) => {
            graphics.clear();
            graphics.setFillStyle({ color: 'white' });
            graphics.circle(peg.x, peg.y, 5);

            graphics.fill();
          }}
        />
      ))}
    </pixiContainer>
  );
}
