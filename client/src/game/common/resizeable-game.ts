import { Application } from 'pixi.js';
import type { Game } from './game';

export class ResizeableGame implements Game {
  protected readonly app: Application;
  protected started: boolean = false;

  protected baseWidth: number;
  protected baseHeight: number;
  private resizeObserver?: ResizeObserver;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.app = new Application();

    const { width, height } = this.canvas.getBoundingClientRect();
    this.baseWidth = width;
    this.baseHeight = height;
  }

  public async start(): Promise<void> {
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

    // NOTE: do not set this.started to true here, it is done in the subclass
  }

  public stop(): void {
    if (!this.started) return;

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
}
