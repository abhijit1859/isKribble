# Skribbl Backend

A real-time multiplayer drawing and guessing game server built with **Express**, **Socket.IO**, and **Redis**. Supports persistent game state and sticky sessions so players can reconnect mid-game without losing their progress.

---

## Tech Stack

- **Node.js** + **TypeScript**
- **Express** — HTTP server
- **Socket.IO** — real-time bidirectional communication
- **Redis** (`node-redis` v4) — persistent game state and session storage
- **cookie-parser** — session cookie parsing
- **uuid** — stable session ID generation

---

## Prerequisites

- Node.js 18+
- A running Redis instance (local or remote)

---

## Installation

```bash
npm install
```

Install required dependencies if starting fresh:

```bash
npm install express socket.io redis uuid cookie-parser cors
npm install -D typescript @types/node @types/express @types/uuid @types/cookie-parser
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `CLIENT_ORIGIN` | `*` | Allowed CORS origin for the frontend |

Example `.env`:

```env
REDIS_URL=redis://localhost:6379
CLIENT_ORIGIN=http://localhost:3000
```

---

## Running the Server

```bash
# Development
npx ts-node server.ts

# Production (compile first)
npx tsc && node dist/server.js
```

Server starts on **http://localhost:3001**.

---

## Architecture Overview

### Redis Storage

Two key types are stored in Redis, both with a **24-hour TTL**.

**`room:<roomId>`** — full room state serialized as JSON:

```json
{
  "id": "abc123",
  "players": [
    { "id": "socket-id", "sessionId": "uuid", "name": "Alice", "points": 80 }
  ],
  "gameStarted": true,
  "drawerIndex": 1,
  "currentWord": "elephant",
  "secondsLeft": 42,
  "currentRound": 2,
  "correctGuessers": ["socket-id-1"]
}
```

**`session:<sessionId>`** — lightweight reconnect lookup:

```json
{
  "roomId": "abc123",
  "name": "Alice"
}
```

### In-Memory Timers

Turn timers (`setTimeout` / `setInterval`) cannot be stored in Redis since they are live Node.js runtime handles, not serializable data. They are kept in a plain in-process `timers` object keyed by `roomId`.

Each turn runs two timers simultaneously:

- **`countDownTimer`** (`setInterval`, 1s) — decrements `secondsLeft`, emits `timer-tick` to all clients, and saves the updated value to Redis every second.
- **`turnTimer`** (`setTimeout`, 60s) — fires once at the end of the turn and calls `endTurn()`.

Both timers are cancelled by `stopTimers()` when a turn ends early (all players guessed, or the drawer disconnects).

> **Note:** If the server restarts, in-memory timers are lost. Room state survives in Redis but the active turn will be frozen. For production use, consider replacing timers with a Redis-backed job queue like [BullMQ](https://bullmq.io).

### Sticky Sessions

Each client is assigned a stable `sessionId` (UUID) on first connection, emitted back via a `session` event. The client should persist this (e.g. `localStorage`) and send it as a cookie on every connection.

On reconnect, the server:
1. Reads the `sessionId` from the cookie
2. Looks up `session:<sessionId>` in Redis
3. Finds the player in the room and updates their `socket.id` to the new connection
4. Emits `room-state` with the current game state including live `secondsLeft`

### Disconnect Grace Period

When a player disconnects, they are **not removed immediately**. The server waits **30 seconds** to allow reconnection. If they reconnect within that window with the same `sessionId`, they are seamlessly restored. If not, they are removed from the room and the session key is deleted from Redis.

---

## Socket Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join-room` | `{ roomId, name }` | Join or create a room |
| `word-select` | `{ roomId, word }` | Drawer selects a word from choices |
| `send-chat` | `{ roomId, message }` | Send a guess or chat message |
| `draw-line` | `{ roomId, line }` | Broadcast a drawn line (drawer only) |
| `clear-canvas` | `{ roomId }` | Clear the canvas (drawer only) |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `session` | `{ sessionId }` | Issued on connect, persist and send as cookie |
| `room-state` | `{ players, gameStarted, drawer, wordLength, secondsLeft, reconnected? }` | Full state snapshot on join or reconnect |
| `updated-players` | `Player[]` | Emitted when the player list changes |
| `game-start` | `{}` | Game has begun |
| `start-turn` | `{ drawer, round, maxRounds }` | A new turn has started |
| `word-choices` | `{ words: string[] }` | Sent only to the drawer — 3 words to choose from |
| `your-word` | `{ word }` | Sent only to the drawer after they select |
| `word-length` | `{ length }` | Sent to all other players after word is selected |
| `timer-tick` | `{ secondsLeft }` | Fires every second during a turn |
| `correct-guess` | `{ player, players }` | A player guessed correctly |
| `receive-chat` | `{ message, player }` | A regular (incorrect) chat message |
| `end-turn` | `{ word, players }` | Turn has ended, reveals the word |
| `new-round` | `{ round }` | A new round has started |
| `game-over` | `{ leaderboard }` | Game finished, sorted leaderboard |
| `game-stop` | `{}` | Game stopped due to insufficient players |
| `draw-line` | `line` | Relayed drawing data to non-drawer clients |
| `clear-canvas` | `{}` | Relayed canvas clear to all clients |

---

## Game Flow

```
Player joins room
      │
      ▼
2+ players present? ──yes──▶ startGame()
                                  │
                                  ▼
                             startTurn()
                          drawer gets word choices
                                  │
                                  ▼
                          drawer selects word
                          60s timer starts
                                  │
                          ┌───────┴────────┐
                    all guessed        timer expires
                          └───────┬────────┘
                                  ▼
                             endTurn()
                          reveal word, award points
                                  │
                    ┌─────────────┴─────────────┐
              everyone drew?                more drawers
                    │                            │
              more rounds?               next drawer's turn
                    │
              ┌─────┴─────┐
           yes              no
            │               │
        new round        endGame()
                        show leaderboard
```

---

## Scoring

Points are awarded to guessers based on how quickly they guess:

```
points = secondsLeft × 2
```

A correct guess at 50 seconds remaining = **100 points**. The drawer does not receive points directly. Players are sorted by total points at the end of the game.

---

## Game Configuration

These constants are at the top of `server.ts` and can be adjusted:

```ts
const MAX_ROUNDS = 3
const WORDS = ["elephant", "guitar", "volcano", "umbrella", "penguin"]
```

Replace `WORDS` with a larger word bank for variety.