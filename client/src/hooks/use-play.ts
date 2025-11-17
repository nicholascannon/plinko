import { useMutation } from '@tanstack/react-query';
import { CONFIG } from '../config';

export function usePlay() {
  // TODO: type this properly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useMutation<any, Error, { walletId: string; bet: number }>({
    async mutationFn({ walletId, bet }) {
      const response = await fetch(`${CONFIG.GAME_SERVER_URL}/v1/plinko/play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletId, bet }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}
