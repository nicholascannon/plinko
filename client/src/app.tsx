import { Application, extend } from '@pixi/react';
import { Graphics } from 'pixi.js';

import './app.css';

extend({ Graphics });

export function App() {
  return (
    <Application antialias resizeTo={window}>
      <pixiGraphics
        draw={(graphics) => {
          graphics.clear();
          graphics.setFillStyle({ color: 'red' });
          graphics.rect(0, 0, 100, 100);
          graphics.fill();
        }}
      />
    </Application>
  );
}
