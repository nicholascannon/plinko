import type { WalletClient } from '../../clients/wallet/wallet-client.js';
import type { GameService } from '../game/game-service.js';
import { PlinkoModel } from './model.js';
import {
  createCompletePlayMetadataV1,
  createInitPlayMetadataV1,
} from './utils/metadata.js';

type PlinkoInit = {
  payouts: number[];
  p: number;
  rows: number;
};

type CompletedPlay = {
  playId: string;
  winAmount: string;
  bucket: number;
  balance: string;
  requestId: string;
  transactions: {
    debitTransactionId: string;
    creditTransactionId: string;
  };
};

export class PlinkoService {
  constructor(
    private readonly plinkoModel: PlinkoModel,
    private readonly walletClient: WalletClient,
    private readonly gameService: GameService
  ) {}

  public init(): PlinkoInit {
    return {
      payouts: this.plinkoModel.payouts,
      p: this.plinkoModel.p,
      rows: this.plinkoModel.rows,
    };
  }

  public async play(
    walletId: string,
    bet: number,
    requestId: string
  ): Promise<CompletedPlay> {
    const initPlay = await this.gameService.initPlay({
      game: PlinkoModel.GAME_IDENTIFIER,
      walletId,
      betAmount: bet.toString(),
      metadata: createInitPlayMetadataV1(requestId),
    });

    try {
      const { transactionId: debitTransactionId } =
        await this.walletClient.debit(walletId, bet, requestId, {
          playId: initPlay.playId,
        });

      const { payout, bucket, multiplier } = this.plinkoModel.play(bet);

      const { balance, transactionId: creditTransactionId } =
        await this.walletClient.credit(walletId, payout, requestId, {
          playId: initPlay.playId,
        });

      const { playId } = await this.gameService.completePlay(
        initPlay.id,
        payout.toString(),
        createCompletePlayMetadataV1(
          requestId,
          debitTransactionId,
          creditTransactionId,
          initPlay.playId,
          bucket,
          multiplier
        )
      );

      return {
        playId,
        winAmount: payout.toString(),
        bucket,
        balance,
        requestId,
        transactions: {
          debitTransactionId,
          creditTransactionId,
        },
      };
    } catch (error) {
      await this.gameService.failPlay(initPlay.id, {
        requestId,
        failureReason: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error; // bubble up to error handlers
    }
  }
}
