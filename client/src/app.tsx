import { Plinko } from './components/game/components/plinko-board/plinko';
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
      <Plinko style={{ width: '500px', height: '500px' }} />

      <button onClick={() => document.dispatchEvent(new Event('play'))}>
        Play
      </button>
    </div>
  );
}
