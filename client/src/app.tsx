import { PlinkoV2 } from './components/game/plinko-v2';
import './app.css';

export function App() {
  return (
    <div
      style={{
        height: '100vh',
        maxHeight: '100vh',
        flexDirection: 'column',
        gap: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <PlinkoV2 style={{ width: '500px', height: '500px' }} />

      <button onClick={() => document.dispatchEvent(new Event('play'))}>
        Play
      </button>
    </div>
  );
}
