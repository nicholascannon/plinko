import { PlinkoV2 } from './components/game/plinko-v2';
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
      <PlinkoV2 height={500} width={500} />
    </div>
  );
}
