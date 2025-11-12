import { PlinkoGame } from './components/game/plinko-game';

import './app.css';

export function App() {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <PlinkoGame height={500} width={500} />
    </div>
  );
}
