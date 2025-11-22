import { describe, it, expect } from 'vitest';
import {
  createInitPlayMetadataV1,
  createCompletePlayMetadataV1,
} from '../metadata.js';

describe('createInitPlayMetadataV1', () => {
  it('should create metadata with version and requestId', () => {
    const requestId = 'req-123';
    const metadata = createInitPlayMetadataV1(requestId);

    expect(metadata).toEqual({
      version: '1.0.0',
      requestId: 'req-123',
    });
  });

  it('should always set version to 1.0.0', () => {
    const metadata1 = createInitPlayMetadataV1('req-1');
    const metadata2 = createInitPlayMetadataV1('req-2');

    expect(metadata1.version).toBe('1.0.0');
    expect(metadata2.version).toBe('1.0.0');
  });
});

describe('createCompletePlayMetadataV1', () => {
  it('should create metadata with all required fields', () => {
    const requestId = 'req-123';
    const debitTransactionId = 'debit-tx-456';
    const creditTransactionId = 'credit-tx-789';
    const initPlayId = 'init-play-abc';

    const metadata = createCompletePlayMetadataV1(
      requestId,
      debitTransactionId,
      creditTransactionId,
      initPlayId
    );

    expect(metadata).toEqual({
      version: '1.0.0',
      requestId: 'req-123',
      debitTransactionId: 'debit-tx-456',
      creditTransactionId: 'credit-tx-789',
      initPlayId: 'init-play-abc',
    });
  });

  it('should always set version to 1.0.0', () => {
    const metadata = createCompletePlayMetadataV1(
      'req',
      'debit',
      'credit',
      'init'
    );

    expect(metadata.version).toBe('1.0.0');
  });
});
