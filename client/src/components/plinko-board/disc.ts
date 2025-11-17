import { Application, Graphics } from 'pixi.js';
import type { Board } from './board';
import { generatePath } from './utils/path';

const RADIUS = 10;

export class Disc {
  private readonly graphic: Graphics;

  constructor() {
    this.graphic = new Graphics().circle(0, 0, RADIUS).fill({ color: 'red' });
  }

  public drop(app: Application, board: Board, bucketIndex: number) {
    const path = generatePath({
      startingPosition: { x: board.config.centerX, y: 0 },
      endPosition: board.buckets[bucketIndex].position,
    });

    board.container.addChild(this.graphic);

    let step = 0;
    const animate = () => {
      const { x, y } = path[step];

      this.graphic.x = x;
      this.graphic.y = y;

      step++;

      // stop animation when disc has completed path
      if (step === path.length) {
        app.ticker.remove(animate);
        board.container.removeChild(this.graphic);
      }
    };

    app.ticker.add(animate);
  }
}
