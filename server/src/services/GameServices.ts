import { Server } from "socket.io";
import { MAX_ROUNDS, getRandomWords } from "../utils/const.js";
import { RoomService } from "./RoomServices.js";
import { TimerManager } from "../managers/TimeManagers.js";

export class GameService {
  constructor(
    private io: Server,
    private roomService: RoomService,
    private timerManager: TimerManager
  ) {}

  async startTimer(roomId: string) {
    const room = await this.roomService.getRoom(roomId);

    if (!room) return;

    this.timerManager.stopTimers(roomId);

    room.secondsLeft = 60;

    await this.roomService.saveRoom(room);

    const t = this.timerManager.getTimers(roomId);

    t.countDownTimer = setInterval(async () => {
      const r = await this.roomService.getRoom(roomId);

      if (!r) return;

      r.secondsLeft--;

      await this.roomService.saveRoom(r);

      this.io.to(roomId).emit("timer-tick", {
        secondsLeft: r.secondsLeft,
      });

      if (r.secondsLeft <= 0) {
        clearInterval(t.countDownTimer!);

        await this.endTurn(roomId);
      }
    }, 1000);
  }

  async startGame(roomId: string) {
    const room = await this.roomService.getRoom(roomId);

    if (!room) return;

    if (room.gameStarted) return;

    room.gameStarted = true;

    room.drawerIndex = 0;

    room.currentRound = 1;

    room.players.forEach((p) => {
      p.points = 0;
    });

    await this.roomService.saveRoom(room);

    this.io.to(roomId).emit("game-start", {});

    await this.startTurn(roomId);
  }

  async startTurn(roomId: string) {
    const room = await this.roomService.getRoom(roomId);

    if (!room) return;

    const connected =
      this.roomService.connectedPlayers(room);

    if (connected.length < 2) return;

    const drawer = room.players[room.drawerIndex];

    if (!drawer || drawer.id === "") {
      room.drawerIndex =
        (room.drawerIndex + 1) %
        room.players.length;

      await this.roomService.saveRoom(room);

      await this.startTurn(roomId);

      return;
    }

    room.correctGuessers = [];

    room.currentWord = "";

    await this.roomService.saveRoom(room);

    this.io.to(roomId).emit("start-turn", {
      drawer,
      round: room.currentRound,
      maxRounds: MAX_ROUNDS,
    });

    this.io.to(drawer.id).emit("word-choices", {
      words: getRandomWords(),
    });
  }

  async endTurn(roomId: string) {
    const room = await this.roomService.getRoom(roomId);

    if (!room) return;

    this.timerManager.stopTimers(roomId);

    this.io.to(roomId).emit("end-turn", {
      word: room.currentWord,
      players:
        this.roomService.connectedPlayers(room),
    });

    room.currentWord = "";

    room.correctGuessers = [];

    await this.roomService.saveRoom(room);

    setTimeout(async () => {
      const r =
        await this.roomService.getRoom(roomId);

      if (!r) return;

      const connected =
        this.roomService.connectedPlayers(r);

      if (
        !r.gameStarted ||
        connected.length < 2
      )
        return;

      const everyoneDrew =
        r.drawerIndex ===
        r.players.length - 1;

      if (everyoneDrew) {
        if (r.currentRound >= MAX_ROUNDS) {
          await this.endGame(roomId);
        } else {
          r.currentRound++;

          r.drawerIndex = 0;

          await this.roomService.saveRoom(r);

          this.io.to(roomId).emit(
            "new-round",
            {
              round: r.currentRound,
            }
          );

          await this.startTurn(roomId);
        }
      } else {
        r.drawerIndex++;

        await this.roomService.saveRoom(r);

        await this.startTurn(roomId);
      }
    }, 3000);
  }

  async endGame(roomId: string) {
    const room = await this.roomService.getRoom(roomId);

    if (!room) return;

    room.gameStarted = false;

    await this.roomService.saveRoom(room);

    const leaderboard =
      this.roomService
        .connectedPlayers(room)
        .sort((a, b) => b.points - a.points);

    this.io.to(roomId).emit("game-over", {
      leaderboard,
    });
  }
} 
