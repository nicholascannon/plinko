import { Container, Graphics } from 'pixi.js';
import {
  generateBoardConfig,
  type BoardConfig,
  type PegConfig,
} from './utils/board';
import { Bucket } from './bucket';

export class Board extends Container {
  public readonly buckets: Bucket[];
  public readonly config: BoardConfig;

  constructor(payouts: number[], spacing: number) {
    super();

    this.config = generateBoardConfig({ payouts, spacing });

    this.width = this.config.width;
    this.height = this.config.height;

    this.config.pegs.forEach((config) => this.addChild(new Peg(config)));

    this.buckets = this.config.buckets.map(
      ({ payout, position }) =>
        new Bucket(payout, {
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
