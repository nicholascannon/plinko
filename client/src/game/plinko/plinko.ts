import { Board } from './entities/board';
import { Disc } from './entities/disc';
import { ResizeableGame } from '../common/resizeable-game';
import { PlayEvent } from '../../events/play-event';
import { dispatchPlayFinishEvent } from '../../events/play-finish-event';

export class Plinko extends ResizeableGame {
  private board: Board;
  private boundPlayHandler?: EventListener;

  constructor(canvas: HTMLCanvasElement, private readonly payouts: number[]) {
    super(canvas);

    const boardSpacing = this.baseWidth / (this.payouts.length + 4); // add some margin
    this.board = new Board(this.payouts, boardSpacing);
    // center the board on stage
    this.board.position.set(
      (this.baseWidth - this.board.config.width) / 2,
      (this.baseHeight - this.board.config.height) / 2
    );
  }

  public async start() {
    await super.start({
      autoStart: true,
      antialias: true,
      resolution: window.devicePixelRatio,
    });

    this.app.stage.addChild(this.board);

    // Store bound function reference for proper cleanup
    this.boundPlayHandler = this.play.bind(this) as EventListener; // type this better
    document.addEventListener(PlayEvent.TYPE, this.boundPlayHandler);

    this.started = true;
  }

  public stop() {
    if (!this.started) return;

    if (this.boundPlayHandler) {
      document.removeEventListener(PlayEvent.TYPE, this.boundPlayHandler);
      this.boundPlayHandler = undefined;
    }

    super.stop(false, {
      children: true,
      texture: true,
      textureSource: true,
      context: true,
    });
    this.started = false;
  }

  private play(e: PlayEvent) {
    const bucketIndex = e.detail.bucket;
    console.log('PLAY', { bucket: bucketIndex });

    const disc = new Disc(this.board.config.spacing / 4);
    disc.drop(this.board, bucketIndex, () => {
      dispatchPlayFinishEvent(e.detail);
    });
  }
}
