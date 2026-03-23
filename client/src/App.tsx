import "./App.css";
import ChatPanel from "./components/ChatBox";
import DrawingCanvas from "./components/DrawingCanvas";
import GameHUD from "./components/GameHud";
import bg2 from "./assets/bg2.png"

import JoinScreen from "./components/JoinScreen";
import PlayerList from "./components/PlayerList";
import WordChoiceOverlay from "./components/WordChoiceOverlay";
import { useSocket } from "./hooks/useSocket";

function App() {
  const {
    phase,
    joinRoom,
    messages,
    myId,
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

  if (phase === "join") {
    return <JoinScreen onJoin={joinRoom} />;
  }

  const amIDrawing = drawer?.id === myId;

  return (
    <div className="h-screen w-full bg-slate-100 p-3"
    style={{
        backgroundImage: `url(${bg2})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      
      {phase === "waiting" ? (
        <div className="flex items-center justify-center h-full">
          <div className="bg-white shadow-md rounded-xl p-10 text-center">
            <h1 className="text-3xl font-semibold">
              Waiting for players...
            </h1>
            <p className="mt-4 text-gray-500 font-medium">
              Invite your friends! <br />
              We need at least 2 players to start the game
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-300 mx-auto h-full flex flex-col gap-3">
          
          <GameHUD
            round={round}
            maxRounds={maxRounds}
            secondsLeft={secondsLeft}
            wordLength={wordLength}
            isDrawer={amIDrawing}
            myWord={myWord}
          />

          <div className="flex flex-1 gap-3 overflow-hidden">
            
             <div className="w-55 shrink-0 bg-white rounded-xl shadow-sm p-2 overflow-y-auto">
              <PlayerList
                players={players}
                drawerId={drawer?.id ?? ""}
                myId={myId}
              />
            </div>

          
            <div className="flex-1 bg-white  rounded-xl shadow-sm flex items-center justify-center overflow-hidden">
              <DrawingCanvas
                isDrawer={amIDrawing}
                lines={lines}
                onDraw={sendLine}
              />
            </div>

         
            <div className="w-75 shrink-0 bg-white rounded-xl shadow-sm p-2 flex flex-col">
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
  );
}

export default App;

