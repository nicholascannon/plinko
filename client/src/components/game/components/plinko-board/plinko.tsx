import { Application, Container, Graphics, Text } from 'pixi.js';
import { useEffect, useRef } from 'react';
import { generateBoard } from './utils/board';
import { generateBucketPositions } from './utils/buckets';
import { generatePath } from './utils/path';

const DISC_RADIUS = 12;

export function Plinko({ style }: { style?: React.CSSProperties }) {
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

      const { container, bucketPositions, board } = renderBoard(app);
      app.stage.addChild(container);

      const play = () => {
        const randomBucket =
          Math.floor(Math.random() * 10) % bucketPositions.length;

        console.log('PLAY', { bucket: randomBucket });

        const path = generatePath({
          endPosition: bucketPositions[randomBucket],
          startingPosition: { x: board.centerX, y: 0 },
          pegs: board.pegs,
          discRadius: DISC_RADIUS,
        });

        const disc = new Graphics()
          .circle(0, 0, DISC_RADIUS)
          .fill({ color: 'red' });
        container.addChild(disc);

        let step = 0;
        let frameCount = 0;
        const framesPerStep = 2; // Update position every 3 frames (slower animation)
        const animateDisc = () => {
          frameCount++;
          if (frameCount < framesPerStep) return;

          frameCount = 0;
          const { x, y } = path[step];

          disc.x = x;
          disc.y = y;

          // stop animation when disc has completed path
          step++;
          if (step === path.length) {
            app.ticker.remove(animateDisc);
            container.removeChild(disc);
          }
        };

        app.ticker.add(animateDisc);
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

  bucketPositions.forEach(({ x, y }, idx) => {
    const bucketContainer = new Container();

    const bucket = new Graphics();
    bucket.circle(x, y, 15);
    bucket.fill({ color: 'yellow' });

    bucketContainer.addChild(bucket);

    const text = new Text({
      text: idx,
      style: {
        fontSize: 24,
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

  return { board, bucketPositions, container };
}
