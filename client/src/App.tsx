import "./App.css";

import ChatPanel from "./components/ChatBox";
import DrawingCanvas from "./components/DrawingCanvas";
import GameHUD from "./components/GameHud";
import JoinScreen from "./components/JoinScreen";
import PlayerList from "./components/PlayerList";
import WordChoiceOverlay from "./components/WordChoiceOverlay";
import WaitingRoom from "./components/WaitingPage";

import { useSocket } from "./hooks/useSocket";

function App() {
  const {
    myId,
    phase,
    joinRoom,
    messages,
    drawer,
    sendChat,
    players,
    lines,
    sendLine,
    selectWord,
    wordChoices,
    round,
    maxRounds,
    secondsLeft,
    myWord,
    wordLength,
  } = useSocket();

  const amIDrawing = drawer?.id === myId;

   if (phase === "join") {
    return <JoinScreen onJoin={joinRoom} />;
  }

  return (
  <div className="h-screen w-full overflow-hidden bg-[#F5F7FB] relative">

   
    <div
      className="absolute inset-0 opacity-[0.35] pointer-events-none"
      style={{
        backgroundImage:
          "radial-gradient(#DFE3EA 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    />

 
    <div className="
      absolute
      top-0
      left-0
      w-full
      h-48
      bg-linear-to-b
      from-white/70
      to-transparent
      pointer-events-none
    " />

    
    <div className="relative z-10 h-full overflow-hidden">

       
      {phase === "waiting" ? (
        <WaitingRoom />
      ) : (
        <div className="h-full min-h-0 overflow-hidden flex flex-col p-4 gap-4 box-border">
 
          <GameHUD
            round={round}
            maxRounds={maxRounds}
            secondsLeft={secondsLeft}
            wordLength={wordLength}
            isDrawer={amIDrawing}
            myWord={myWord}
          />
 
          <div
            className="
              flex-1
              min-h-0
              grid
              grid-cols-[260px_1fr_340px]
              gap-4
            "
          >
 
            <div className="min-h-0 overflow-hidden">
              <PlayerList
                players={players}
                drawerId={drawer?.id ?? ""}
                myId={myId}
              />
            </div>
 
            <div
              className="
                min-h-0
                bg-[#FCFCFD]
                border
                border-[#E9ECEF]
                rounded-[28px]
                overflow-hidden
              "
            >
              <DrawingCanvas
                isDrawer={amIDrawing}
                lines={lines}
                onDraw={sendLine}
              />
            </div>

         
            <div className="min-h-0 overflow-hidden">
              <ChatPanel
                messages={messages}
                isDrawer={amIDrawing}
                onSend={sendChat}
              />
            </div>
          </div>
        </div>
      )}
 
      {phase === "word-choice" &&
        amIDrawing &&
        wordChoices.length > 0 && (
          <WordChoiceOverlay
            words={wordChoices}
            onSelect={selectWord}
          />
        )}
    </div>
  </div>
);
}

export default App;