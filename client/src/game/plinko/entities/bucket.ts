import {
  Application,
  Graphics,
  Ticker,
  type ContainerChild,
  type ContainerOptions,
} from 'pixi.js';
import { Container, Text } from 'pixi.js';

export class Bucket extends Container {
  private animateFn?: (ticker: Ticker) => void;

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

  public bounce(app: Application) {
    if (this.animateFn) return;

    // Use a spring-like bounce with easing for a smoother, more natural effect
    // Parameters for "spring" animation
    const duration = 32; // frames for the full bounce (up + down)
    let frame = 0;
    const baseY = this.y;
    const amplitude = 10;
    const damping = 0.32; // "squash" effect

    this.animateFn = () => {
      frame++;
      // Normalized time [0, 1]
      const t = Math.min(frame / duration, 1);

      // Out-and-back ease, damped, single cycle
      // y(t) = startY - amplitude * (1 - e^{-damping*t}) * sin(π * t)
      const easedBounce =
        baseY -
        amplitude *
          (1 - Math.exp(-damping * t * 7)) * // 7 makes it snappier
          Math.sin(Math.PI * t);

      this.y = easedBounce;

      // End when returning to startY (after 1 cycle)
      if (t >= 1) {
        this.y = baseY;
        if (this.animateFn) {
          app.ticker.remove(this.animateFn);
        }
        this.animateFn = undefined;
      }
    };

    app.ticker.add(this.animateFn);
  }
}
