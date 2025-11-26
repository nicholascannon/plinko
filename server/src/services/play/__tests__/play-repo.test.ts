/**
 * These tests really aren't the best but they're good for now for critical operations
 * like the game service operations.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PgPlayRepository } from '../play-repo.js';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { playsTable } from '../../../data/schema.js';
import type { Play } from '../types.js';

const NOW = new Date('2025-01-01T00:00:00.000Z');

describe('PgPlayRepository', () => {
  let pgPlayRepository: PgPlayRepository;
  let mockDb: NodePgDatabase;
  let insertValuesSpy: ReturnType<typeof vi.fn>;
  let selectFromSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);

    // Mock the insert chain: db.insert().values().returning()
    const mockReturning = vi.fn().mockResolvedValue([
      {
        id: 1n,
        created_at: new Date('2024-01-01'),
        play_id: 'test-play-id',
        wallet_id: 'test-wallet-id',
        game: 'plinko',
        bet_amount: '100',
        win_amount: null,
        status: 'initiated',
        metadata: {},
      },
    ]);

    const mockValues = vi.fn().mockReturnValue({
      returning: mockReturning,
    });

    const mockInsert = vi.fn().mockReturnValue({
      values: mockValues,
    });

    // Mock the select chain: db.select().from().where().limit()
    const mockLimit = vi.fn().mockResolvedValue([
      {
        id: 1n,
        created_at: new Date('2024-01-01'),
        play_id: 'test-play-id',
        wallet_id: 'test-wallet-id',
        game: 'plinko',
        bet_amount: '100',
        win_amount: null,
        status: 'initiated',
        metadata: {},
      },
    ]);

    const mockWhere = vi.fn().mockReturnValue({
      limit: mockLimit,
    });

    const mockFrom = vi.fn().mockReturnValue({
      where: mockWhere,
    });

    const mockSelect = vi.fn().mockReturnValue({
      from: mockFrom,
    });

    mockDb = {
      insert: mockInsert,
      select: mockSelect,
    } as unknown as NodePgDatabase;

    insertValuesSpy = mockValues;
    selectFromSpy = mockFrom;

    pgPlayRepository = new PgPlayRepository(mockDb);
  });

  describe('insertPlayEvent', () => {
    it('should call insert with all required fields including bet_amount', async () => {
      const play: Play = {
        playId: 'test-play-id',
        walletId: 'test-wallet-id',
        game: 'plinko',
        betAmount: '100',
        winAmount: undefined,
        status: 'initiated',
        metadata: { testKey: 'testValue' },
      };

      await pgPlayRepository.insertPlayEvent(play);

      expect(insertValuesSpy).toHaveBeenCalledWith({
        play_id: 'test-play-id',
        wallet_id: 'test-wallet-id',
        game: 'plinko',
        bet_amount: '100', // This would fail if bet_amount was missing
        win_amount: undefined,
        status: 'initiated',
        metadata: { testKey: 'testValue' },
      });
    });

    it('should include all fields from the Play type', async () => {
      const play: Play = {
        playId: 'play-123',
        walletId: 'wallet-456',
        game: 'plinko',
        betAmount: '50.00',
        winAmount: '75.00',
        status: 'completed',
        metadata: { multiplier: 1.5 },
      };

      await pgPlayRepository.insertPlayEvent(play);

      const callArgs = insertValuesSpy.mock.calls[0]?.[0];
      expect(callArgs).toHaveProperty('bet_amount', '50.00');
      expect(callArgs).toHaveProperty('win_amount', '75.00');
      expect(callArgs).toHaveProperty('play_id', 'play-123');
      expect(callArgs).toHaveProperty('wallet_id', 'wallet-456');
      expect(callArgs).toHaveProperty('game', 'plinko');
      expect(callArgs).toHaveProperty('status', 'completed');
      expect(callArgs).toHaveProperty('metadata', { multiplier: 1.5 });
    });
  });

  describe('getPlayEventById', () => {
    it('should call select with correct field mappings', async () => {
      await pgPlayRepository.getPlayEventById(1n);

      expect(mockDb.select).toHaveBeenCalledWith({
        id: playsTable.id,
        createdAt: playsTable.created_at,
        playId: playsTable.play_id,
        walletId: playsTable.wallet_id,
        game: playsTable.game,
        betAmount: playsTable.bet_amount,
        winAmount: playsTable.win_amount,
        status: playsTable.status,
        metadata: playsTable.metadata,
      });
    });

    it('should call from with playsTable', async () => {
      await pgPlayRepository.getPlayEventById(1n);

      expect(selectFromSpy).toHaveBeenCalledWith(playsTable);
    });
  });

  // TODO: add tests for getPlays (look into drizzle.mock() for this instead of above solution)
});
