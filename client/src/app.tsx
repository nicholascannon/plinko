import { PlinkoWrapper } from './components/plinko-wrapper';
import { usePlay } from './hooks/use-play';
import { useWallet } from './hooks/use-wallet';
import { useGameConfig } from './hooks/use-game-config';
import { useEffect } from 'react';

import './app.css';

const WALLET_ID = '4bcaf50f-7c95-4f97-9a08-fbaddf966cb9';

export function App() {
  const { data: gameConfig, isLoading: loadingGameConfig } = useGameConfig();
  const {
    data: wallet,
    isLoading: walletLoading,
    refetch: refetchWallet,
  } = useWallet(WALLET_ID);
  const { mutate: play } = usePlay();

  useEffect(() => {
    const playFinish = () => refetchWallet();
    document.addEventListener('playFinish', playFinish);

    return () => {
      document.removeEventListener('playFinish', playFinish);
    };
  }, [refetchWallet]);

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
      <PlinkoWrapper
        payouts={gameConfig.payouts}
        style={{ width: '650px', height: '650px' }}
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
