import {
  useState,
  useEffect,
  createContext,
  type ReactNode,
  useContext,
} from 'react';
import { CONFIG } from '../config';
import { BalanceUpdateEvent } from '../events/balance-update-event';
import { useWalletQuery } from '../hooks/use-wallet-query';

type Wallet = {
  id: string;
  balance: string;
  updated: string;
};

const WalletContext = createContext<Wallet | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet | undefined>(undefined);
  const { data } = useWalletQuery(CONFIG.WALLET_ID);

  useEffect(() => {
    setWallet(data); // this isn't great but we only need the initial balance from server
  }, [data]);

  useEffect(() => {
    const playFinish = (e: BalanceUpdateEvent) => {
      const payload = e.detail;
      if (payload.balance) {
        setWallet((prev) =>
          prev ? { ...prev, balance: payload.balance } : undefined
        );
      } else if (payload.delta) {
        setWallet((prev) =>
          prev
            ? {
                ...prev,
                balance: (Number(prev.balance) + payload.delta).toFixed(2),
              }
            : undefined
        );
      }
    };

    // TODO: type these better
    document.addEventListener(
      BalanceUpdateEvent.TYPE,
      playFinish as EventListener
    );

    return () => {
      document.removeEventListener(
        BalanceUpdateEvent.TYPE,
        playFinish as EventListener
      );
    };
  }, [wallet]);

  return (
    <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWallet() {
  return useContext(WalletContext);
}
