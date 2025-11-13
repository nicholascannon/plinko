import { useEffect, useMemo, useRef, useState } from 'react';
import { useApplication } from '@pixi/react';
import { generateBoard } from './utils/board';
import { generateBucketPositions } from './utils/buckets';
import { generatePath } from './utils/path';
import type { Direction } from './utils/types';

interface PlinkoBoardProps {
  buckets: number[];
  spacing: number;
}

const TARGET_BUCKET_INDEX = 0;
const BALL_RADIUS = 8;

export function PlinkoBoard({ buckets, spacing }: PlinkoBoardProps) {
  const { app } = useApplication();
  const board = useMemo(
    () => generateBoard({ rows: buckets.length, spacing }),
    [buckets.length, spacing]
  );
  const bucketPositions = useMemo(
    () => generateBucketPositions({ board, buckets }),
    [board, buckets]
  );
  const path = useMemo(
    () =>
      generatePath({
        pegs: board.pegs,
        endPosition: bucketPositions[TARGET_BUCKET_INDEX],
        startingPosition: { x: board.centerX, y: 0 },
      }),
    [board, bucketPositions]
  );

  const [ballPosition, setBallPosition] = useState<Direction | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const pathIndexRef = useRef(0);
  const frameCountRef = useRef(0);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current || path.length === 0) return;
    hasStartedRef.current = true;
    pathIndexRef.current = 0;
    setBallPosition(path[0]);
    setIsAnimating(true);
  }, [path]);

  useEffect(() => {
    if (!isAnimating) return;

    const ticker = app.ticker;
    frameCountRef.current = 0;
    const animate = () => {
      frameCountRef.current += 1;
      // Update every 2 frames to slow down animation
      if (frameCountRef.current % 2 === 0) {
        if (pathIndexRef.current < path.length - 1) {
          pathIndexRef.current += 1;
          setBallPosition(path[pathIndexRef.current]);
        } else {
          setIsAnimating(false);
        }
      }
    };

    ticker.add(animate);
    return () => {
      ticker.remove(animate);
    };
  }, [isAnimating, app.ticker, path]);

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
      {ballPosition && (
        <pixiGraphics
          key={`ball-${ballPosition.x}-${ballPosition.y}`}
          draw={(graphics) => {
            graphics.clear();
            graphics.setFillStyle({ color: 'red' });
            graphics.circle(ballPosition.x, ballPosition.y, BALL_RADIUS);
            graphics.fill();
          }}
        />
      )}
    </pixiContainer>
  );
}
