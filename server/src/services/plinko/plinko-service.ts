import type { WalletClient } from '../../clients/wallet/client.js';
import { toValidMoney } from '../../lib/utils/number.js';
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
      // TODO: wallet needs to be updated to take metadata (playId)
      const { transactionId: debitTransactionId } =
        await this.walletClient.debit(walletId, bet, requestId);

      const { payout, bucket } = this.plinkoModel.play(bet);

      const { balance, transactionId: creditTransactionId } =
        await this.walletClient.credit(walletId, payout, requestId);
      const winAmount = toValidMoney(payout - bet).toString();

      const { playId } = await this.gameService.completePlay(
        initPlay.id,
        winAmount,
        createCompletePlayMetadataV1(
          requestId,
          debitTransactionId,
          creditTransactionId,
          initPlay.playId
        )
      );

      return {
        playId,
        winAmount,
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
