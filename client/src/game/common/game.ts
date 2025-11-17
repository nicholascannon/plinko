export interface Game {
  start(): Promise<void>;
  stop(): void;
}
