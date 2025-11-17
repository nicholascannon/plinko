import { Application } from 'pixi.js';
import { Board } from './board';
import { Disc } from './disc';

/**
 * The Pixi Plinko Game.
 */
export class PlinkoGame {
  private readonly app: Application;
  private readonly canvas: HTMLCanvasElement;
  private started: boolean = false;
  private board?: Board;

  constructor(canvas: HTMLCanvasElement) {
    this.app = new Application();
    this.canvas = canvas;
  }

  public async start(payouts: number[]) {
    await this.app.init({
      autoStart: true,
      antialias: true,
      resolution: window.devicePixelRatio,
      resizeTo: this.canvas,
      canvas: this.canvas,
    });

    const boardSpacing = this.app.screen.width / (payouts.length + 4); // add some margin
    this.board = new Board(payouts, boardSpacing);

    // center the board on stage
    this.board.container.x =
      (this.app.screen.width - this.board.config.width) / 2;
    this.board.container.y =
      (this.app.screen.height - this.board.config.height) / 2;
    this.app.stage.addChild(this.board.container);

    // @ts-expect-error TODO: figure out how to properly type custom events
    document.addEventListener('play', this.play.bind(this));

    this.started = true;
  }

  public stop() {
    if (!this.started) return;

    // @ts-expect-error TODO: figure out how to properly type custom events
    document.removeEventListener('play', this.play.bind(this));

    this.app.destroy(false, {
      children: true,
      texture: true,
      textureSource: true,
      context: true,
    });
  }

  private play(e: CustomEvent) {
    if (!this.board) return; // TODO: log something here?

    const bucketIndex = e.detail.bucket;
    console.log('PLAY', { bucket: bucketIndex });

    const disc = new Disc();
    disc.drop(this.app, this.board, bucketIndex);
  }
}
