import { useEffect, useRef } from 'react';
import { PlinkoUI } from './plinko-ui';

interface PlinkoProps {
  style?: React.CSSProperties;
  payouts: number[];
}

export function Plinko({ style, payouts }: PlinkoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plinkoRef = useRef<PlinkoUI | null>(null);

  useEffect(() => {
    let mounted = false;

    (async () => {
      if (!canvasRef.current) return;
      if (plinkoRef.current) return;

      plinkoRef.current = new PlinkoUI(canvasRef.current);
      await plinkoRef.current.init(payouts);

      mounted = true;
    })();

    return () => {
      if (mounted) {
        plinkoRef.current?.destroy();
        plinkoRef.current = null;
      }
    };
  }, [payouts]);

  return <canvas style={style} ref={canvasRef}></canvas>;
}
