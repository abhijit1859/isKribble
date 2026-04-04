import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createClient } from "redis";
import { v4 as uuidv4 } from "uuid";
import http from "http";
import { Server } from "socket.io";
import { getRandomWords, MAX_ROUNDS } from "./utils/const.js";
import dotenv from "dotenv"
dotenv.config()
 

 
//prod
const redis = createClient({
   username: 'default',
    password: process.env.REDIS_PASSWORD!,
    socket: {
        host: process.env.REDIS_HOST!,
        port: 18087
    }
});
//localhost
// const redis = createClient({
//     socket: {
//         host: 'localhost',
//         port: 6379
//     }
// });

redis.on('error', err => console.log('Redis Client Error', err));

await redis.connect();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(cookieParser());

app.get("/flush", async (req, res) => {
  await redis.flushAll();
  res.send("Redis flushed!");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

type Player = {
  id: string;
  sessionId: string;
  name: string;
  points: number;
};

type RoomData = {
  id: string;
  players: Player[];
  gameStarted: boolean;
  drawerIndex: number;
  currentWord: string;
  secondsLeft: number;
  correctGuessers: string[];
  currentRound: number;
};

const ROOM_TTL = 60 * 5;

const roomKey = (roomId: string) => `room:${roomId}`;
const sessionKey = (sessionId: string) => `session:${sessionId}`;

async function getRoom(roomId: string): Promise<RoomData | null> {
  const raw = await redis.get(roomKey(roomId));
  return raw ? JSON.parse(raw) : null;
}

async function saveRoom(room: RoomData) {
  await redis.set(roomKey(room.id), JSON.stringify(room), { EX: ROOM_TTL });
}

async function saveSession(sessionId: string, roomId: string, name: string) {
  await redis.set(
    sessionKey(sessionId),
    JSON.stringify({ roomId, name }),
    { EX: ROOM_TTL }
  );
}

async function getSession(sessionId: string) {
  const raw = await redis.get(sessionKey(sessionId));
  return raw ? JSON.parse(raw) : null;
}

function connectedPlayers(room: RoomData): Player[] {
  return room.players.filter((p) => p.id !== "");
}

const timers: Record<
  string,
  {
    turnTimer: NodeJS.Timeout | null;
    countDownTimer: NodeJS.Timeout | null;
  }
> = {};

function getTimers(roomId: string) {
  if (!timers[roomId]) {
    timers[roomId] = { turnTimer: null, countDownTimer: null };
  }
  return timers[roomId];
}

function stopTimers(roomId: string) {
  const t = timers[roomId];
  if (!t) return;
  if (t.turnTimer) clearTimeout(t.turnTimer);
  if (t.countDownTimer) clearInterval(t.countDownTimer);
}

async function startTimer(roomId: string) {
  const room = await getRoom(roomId);
  if (!room) return;

  stopTimers(roomId);

  room.secondsLeft = 60;
  await saveRoom(room);

  const t = getTimers(roomId);

  t.countDownTimer = setInterval(async () => {
    const r = await getRoom(roomId);
    if (!r) return;

    r.secondsLeft--;
    await saveRoom(r);

    io.to(roomId).emit("timer-tick", { secondsLeft: r.secondsLeft });

    if (r.secondsLeft <= 0) {
      clearInterval(t.countDownTimer!);
      endTurn(roomId);
    }
  }, 1000);
}

async function startGame(roomId: string) {
  const room = await getRoom(roomId);
  if (!room) return;

  if (room.gameStarted) return;

  room.gameStarted = true;
  room.drawerIndex = 0;
  room.currentRound = 1;
  room.players.forEach((p) => (p.points = 0));

  await saveRoom(room);

  io.to(roomId).emit("game-start", {});
  startTurn(roomId);
}

async function startTurn(roomId: string) {
  const room = await getRoom(roomId);
  if (!room) return;

  const connected = connectedPlayers(room);
  if (connected.length < 2) return;

  const drawer = room.players[room.drawerIndex];

  if (!drawer || drawer.id === "") {
    room.drawerIndex = (room.drawerIndex + 1) % room.players.length;
    await saveRoom(room);
    startTurn(roomId);
    return;
  }

  room.correctGuessers = [];
  room.currentWord = "";
  await saveRoom(room);

  io.to(roomId).emit("start-turn", {
    drawer,
    round: room.currentRound,
    maxRounds: MAX_ROUNDS,
  });

  io.to(drawer.id).emit("word-choices", {
    words: getRandomWords(),
  });
}

async function endTurn(roomId: string) {
  const room = await getRoom(roomId);
  if (!room) return;

  stopTimers(roomId);

  io.to(roomId).emit("end-turn", {
    word: room.currentWord,
    players: connectedPlayers(room),
  });

  room.currentWord = "";
  room.correctGuessers = [];
  await saveRoom(room);

  setTimeout(async () => {
    const r = await getRoom(roomId);
    if (!r) return;

    const connected = connectedPlayers(r);
    if (!r.gameStarted || connected.length < 2) return;

    const everyoneDrew = r.drawerIndex === r.players.length - 1;

    if (everyoneDrew) {
      if (r.currentRound >= MAX_ROUNDS) {
        endGame(roomId);
      } else {
        r.currentRound++;
        r.drawerIndex = 0;
        await saveRoom(r);
        io.to(roomId).emit("new-round", { round: r.currentRound });
        startTurn(roomId);
      }
    } else {
      r.drawerIndex++;
      await saveRoom(r);
      startTurn(roomId);
    }
  }, 3000);
}

async function endGame(roomId: string) {
  const room = await getRoom(roomId);
  if (!room) return;

  room.gameStarted = false;
  await saveRoom(room);

  const leaderboard = connectedPlayers(room).sort(
    (a, b) => b.points - a.points
  );

  io.to(roomId).emit("game-over", { leaderboard });
}

io.on("connection", async (socket) => {
  console.log("connected", socket.id);

  let sessionId: string =
    (socket.handshake.auth as { sessionId?: string }).sessionId ?? "";
  if (!sessionId) sessionId = uuidv4();

  console.log("sessionId:", sessionId);

  socket.on("join-room", async ({ roomId, name }) => {
    console.log("join-room", { roomId, name, sessionId });

    socket.join(roomId);

    let room = await getRoom(roomId);

    if (!room) {
      room = {
        id: roomId,
        players: [],
        gameStarted: false,
        drawerIndex: 0,
        currentWord: "",
        secondsLeft: 60,
        correctGuessers: [],
        currentRound: 1,
      };
    }

    const existingIndex = room.players.findIndex(
      (p) => p.sessionId === sessionId
    );

    if (existingIndex !== -1) {
      room.players[existingIndex]!.id = socket.id;
      room.players[existingIndex]!.name = name;
      console.log("reconnected player, points:", room.players[existingIndex]!.points);
    } else {
      room.players.push({ id: socket.id, sessionId, name, points: 0 });
      console.log("new player added");
    }

    await saveRoom(room);
    await saveSession(sessionId, roomId, name);

    io.to(roomId).emit("updated-players", connectedPlayers(room));

    socket.emit("room-state", {
      players: connectedPlayers(room),
      gameStarted: room.gameStarted,
      drawer: room.players[room.drawerIndex],
      wordLength: room.currentWord ? room.currentWord.length : 0,
      secondsLeft: room.secondsLeft,
    });

    const connected = connectedPlayers(room);
    console.log("connected players:", connected.length, "gameStarted:", room.gameStarted);

    if (connected.length >= 2 && !room.gameStarted) {
      startGame(roomId);
    }
  });

  socket.on("word-select", async ({ roomId, word }) => {
    const room = await getRoom(roomId);
    if (!room) return;

    const drawer = room.players[room.drawerIndex];
    if (drawer?.id !== socket.id) return;

    room.currentWord = word;
    await saveRoom(room);

    io.to(roomId).emit("word-length", { length: word.length });
    socket.emit("your-word", { word });

    startTimer(roomId);
  });

  socket.on("draw-line", async ({ roomId, line }) => {
    const room = await getRoom(roomId);
    if (!room) return;

    const drawer = room.players[room.drawerIndex];
    if (drawer?.id !== socket.id) return;

    socket.to(roomId).emit("draw-line", line);
  });

  socket.on("clear-canvas", async ({ roomId }) => {
    const room = await getRoom(roomId);
    if (!room) return;

    const drawer = room.players[room.drawerIndex];
    if (drawer?.id !== socket.id) return;

    io.to(roomId).emit("clear-canvas");
  });

  socket.on("send-chat", async ({ roomId, message }) => {
    const room = await getRoom(roomId);
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    const drawer = room.players[room.drawerIndex];

    if (!player || drawer?.id === socket.id) return;

    const isCorrect =
      message.toLowerCase().trim() === room.currentWord.toLowerCase();

    if (isCorrect && !room.correctGuessers.includes(socket.id)) {
      room.correctGuessers.push(socket.id);
      player.points += room.secondsLeft * 2;

      await saveRoom(room);

      io.to(roomId).emit("correct-guess", {
        player,
        players: connectedPlayers(room),
      });

      const nonDrawers = connectedPlayers(room).filter(
        (p) => p.id !== drawer?.id
      );

      const allGuessed = nonDrawers.every((p) =>
        room.correctGuessers.includes(p.id)
      );

      if (allGuessed) endTurn(roomId);
    } else {
      io.to(roomId).emit("receive-chat", { message, player });
    }
  });

  socket.on("disconnect", async () => {
    const session = await getSession(sessionId);
    if (!session) return;

    const room = await getRoom(session.roomId);
    if (!room) return;

    const playerIndex = room.players.findIndex((p) => p.id === socket.id);
    if (playerIndex !== -1) {
      room.players[playerIndex]!.id = "";
    }

    await saveRoom(room);

    const connected = connectedPlayers(room);
    io.to(session.roomId).emit("updated-players", connected);

    if (connected.length < 2 && room.gameStarted) {
      room.gameStarted = false;
      stopTimers(session.roomId);
      await saveRoom(room);
      io.to(session.roomId).emit("game-stop");
    }
  });
});

server.listen(process.env.PORT, () => {
  console.log("Server running on port 3000");
});