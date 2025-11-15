import { Plinko } from './components/plinko-board/plinko';
import './app.css';
import { useQuery } from '@tanstack/react-query';

const GAME_SERVER_URL = 'http://localhost:8001';

export function App() {
  const { data, isLoading } = useQuery({
    queryKey: ['init-plinko'],
    queryFn: async () => {
      const response = await fetch(`${GAME_SERVER_URL}/v1/plinko/init`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  if (isLoading) return <h1>Loading...</h1>;

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
      <Plinko
        buckets={data.payouts}
        style={{ width: '100%', height: '100%' }}
      />

      <button onClick={() => document.dispatchEvent(new Event('play'))}>
        Play
      </button>
    </div>
  );
}
