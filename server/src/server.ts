import express from "express"
import http from "http"
import { Server } from "socket.io"

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: { origin: "*" },
})

type Player = {
  id: string
  name: string
  points: number
}

type Room = {
  id: string
  players: Player[]
  gameStarted: boolean
  drawerIndex: number
  currentWord: string
  secondsLeft: number
  correctGuessers: Set<string>
  turnTimer: ReturnType<typeof setTimeout> | null
  countDownTimer: ReturnType<typeof setInterval> | null
  currentRound: number
}

const rooms: Record<string, Room> = {}

const MAX_ROUNDS = 3
const WORDS = ["elephant", "guitar", "volcano", "umbrella", "penguin"]

const getRoom = (roomId: string) => rooms[roomId]

const getRandomWords = () => {
  return [...WORDS].sort(() => Math.random() - 0.5).slice(0, 3)
}

const startTimer = (roomId: string) => {
  const room = getRoom(roomId)
  if (!room) return

  room.secondsLeft = 60

  room.countDownTimer = setInterval(() => {
    room.secondsLeft--
    io.to(roomId).emit("timer-tick", { secondsLeft: room.secondsLeft })

    if (room.secondsLeft <= 0) {
      clearInterval(room.countDownTimer!)
    }
  }, 1000)

  room.turnTimer = setTimeout(() => {
    endTurn(roomId)
  }, 60000)
}

const stopTimers = (room: Room) => {
  if (room.turnTimer) clearTimeout(room.turnTimer)
  if (room.countDownTimer) clearInterval(room.countDownTimer)

  room.turnTimer = null
  room.countDownTimer = null
}

const startGame = (roomId: string) => {
  const room = getRoom(roomId)
  if (!room) return

  room.gameStarted = true
  room.drawerIndex = 0
  room.currentRound = 1

  room.players.forEach(p => (p.points = 0))

  io.to(roomId).emit("game-start", {})
  startTurn(roomId)
}

const startTurn = (roomId: string) => {
  const room = getRoom(roomId)
  if (!room || room.players.length < 2) return

  const drawer = room.players[room.drawerIndex]

  room.correctGuessers.clear()
  room.currentWord = ""

  io.to(roomId).emit("start-turn", {
    drawer,
    round: room.currentRound,
    maxRounds: MAX_ROUNDS,
  })

  io.to(drawer!.id).emit("word-choices", {
    words: getRandomWords(),
  })
}

const endTurn = (roomId: string) => {
  const room = getRoom(roomId)
  if (!room) return

  stopTimers(room)

  io.to(roomId).emit("end-turn", {
    word: room.currentWord,
    players: room.players,
  })

  room.currentWord = ""
  room.correctGuessers.clear()

  setTimeout(() => {
    if (!room.gameStarted || room.players.length < 2) return

    const everyoneDrew = room.drawerIndex === room.players.length - 1

    if (everyoneDrew) {
      if (room.currentRound >= MAX_ROUNDS) {
        endGame(roomId)
      } else {
        room.currentRound++
        room.drawerIndex = 0
        io.to(roomId).emit("new-round", { round: room.currentRound })
        startTurn(roomId)
      }
    } else {
      room.drawerIndex++
      startTurn(roomId)
    }
  }, 3000)
}

const endGame = (roomId: string) => {
  const room = getRoom(roomId)
  if (!room) return

  room.gameStarted = false
  stopTimers(room)

  const leaderboard = [...room.players].sort((a, b) => b.points - a.points)

  io.to(roomId).emit("game-over", { leaderboard })

  room.currentRound = 1
  room.drawerIndex = 0
}

const stopGame = (roomId: string) => {
  const room = getRoom(roomId)
  if (!room) return

  room.gameStarted = false
  stopTimers(room)

  io.to(roomId).emit("game-stop", {})
}

io.on("connection", (socket) => {
  console.log("connected", socket.id)

  socket.on("join-room", ({ roomId, name }) => {
    socket.join(roomId)
    console.log(rooms.room1?.players)

    if (!rooms[roomId]) {
      rooms[roomId] = {
        id: roomId,
        players: [],
        gameStarted: false,
        drawerIndex: 0,
        currentWord: "",
        secondsLeft: 60,
        correctGuessers: new Set(),
        turnTimer: null,
        countDownTimer: null,
        currentRound: 1,
      }
    }

    const room = rooms[roomId]

    const player: Player = {
      id: socket.id,
      name,
      points: 0,
    }

    room.players.push(player)

     io.to(roomId).emit("updated-players", room.players)

     socket.emit("room-state", {
      players: room.players,
      gameStarted: room.gameStarted,
      drawer: room.players[room.drawerIndex],
      wordLength:room.currentRound?room.currentWord.length:0,
      secondsLeft:room.secondsLeft
    })

    if (room.players.length >= 2 && !room.gameStarted) {
      startGame(roomId)
    }
  })

  socket.on("word-select", ({ roomId, word }) => {
    const room = getRoom(roomId)
    if (!room) return

    const drawer = room.players[room.drawerIndex]

    // ✅ FIXED: only drawer can select
    if (drawer?.id !== socket.id) return

    room.currentWord = word

    io.to(roomId).emit("word-length", { length: word.length })
    socket.emit("your-word", { word })

    startTimer(roomId)
  })

  socket.on("send-chat", ({ roomId, message }) => {
    const room = getRoom(roomId)
    if (!room) return

    const player = room.players.find(p => p.id === socket.id)
    const drawer = room.players[room.drawerIndex]

    if (!player || drawer?.id === socket.id) return

    const isCorrect =
      message.toLowerCase().trim() === room.currentWord.toLowerCase()

    if (isCorrect && !room.correctGuessers.has(socket.id)) {
      room.correctGuessers.add(socket.id)

      player.points += room.secondsLeft * 2

      // ✅ FIXED TYPO
      io.to(roomId).emit("correct-guess", {
        player,
        players: room.players,
      })

      const nonDrawers = room.players.filter(p => p.id !== drawer?.id)
      const allGuessed = nonDrawers.every(p =>
        room.correctGuessers.has(p.id)
      )

      if (allGuessed) {
        endTurn(roomId)
      }
    } else {
      io.to(roomId).emit("receive-chat", { message, player })
    }
  })

  socket.on("draw-line",({roomId,line})=>{
    const room=rooms[roomId]

    if(!room) return
    const drawer=room.players[room.drawerIndex]

    if(drawer?.id!==socket.id) return

    socket.to(roomId).emit("draw-line",line)

  })

  socket.on("clear-canvas", ({ roomId }) => {
  const room = rooms[roomId]
  if (!room) return

  const drawer = room.players[room.drawerIndex]
  if (drawer?.id !== socket.id) return

  io.to(roomId).emit("clear-canvas")
})

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const room = rooms[roomId]
      if (!room) continue

      const index = room.players.findIndex(p => p.id === socket.id)

      if (index !== -1) {
        room.players.splice(index, 1)

        if (room.drawerIndex >= room.players.length) {
          room.drawerIndex = 0
        }

        io.to(roomId).emit("updated-players", room.players)

        if (room.players.length < 2 && room.gameStarted) {
          stopGame(roomId)
        }

        if (room.players.length === 0) {
          delete rooms[roomId]
        }

        break
      }
    }
  })
})

server.listen(3001, () => {
  console.log("Server running on http://localhost:3001")
})