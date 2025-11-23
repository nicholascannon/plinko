import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlinkoService } from '../plinko-service.js';
import { GameService } from '../../game/game-service.js';
import { PlinkoModel, type PlinkoPlayResponse } from '../model.js';
import {
  MockGameRepository,
  type GameRepository,
} from '../../game/game-repo.js';
import { MemoryWalletClient } from '../../../clients/wallet/memory-wallet-client.js';
import {
  createCompletePlayMetadataV1,
  createInitPlayMetadataV1,
} from '../utils/metadata.js';
import { WalletClientError } from '../../../clients/wallet/errors.js';
import type { WalletClient } from '../../../clients/wallet/wallet-client.js';

const WALLET_ID = 'wallet-123';
const REQUEST_ID = 'request-id';
const PLAY_ID = '0-0-0-0-0';

vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => PLAY_ID),
});

const mockPlinkoPlayResult = (response: PlinkoPlayResponse): PlinkoModel =>
  ({
    play(_bet: number): PlinkoPlayResponse {
      return response;
    },
  } as PlinkoModel);

describe('PlinkoService', () => {
  let gameRepo: GameRepository;
  let gameService: GameService;

  beforeEach(() => {
    gameRepo = new MockGameRepository();
    gameService = new GameService(gameRepo);
  });

  describe('success paths', () => {
    it('should successfully complete a win play', async () => {
      const initialBalance = 10;
      const betAmount = 10;
      const winAmount = 20;

      // setup
      const plinkoModel = mockPlinkoPlayResult({
        bucket: 1,
        multiplier: 2,
        payout: winAmount,
      });
      const walletClient = new MemoryWalletClient({
        [WALLET_ID]: initialBalance,
      });
      const plinkoService = new PlinkoService(
        plinkoModel,
        walletClient,
        gameService
      );

      const modelPlaySpy = vi.spyOn(plinkoModel, 'play');
      const debitSpy = vi.spyOn(walletClient, 'debit');
      const creditSpy = vi.spyOn(walletClient, 'credit');
      const initPlaySpy = vi.spyOn(gameService, 'initPlay');
      const completePlaySpy = vi.spyOn(gameService, 'completePlay');

      // test
      const result = await plinkoService.play(WALLET_ID, betAmount, REQUEST_ID);

      // assert
      expect(modelPlaySpy).toHaveBeenCalledWith(betAmount);

      expect(initPlaySpy).toHaveBeenCalledWith({
        game: PlinkoModel.GAME_IDENTIFIER,
        walletId: WALLET_ID,
        betAmount: betAmount.toString(),
        metadata: createInitPlayMetadataV1(REQUEST_ID),
      });
      expect(completePlaySpy).toHaveBeenCalledWith(
        1n,
        winAmount.toString(),
        createCompletePlayMetadataV1(
          REQUEST_ID,
          'debit-txn-id',
          'credit-txn-id',
          1,
          2
        )
      );

      expect(debitSpy).toHaveBeenCalledWith(WALLET_ID, betAmount, REQUEST_ID, {
        playId: PLAY_ID,
      });
      expect(creditSpy).toHaveBeenCalledWith(WALLET_ID, winAmount, REQUEST_ID, {
        playId: PLAY_ID,
      });

      expect(result).toEqual({
        playId: PLAY_ID,
        winAmount: winAmount.toString(),
        bucket: 1,
        balance: '20',
        requestId: REQUEST_ID,
        multiplier: '2.00',
        transactions: {
          creditTransactionId: 'credit-txn-id',
          debitTransactionId: 'debit-txn-id',
        },
      });
    });

    it('should successfully complete a loss play', async () => {
      const initialBalance = 10;
      const betAmount = 10;
      const winAmount = 2; // 10 * 0.2

      // setup
      const plinkoModel = mockPlinkoPlayResult({
        bucket: 5,
        multiplier: 0.2,
        payout: winAmount,
      });
      const walletClient = new MemoryWalletClient({
        [WALLET_ID]: initialBalance,
      });
      const plinkoService = new PlinkoService(
        plinkoModel,
        walletClient,
        gameService
      );

      const modelPlaySpy = vi.spyOn(plinkoModel, 'play');
      const debitSpy = vi.spyOn(walletClient, 'debit');
      const creditSpy = vi.spyOn(walletClient, 'credit');
      const initPlaySpy = vi.spyOn(gameService, 'initPlay');
      const completePlaySpy = vi.spyOn(gameService, 'completePlay');

      // test
      const result = await plinkoService.play(WALLET_ID, betAmount, REQUEST_ID);

      // assert
      expect(modelPlaySpy).toHaveBeenCalledWith(betAmount);

      expect(initPlaySpy).toHaveBeenCalledWith({
        game: PlinkoModel.GAME_IDENTIFIER,
        walletId: WALLET_ID,
        betAmount: betAmount.toString(),
        metadata: createInitPlayMetadataV1(REQUEST_ID),
      });
      expect(completePlaySpy).toHaveBeenCalledWith(
        1n,
        winAmount.toString(),
        createCompletePlayMetadataV1(
          REQUEST_ID,
          'debit-txn-id',
          'credit-txn-id',
          5,
          0.2
        )
      );

      expect(debitSpy).toHaveBeenCalledWith(WALLET_ID, betAmount, REQUEST_ID, {
        playId: PLAY_ID,
      });
      expect(creditSpy).toHaveBeenCalledWith(WALLET_ID, winAmount, REQUEST_ID, {
        playId: PLAY_ID,
      });

      expect(result).toEqual({
        playId: PLAY_ID,
        winAmount: winAmount.toString(),
        bucket: 5,
        balance: '2',
        requestId: REQUEST_ID,
        multiplier: '0.20',
        transactions: {
          creditTransactionId: 'credit-txn-id',
          debitTransactionId: 'debit-txn-id',
        },
      });
    });
  });

  describe('failure paths', () => {
    it('should fail a play when the wallet has insufficient funds', async () => {
      const betAmount = 10;

      // setup
      const plinkoModel = {
        play: vi.fn(),
      } as unknown as PlinkoModel;
      const walletClient = {
        debit: () => {
          throw new WalletClientError(
            'INSUFFICIENT_FUNDS',
            { availableBalance: 0 },
            400,
            WALLET_ID,
            REQUEST_ID
          );
        },
        credit: vi.fn(),
      } as unknown as WalletClient;
      const plinkoService = new PlinkoService(
        plinkoModel,
        walletClient,
        gameService
      );

      const modelPlaySpy = vi.spyOn(plinkoModel, 'play');
      const debitSpy = vi.spyOn(walletClient, 'debit');
      const creditSpy = vi.spyOn(walletClient, 'credit');
      const initPlaySpy = vi.spyOn(gameService, 'initPlay');
      const completePlaySpy = vi.spyOn(gameService, 'completePlay');
      const failPlay = vi.spyOn(gameService, 'failPlay');

      // test
      try {
        await plinkoService.play(WALLET_ID, betAmount, REQUEST_ID);
        expect.fail('Should have thrown insufficient funds error');
      } catch (error) {
        expect(error).toBeInstanceOf(WalletClientError);
        expect((error as WalletClientError).type).toBe('INSUFFICIENT_FUNDS');
      }

      // assert
      expect(modelPlaySpy).not.toHaveBeenCalled();

      expect(initPlaySpy).toHaveBeenCalledWith({
        game: PlinkoModel.GAME_IDENTIFIER,
        walletId: WALLET_ID,
        betAmount: betAmount.toString(),
        metadata: createInitPlayMetadataV1(REQUEST_ID),
      });
      expect(failPlay).toHaveBeenCalledWith(1n, {
        requestId: REQUEST_ID,
        failureReason: 'INSUFFICIENT_FUNDS',
      });
      expect(completePlaySpy).not.toHaveBeenCalled();

      expect(debitSpy).toHaveBeenCalledWith(WALLET_ID, betAmount, REQUEST_ID, {
        playId: PLAY_ID,
      });
      expect(creditSpy).not.toHaveBeenCalled();
    });

    it('should fail a play when the wallet is not found', async () => {
      const betAmount = 10;

      // setup
      const plinkoModel = {
        play: vi.fn(),
      } as unknown as PlinkoModel;
      const walletClient = {
        debit: () => {
          throw new WalletClientError(
            'WALLET_NOT_FOUND',
            {},
            404,
            WALLET_ID,
            REQUEST_ID
          );
        },
        credit: vi.fn(),
      } as unknown as WalletClient;
      const plinkoService = new PlinkoService(
        plinkoModel,
        walletClient,
        gameService
      );

      const modelPlaySpy = vi.spyOn(plinkoModel, 'play');
      const debitSpy = vi.spyOn(walletClient, 'debit');
      const creditSpy = vi.spyOn(walletClient, 'credit');
      const initPlaySpy = vi.spyOn(gameService, 'initPlay');
      const completePlaySpy = vi.spyOn(gameService, 'completePlay');
      const failPlay = vi.spyOn(gameService, 'failPlay');

      // test
      try {
        await plinkoService.play(WALLET_ID, betAmount, REQUEST_ID);
        expect.fail('Should have thrown wallet not found error');
      } catch (error) {
        expect(error).toBeInstanceOf(WalletClientError);
        expect((error as WalletClientError).type).toBe('WALLET_NOT_FOUND');
      }

      // assert
      expect(modelPlaySpy).not.toHaveBeenCalled();

      expect(initPlaySpy).toHaveBeenCalledWith({
        game: PlinkoModel.GAME_IDENTIFIER,
        walletId: WALLET_ID,
        betAmount: betAmount.toString(),
        metadata: createInitPlayMetadataV1(REQUEST_ID),
      });
      expect(failPlay).toHaveBeenCalledWith(1n, {
        requestId: REQUEST_ID,
        failureReason: 'WALLET_NOT_FOUND',
      });
      expect(completePlaySpy).not.toHaveBeenCalled();

      expect(debitSpy).toHaveBeenCalledWith(WALLET_ID, betAmount, REQUEST_ID, {
        playId: PLAY_ID,
      });
      expect(creditSpy).not.toHaveBeenCalled();
    });
  });
});
