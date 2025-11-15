import type { Peg } from './board';
import type { Position } from './types';

export function generatePath({
  pegs: _pegs,
  startingPosition,
  endPosition,
}: {
  pegs: Peg[];
  startingPosition: Position;
  endPosition: Position;
}): Position[] {
  void _pegs; // Will be used for collision detection later
  const dx = endPosition.x - startingPosition.x;
  const dy = endPosition.y - startingPosition.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) {
    return [];
  }

  // Generate path with steps of reasonable size
  const stepSize = 5; // pixels per step
  const path: Position[] = [startingPosition];

  let currentX = startingPosition.x;
  let currentY = startingPosition.y;
  let remainingDistance = distance;

  while (remainingDistance > 0) {
    const step = Math.min(stepSize, remainingDistance);
    const t = step / distance;

    currentX += dx * t;
    currentY += dy * t;
    remainingDistance -= step;

    path.push({
      x: currentX,
      y: currentY,
    });
  }

  return path;
}
