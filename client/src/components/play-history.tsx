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
    const onPlayFinish = (e: PlayFinishEvent) => {
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
    document.addEventListener(PlayFinishEvent.TYPE, onPlayFinish);

    return () => {
      document.removeEventListener(PlayFinishEvent.TYPE, onPlayFinish);
    };
  }, []);

  return (
    <div>
      <h2 className="text-lg font-medium">Play History</h2>
      <ul className="max-h-[250px] overflow-y-auto w-full">
        {plays.map(({ id, multiplier }) => (
          <li key={id}>
            <span>x{Number(multiplier).toFixed(1)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
