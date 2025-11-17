import type {
  ApplicationOptions,
  DestroyOptions,
  RendererDestroyOptions,
} from 'pixi.js';

export interface Game {
  start(options?: Partial<ApplicationOptions>): Promise<void>;
  stop(
    rendererDestroyOptions?: RendererDestroyOptions,
    pixiDestroyOptions?: DestroyOptions
  ): void;
}
