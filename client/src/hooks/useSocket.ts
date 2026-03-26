import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { Player, ChatMessage, GamePhase, DrawLine } from "../utils/types";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  const [myId, setMyId] = useState("");
  const [phase, setPhase] = useState<GamePhase>("join");
  const [players, setPlayers] = useState<Player[]>([]);
  const [drawer, setDrawer] = useState<Player | null>(null);
  const [round, setRound] = useState(1);
  const [maxRounds] = useState(3);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [wordLength, setWordLength] = useState(0);
  const [myWord, setMyWord] = useState("");
  const [wordChoices, setWordChoices] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lines, setLines] = useState<DrawLine[]>([]);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [roomId, setRoomId] = useState("");

  const addMessage = (msg: ChatMessage) =>
    setMessages((prev) => [...prev, msg]);

  useEffect(() => {
    let sessionId = localStorage.getItem("skribbl_sid");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem("skribbl_sid", sessionId);
    }

    const socket = io(SERVER_URL, {
      auth: { sessionId },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setMyId(socket.id ?? "");
    });

    socket.on("game-start", () => {
      setLines([]);
      setMessages([]);
      addMessage({ type: "system", message: "🎮 Game started!" });
    });

    socket.on("start-turn", ({ drawer, round }) => {
      setDrawer(drawer);
      setRound(round);
      setLines([]);
      setWordLength(0);
      setMyWord("");
      setSecondsLeft(60);

      const amIDrawing = drawer.id === socket.id;
      setPhase(amIDrawing ? "word-choice" : "drawing");

      addMessage({
        type: "system",
        message: `✏️ ${drawer.name} is drawing…`,
      });
    });

    socket.on("word-choices", ({ words }) => {
      setWordChoices(words);
      setPhase("word-choice");
    });

    socket.on("your-word", ({ word }) => {
      setMyWord(word);
      setWordChoices([]);
      setPhase("drawing");
    });

    socket.on("word-length", ({ length }) => {
      setWordLength(length);
    });

    socket.on("timer-tick", ({ secondsLeft }) => {
      setSecondsLeft(secondsLeft);
    });

    socket.on("receive-chat", ({ message, player }) => {
      addMessage({ type: "chat", player, message });
    });

    socket.on("correct-guess", ({ player, players }) => {
      setPlayers(players);
      addMessage({ type: "correct", player }) ;
    });

    socket.on("updated-players", (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on("end-turn", ({ word, players }) => {
      setPlayers(players);
      setPhase("end-turn");
      setWordChoices([]);
      addMessage({ type: "system", message: `🔑 The word was: ${word}` });
    });

    socket.on("new-round", ({ round }) => {
      setRound(round);
      addMessage({ type: "system", message: `🔄 Round ${round} starting!` });
    });

    socket.on("game-over", ({ leaderboard }) => {
      setLeaderboard(leaderboard);
      setPhase("game-over");
    });

    socket.on("game-stop", () => {
      addMessage({
        type: "system",
        message: "⚠️ Not enough players — game paused.",
      });
      setPhase("waiting");
    });

    socket.on("draw-line", (line) => {
      setLines((prev) => [...prev, line]);
    });

    socket.on("clear-canvas", () => {
      setLines([]);
    });

    socket.on("room-state", ({ players, gameStarted, drawer, wordLength, secondsLeft }) => {
      setPlayers(players);
      setDrawer(drawer);
      setWordLength(wordLength);
      setSecondsLeft(secondsLeft);

      if (!gameStarted) {
        setPhase("waiting");
        return;
      }

      const amIDrawing = drawer?.id === socket.id;
      setPhase(amIDrawing ? "word-choice" : "drawing");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinRoom = useCallback((name: string, room: string) => {
    setRoomId(room);
    setPhase("waiting");
    addMessage({ type: "system", message: `👋 You joined room "${room}"` });
    socketRef.current?.emit("join-room", { roomId: room, name });
  }, []);

  const sendChat = useCallback(
    (message: string) => {
      socketRef.current?.emit("send-chat", { roomId, message });
    },
    [roomId]
  );

  const sendLine = useCallback(
    (line: DrawLine) => {
      setLines((prev) => [...prev, line]);
      socketRef.current?.emit("draw-line", { roomId, line });
    },
    [roomId]
  );

  const clearCanvas = useCallback(() => {
    setLines([]);
    socketRef.current?.emit("clear-canvas", { roomId });
  }, [roomId]);

  const selectWord = useCallback(
    (word: string) => {
      socketRef.current?.emit("word-select", { roomId, word });
    },
    [roomId]
  );

  return {
    myId,
    phase,
    players,
    drawer,
    round,
    maxRounds,
    secondsLeft,
    wordLength,
    myWord,
    wordChoices,
    messages,
    lines,
    leaderboard,
    joinRoom,
    sendChat,
    sendLine,
    clearCanvas,
    selectWord,
  };
}