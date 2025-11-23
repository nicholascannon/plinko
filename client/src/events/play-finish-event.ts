import type { PlayResponse } from '../hooks/use-play';

export class PlayFinishEvent extends CustomEvent<PlayResponse> {
  public static readonly TYPE = 'playFinish';

  constructor(playDetails: PlayResponse) {
    super(PlayFinishEvent.TYPE, {
      detail: playDetails,
    });
  }
}

export function dispatchPlayFinishEvent(playDetails: PlayResponse) {
  document.dispatchEvent(new PlayFinishEvent(playDetails));
}
