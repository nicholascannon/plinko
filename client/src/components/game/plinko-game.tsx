import { Application, extend } from '@pixi/react';
import { Container, Graphics, Text } from 'pixi.js';
import { PlinkoBoard } from './components/plinko-board';

extend({ Graphics, Container, Text });

export function PlinkoGame({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const numberOfBuckets = 8;

  return (
    <Application
      width={width}
      height={height}
      antialias
      autoDensity
      resolution={window.devicePixelRatio}
      autoStart
    >
      <PlinkoBoard
        spacing={height / numberOfBuckets - 10}
        buckets={Array.from({ length: numberOfBuckets }, (_, i) => i + 1)}
      />
    </Application>
  );
}
