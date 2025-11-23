import type { Metadata } from '../../../lib/types.js';

export function createInitPlayMetadataV1(requestId: string): Metadata {
  return {
    version: '1.0.0',
    requestId,
  };
}

export function createCompletePlayMetadataV1(
  requestId: string,
  debitTransactionId: string,
  creditTransactionId: string,
  initPlayId: string,
  bucket: number,
  multiplier: number
): Metadata {
  return {
    version: '1.0.0',
    requestId,
    debitTransactionId,
    creditTransactionId,
    initPlayId,
    bucket,
    multiplier,
  };
}
