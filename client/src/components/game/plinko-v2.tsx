import { Application, Container, Graphics } from 'pixi.js';
import { useEffect, useRef } from 'react';
import { generateBoard } from './components/plinko-board/utils/board';
import { generateBucketPositions } from './components/plinko-board/utils/buckets';

export function PlinkoV2({ style }: { style?: React.CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);

  useEffect(() => {
    let mounted = false;
    const play: (() => void) | undefined = undefined;

    (async () => {
      if (!canvasRef.current) return;
      if (appRef.current) return;

      appRef.current = new Application();
      const app = appRef.current;

      await app.init({
        autoStart: true,
        antialias: true,
        resolution: window.devicePixelRatio,
        resizeTo: canvasRef.current,
        canvas: canvasRef.current,
      });

      renderBoard(app);

      const play = () => {
        alert('play');
      };
      document.addEventListener('play', play);

      mounted = true;
    })();

    return () => {
      // Game cleanup
      if (play) document.removeEventListener('play', play);
      if (mounted) {
        appRef.current?.destroy(false, {
          children: true,
          texture: true,
          textureSource: true,
          context: true,
        });
        appRef.current = null;
      }
    };
  }, []);

  return <canvas style={style} ref={canvasRef}></canvas>;
}

function renderBoard(app: Application) {
  const buckets = Array.from({ length: 8 }, (_, i) => i + 1);

  const board = generateBoard({
    rows: buckets.length,
    spacing: app.screen.width / (buckets.length + 1), // add some margin with + 1
  });
  const bucketPositions = generateBucketPositions({
    board,
    buckets,
  });

  const offsetX = (app.screen.width - board.width) / 2;
  const offsetY = (app.screen.height - board.height) / 2;

  const container = new Container({ x: offsetX, y: offsetY });

  board.pegs.forEach(({ x, y, radius }) => {
    const peg = new Graphics();
    peg.circle(x, y, radius);
    peg.fill({ color: 'white' });
    container.addChild(peg);
  });

  bucketPositions.forEach(({ x, y }) => {
    const bucket = new Graphics();
    bucket.circle(x, y, 15);
    bucket.fill({ color: 'yellow' });
    container.addChild(bucket);
  });

  app.stage.addChild(container);
}
