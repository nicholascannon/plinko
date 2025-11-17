import { Graphics } from 'pixi.js';
import { Container, Text } from 'pixi.js';
import type { Position } from '../../game/utils/types';

export class Bucket {
  public readonly container: Container;

  constructor(
    public readonly payout: number,
    public readonly position: Position
  ) {
    this.container = new Container();

    const bucket = new Graphics();
    bucket.circle(this.position.x, this.position.y, 15);
    bucket.fill({ color: 'yellow' });

    this.container.addChild(bucket);

    const text = new Text({
      text: payout.toFixed(1),
      style: {
        fontSize: 12,
        fill: 'black',
        fontFamily: 'Arial',
      },
      anchor: 0.5,
    });
    text.x = this.position.x;
    text.y = this.position.y;
    this.container.addChild(text);
  }
}
