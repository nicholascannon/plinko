import { CONFIG } from '../config';
import { dispatchPlayEvent } from '../events/play-event';
import { usePlay } from '../hooks/use-play';

export function Controller({ className }: { className: string }) {
  const { play } = usePlay();

  return (
    <div className={className}>
      <button
        className="w-full bg-green-400 p-2 rounded text-white cursor-pointer hover:bg-green-500 active:bg-green-600 outline-green-500"
        onClick={() =>
          play(
            { walletId: CONFIG.WALLET_ID, bet: 1 },
            {
              onSuccess: (res) => dispatchPlayEvent(res),
            }
          )
        }
      >
        BET
      </button>
    </div>
  );
}
