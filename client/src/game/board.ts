import { Container, Graphics } from 'pixi.js';
import { generateBoardConfig, type BoardConfig } from './utils/board';
import { getBucketPositions } from './utils/buckets';
import { Bucket } from './bucket';

export class Board {
  public readonly container: Container;
  public readonly buckets: Bucket[];

  public readonly config: BoardConfig;

  constructor(payouts: number[], spacing: number) {
    const rows = payouts.length;
    this.config = generateBoardConfig({ rows, spacing });

    this.container = new Container();

    this.config.pegs.forEach(({ x, y, radius }) => {
      const peg = new Graphics();
      peg.circle(x, y, radius);
      peg.fill({ color: 'white' });
      this.container.addChild(peg);
    });

    this.buckets = getBucketPositions({ board: this.config, payouts }).map(
      (position, i) =>
        new Bucket(payouts[i], {
          x: position.x,
          y: position.y + spacing / 2, // add some space from the pegs
        })
    );
    this.buckets.forEach((bucket) => this.container.addChild(bucket.container));
  }
}
