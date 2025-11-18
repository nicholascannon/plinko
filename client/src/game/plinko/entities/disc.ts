import {
  Application,
  Graphics,
  GraphicsContext,
  type GraphicsOptions,
} from 'pixi.js';
import type { Board } from './board';
import { generatePath } from './utils/path';

const RADIUS = 10;

export class Disc extends Graphics {
  private animateFn?: () => void;

  constructor(options?: GraphicsOptions | GraphicsContext) {
    super(options);
    this.circle(0, 0, RADIUS);
    this.fill({ color: 'red' });
  }

  public drop(app: Application, board: Board, bucketIndex: number) {
    if (this.animateFn) return;

    const bucket = board.buckets[bucketIndex];
    const path = generatePath({
      startingPosition: { x: board.config.width / 2, y: 0 },
      endPosition: bucket.position,
    });

    board.addChild(this);

    let step = 0;
    this.animateFn = () => {
      const { x, y } = path[step];

      this.x = x;
      this.y = y;

      step++;

      // stop animation when disc has completed path
      if (step === path.length) {
        bucket.bounce(app);

        if (this.animateFn) {
          app.ticker.remove(this.animateFn);
        }
        board.removeChild(this);

        // destroy resources and nullify references for GC
        this.destroy();
        this.animateFn = undefined;
      }
    };

    app.ticker.add(this.animateFn);
  }
}
