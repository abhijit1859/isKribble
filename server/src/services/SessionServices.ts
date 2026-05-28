import { redis } from "../config/redis.js";

export class SessionService {
  private ROOM_TTL = 60 * 5;

  private sessionKey(sessionId: string) {
    return `session:${sessionId}`;
  }

  async saveSession(
    sessionId: string,
    roomId: string,
    name: string
  ) {
    await redis.set(
      this.sessionKey(sessionId),
      JSON.stringify({ roomId, name }),
      {
        EX: this.ROOM_TTL,
      }
    );
  }

  async getSession(sessionId: string) {
    const raw = await redis.get(this.sessionKey(sessionId));

    return raw ? JSON.parse(raw) : null;
  }
}