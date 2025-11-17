import { Application } from 'pixi.js';
import { Board } from './board';
import { Disc } from './disc';

/**
 * The Pixi Plinko Game.
 */
export class Plinko {
  private readonly app: Application;
  private readonly canvas: HTMLCanvasElement;
  private started: boolean = false;

  private baseWidth: number;
  private baseHeight: number;
  private resizeObserver?: ResizeObserver;

  private board?: Board;
  private boundPlayHandler?: EventListener;

  constructor(canvas: HTMLCanvasElement) {
    this.app = new Application();
    this.canvas = canvas;

    // Capture initial canvas size as base resolution
    const rect = this.canvas.getBoundingClientRect();
    this.baseWidth = rect.width;
    this.baseHeight = rect.height;
  }

  public async start(payouts: number[]) {
    await this.app.init({
      autoStart: true,
      antialias: true,
      resolution: window.devicePixelRatio,
      width: this.baseWidth,
      height: this.baseHeight,
      canvas: this.canvas,
    });

    // Setup resize observer to handle canvas size changes
    this.setupResizeObserver();

    const boardSpacing = this.baseWidth / (payouts.length + 4); // add some margin
    this.board = new Board(payouts, boardSpacing);

    // center the board on stage using base resolution
    this.board.x = (this.baseWidth - this.board.config.width) / 2;
    this.board.y = (this.baseHeight - this.board.config.height) / 2;
    this.app.stage.addChild(this.board);

    // Store bound function reference for proper cleanup
    this.boundPlayHandler = this.play.bind(this) as EventListener;
    document.addEventListener('play', this.boundPlayHandler);

    this.started = true;
  }

  public stop() {
    if (!this.started) return;

    if (this.boundPlayHandler) {
      document.removeEventListener('play', this.boundPlayHandler);
      this.boundPlayHandler = undefined;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }

    this.app.destroy(false, {
      children: true,
      texture: true,
      textureSource: true,
      context: true,
    });
  }

  private setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    this.resizeObserver.observe(this.canvas);
  }

  private handleResize() {
    const rect = this.canvas.getBoundingClientRect();
    const newWidth = rect.width;
    const newHeight = rect.height;

    // Calculate scale factor maintaining aspect ratio
    const scaleX = newWidth / this.baseWidth;
    const scaleY = newHeight / this.baseHeight;
    const scale = Math.min(scaleX, scaleY);

    // Update renderer size to actual canvas size
    this.app.renderer.resize(newWidth, newHeight);

    // Apply scale to stage
    this.app.stage.scale.set(scale);

    // Center the stage if letterboxing/pillarboxing occurs
    const scaledWidth = this.baseWidth * scale;
    const scaledHeight = this.baseHeight * scale;
    this.app.stage.x = (newWidth - scaledWidth) / 2;
    this.app.stage.y = (newHeight - scaledHeight) / 2;
  }

  private play(e: CustomEvent) {
    if (!this.board) return; // TODO: log something here?

    const bucketIndex = e.detail.bucket;
    console.log('PLAY', { bucket: bucketIndex });

    const disc = new Disc();
    disc.drop(this.app, this.board, bucketIndex);
  }
}
