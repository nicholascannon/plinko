import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameService } from '../game-service.js';
import type { GameRepository } from '../game-repo.js';
import type { PersistedPlay } from '../types.js';
import { LOGGER } from '../../../lib/logger.js';

const TRANSACTION_ID = '0-0-0-0-0';

vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => TRANSACTION_ID),
});

describe('GameService', () => {
  let gameService: GameService;
  let mockGameRepo: GameRepository;
  let mockGetPlayEventById: ReturnType<typeof vi.fn>;
  let mockInsertPlayEvent: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGetPlayEventById = vi.fn();
    mockInsertPlayEvent = vi.fn();
    mockGameRepo = {
      getPlayEventById: mockGetPlayEventById,
      insertPlayEvent: mockInsertPlayEvent,
    } as unknown as GameRepository;
    gameService = new GameService(mockGameRepo);
    vi.clearAllMocks();
  });

  describe('initPlay', () => {
    it('should create an initiated play', async () => {
      const metadata = { testKey: 'testValue', number: 42 };
      const mockPersistedPlay: PersistedPlay = {
        id: 1n,
        createdAt: new Date(),
        playId: TRANSACTION_ID,
        walletId: 'wallet-123',
        game: 'plinko',
        betAmount: '100',
        winAmount: undefined,
        status: 'initiated',
        metadata,
      };

      mockInsertPlayEvent.mockResolvedValue(mockPersistedPlay);

      const result = await gameService.initPlay({
        game: 'plinko',
        walletId: 'wallet-123',
        betAmount: '100',
        metadata,
      });

      expect(mockInsertPlayEvent).toHaveBeenCalledWith({
        playId: TRANSACTION_ID,
        walletId: 'wallet-123',
        game: 'plinko',
        betAmount: '100',
        winAmount: undefined,
        status: 'initiated',
        metadata,
      });
      expect(result).toEqual(mockPersistedPlay);
    });
  });

  describe('completePlay', () => {
    it('should complete a play', async () => {
      const metadata = { result: 'win', multiplier: 1.5 };
      const initPlay: PersistedPlay = {
        id: 1n,
        createdAt: new Date(),
        playId: TRANSACTION_ID,
        walletId: 'wallet-123',
        game: 'plinko',
        betAmount: '100',
        winAmount: undefined,
        status: 'initiated',
        metadata: undefined,
      };

      const completedPlay: PersistedPlay = {
        id: 2n,
        createdAt: new Date(),
        playId: TRANSACTION_ID,
        walletId: 'wallet-123',
        game: 'plinko',
        betAmount: '100',
        winAmount: '150',
        status: 'completed',
        metadata,
      };

      mockGetPlayEventById.mockResolvedValue(initPlay);
      mockInsertPlayEvent.mockResolvedValue(completedPlay);

      const result = await gameService.completePlay(1n, '150', metadata);

      expect(mockInsertPlayEvent).toHaveBeenCalledWith({
        playId: TRANSACTION_ID,
        walletId: 'wallet-123',
        game: 'plinko',
        betAmount: '100',
        winAmount: '150',
        status: 'completed',
        metadata,
      });
      expect(result).toEqual(completedPlay);
    });

    it('should throw error when init play not found', async () => {
      mockGetPlayEventById.mockResolvedValue(undefined);

      await expect(gameService.completePlay(1n, '150')).rejects.toThrow(
        'Play init not found when completing play'
      );

      expect(mockGetPlayEventById).toHaveBeenCalledWith(1n, 'initiated');
      expect(mockInsertPlayEvent).not.toHaveBeenCalled();
    });
  });

  describe('failPlay', () => {
    it('should fail a play', async () => {
      const metadata = { error: 'timeout', reason: 'network' };
      const initPlay: PersistedPlay = {
        id: 1n,
        createdAt: new Date(),
        playId: TRANSACTION_ID,
        walletId: 'wallet-123',
        game: 'plinko',
        betAmount: '100',
        winAmount: undefined,
        status: 'initiated',
        metadata: undefined,
      };

      const failedPlay: PersistedPlay = {
        id: 2n,
        createdAt: new Date(),
        playId: TRANSACTION_ID,
        walletId: 'wallet-123',
        game: 'plinko',
        betAmount: '100',
        winAmount: undefined,
        status: 'failed',
        metadata,
      };

      mockGetPlayEventById.mockResolvedValue(initPlay);
      mockInsertPlayEvent.mockResolvedValue(failedPlay);

      const result = await gameService.failPlay(1n, metadata);

      expect(mockInsertPlayEvent).toHaveBeenCalledWith({
        playId: TRANSACTION_ID,
        walletId: 'wallet-123',
        game: 'plinko',
        betAmount: '100',
        winAmount: undefined,
        status: 'failed',
        metadata,
      });
      expect(result).toEqual(failedPlay);
    });

    it('should return undefined and log warning when init play not found', async () => {
      const metadata = { error: 'not found' };
      mockGetPlayEventById.mockResolvedValue(undefined);

      const result = await gameService.failPlay(1n, metadata);

      expect(LOGGER.warn).toHaveBeenCalledWith(
        'Play init not found when failing play',
        {
          id: 1n,
          metadata,
        }
      );
      expect(result).toBeUndefined();
    });
  });
});
