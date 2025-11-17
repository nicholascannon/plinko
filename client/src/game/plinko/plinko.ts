import { Board } from './entities/board';
import { Disc } from './entities/disc';
import { ResizeableGame } from '../common/resizeable-game';

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
    await super.start();

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

    super.stop();
    this.started = false;
  }

  private play(e: CustomEvent) {
    const bucketIndex = e.detail.bucket;
    console.log('PLAY', { bucket: bucketIndex });

    const disc = new Disc();
    disc.drop(this.app, this.board, bucketIndex);
  }
}
