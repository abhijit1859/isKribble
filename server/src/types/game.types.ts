export interface Player {
  id: string;
  sessionId: string;
  name: string;
  points: number;
}

export interface RoomData {
  id: string;
  players: Player[];
  gameStarted: boolean;
  drawerIndex: number;
  currentWord: string;
  secondsLeft: number;
  correctGuessers: string[];
  currentRound: number;
}