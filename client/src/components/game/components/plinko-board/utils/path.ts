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
  const numSteps = Math.ceil(distance / stepSize);
  const path: Position[] = [];

  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    path.push({
      x: startingPosition.x + dx * t,
      y: startingPosition.y + dy * t,
    });
  }

  return path;
}
