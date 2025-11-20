import type { PlayResponse } from '../hooks/use-play';

export class PlayEvent extends CustomEvent<PlayResponse> {
  public static readonly TYPE = 'play';

  constructor(playDetails: PlayResponse) {
    super(PlayEvent.TYPE, {
      detail: playDetails,
    });
  }
}

export function dispatchPlayEvent(playDetails: PlayResponse) {
  document.dispatchEvent(new PlayEvent(playDetails));
}
