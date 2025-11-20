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
    <div className="flex flex-col h-screen max-h-screen gap-2 items-center p-4">
      <div className="flex items-center justify-center w-full">
        <h1 className="text-2xl">${balance}</h1>
      </div>

      <div className="flex-1 flex flex-col-reverse gap-2 justify-between items-center lg:flex-row lg:items-stretch">
        <Controller className="w-full flex-1 lg:min-w-[400px]" />

        <PlinkoWrapper
          payouts={gameConfig.payouts}
          style={{ width: '100%', maxWidth: '650px', flex: 1 }}
        />
      </div>
    </div>
  );
}
