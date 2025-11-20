import { useState } from 'react';
import { CONFIG } from '../config';
import { dispatchPlayEvent } from '../events/play-event';
import { usePlay } from '../hooks/use-play';
import { dispatchBalanceUpdateEvent } from '../events/balance-update-event';

export function Controller({ className }: { className: string }) {
  const { play } = usePlay();
  const [amount, setAmount] = useState(10);

  return (
    <div className={`${className} flex flex-col gap-2`}>
      <span className="flex flex-col gap-1">
        <label htmlFor="amount">Bet Amount</label>
        <input
          className="p-2 rounded border"
          type="number"
          name="amount"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </span>

      <button
        className="w-full bg-green-400 p-2 rounded text-white cursor-pointer hover:bg-green-500 active:bg-green-600 outline-green-500"
        onClick={() => {
          dispatchBalanceUpdateEvent({ balance: undefined, delta: -amount });
          play(
            { walletId: CONFIG.WALLET_ID, bet: amount },
            {
              onSuccess: (res) => dispatchPlayEvent(res),
            }
          );
        }}
      >
        BET
      </button>
    </div>
  );
}
