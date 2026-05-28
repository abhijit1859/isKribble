import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { GameService } from "../services/GameServices.js";
import { SessionService } from "../services/SessionServices.js";
import { RoomService } from "../services/RoomServices.js";
import { TimerManager } from "../managers/TimeManagers.js"

export class GameSocket {
    private roomService;
    private sessionService;
    private timerManager;
    private gameService;

    constructor(private io: Server) {
        this.roomService = new RoomService();
        this.sessionService = new SessionService();
        this.timerManager = new TimerManager();

        this.gameService = new GameService(
            this.io,
            this.roomService,
            this.timerManager
        );

        this.initialize();
    }

    initialize() {
        this.io.on("connection", (socket) => {
            this.handleConnection(socket);
        });
    }

    async handleConnection(socket: Socket) {
        console.log("connected", socket.id);

        let sessionId =
            (socket.handshake.auth as { sessionId?: string })
                .sessionId ?? "";

        if (!sessionId) {
            sessionId = uuidv4();
        }

        socket.on("join-room", async ({ roomId, name }) => {
            await this.handleJoinRoom(
                socket,
                roomId,
                name,
                sessionId
            );
        });

        socket.on("word-select", async ({ roomId, word }) => {
            await this.handleWordSelect(
                socket,
                roomId,
                word
            );
        });

        socket.on("draw-line", async ({ roomId, line }) => {
            socket.to(roomId).emit("draw-line", line);
        });

        socket.on("clear-canvas", ({ roomId }) => {
            this.io.to(roomId).emit("clear-canvas");
        });

        socket.on("send-chat", async ({ roomId, message }) => {
            await this.handleChat(
                socket,
                roomId,
                message
            );
        });

        socket.on("disconnect", async () => {
            await this.handleDisconnect(
                socket,
                sessionId
            );
        });
    }


    async handleJoinRoom(
        socket: Socket,
        roomId: string,
        name: string,
        sessionId: string
    ) {
        console.log("join-room", {
            roomId,
            name,
            sessionId,
        });

        socket.join(roomId);

        let room = await this.roomService.getRoom(roomId);

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

            console.log(
                "reconnected player"
            );
        } else {
            room.players.push({
                id: socket.id,
                sessionId,
                name,
                points: 0,
            });

            console.log("new player added");
        }

        await this.roomService.saveRoom(room);

        await this.sessionService.saveSession(
            sessionId,
            roomId,
            name
        );

        this.io.to(roomId).emit(
            "updated-players",
            this.roomService.connectedPlayers(room)
        );

        socket.emit("room-state", {
            players:
                this.roomService.connectedPlayers(room),

            gameStarted: room.gameStarted,

            drawer:
                room.players[room.drawerIndex],

            wordLength: room.currentWord
                ? room.currentWord.length
                : 0,

            secondsLeft: room.secondsLeft,
        });

        const connected =
            this.roomService.connectedPlayers(room);

        console.log(
            "connected players:",
            connected.length
        );

        if (
            connected.length >= 2 &&
            !room.gameStarted
        ) {
            await this.gameService.startGame(roomId);
        }
    }




    async handleWordSelect(
        socket: Socket,
        roomId: string,
        word: string
    ) {
        const room =
            await this.roomService.getRoom(roomId);

        if (!room) return;

        const drawer =
            room.players[room.drawerIndex];

        if (drawer?.id !== socket.id) return;

        room.currentWord = word;

        await this.roomService.saveRoom(room);

        this.io.to(roomId).emit("word-length", {
            length: word.length,
        });

        socket.emit("your-word", { word });

        await this.gameService.startTimer(roomId);
    }




    async handleChat(
        socket: Socket,
        roomId: string,
        message: string
    ) {
        const room =
            await this.roomService.getRoom(roomId);

        if (!room) return;

        const player = room.players.find(
            (p) => p.id === socket.id
        );

        const drawer =
            room.players[room.drawerIndex];

        if (!player || drawer?.id === socket.id)
            return;

        const isCorrect =
            message.toLowerCase().trim() ===
            room.currentWord.toLowerCase();

        if (
            isCorrect &&
            !room.correctGuessers.includes(socket.id)
        ) {
            room.correctGuessers.push(socket.id);

            player.points += room.secondsLeft * 2;

            await this.roomService.saveRoom(room);

            this.io.to(roomId).emit(
                "correct-guess",
                {
                    player,
                    players:
                        this.roomService.connectedPlayers(room),
                }
            );

            const nonDrawers =
                this.roomService
                    .connectedPlayers(room)
                    .filter((p) => p.id !== drawer?.id);

            const allGuessed = nonDrawers.every(
                (p) =>
                    room.correctGuessers.includes(p.id)
            );

            if (allGuessed) {
                await this.gameService.endTurn(roomId);
            }
        } else {
            this.io.to(roomId).emit(
                "receive-chat",
                {
                    message,
                    player,
                }
            );
        }
    }



    async handleDisconnect(
        socket: Socket,
        sessionId: string
    ) {
        const session =
            await this.sessionService.getSession(
                sessionId
            );

        if (!session) return;

        const room =
            await this.roomService.getRoom(
                session.roomId
            );

        if (!room) return;

        const playerIndex =
            room.players.findIndex(
                (p) => p.id === socket.id
            );

        if (playerIndex !== -1) {
            room.players[playerIndex]!.id = "";
        }

        await this.roomService.saveRoom(room);

        const connected =
            this.roomService.connectedPlayers(room);

        this.io.to(session.roomId).emit(
            "updated-players",
            connected
        );

        if (
            connected.length < 2 &&
            room.gameStarted
        ) {
            room.gameStarted = false;

            this.timerManager.stopTimers(
                session.roomId
            );

            await this.roomService.saveRoom(room);

            this.io.to(session.roomId).emit(
                "game-stop"
            );
        }
    }

}