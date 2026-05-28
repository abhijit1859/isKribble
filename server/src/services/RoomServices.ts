import { redis } from "../config/redis.js";
import type { RoomData } from "../types/game.types.js";
 
export class RoomService {
  private ROOM_TTL = 60 * 5;

  private roomKey(roomId: string) {
    return `room:${roomId}`;
  }

  async getRoom(roomId: string): Promise<RoomData | null> {
    const raw = await redis.get(this.roomKey(roomId));

    return raw ? JSON.parse(raw) : null;
  }

  async saveRoom(room: RoomData) {
    await redis.set(
      this.roomKey(room.id),
      JSON.stringify(room),
      {
        EX: this.ROOM_TTL,
      }
    );
  }

  connectedPlayers(room: RoomData) {
    return room.players.filter((p) => p.id !== "");
  }
}