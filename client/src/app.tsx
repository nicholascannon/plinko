import { Application, extend } from '@pixi/react';
import { Container, Graphics, Text } from 'pixi.js';

import './app.css';
import { PlinkoBoard } from './components/plinko-board';

extend({ Graphics, Container, Text });

export function App() {
  return (
    <Application antialias resizeTo={window} resolution={1}>
      <PlinkoBoard buckets={Array.from({ length: 8 }, (_, i) => i + 1)} />
    </Application>
  );
}
