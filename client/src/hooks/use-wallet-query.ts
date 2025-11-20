import { useQuery } from '@tanstack/react-query';
import { CONFIG } from '../config';

type WalletQueryResponse = {
  id: string;
  balance: string;
  updated: string;
};

export function useWalletQuery(walletId: string) {
  return useQuery<WalletQueryResponse, Error>({
    queryKey: ['get-wallet', walletId],
    queryFn: async () => {
      const response = await fetch(
        `${CONFIG.WALLET_SERVER_URL}/v1/wallet/${walletId}`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });
}
