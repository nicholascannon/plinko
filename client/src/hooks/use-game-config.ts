import { useQuery } from '@tanstack/react-query';
import { CONFIG } from '../config';

type GameConfigResponse = {
  payouts: number[];
  p: number;
  rows: number;
};

export function useGameConfig() {
  return useQuery<GameConfigResponse, Error>({
    queryKey: ['init-plinko'],
    queryFn: async () => {
      const response = await fetch(`${CONFIG.GAME_SERVER_URL}/v1/plinko/init`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}
