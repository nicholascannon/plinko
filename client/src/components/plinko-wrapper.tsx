import { useEffect, useRef } from 'react';
import { Plinko } from '../game';

interface PlinkoProps {
  style?: React.CSSProperties;
  payouts: number[];
}

export function PlinkoWrapper({ style, payouts }: PlinkoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plinkoRef = useRef<Plinko | null>(null);

  useEffect(() => {
    let mounted = false;

    (async () => {
      if (!canvasRef.current) return;
      if (plinkoRef.current) return;

      plinkoRef.current = new Plinko(canvasRef.current, payouts);
      await plinkoRef.current.start();

      mounted = true;
    })();

    return () => {
      if (mounted) {
        plinkoRef.current?.stop();
        plinkoRef.current = null;
      }
    };
  }, [payouts]);

  return <canvas style={style} ref={canvasRef}></canvas>;
}
