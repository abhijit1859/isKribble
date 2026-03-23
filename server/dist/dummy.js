import express from "express";
import http from "http";
import { Server } from "socket.io";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});
let players = [];
let gameStarted = false;
let drawerIndex = 0;
let currentWord = "";
let secondsLeft = 60;
let correctGuessers = new Set();
let turnTimer = null;
let countDownTimer = null;
let currentRound = 1;
const MAX_ROUNDS = 3;
const wordList = ["elephant", "guitar", "volcano", "umbrella", "penguin"];
const startTimer = () => {
    secondsLeft = 60;
    countDownTimer = setInterval(() => {
        secondsLeft--;
        io.emit("timer-tick", { secondsLeft });
        if (secondsLeft <= 0) {
            clearInterval(countDownTimer);
        }
    }, 1000);
    turnTimer = setTimeout(() => {
        endTurn();
    }, 60000);
};
const stopTimers = () => {
    if (turnTimer)
        clearTimeout(turnTimer);
    if (countDownTimer)
        clearInterval(countDownTimer);
    turnTimer = null;
    countDownTimer = null;
};
const getRandomWords = () => {
    const shuffled = [...wordList].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
};
const startTurn = () => {
    if (players.length < 2)
        return;
    const drawer = players[drawerIndex];
    correctGuessers.clear();
    currentWord = "";
    io.emit("start-turn", {
        drawer,
        round: currentRound,
        maxRounds: MAX_ROUNDS,
    });
    io.to(drawer.id).emit("word-choices", {
        words: getRandomWords(),
    });
};
const endTurn = () => {
    stopTimers();
    io.emit("end-turn", {
        word: currentWord,
        players,
    });
    currentWord = "";
    correctGuessers.clear();
    setTimeout(() => {
        if (!gameStarted || players.length < 2)
            return;
        const everyoneDrew = drawerIndex === players.length - 1;
        if (everyoneDrew) {
            if (currentRound >= MAX_ROUNDS) {
                endGame();
            }
            else {
                currentRound++;
                drawerIndex = 0;
                io.emit("new-round", { round: currentRound });
                startTurn();
            }
        }
        else {
            drawerIndex = (drawerIndex + 1) % players.length;
            startTurn();
        }
    }, 3000);
};
const startGame = () => {
    gameStarted = true;
    drawerIndex = 0;
    currentRound = 1;
    players.forEach(p => (p.points = 0));
    io.emit("game-start", { message: "Game starting!" });
    startTurn();
};
const stopGame = () => {
    gameStarted = false;
    stopTimers();
    io.emit("game-stop", { message: "Not enough players" });
};
const endGame = () => {
    gameStarted = false;
    stopTimers();
    const leaderboard = [...players].sort((a, b) => b.points - a.points);
    io.emit("game-over", { leaderboard });
    currentRound = 1;
    drawerIndex = 0;
};
io.on("connection", (socket) => {
    console.log("Connected:", socket.id);
    socket.on("set-name", (name) => {
        const player = {
            id: socket.id,
            name,
            points: 0,
        };
        players.push(player);
        io.emit("updated-players", players);
        if (players.length >= 2 && !gameStarted) {
            startGame();
        }
    });
    socket.on("word-select", (word) => {
        const drawer = players[drawerIndex];
        if (drawer?.id !== socket.id)
            return;
        currentWord = word;
        io.emit("word-length", { length: currentWord.length });
        socket.emit("your-word", { word: currentWord });
        startTimer();
    });
    socket.on("send-chat", (message) => {
        const player = players.find(p => p.id === socket.id);
        if (!player)
            return;
        const drawer = players[drawerIndex];
        if (drawer?.id === socket.id)
            return;
        const isCorrect = message.toLowerCase().trim() === currentWord.toLowerCase();
        if (isCorrect && !correctGuessers.has(socket.id)) {
            correctGuessers.add(socket.id);
            player.points += secondsLeft * 2;
            io.emit("correct-guess", { player, players });
            const nonDrawers = players.filter(p => p.id !== drawer?.id);
            const allGuessed = nonDrawers.every(p => correctGuessers.has(p.id));
            if (allGuessed) {
                io.emit("all-guessed", {});
                endTurn();
            }
        }
        else {
            io.emit("receive-chat", { message, player });
        }
    });
    socket.on("draw", (data) => {
        const drawer = players[drawerIndex];
        if (drawer?.id !== socket.id)
            return;
        socket.broadcast.emit("draw", data);
    });
    socket.on("fill", (data) => {
        const drawer = players[drawerIndex];
        if (drawer?.id !== socket.id)
            return;
        socket.broadcast.emit("fill", data);
    });
    socket.on("clear-canvas", () => {
        const drawer = players[drawerIndex];
        if (drawer?.id !== socket.id)
            return;
        socket.broadcast.emit("clear-canvas");
    });
    socket.on("disconnect", () => {
        const index = players.findIndex(p => p.id === socket.id);
        if (index !== -1) {
            players.splice(index, 1);
        }
        if (drawerIndex >= players.length) {
            drawerIndex = 0;
        }
        io.emit("updated-players", players);
        if (players.length < 2 && gameStarted) {
            stopGame();
        }
    });
});
server.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
});
//# sourceMappingURL=dummy.js.map