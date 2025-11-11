import { useMemo, useState, useEffect } from 'react';
import { Graphics } from 'pixi.js';

interface PlinkoBoardProps {
  buckets: number[];
}

export function PlinkoBoard({ buckets }: PlinkoBoardProps) {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { width, height } = dimensions;

  const pegsInRow = (row: number) => 2 + (row - 1);

  const boardConfig = useMemo(() => {
    const numBuckets = buckets.length;
    const numRows = numBuckets;

    // Calculate dimensions
    const boardWidth = width * 0.5;
    const boardHeight = height * 0.7;

    // Calculate peg size and spacing
    const pegRadius = Math.min(4, boardWidth / (numBuckets * 4));
    const horizontalSpacing = boardWidth / numBuckets;
    const verticalSpacing = boardHeight / (numRows + 1);

    // Center position
    const centerX = width / 2;
    const boardTopY = (height - boardHeight) / 2;

    return {
      numRows,
      numBuckets,
      boardWidth,
      boardHeight,
      pegRadius,
      horizontalSpacing,
      verticalSpacing,
      centerX,
      boardTopY,
    };
  }, [buckets, width, height]);

  return (
    <pixiContainer>
      {/* Render pegs */}
      {Array.from({ length: boardConfig.numRows }, (_, rowIndex) => {
        const numPegsInRow = pegsInRow(rowIndex + 1);
        const rowY =
          boardConfig.boardTopY + (rowIndex + 1) * boardConfig.verticalSpacing;

        return Array.from({ length: numPegsInRow }, (_, pegIndex) => {
          // Calculate x position: center the row, then space pegs evenly
          const rowWidth = (numPegsInRow - 1) * boardConfig.horizontalSpacing;
          const rowStartX = boardConfig.centerX - rowWidth / 2;
          const pegX = rowStartX + pegIndex * boardConfig.horizontalSpacing;

          return (
            <pixiGraphics
              key={`peg-${rowIndex}-${pegIndex}`}
              draw={(graphics: Graphics) => {
                graphics.clear();
                graphics.setFillStyle({ color: 'white' });
                graphics.circle(0, 0, boardConfig.pegRadius);
                graphics.fill();
              }}
              x={pegX}
              y={rowY}
            />
          );
        });
      })}

      {/* Render buckets */}
      {buckets.map((_value, index) => {
        const rowStartX = boardConfig.centerX - boardConfig.boardWidth / 2;
        const bucketX = rowStartX + index * boardConfig.horizontalSpacing + 25;
        const bucketY = boardConfig.boardTopY + boardConfig.boardHeight - 40;

        return (
          <pixiGraphics
            key={`bucket-${index}`}
            draw={(graphics: Graphics) => {
              graphics.clear();
              graphics.setFillStyle({ color: 'yellow' });
              graphics.rect(0, 0, 50, 50);
              graphics.fill();
            }}
            x={bucketX}
            y={bucketY}
          />
        );
      })}
    </pixiContainer>
  );
}
