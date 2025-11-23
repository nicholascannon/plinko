import { LOGGER } from '../../lib/logger.js';
import type { Metadata } from '../../lib/types.js';
import { WalletClientError } from './errors.js';
import type { WalletClient } from './wallet-client.js';

export class HttpWalletClient implements WalletClient {
  constructor(private readonly baseUrl: string) {}

  public async getBalance(id: string, requestId: string) {
    const response = await fetch(`${this.baseUrl}/v1/wallet/${id}`, {
      headers: {
        'X-Request-Id': requestId,
      },
    });
    return response.json() as Promise<{ balance: string }>;
  }

  public async handleError(
    response: Response,
    walletId: string,
    requestId: string
  ): Promise<never> {
    const payload = (await response.json()) as Record<string, any>; // not the best
    switch (payload.error) {
      case 'WALLET_NOT_FOUND':
        throw new WalletClientError(
          'WALLET_NOT_FOUND',
          payload,
          response.status,
          walletId,
          requestId
        );
      case 'INVALID_DEBIT_AMOUNT':
        throw new WalletClientError(
          'INVALID_DEBIT_AMOUNT',
          payload,
          response.status,
          walletId,
          requestId
        );
      case 'INSUFFICIENT_FUNDS':
        throw new WalletClientError(
          'INSUFFICIENT_FUNDS',
          payload,
          response.status,
          walletId,
          requestId
        );
    }

    throw new Error(
      `Wallet Client Error: ${response.status} ${await response.text()}`
    );
  }

  private logRequest(
    id: string,
    operation: 'credit' | 'debit',
    requestId: string
  ) {
    LOGGER.info('Wallet operation', { id, operation, requestId });
  }

  public async credit(
    id: string,
    amount: number,
    requestId: string,
    metadata: Metadata
  ) {
    this.logRequest(id, 'credit', requestId);
    const response = await fetch(`${this.baseUrl}/v1/wallet/${id}/credit`, {
      method: 'POST',
      body: JSON.stringify({ amount, metadata }),
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
        'X-Source': 'plinko-game-server',
      },
    });
    if (!response.ok) {
      await this.handleError(response, id, requestId);
    }

    return response.json() as Promise<{
      balance: string;
      transactionId: string;
    }>;
  }

  public async debit(
    id: string,
    amount: number,
    requestId: string,
    metadata: Metadata
  ) {
    this.logRequest(id, 'debit', requestId);
    const response = await fetch(`${this.baseUrl}/v1/wallet/${id}/debit`, {
      method: 'POST',
      body: JSON.stringify({ amount, metadata }),
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
        'X-Source': 'plinko-game-server',
      },
    });
    if (!response.ok) {
      await this.handleError(response, id, requestId);
    }

    return response.json() as Promise<{
      balance: string;
      transactionId: string;
    }>;
  }
}
