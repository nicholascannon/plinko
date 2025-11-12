import { Application, extend } from '@pixi/react';
import { Container, Graphics, Text } from 'pixi.js';
import { PlinkoBoard } from './components/plinko-board';

import './app.css';

extend({ Graphics, Container, Text });

export function App() {
  return (
    <Application
      resizeTo={window}
      antialias
      autoDensity
      resolution={window.devicePixelRatio}
      autoStart
    >
      <PlinkoBoard
        x={window.innerHeight * 0.1}
        y={window.innerWidth * 0.1}
        spacing={50}
        buckets={Array.from({ length: 8 }, (_, i) => i + 1)}
      />
    </Application>
  );
}
