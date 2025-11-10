import type { NextFunction, Request, Response } from 'express';
import { HttpWalletClientError } from './errors.js';
import { LOGGER } from '../../lib/logger.js';

export function walletClientErrorHandler(
  error: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof HttpWalletClientError) {
    LOGGER.warn('Wallet client error', { ...error });

    switch (error.type) {
      case 'WALLET_NOT_FOUND':
        return res.status(404).json({
          message: 'Wallet not found',
          requestId: error.requestId,
          walletId: error.walletId,
        });
      case 'INVALID_DEBIT_AMOUNT':
        return res.status(400).json({
          message: 'Invalid debit amount',
          requestId: error.requestId,
          walletId: error.walletId,
          debitAmount: error.payload.amount,
        });
      case 'INSUFFICIENT_FUNDS':
        return res
          .status(400)
          .json({
            message: 'Insufficient funds',
            requestId: error.requestId,
            balance: error.payload.availableBalance,
            walletId: error.walletId,
          });
    }
  }

  next(error);
}
