import { useApplication } from '@pixi/react';

interface PlinkoBoardProps {
  buckets: number[];
  spacing: number;
}

type Position = {
  x: number;
  y: number;
};

type Board = {
  pegs: Position[];
  width: number;
  height: number;
};

function generateBoard({
  rows,
  spacing,
}: {
  rows: number;
  spacing: number;
}): Board {
  const pegs: Position[] = [];

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
      });
    }
  }

  return {
    pegs,
    width,
    height: rows * spacing,
  };
}

export function PlinkoBoard({ buckets, spacing }: PlinkoBoardProps) {
  const { app } = useApplication();
  const board = generateBoard({ rows: buckets.length, spacing });

  const offsetX = (app.screen.width - board.width) / 2;
  const offsetY = (app.screen.height - board.height) / 2;

  return (
    <pixiContainer x={offsetX} y={offsetY}>
      {board.pegs.map((peg, i) => (
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
