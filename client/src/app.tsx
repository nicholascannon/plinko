import { Plinko } from './components/plinko-board/plinko';
import './app.css';
import { useMutation, useQuery } from '@tanstack/react-query';

const WALLET_SERVER_URL = 'http://localhost:8000';
const GAME_SERVER_URL = 'http://localhost:8001';
const WALLET_ID = '4bcaf50f-7c95-4f97-9a08-fbaddf966cb9';

function useGameConfig() {
  // TODO: add custom types
  return useQuery({
    queryKey: ['init-plinko'],
    queryFn: async () => {
      const response = await fetch(`${GAME_SERVER_URL}/v1/plinko/init`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}

function useGetWallet(walletId: string) {
  // TODO: add custom types
  return useQuery({
    queryKey: ['get-wallet', walletId],
    queryFn: async () => {
      const response = await fetch(
        `${WALLET_SERVER_URL}/v1/wallet/${walletId}`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}

function usePlayMutation() {
  // TODO: type this properly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useMutation<any, Error, { walletId: string; bet: number }>({
    async mutationFn({ walletId, bet }) {
      const response = await fetch(`${GAME_SERVER_URL}/v1/plinko/play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletId, bet }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}

export function App() {
  const { data: gameConfig, isLoading: loadingGameConfig } = useGameConfig();
  const {
    data: wallet,
    isLoading: walletLoading,
    refetch: refetchWallet,
  } = useGetWallet(WALLET_ID);
  const { mutate: play } = usePlayMutation();

  if (loadingGameConfig || walletLoading) return <h1>Loading...</h1>;

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
        payouts={gameConfig.payouts}
        style={{ width: '100%', height: '100%' }}
      />

      <button
        onClick={() => {
          play(
            { walletId: WALLET_ID, bet: 100 },
            {
              onSuccess: (res) => {
                document.dispatchEvent(
                  new CustomEvent('play', {
                    detail: {
                      bucket: res.slot, // TODO: rename slot to bucket
                    },
                  })
                );
                refetchWallet();
              },
            }
          );
        }}
      >
        Play
      </button>

      <h1>Wallet Balance: ${wallet.balance}</h1>
    </div>
  );
}
