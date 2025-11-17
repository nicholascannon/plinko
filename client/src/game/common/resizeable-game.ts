import {
  Application,
  type ApplicationOptions,
  type DestroyOptions,
  type RendererDestroyOptions,
} from 'pixi.js';
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

  public async start(options?: Partial<ApplicationOptions>): Promise<void> {
    await this.app.init({
      ...options,
      // always override these options
      width: this.baseWidth,
      height: this.baseHeight,
      canvas: this.canvas,
    });

    this.setupResizeObserver();

    // NOTE: do not set this.started to true here, it is done in the subclass
  }

  public stop(
    rendererDestroyOptions?: RendererDestroyOptions,
    pixiDestroyOptions?: DestroyOptions
  ): void {
    if (!this.started) return;

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }

    this.app.destroy(rendererDestroyOptions, pixiDestroyOptions);
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

    this.app.renderer.resize(newWidth, newHeight);
    this.app.stage.scale.set(scale);

    // Center the stage if letterboxing/pillarboxing occurs
    const scaledWidth = this.baseWidth * scale;
    const scaledHeight = this.baseHeight * scale;
    this.app.stage.x = (newWidth - scaledWidth) / 2;
    this.app.stage.y = (newHeight - scaledHeight) / 2;
  }
}
