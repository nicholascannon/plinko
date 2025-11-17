import { Container, Graphics } from 'pixi.js';
import {
  generateBoardConfig,
  type BoardConfig,
  type PegConfig,
} from './utils/board';
import { getBucketPositions } from './utils/buckets';
import { Bucket } from './bucket';

export class Board extends Container {
  public readonly buckets: Bucket[];
  public readonly config: BoardConfig;

  constructor(payouts: number[], spacing: number) {
    super();

    const rows = payouts.length;
    this.config = generateBoardConfig({ rows, spacing });

    this.width = this.config.width;
    this.height = this.config.height;

    this.config.pegs.forEach((config) => this.addChild(new Peg(config)));

    this.buckets = getBucketPositions({ board: this.config, payouts }).map(
      (position, i) =>
        new Bucket(payouts[i], {
          x: position.x,
          y: position.y + spacing / 2, // add some space from the pegs
        })
    );
    this.buckets.forEach((bucket) => this.addChild(bucket));
  }
}

class Peg extends Graphics {
  constructor(public readonly config: PegConfig) {
    super();
    this.circle(config.x, config.y, config.radius);
    this.fill({ color: 'white' });
  }
}
