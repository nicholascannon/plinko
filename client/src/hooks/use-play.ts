import { useMutation } from '@tanstack/react-query';
import { CONFIG } from '../config';

export type PlayArgs = {
  walletId: string;
  bet: number;
};

export type PlayResponse = {
  requestId: string;
  transactionId: string;
  bucket: number;
  winAmount: string;
  balance: string;
};

export function usePlay() {
  const { mutate } = useMutation<PlayResponse, Error, PlayArgs>({
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

  return { play: mutate };
}
