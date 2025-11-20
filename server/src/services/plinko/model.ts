import * as math from 'mathjs';
import binomial from '@stdlib/random-base-binomial';
import { LOGGER } from '../../lib/logger.js';

export class PlinkoModel {
  public readonly rtp: number;
  public readonly payouts: number[];
  public readonly p: number;
  public readonly rows: number;

  constructor(config: {
    targetRtp: number;
    rows: number;
    p: number;
    middlePayout: number;
    edgePayout: number;
  }) {
    const { targetRtp, rows, p, middlePayout, edgePayout } = config;

    const probabilities = Array.from(
      { length: rows + 1 },
      (_, k) => math.combinations(rows, k) * p ** k * (1 - p) ** (rows - k)
    );

    // Generate initial payout curve (parabolic: highest at edges, lowest in middle)
    // Edges (k=0, k=rows) get edgePayout, middle (k=rows/2) gets middlePayout
    let payouts = Array.from({ length: rows + 1 }, (_, k) => {
      const x = k / rows;
      // Parabolic curve: 1 at edges (x=0, x=1), 0 at center (x=0.5)
      const curveValue = 4 * (x - 0.5) ** 2;
      return middlePayout + (edgePayout - middlePayout) * curveValue;
    });

    // Fix edges and middle to exact values
    const fixedIndices = [0, Math.floor(rows / 2), rows];
    payouts[0] = edgePayout;
    payouts[Math.floor(rows / 2)] = middlePayout;
    payouts[rows] = edgePayout;

    const rtpFixed = fixedIndices.reduce(
      (sum, i) => sum + probabilities[i]! * payouts[i]!,
      0
    );
    const rtpIntermediate = probabilities.reduce((sum, pk, i) => {
      if (!fixedIndices.includes(i)) {
        sum += pk * payouts[i]!;
      }
      return sum;
    }, 0);

    // Scale intermediate payouts to hit target RTP
    // targetRtp = expectedFixed + scale * expectedIntermediate
    const scale =
      rtpIntermediate > 0 ? (targetRtp - rtpFixed) / rtpIntermediate : 1;

    // Apply scaling only to intermediate positions
    payouts = payouts.map((p, i) => (fixedIndices.includes(i) ? p : p * scale));

    const actualRtp = probabilities.reduce(
      (sum, pk, i) => sum + pk * payouts[i]!,
      0
    );

    this.rtp = actualRtp;
    this.payouts = payouts;
    this.p = p;
    this.rows = rows;

    LOGGER.info('Plinko model initialized', {
      ...config,
      actualRtp: this.rtp.toFixed(3),
    });
  }

  public play(bet: number) {
    const bucket = binomial(this.rows, this.p);
    const payout = this.payouts[bucket]! * bet;

    return { bucket, payout: Number(payout.toFixed(2)) };
  }
}
