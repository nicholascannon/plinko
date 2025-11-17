import { Graphics, type ContainerChild, type ContainerOptions } from 'pixi.js';
import { Container, Text } from 'pixi.js';

export class Bucket extends Container {
  constructor(
    public readonly payout: number,
    options?: ContainerOptions<ContainerChild>
  ) {
    super(options);

    const bucket = new Graphics().circle(0, 0, 20).fill({ color: 'yellow' });
    this.addChild(bucket);

    const text = new Text({
      text: payout.toFixed(1),
      style: {
        fontSize: 12,
        fill: 'black',
        fontFamily: 'Arial',
      },
      anchor: 0.5,
      x: 0,
      y: 0,
    });
    this.addChild(text);
  }
}
