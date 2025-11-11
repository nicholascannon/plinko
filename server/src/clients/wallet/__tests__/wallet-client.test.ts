import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpWalletClient } from '../client.js';
import { HttpWalletClientError } from '../errors.js';
import { LOGGER } from '../../../lib/logger.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const BASE_URL = 'http://wallet-service.test';
const WALLET_ID = 'wallet-123';
const REQUEST_ID = 'req-456';
const AMOUNT = 100;

function mockFetchValue(data: any, status = 200): Response {
  const mockJson = vi.fn().mockResolvedValue(data);
  const mockText = vi.fn().mockResolvedValue(JSON.stringify(data));
  const mockResponse = {
    ok: status >= 200 && status < 300,
    status,
    json: mockJson,
    text: mockText,
  } as any;
  mockFetch.mockResolvedValue(mockResponse);
  return mockResponse;
}

describe('HttpWalletClient', () => {
  let client: HttpWalletClient;

  beforeEach(() => {
    client = new HttpWalletClient(BASE_URL);
    vi.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should make GET request with correct URL and headers, and return balance', async () => {
      // SETUP
      const mockBalance = { balance: 500 };
      mockFetchValue(mockBalance);

      // ACTION
      const result = await client.getBalance(WALLET_ID, REQUEST_ID);

      // ASSERT
      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/wallet/${WALLET_ID}`,
        {
          headers: {
            'X-Request-Id': REQUEST_ID,
          },
        }
      );
      expect(result).toEqual(mockBalance);
    });
  });

  describe('credit', () => {
    it('should log request, make POST request with correct configuration, and return result', async () => {
      // SETUP
      const mockResult = { balance: 600, transactionId: 'txn-789' };
      mockFetchValue(mockResult);

      // ACTION
      const result = await client.credit(WALLET_ID, AMOUNT, REQUEST_ID);

      // ASSERT
      expect(LOGGER.info).toHaveBeenCalledWith('Wallet operation', {
        id: WALLET_ID,
        operation: 'credit',
        requestId: REQUEST_ID,
      });
      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/wallet/${WALLET_ID}/credit`,
        {
          method: 'POST',
          body: JSON.stringify({ amount: AMOUNT }),
          headers: {
            'Content-Type': 'application/json',
            'X-Request-Id': REQUEST_ID,
            'X-Source': 'plinko-game-server',
          },
        }
      );
      expect(result).toEqual(mockResult);
    });

    it('should call handleError when response is not ok', async () => {
      // SETUP
      const errorPayload = { error: 'WALLET_NOT_FOUND' };
      mockFetchValue(errorPayload, 404);

      // ACTION & ASSERT
      await expect(
        client.credit(WALLET_ID, AMOUNT, REQUEST_ID)
      ).rejects.toThrow(HttpWalletClientError);
      expect(LOGGER.info).toHaveBeenCalledWith('Wallet operation', {
        id: WALLET_ID,
        operation: 'credit',
        requestId: REQUEST_ID,
      });
    });
  });

  describe('debit', () => {
    it('should log request, make POST request with correct configuration, and return result', async () => {
      // SETUP
      const mockResult = { balance: 400, transactionId: 'txn-101' };
      mockFetchValue(mockResult);

      // ACTION
      const result = await client.debit(WALLET_ID, AMOUNT, REQUEST_ID);

      // ASSERT
      expect(LOGGER.info).toHaveBeenCalledWith('Wallet operation', {
        id: WALLET_ID,
        operation: 'debit',
        requestId: REQUEST_ID,
      });
      expect(mockFetch).toHaveBeenCalledWith(
        `${BASE_URL}/v1/wallet/${WALLET_ID}/debit`,
        {
          method: 'POST',
          body: JSON.stringify({ amount: AMOUNT }),
          headers: {
            'Content-Type': 'application/json',
            'X-Request-Id': REQUEST_ID,
            'X-Source': 'plinko-game-server',
          },
        }
      );
      expect(result).toEqual(mockResult);
    });

    it('should call handleError when response is not ok', async () => {
      // SETUP
      const errorPayload = { error: 'INSUFFICIENT_FUNDS' };
      mockFetchValue(errorPayload, 400);

      // ACTION & ASSERT
      await expect(client.debit(WALLET_ID, AMOUNT, REQUEST_ID)).rejects.toThrow(
        HttpWalletClientError
      );
      expect(LOGGER.info).toHaveBeenCalledWith('Wallet operation', {
        id: WALLET_ID,
        operation: 'debit',
        requestId: REQUEST_ID,
      });
    });
  });

  describe('handleError', () => {
    it('should throw HttpWalletClientError for WALLET_NOT_FOUND', async () => {
      // SETUP
      const errorPayload = { error: 'WALLET_NOT_FOUND', message: 'Not found' };
      const mockResponse = mockFetchValue(errorPayload, 404);

      // ACTION & ASSERT
      try {
        await client.handleError(mockResponse, WALLET_ID, REQUEST_ID);
        expect.fail('Should have thrown HttpWalletClientError');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpWalletClientError);
        const walletError = error as HttpWalletClientError;
        expect(walletError.type).toBe('WALLET_NOT_FOUND');
        expect(walletError.payload).toEqual(errorPayload);
        expect(walletError.httpCode).toBe(404);
        expect(walletError.walletId).toBe(WALLET_ID);
        expect(walletError.requestId).toBe(REQUEST_ID);
      }
    });

    it('should throw HttpWalletClientError for INVALID_DEBIT_AMOUNT', async () => {
      // SETUP
      const errorPayload = {
        error: 'INVALID_DEBIT_AMOUNT',
        message: 'Invalid amount',
      };
      const mockResponse = mockFetchValue(errorPayload, 400);

      // ACTION & ASSERT
      try {
        await client.handleError(mockResponse, WALLET_ID, REQUEST_ID);
        expect.fail('Should have thrown HttpWalletClientError');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpWalletClientError);
        const walletError = error as HttpWalletClientError;
        expect(walletError.type).toBe('INVALID_DEBIT_AMOUNT');
        expect(walletError.payload).toEqual(errorPayload);
        expect(walletError.httpCode).toBe(400);
        expect(walletError.walletId).toBe(WALLET_ID);
        expect(walletError.requestId).toBe(REQUEST_ID);
      }
    });

    it('should throw HttpWalletClientError for INSUFFICIENT_FUNDS', async () => {
      // SETUP
      const errorPayload = {
        error: 'INSUFFICIENT_FUNDS',
        availableBalance: 50,
      };
      const mockResponse = mockFetchValue(errorPayload, 400);

      // ACTION & ASSERT
      try {
        await client.handleError(mockResponse, WALLET_ID, REQUEST_ID);
        expect.fail('Should have thrown HttpWalletClientError');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpWalletClientError);
        const walletError = error as HttpWalletClientError;
        expect(walletError.type).toBe('INSUFFICIENT_FUNDS');
        expect(walletError.payload).toEqual(errorPayload);
        expect(walletError.httpCode).toBe(400);
        expect(walletError.walletId).toBe(WALLET_ID);
        expect(walletError.requestId).toBe(REQUEST_ID);
      }
    });

    it('should throw generic Error for unknown error types', async () => {
      // SETUP
      const errorPayload = {
        error: 'UNKNOWN_ERROR',
        message: 'Something went wrong',
      };
      const errorText = 'Server error';
      const mockText = vi.fn().mockResolvedValue(errorText);
      const mockResponse = {
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue(errorPayload),
        text: mockText,
      } as any;

      // ACTION & ASSERT
      await expect(
        client.handleError(mockResponse, WALLET_ID, REQUEST_ID)
      ).rejects.toThrow(`Wallet Client Error: 500 ${errorText}`);
    });
  });
});
