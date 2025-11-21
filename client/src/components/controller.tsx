import { useState } from 'react';
import { CONFIG } from '../config';
import { dispatchPlayEvent } from '../events/play-event';
import { usePlay } from '../hooks/use-play';
import { dispatchBalanceUpdateEvent } from '../events/balance-update-event';
import { useWallet } from '../providers/wallet-provider';

const MIN_BET_AMOUNT = 1;

export function Controller({ className }: { className: string }) {
  const { play } = usePlay();
  const [amount, setAmount] = useState(10);
  const wallet = useWallet();

  const betDisabled =
    !wallet?.balance ||
    Number(wallet.balance) < amount ||
    amount < MIN_BET_AMOUNT;

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
        className="w-full bg-green-400 p-2 rounded text-white cursor-pointer hover:bg-green-500 active:bg-green-600 outline-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
        disabled={betDisabled}
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
