import { useApplication } from '@pixi/react';
import { useEffect, useState } from 'react';

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
  centerX: number;
  rows: number;
};

type Ball = {
  x: number;
  y: number;
  vx: number;
  vy: number;
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
    centerX,
    rows,
  };
}

function isEdgePeg(pegIndex: number, board: Board): boolean {
  let currentIndex = 0;
  for (let row = 0; row < board.rows; row++) {
    const numPegs = 3 + (row - 1);
    if (pegIndex === currentIndex || pegIndex === currentIndex + numPegs - 1) {
      return true;
    }
    currentIndex += numPegs;
  }
  return false;
}

function isLeftEdgePeg(pegIndex: number, board: Board): boolean {
  let currentIndex = 0;
  for (let row = 0; row < board.rows; row++) {
    const numPegs = 3 + (row - 1);
    if (pegIndex === currentIndex) {
      return true;
    }
    currentIndex += numPegs;
  }
  return false;
}

export function PlinkoBoard({ buckets, spacing }: PlinkoBoardProps) {
  const { app } = useApplication();
  const board = generateBoard({ rows: buckets.length, spacing });

  const offsetX = (app.screen.width - board.width) / 2;
  const offsetY = (app.screen.height - board.height) / 2;

  const [ball, setBall] = useState<Ball | null>(null);

  // Initialize ball after 1 second delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setBall({
        x: board.centerX + (Math.random() - 0.5) * 20,
        y: 0,
        vx: (Math.random() - 0.5) * 2,
        vy: 0,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [board.centerX]);

  const PEG_RADIUS = 7;
  const BALL_RADIUS = 12;
  const GRAVITY = 1.5;
  const BOUNCE_DAMPING = 0.4;
  const COLLISION_DISTANCE = BALL_RADIUS + PEG_RADIUS;

  useEffect(() => {
    if (!ball) return;

    const tickCallback = (ticker: { deltaTime: number }) => {
      const delta = Math.min(Number(ticker.deltaTime) || 1, 2);
      setBall((currentBall) => {
        if (!currentBall) return null;

        // Check if ball has fallen off the board
        if (currentBall.y > board.height) {
          return null;
        }

        // Apply gravity
        let newVy = currentBall.vy + GRAVITY * delta;
        let newVx = currentBall.vx;
        let newX = currentBall.x + newVx * delta * 0.7;
        let newY = currentBall.y + newVy * delta * 0.7;

        // Check collisions with pegs
        for (let i = 0; i < board.pegs.length; i++) {
          const peg = board.pegs[i];
          const dx = newX - peg.x;
          const dy = newY - peg.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < COLLISION_DISTANCE && distance > 0) {
            // Calculate collision normal (from peg to ball)
            const normalX = dx / distance;
            const normalY = dy / distance;

            // Reflect velocity off the normal
            const dotProduct = newVx * normalX + newVy * normalY;
            let reflectedVx = newVx - 2 * dotProduct * normalX;
            let reflectedVy = newVy - 2 * dotProduct * normalY;

            // Apply damping
            reflectedVx *= BOUNCE_DAMPING;
            reflectedVy *= BOUNCE_DAMPING;

            // If ball is on top of peg (normalY close to -1), add horizontal push to slide off
            if (normalY < -0.7) {
              // Add horizontal velocity to help slide off
              const slideDirection = normalX > 0 ? 1 : -1;
              reflectedVx += slideDirection * 0.5;
              // Ensure minimum downward velocity
              if (reflectedVy > -0.3) {
                reflectedVy = -0.3;
              }
            }

            // Ensure minimum velocity to prevent getting stuck
            const minVelocity = 0.2;
            if (
              Math.abs(reflectedVx) < minVelocity &&
              Math.abs(reflectedVy) < minVelocity
            ) {
              // Add a small push in a random horizontal direction
              reflectedVx = (Math.random() - 0.5) * 0.5;
              reflectedVy = -0.3;
            }

            // Handle edge pegs - ensure ball bounces inward
            if (isEdgePeg(i, board)) {
              if (isLeftEdgePeg(i, board)) {
                // Left edge: ensure vx is positive (pointing right/inward)
                if (reflectedVx < 0) {
                  reflectedVx = Math.abs(reflectedVx);
                }
              } else {
                // Right edge: ensure vx is negative (pointing left/inward)
                if (reflectedVx > 0) {
                  reflectedVx = -Math.abs(reflectedVx);
                }
              }
            }

            newVx = reflectedVx;
            newVy = reflectedVy;

            // Push ball further out of collision to prevent immediate re-collision
            const pushOutDistance = COLLISION_DISTANCE * 1.1;
            newX = peg.x + normalX * pushOutDistance;
            newY = peg.y + normalY * pushOutDistance;
          }
        }

        return {
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
        };
      });
    };

    app.ticker.add(tickCallback);

    return () => {
      app.ticker.remove(tickCallback);
    };
  }, [app, board, ball, COLLISION_DISTANCE]);

  return (
    <pixiContainer x={offsetX} y={offsetY}>
      {board.pegs.map((peg, i) => (
        <pixiGraphics
          key={`peg-${i}`}
          draw={(graphics) => {
            graphics.clear();
            graphics.setFillStyle({ color: 'white' });
            graphics.circle(peg.x, peg.y, PEG_RADIUS);

            graphics.fill();
          }}
        />
      ))}
      {ball && (
        <pixiGraphics
          draw={(graphics) => {
            graphics.clear();
            graphics.setFillStyle({ color: 'red' });
            graphics.circle(ball.x, ball.y, BALL_RADIUS);
            graphics.fill();
          }}
        />
      )}
    </pixiContainer>
  );
}
