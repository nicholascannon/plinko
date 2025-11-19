import { Graphics, GraphicsContext, type GraphicsOptions } from 'pixi.js';
import { gsap } from 'gsap';
import type { Board } from './board';

const RADIUS = 10;

export class Disc extends Graphics {
  private animation?: gsap.core.Tween;

  constructor(options?: GraphicsOptions | GraphicsContext) {
    super(options);
    this.circle(0, 0, RADIUS);
    this.fill({ color: 'red' });
  }

  public drop(board: Board, bucketIndex: number) {
    if (this.animation) return;

    const bucket = board.buckets[bucketIndex];

    // TODO: we don't really need the path but we need a more realistic animation later
    // const path = generatePath({
    //   startingPosition: { x: board.config.width / 2, y: 0 },
    //   endPosition: bucket.position,
    // });

    board.addChild(this);

    // Set initial position
    this.x = board.config.width / 2;
    this.y = 0;

    this.animation = gsap.to(this, {
      x: bucket.position.x,
      y: bucket.position.y,
      duration: 1,
      ease: 'none',
      onComplete: () => {
        bucket.bounce();

        board.removeChild(this);

        // destroy resources and nullify references for GC
        this.destroy();
        this.animation = undefined;
      },
    });
  }
}
