import { Graphics, GraphicsContext, type GraphicsOptions } from 'pixi.js';
import { gsap } from 'gsap';
import type { Board } from './board';

export class Disc extends Graphics {
  private animation?: gsap.core.Timeline;

  constructor(
    public readonly radius: number,
    options?: GraphicsOptions | GraphicsContext
  ) {
    super(options);
    this.circle(0, 0, radius);
    this.fill({ color: 'red' });
  }

  public drop(board: Board, bucketIndex: number) {
    if (this.animation) return;

    const targetBucket = board.buckets[bucketIndex];
    const rows = board.buckets.length;
    const spacing = board.config.spacing;
    const pegRadius = board.config.pegs[0].radius / 2;
    const boardCenterX = board.config.width / 2;

    this.x = boardCenterX;
    this.y = 0;
    board.addChild(this);

    // Compute R | L moves to target bucket
    const totalSteps = rows - 1;
    const rightMoves = bucketIndex;
    const leftMoves = totalSteps - rightMoves;
    const moves: Array<'R' | 'L'> = [
      ...Array(rightMoves).fill('R'),
      ...Array(leftMoves).fill('L'),
    ];

    // Shuffle moves
    for (let i = moves.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [moves[i], moves[j]] = [moves[j], moves[i]];
    }

    const tl = gsap.timeline({
      onComplete: () => {
        targetBucket.bounce();
        board.removeChild(this);
        this.destroy();
        this.animation = undefined;
      },
    });
    this.animation = tl;

    let currentX = this.x;
    let currentY = this.y;

    moves.forEach((move) => {
      const nextX = currentX + (move === 'R' ? 0.5 : -0.5) * spacing;
      const nextY = currentY + spacing;
      const collisionY = nextY - (pegRadius + this.radius);

      // 1. Fall to collision
      tl.to(this, {
        x: currentX, // Fall straight down
        y: collisionY,
        duration: 0.08 + Math.random() * 0.02,
        ease: 'power2.in',
      });

      // 2. Bounce to next gap (Parabolic Arc)
      // Split into two parts: Up (to peak) and Down (to next gap)
      const bounceDuration = 0.15 + Math.random() * 0.05;
      const bounceHeight = spacing * 0.3;
      const midX = (currentX + nextX) / 2;
      const peakY = collisionY - bounceHeight;

      // Part A: Bounce Up
      tl.to(this, {
        x: midX,
        y: peakY,
        rotation: `+=${(Math.random() * 180 - 90) * 0.5}`, // Half spin
        duration: bounceDuration * 0.5,
        ease: 'power1.out',
      });

      // Part B: Bounce Down
      tl.to(this, {
        x: nextX,
        y: nextY,
        rotation: `+=${(Math.random() * 180 - 90) * 0.5}`, // Other half spin
        duration: bounceDuration * 0.5,
        ease: 'power2.in',
      });

      currentX = nextX;
      currentY = nextY;
    });

    // Final drop to bucket
    tl.to(this, {
      x: targetBucket.position.x,
      y: targetBucket.position.y,
      duration: 0.15,
      ease: 'bounce.out',
    });
  }
}
