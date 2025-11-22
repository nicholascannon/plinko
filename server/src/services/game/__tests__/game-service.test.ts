import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameService } from '../game-service.js';
import { MockGameRepository } from '../game-repo.js';

const NOW = new Date('2025-01-01T00:00:00.000Z');
const TRANSACTION_ID = '0-0-0-0-0';

vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => TRANSACTION_ID),
});

describe('GameService', () => {
  let gameService: GameService;
  let mockGameRepo: MockGameRepository;
  let saveTransactionSpy: ReturnType<typeof vi.fn>;
  let getPlayEventByIdSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGameRepo = new MockGameRepository();
    saveTransactionSpy = vi.spyOn(
      MockGameRepository.prototype,
      'insertPlayEvent'
    );
    getPlayEventByIdSpy = vi.spyOn(
      MockGameRepository.prototype,
      'getPlayEventById'
    );
    gameService = new GameService(mockGameRepo);

    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  describe('initPlay', () => {
    it('should create an initiated play', async () => {
      const result = await gameService.initPlay({
        game: 'plinko',
        walletId: 'wallet-123',
        betAmount: '100',
        metadata: { testKey: 'testValue', number: 42 },
      });

      expect(saveTransactionSpy).toHaveBeenCalledWith({
        playId: TRANSACTION_ID,
        walletId: 'wallet-123',
        game: 'plinko',
        betAmount: '100',
        winAmount: undefined,
        status: 'initiated',
        metadata: { testKey: 'testValue', number: 42 },
      });
      expect(result).toEqual({
        id: 1n,
        createdAt: NOW,
        playId: TRANSACTION_ID,
        walletId: 'wallet-123',
        game: 'plinko',
        betAmount: '100',
        winAmount: undefined,
        status: 'initiated',
        metadata: { testKey: 'testValue', number: 42 },
      });
    });
  });

  describe('completePlay', () => {
    it('should complete a play', async () => {
      mockGameRepo.insertPlayEvent({
        playId: TRANSACTION_ID,
        walletId: 'wallet-123',
        game: 'plinko',
        betAmount: '100',
        winAmount: undefined,
        status: 'initiated',
        metadata: undefined,
      });

      const result = await gameService.completePlay(1n, '150', {
        result: 'win',
        multiplier: 1.5,
      });

      expect(saveTransactionSpy).toHaveBeenCalledWith({
        playId: TRANSACTION_ID,
        walletId: 'wallet-123',
        game: 'plinko',
        betAmount: '100',
        winAmount: '150',
        status: 'completed',
        metadata: { result: 'win', multiplier: 1.5 },
      });
      expect(result).toEqual({
        id: 2n,
        createdAt: NOW,
        playId: TRANSACTION_ID,
        walletId: 'wallet-123',
        game: 'plinko',
        betAmount: '100',
        winAmount: '150',
        status: 'completed',
        metadata: { result: 'win', multiplier: 1.5 },
      });
    });

    it('should throw error when init play not found', async () => {
      await expect(gameService.completePlay(1n, '150')).rejects.toThrow(
        'Play init not found when completing play'
      );

      expect(getPlayEventByIdSpy).toHaveBeenCalledWith(1n, 'initiated');
      expect(saveTransactionSpy).not.toHaveBeenCalled();
    });
  });

  describe('failPlay', () => {
    it('should fail a play', async () => {
      mockGameRepo.insertPlayEvent({
        playId: TRANSACTION_ID,
        walletId: 'wallet-123',
        game: 'plinko',
        betAmount: '100',
        winAmount: undefined,
        status: 'initiated',
        metadata: undefined,
      });

      const result = await gameService.failPlay(1n, {
        error: 'timeout',
        reason: 'network',
      });

      expect(saveTransactionSpy).toHaveBeenCalledWith({
        playId: TRANSACTION_ID,
        walletId: 'wallet-123',
        game: 'plinko',
        betAmount: '100',
        winAmount: undefined,
        status: 'failed',
        metadata: { error: 'timeout', reason: 'network' },
      });
      expect(result).toEqual({
        id: 2n,
        createdAt: NOW,
        playId: TRANSACTION_ID,
        walletId: 'wallet-123',
        game: 'plinko',
        betAmount: '100',
        winAmount: undefined,
        status: 'failed',
        metadata: { error: 'timeout', reason: 'network' },
      });
    });

    it('should return undefined and log warning when init play not found', async () => {
      const metadata = { error: 'not found' };

      const result = await gameService.failPlay(1n, metadata);

      expect(getPlayEventByIdSpy).toHaveBeenCalledWith(1n, 'initiated');
      expect(saveTransactionSpy).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });
});
