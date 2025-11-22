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
});

describe('createCompletePlayMetadataV1', () => {
  it('should create metadata with all required fields', () => {
    const requestId = 'req-123';
    const debitTransactionId = 'debit-tx-456';
    const creditTransactionId = 'credit-tx-789';
    const initPlayId = 'init-play-abc';
    const bucket = 1;
    const multiplier = 1.5;

    const metadata = createCompletePlayMetadataV1(
      requestId,
      debitTransactionId,
      creditTransactionId,
      initPlayId,
      bucket,
      multiplier
    );

    expect(metadata).toEqual({
      version: '1.0.0',
      requestId: 'req-123',
      debitTransactionId: 'debit-tx-456',
      creditTransactionId: 'credit-tx-789',
      initPlayId: 'init-play-abc',
      bucket: 1,
      multiplier: 1.5,
    });
  });
});
