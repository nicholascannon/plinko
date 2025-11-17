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
  constructor(options?: GraphicsOptions | GraphicsContext) {
    super(options);
    this.circle(0, 0, RADIUS);
    this.fill({ color: 'red' });
  }

  public drop(app: Application, board: Board, bucketIndex: number) {
    const path = generatePath({
      startingPosition: { x: board.config.centerX, y: 0 },
      endPosition: board.buckets[bucketIndex].position,
    });

    board.addChild(this);

    let step = 0;
    const animate = () => {
      const { x, y } = path[step];

      this.x = x;
      this.y = y;

      step++;

      // stop animation when disc has completed path
      if (step === path.length) {
        app.ticker.remove(animate);
        board.removeChild(this);
      }
    };

    app.ticker.add(animate);
  }
}
