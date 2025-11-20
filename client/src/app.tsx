import { PlinkoWrapper } from './components/plinko-wrapper';
import { useWallet } from './hooks/use-wallet';
import { useGameConfig } from './hooks/use-game-config';
import { useEffect, useState } from 'react';
import { PlayFinishEvent } from './events/play-finish-event';
import { Controller } from './components/controller';

const WALLET_ID = '4bcaf50f-7c95-4f97-9a08-fbaddf966cb9';

export function App() {
  const { data: gameConfig, isLoading: loadingGameConfig } = useGameConfig();
  const { data: wallet } = useWallet(WALLET_ID);

  const [balance, setBalance] = useState<number | undefined>(undefined);

  // TODO: temp - this is bad
  useEffect(() => {
    setBalance(wallet?.balance);
  }, [wallet?.balance]);

  useEffect(() => {
    const playFinish = (e: PlayFinishEvent) => {
      setBalance(e.detail.balance);
    };
    // TODO: type these better
    document.addEventListener(
      PlayFinishEvent.TYPE,
      playFinish as EventListener
    );

    return () => {
      document.removeEventListener(
        PlayFinishEvent.TYPE,
        playFinish as EventListener
      );
    };
  }, []);

  if (loadingGameConfig || !balance) return <h1>Loading...</h1>;

  return (
    <div className="flex flex-col h-screen gap-4 items-center">
      <p>${balance}</p>

      <PlinkoWrapper
        payouts={gameConfig.payouts}
        style={{ width: '650px', height: '650px' }}
      />

      <Controller />
    </div>
  );
}
