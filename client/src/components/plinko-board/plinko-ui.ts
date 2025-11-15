import { Application, Container, Graphics, Text } from 'pixi.js';
import { generateBoardConfig, type BoardConfig } from './utils/board';
import { generateBuckets } from './utils/buckets';
import type { Bucket } from './utils/types';
import { generatePath } from './utils/path';

// TODO: name this better
export class PlinkoUI {
  private readonly app: Application;
  private readonly canvas: HTMLCanvasElement;
  private initialised: boolean = false;

  private boardConfig?: BoardConfig;
  private buckets?: Bucket[];

  private board?: Container;

  constructor(canvas: HTMLCanvasElement) {
    this.app = new Application();
    this.canvas = canvas;
  }

  public async init(payouts: number[]) {
    await this.app.init({
      autoStart: true,
      antialias: true,
      resolution: window.devicePixelRatio,
      resizeTo: this.canvas,
      canvas: this.canvas,
    });

    this.boardConfig = generateBoardConfig({
      rows: payouts.length,
      spacing: this.app.screen.width / (payouts.length + 4), // add some margin
    });
    this.buckets = generateBuckets({
      board: this.boardConfig,
      payouts,
    });

    this.render();

    // TODO: rename this to drop disc or something
    // @ts-expect-error TODO: figure out how to properly type custom events
    document.addEventListener('play', this.play.bind(this));

    this.initialised = true;
  }

  public destroy() {
    if (!this.initialised) return;

    // @ts-expect-error TODO: figure out how to properly type custom events
    document.removeEventListener('play', this.play.bind(this));

    this.app.destroy(false, {
      children: true,
      texture: true,
      textureSource: true,
      context: true,
    });
  }

  private render() {
    this.board = this.renderBoard();
    this.app.stage.addChild(this.board!);
  }

  private renderBoard() {
    if (!this.boardConfig || !this.buckets) return;

    const offsetX = (this.app.screen.width - this.boardConfig.width) / 2;
    const offsetY = (this.app.screen.height - this.boardConfig.height) / 2;

    const container = new Container({ x: offsetX, y: offsetY });

    this.boardConfig.pegs.forEach(({ x, y, radius }) => {
      const peg = new Graphics();
      peg.circle(x, y, radius);
      peg.fill({ color: 'white' });
      container.addChild(peg);
    });

    this.buckets.forEach(({ position: { x, y }, payout }) => {
      const bucketContainer = new Container();

      const bucket = new Graphics();
      bucket.circle(x, y, 15);
      bucket.fill({ color: 'yellow' });

      bucketContainer.addChild(bucket);

      const text = new Text({
        text: payout.toFixed(1),
        style: {
          fontSize: 12,
          fill: 'black',
          fontFamily: 'Arial',
        },
        anchor: 0.5,
      });
      text.x = x;
      text.y = y;
      bucketContainer.addChild(text);

      container.addChild(bucketContainer);
    });

    return container;
  }

  private play(e: CustomEvent) {
    if (!this.buckets || !this.boardConfig) return;
    const bucket = e.detail.bucket;

    console.log('PLAY', { bucket });

    const path = generatePath({
      endPosition: this.buckets[bucket].position,
      startingPosition: { x: this.boardConfig.centerX, y: 0 },
    });

    const disc = new Graphics()
      .circle(0, 0, 10) // TODO: use constant
      .fill({ color: 'red' });
    this.board!.addChild(disc);

    let step = 0;
    const animateDisc = () => {
      const { x, y } = path[step];

      disc.x = x;
      disc.y = y;

      step++;

      // stop animation when disc has completed path
      if (step === path.length) {
        this.app.ticker.remove(animateDisc);
        this.board!.removeChild(disc);
      }
    };

    this.app.ticker.add(animateDisc);
  }
}
