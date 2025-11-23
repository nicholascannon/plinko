import { useEffect, useState } from 'react';
import { PlayFinishEvent } from '../events/play-finish-event';

type Play = {
  id: string;
  winAmount: string;
  multiplier: string;
  betAmount: string;
};

// TODO: hydrate play history from server on mount
export function PlayHistory() {
  const [plays, setPlays] = useState<Play[]>([]);

  useEffect(() => {
    const boundPlayFinishHandler = (e: PlayFinishEvent) => {
      setPlays((prev) => [
        {
          id: e.detail.playId,
          winAmount: e.detail.winAmount,
          multiplier: e.detail.multiplier,
          betAmount: e.detail.betAmount,
        },
        ...prev,
      ]);
    };
    document.addEventListener(
      PlayFinishEvent.TYPE,
      boundPlayFinishHandler as EventListener
    );

    return () => {
      document.removeEventListener(
        PlayFinishEvent.TYPE,
        boundPlayFinishHandler as EventListener
      );
    };
  }, []);

  return (
    <div>
      <h2 className="text-lg font-medium">Play History</h2>
      <ul className="max-h-[300px] overflow-y-auto">
        {plays.map(({ id, winAmount, multiplier, betAmount }) => (
          <li key={id}>
            <span>x{Number(multiplier).toFixed(1)}</span>{' '}
            <span
              className={
                winAmount > betAmount ? 'text-green-500' : 'text-red-500'
              }
            >
              ${Number(winAmount).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
