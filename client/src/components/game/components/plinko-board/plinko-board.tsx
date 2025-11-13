import { useEffect, useRef } from 'react';
import { useApplication } from '@pixi/react';
import type { Graphics } from 'pixi.js';
import { generateBoard } from './utils/board';
import { generateBucketPositions } from './utils/buckets';
import { generatePath } from './utils/path';

interface PlinkoBoardProps {
  buckets: number[];
  spacing: number;
}

const TARGET_BUCKET_INDEX = 0;
const BALL_RADIUS = 8;

export function PlinkoBoard({ buckets, spacing }: PlinkoBoardProps) {
  const { app } = useApplication();
  const board = generateBoard({ rows: buckets.length, spacing });
  const bucketPositions = generateBucketPositions({ board, buckets });
  const path = generatePath({
    pegs: board.pegs,
    endPosition: bucketPositions[TARGET_BUCKET_INDEX],
    startingPosition: { x: board.centerX, y: 0 },
  });

  const ballGraphicsRef = useRef<Graphics | null>(null);
  const pathIndexRef = useRef(0);
  const frameCountRef = useRef(0);
  const pathRef = useRef(path);

  useEffect(() => {
    // Recalculate path when dependencies change
    const currentBoard = generateBoard({ rows: buckets.length, spacing });
    const currentBucketPositions = generateBucketPositions({
      board: currentBoard,
      buckets,
    });
    const currentPath = generatePath({
      pegs: currentBoard.pegs,
      endPosition: currentBucketPositions[TARGET_BUCKET_INDEX],
      startingPosition: { x: currentBoard.centerX, y: 0 },
    });
    pathRef.current = currentPath;

    if (currentPath.length === 0 || !ballGraphicsRef.current) return;

    // Reset animation state when path changes
    pathIndexRef.current = 0;
    frameCountRef.current = 0;

    const ballGraphics = ballGraphicsRef.current;
    const startPath = currentPath[pathIndexRef.current];
    ballGraphics.x = startPath.x;
    ballGraphics.y = startPath.y;
    ballGraphics.visible = true;

    const ticker = app.ticker;
    const animate = () => {
      frameCountRef.current += 1;
      // Update every 2 frames to slow down animation
      if (frameCountRef.current % 2 === 0) {
        if (pathIndexRef.current < pathRef.current.length - 1) {
          pathIndexRef.current += 1;
          const currentPathPoint = pathRef.current[pathIndexRef.current];
          ballGraphics.x = currentPathPoint.x;
          ballGraphics.y = currentPathPoint.y;
        } else {
          ticker.remove(animate);
        }
      }
    };

    ticker.add(animate);
    return () => {
      ticker.remove(animate);
    };
  }, [buckets, spacing, app.ticker]);

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
            graphics.circle(peg.x, peg.y, peg.radius);

            graphics.fill();
          }}
        />
      ))}
      {bucketPositions.map((bucket, i) => (
        <pixiGraphics
          key={`bucket-${i}`}
          draw={(graphics) => {
            graphics.clear();
            graphics.setFillStyle({ color: 'yellow' });
            graphics.circle(bucket.x, bucket.y, 15);
            graphics.fill();
          }}
        />
      ))}
      <pixiGraphics
        draw={(graphics) => {
          if (!ballGraphicsRef.current) {
            ballGraphicsRef.current = graphics;
          }
          graphics.clear();
          graphics.setFillStyle({ color: 'red' });
          graphics.circle(0, 0, BALL_RADIUS);
          graphics.fill();
        }}
        visible={false}
      />
    </pixiContainer>
  );
}
