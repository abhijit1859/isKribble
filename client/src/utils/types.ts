// ─── All shared TypeScript types ───────────────────────────────────────────

export type Player = {
  id: string;
  name: string;
  points: number;
};

export type ChatMessage = {
  type: "chat" | "correct" | "system";
  player?: Player;
  message: string;
};

export type GamePhase =
  | "join"        // lobby / name entry screen
  | "waiting"     // waiting for a second player
  | "word-choice" // drawer is picking a word
  | "drawing"     // active drawing turn
  | "end-turn"    // brief reveal between turns
  | "game-over";  // final leaderboard

export type DrawLine = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
  width: number;
};