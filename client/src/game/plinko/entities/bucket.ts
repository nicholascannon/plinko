import { Graphics, type ContainerChild, type ContainerOptions } from 'pixi.js';
import { Container, Text } from 'pixi.js';
import { gsap } from 'gsap';

export class Bucket extends Container {
  private animation?: gsap.core.Tween;

  constructor(
    public readonly payout: number,
    size: number,
    options?: ContainerOptions<ContainerChild>
  ) {
    super(options);

    const cornerRadius = size * 0.1;
    const bucket = new Graphics()
      .roundRect(-size / 2, -size / 2, size, size, cornerRadius)
      .fill({ color: 'yellow' });
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

  public bounce() {
    if (this.animation) return;

    const baseY = this.y;
    const amplitude = 5;
    const duration = 0.1; // seconds

    this.animation = gsap.to(this, {
      y: baseY + amplitude,
      duration,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.y = baseY;
        this.animation = undefined;
      },
    });
  }
}
