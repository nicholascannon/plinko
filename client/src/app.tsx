import { PlinkoWrapper } from './components/plinko-wrapper';
import { useGameConfig } from './hooks/use-game-config';
import { Controller } from './components/controller';
import { useWallet } from './providers/wallet-provider';

export function App() {
  const { data: gameConfig, isLoading: loadingGameConfig } = useGameConfig();
  const wallet = useWallet();

  if (loadingGameConfig || !wallet?.balance) return <h1>Loading...</h1>;

  return (
    <div className="flex flex-col h-screen max-h-screen gap-2 items-center p-4">
      <div className="flex items-center justify-center w-full">
        <h1 className="text-2xl">${wallet.balance}</h1>
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
