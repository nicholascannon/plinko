import { PlinkoModel } from './model.js';

function testRtp(model: PlinkoModel, iterations: number = 1_000_000) {
  console.log('Running RTP test...');
  console.log(`Expected RTP: ${model.rtp}`);
  console.log(`Iterations: ${iterations}\n`);

  let totalPayout = 0;

  for (let i = 0; i < iterations; i++) {
    const { payout } = model.play();
    totalPayout += payout;
  }

  const actualRtp = totalPayout / iterations;
  const expectedRtp = model.rtp;
  const difference = Math.abs(actualRtp - expectedRtp);

  console.log('Results:');
  console.log(`  Expected RTP: ${expectedRtp.toFixed(6)}`);
  console.log(`  Actual RTP:   ${actualRtp.toFixed(6)}`);
  console.log(`  Difference:   ${difference.toFixed(6)}`);
  console.log(
    `  Error %:      ${((difference / expectedRtp) * 100).toFixed(4)}%`
  );
  console.log(`  Total Payout: ${totalPayout.toFixed(2)}`);

  // Typically, with 1M iterations, you'd expect the difference to be < 0.001
  if (difference < 0.001) {
    console.log('\n✅ RTP test passed!');
  } else {
    console.log('\n⚠️  RTP test warning: difference is larger than expected');
  }
}

const model = new PlinkoModel({
  targetRtp: 0.95,
  rows: 16,
  p: 0.5,
  middlePayout: 0.2,
  edgePayout: 100,
});

testRtp(model, 1_000_000);
