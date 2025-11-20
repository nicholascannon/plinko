import { CONFIG } from '../config';
import { dispatchPlayEvent } from '../events/play-event';
import { usePlay } from '../hooks/use-play';

export function Controller() {
  const { play } = usePlay();

  return (
    <div>
      <button
        onClick={() =>
          play(
            { walletId: CONFIG.WALLET_ID, bet: 1 },
            {
              onSuccess: (res) => dispatchPlayEvent(res),
            }
          )
        }
      >
        Bet
      </button>
    </div>
  );
}
