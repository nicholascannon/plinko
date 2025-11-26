import { useEffect, useState } from 'react';
import { PlayFinishEvent } from '../events/play-finish-event';
import { CONFIG } from '../config';
import { usePlinkoPlayHistory } from '../hooks/use-plinko-play-history';

type Play = {
  id: string;
  winAmount: string;
  multiplier: string;
  betAmount: string;
};

export function PlayHistory() {
  const { data: playHistory, isLoading } = usePlinkoPlayHistory(
    CONFIG.WALLET_ID
  );
  const [plays, setPlays] = useState<Play[]>([]);

  useEffect(() => {
    if (playHistory) {
      setPlays(
        playHistory.plays.map((play) => ({
          id: play.playId,
          winAmount: play.winAmount,
          multiplier:
            // This could be done a bit better
            (play.metadata.multiplier as number)?.toFixed(1) ?? '0.00',
          betAmount: play.betAmount,
        }))
      );
    }
  }, [playHistory]);

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
      {isLoading && (
        <p className="text-sm text-gray-500 text-center">Loading...</p>
      )}
      {plays.length === 0 && (
        <p className="text-sm text-gray-500 text-center">No play history</p>
      )}
      <ul className="max-h-[250px] overflow-y-auto w-full">
        {plays.map(({ id, multiplier }) => (
          <li key={id}>
            <span className="text-sm text-gray-500">
              x{Number(multiplier).toFixed(1)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
