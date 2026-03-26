# 🎨 Skribbl Clone — Real-Time Multiplayer Drawing Game

> A blazing-fast, Redis-powered, socket-based multiplayer drawing & guessing game backend. Built with Node.js, Socket.IO, and Redis.

---

## ✨ Features

- 🔌 **Real-time communication** via Socket.IO
- 🧠 **Persistent game state** stored in Redis (survives restarts & reconnects)
- 🔄 **Session-based reconnection** — players rejoin seamlessly and keep their points
- ⏱️ **Server-side timers** — countdown is authoritative, never trust the client
- 🎯 **Automatic turn & round management**
- 🏆 **Leaderboard generation** at game end
- 🌐 **CORS-ready** for separate frontend deployment

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | >= 18.x |
| Redis | Cloud / Local (v7+) |
| npm / pnpm | Latest |

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/skribbl-clone.git
cd skribbl-clone
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Redis Connection
REDIS_HOST=your-redis-host.example.com
REDIS_PASSWORD=your_redis_password

# Server
PORT=3000

# Frontend (for CORS)
FRONTEND_URL=http://localhost:5173
```

| Variable | Description |
|---|---|
| `REDIS_HOST` | Hostname of your Redis instance |
| `REDIS_PASSWORD` | Redis auth password |
| `PORT` | Port for the HTTP/WS server |
| `FRONTEND_URL` | Allowed CORS origin (your frontend URL) |

### 4. Run the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

Server starts on the port defined in `PORT` (default: `3000`).

---

## 📡 API Reference

### HTTP Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/flush` | Flush all Redis data — **dev only!** |

---

### Socket.IO Events

#### Client → Server (Emitted by clients)

| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `{ roomId, name }` | Join or create a room and register as a player |
| `word-select` | `{ roomId, word }` | Drawer selects a word from the given choices |
| `draw-line` | `{ roomId, line }` | Send a drawing segment (drawer only) |
| `clear-canvas` | `{ roomId }` | Clear the canvas for everyone (drawer only) |
| `send-chat` | `{ roomId, message }` | Send a chat message or a guess |

#### Server → Client (Emitted by server)

| Event | Payload | Description |
|-------|---------|-------------|
| `room-state` | `{ players, gameStarted, drawer, wordLength, secondsLeft }` | Full state snapshot sent on join/reconnect |
| `updated-players` | `Player[]` | Broadcast when the player list changes |
| `game-start` | `{}` | Game has officially begun |
| `start-turn` | `{ drawer, round, maxRounds }` | A new turn starts |
| `word-choices` | `{ words: string[] }` | Sent **only** to the drawer with word options |
| `your-word` | `{ word }` | Sent **only** to the drawer after selection |
| `word-length` | `{ length: number }` | Sent to all players (excluding drawer) |
| `timer-tick` | `{ secondsLeft: number }` | Fires every second during a turn |
| `draw-line` | `Line` | Relays drawing data to non-drawer players |
| `clear-canvas` | — | Tells all clients to wipe their canvas |
| `receive-chat` | `{ message, player }` | A regular chat message (wrong/non-guess) |
| `correct-guess` | `{ player, players }` | A player guessed the word correctly |
| `end-turn` | `{ word, players }` | Turn ended; reveals the word and current scores |
| `new-round` | `{ round }` | A new round has started |
| `game-over` | `{ leaderboard: Player[] }` | Game ended; sorted leaderboard |
| `game-stop` | — | Game aborted (too few players) |

---

## 🗂️ Project Structure

```
.
├── index.ts           # Main server — Express + Socket.IO + game logic
├── utils/
│   └── const.ts       # Word bank, MAX_ROUNDS, getRandomWords()
├── .env               # Environment variables (not committed)
└── package.json
```

---

## 🧩 Data Models

### `Player`

```ts
type Player = {
  id: string;        // Socket ID (changes on reconnect)
  sessionId: string; // Stable UUID stored client-side
  name: string;
  points: number;
};
```

### `RoomData`

```ts
type RoomData = {
  id: string;
  players: Player[];
  gameStarted: boolean;
  drawerIndex: number;    // Index into players[]
  currentWord: string;
  secondsLeft: number;
  correctGuessers: string[]; // Socket IDs who guessed correctly
  currentRound: number;
};
```

---

## 🔐 Session & Reconnection

Every client generates a **UUID session ID** on first connection and stores it locally. On reconnect, they pass the same session ID, and the server:

1. Finds the player by `sessionId` in the room
2. Updates their socket ID to the new connection
3. Restores their **points** and **game position**

This means players can refresh the page or lose connection momentarily and rejoin without penalty.

---

## ⚙️ Game Flow

```
Join Room → Auto-start (2+ players) → Start Turn → Drawer picks word
    → 60s countdown → Guessers send chat
    → Correct guess? → Award points → All guessed? → End turn early
    → Timer expires → End turn → Next drawer
    → All drew? → Next round (or Game Over)
```

---

## 🌍 Deployment Notes

- Redis TTL is set to **24 hours** per room — rooms auto-expire
- Timers live **in-memory** on the server; a server restart resets active timers (but room state survives in Redis)
- For production, use a process manager like **PM2** to minimize downtime

---

