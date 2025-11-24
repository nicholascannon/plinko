import { PlinkoWrapper } from './components/plinko-wrapper';
import { useGameConfig } from './hooks/use-game-config';
import { Controller } from './components/controller';
import { useWallet } from './providers/wallet-provider';
import { PlayHistory } from './components/play-history';

export function App() {
  const { data: gameConfig, isLoading: loadingGameConfig } = useGameConfig();
  const wallet = useWallet();

  if (loadingGameConfig || !wallet?.balance) return <h1>Loading...</h1>;

  return (
    <div className="h-screen max-h-screen p-8">
      <div className="flex items-center  pb-8">
        <h1 className="flex-1 text-2xl">PLINKO</h1>
        <h1 className="text-xl">${wallet.balance}</h1>
        <div className="flex-1"></div>
      </div>

      <div className="flex gap-4 flex-col-reverse justify-center items-center md:flex-row md:items-start">
        <div className="w-full sm:max-w-[435px] flex-1 gap-4 flex flex-col">
          <Controller />
          <PlayHistory />
        </div>

        <PlinkoWrapper
          payouts={gameConfig.payouts}
          style={{ width: '100%', maxWidth: '650px', flex: 1 }}
        />
      </div>
    </div>
  );
}
