

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { Player, ChatMessage, GamePhase, DrawLine } from "../utils/types";

const SERVER_URL = "http://localhost:3001";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  // ── State ──────────────────────────────────────────────────────────────────
  const [myId, setMyId] = useState("");
  const [phase, setPhase] = useState<GamePhase>("join");
  const [players, setPlayers] = useState<Player[]>([]);
  const [drawer, setDrawer] = useState<Player | null>(null);
  const [round, setRound] = useState(1);
  const [maxRounds] = useState(3);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [wordLength, setWordLength] = useState(0);
  const [myWord, setMyWord] = useState("");          // only for drawer
  const [wordChoices, setWordChoices] = useState<string[]>([]); // for word-choice screen
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lines, setLines] = useState<DrawLine[]>([]);
  const [endTurnWord, setEndTurnWord] = useState("");          // revealed at turn end
  const [leaderboard, setLeaderboard] = useState<Player[]>([]); // game-over screen
  const [roomId, setRoomId] = useState("");

  const addMessage = (msg: ChatMessage) =>
    setMessages((prev) => [...prev, msg]);

  useEffect(() => {
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      setMyId(socket.id ?? "");
    });


    socket.on("game-start", () => {
      setLines([]);
      setMessages([]);
      addMessage({ type: "system", message: "🎮 Game started!" });
    });

    socket.on("start-turn", ({ drawer, round, maxRounds }: {
      drawer: Player; round: number; maxRounds: number
    }) => {
      setDrawer(drawer);
      setRound(round);
      setLines([]);
      setWordLength(0);
      setMyWord("");
      setSecondsLeft(60);

      const isMe = drawer.id === socket.id;
      setPhase(isMe ? "word-choice" : "drawing");
      addMessage({
        type: "system",
        message: `✏️ ${drawer.name} is drawing…`,
      });
    });

    socket.on("word-choices", ({ words }: { words: string[] }) => {
      setWordChoices(words);
      setPhase("word-choice");
    });

    socket.on("your-word", ({ word }: { word: string }) => {
      setMyWord(word);
      setPhase("drawing");
    });

    socket.on("word-length", ({ length }: { length: number }) => {
      setWordLength(length);
    });

    socket.on("timer-tick", ({ secondsLeft }: { secondsLeft: number }) => {
      setSecondsLeft(secondsLeft);
    });

    socket.on("receive-chat", ({ message, player }: { message: string; player: Player }) => {
      addMessage({ type: "chat", player, message });
    });

    socket.on("correct-guess", ({ player, players }: { player: Player; players: Player[] }) => {
      setPlayers(players);
      addMessage({ type: "correct", player });
    });

    socket.on("updated-players", (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    });

    socket.on("end-turn", ({ word, players }: { word: string; players: Player[] }) => {
      setPlayers(players);
      setEndTurnWord(word);
      setPhase("end-turn");
      addMessage({ type: "system", message: `🔑 The word was: ${word}` });
    });

    socket.on("new-round", ({ round }: { round: number }) => {
      setRound(round);
      addMessage({ type: "system", message: `🔄 Round ${round} starting!` });
    });

    socket.on("game-over", ({ leaderboard }: { leaderboard: Player[] }) => {
      setLeaderboard(leaderboard);
      setPhase("game-over");
    });

    socket.on("game-stop", () => {
      addMessage({ type: "system", message: "⚠️ Not enough players — game paused." });
      setPhase("waiting");
    });

    socket.on("draw-line", (line: DrawLine) => {
      setLines((prev) => [...prev, line]);
    });

    socket.on("clear-canvas", () => {
      setLines([]);
    });

    socket.on("room-state", ({ players, gameStarted, drawer,wordLength,secondsLeft }) => {
      setPlayers(players)
      setDrawer(drawer)
      setWordLength(wordLength)
      setSecondsLeft(secondsLeft)

      if (gameStarted) {
        setPhase("drawing")
      } else {
        setPhase("waiting")
      }
    })

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinRoom = useCallback((name: string, room: string) => {
    setRoomId(room);
    setPhase("waiting");
    socketRef.current?.emit("join-room", { roomId: room, name });
    addMessage({ type: "system", message: `👋 You joined room "${room}"` });
  }, []);

  const sendChat = useCallback((message: string) => {
    socketRef.current?.emit("send-chat", { roomId, message })
  }, [roomId])

  const sendLine=useCallback((line:DrawLine)=>{
    setLines((prev)=>[...prev,line])
    socketRef.current?.emit("draw-line",{roomId,line})
  },[roomId])

  const clearCanvas=useCallback(()=>{
    setLines([])
    socketRef.current?.emit("clear-canvas",{roomId})
  },[roomId])

  const selectWord=useCallback((word:string)=>{
    socketRef.current?.emit("word-select",{roomId,word})
  },[roomId])

  return {

    myId, phase, players, drawer, round, maxRounds,
    secondsLeft, wordLength, myWord, wordChoices,
    messages, lines, endTurnWord, leaderboard,
    joinRoom, sendChat,sendLine,clearCanvas,selectWord
  }
}