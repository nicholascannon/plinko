import { LOGGER } from '../../lib/logger.js';
import { HttpWalletClientError } from './errors.js';

export interface WalletClient {
  getBalance: (id: string) => Promise<{ balance: number }>;
  credit: (id: string, amount: number) => Promise<{ balance: number }>;
  debit: (id: string, amount: number) => Promise<{ balance: number }>;
}

export class HttpWalletClient implements WalletClient {
  constructor(private readonly baseUrl: string) {}

  public async getBalance(id: string): Promise<{ balance: number }> {
    const response = await fetch(`${this.baseUrl}/v1/wallet/${id}`);
    return response.json() as Promise<{ balance: number }>;
  }

  private async handleError(response: Response, walletId: string) {
    const payload = (await response.json()) as Record<string, any>; // not the best
    switch (payload.error) {
      case 'WALLET_NOT_FOUND':
        throw new HttpWalletClientError(
          'WALLET_NOT_FOUND',
          payload,
          response.status,
          walletId
        );
      case 'INVALID_DEBIT_AMOUNT':
        throw new HttpWalletClientError(
          'INVALID_DEBIT_AMOUNT',
          payload,
          response.status,
          walletId
        );
      case 'INSUFFICIENT_FUNDS':
        throw new HttpWalletClientError(
          'INSUFFICIENT_FUNDS',
          payload,
          response.status,
          walletId
        );
    }

    throw new Error(
      `Wallet Client Error: ${response.status} ${await response.text()}`
    );
  }

  private logRequest(id: string, operation: 'credit' | 'debit') {
    LOGGER.info('Wallet request', { id, operation });
  }

  public async credit(
    id: string,
    amount: number
  ): Promise<{ balance: number }> {
    this.logRequest(id, 'credit');
    const response = await fetch(`${this.baseUrl}/v1/wallet/${id}/credit`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      await this.handleError(response, id);
    }

    return response.json() as Promise<{ balance: number }>;
  }

  public async debit(id: string, amount: number): Promise<{ balance: number }> {
    this.logRequest(id, 'debit');
    const response = await fetch(`${this.baseUrl}/v1/wallet/${id}/debit`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      await this.handleError(response, id);
    }

    return response.json() as Promise<{ balance: number }>;
  }
}
