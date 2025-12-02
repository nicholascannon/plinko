import { useQuery } from '@tanstack/react-query';
import { CONFIG } from '../config';

type PlayHistory = {
  playId: string;
  walletId: string;
  game: string;
  betAmount: string;
  winAmount: string;
  createdAt: Date;
  metadata: Record<string, string | number | boolean | undefined>;
};

const GAME_NAME = 'plinko-v1';

export function usePlinkoPlayHistory(walletId: string) {
  return useQuery<{ plays: PlayHistory[] }, Error>({
    queryKey: ['plinko-play-history', walletId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('walletId', walletId);
      params.set('game', GAME_NAME);

      const response = await fetch(
        `${CONFIG.GAME_SERVER_URL}/v1/play/history?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}
