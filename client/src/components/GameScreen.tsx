import { useState } from "react"
import { useCanvas } from "../hooks/useCanvas"
import Toolbar      from "./Toolbar"
import PlayerList   from "./PlayerList"
import ChatBox      from "./ChatBox"
import WordChoices  from "./WordChoices"
import type { Player, ChatMessage, Tool } from "../utils/types"

type Props = {
  // Who / where
  myId:       string
  players:    Player[]
  drawer:     Player | null
  iAmDrawer:  boolean
  // Turn info
  round:      number
  maxRounds:  number
  timer:      number
  wordLength: number | null   // number of letters in the word
  myWord:     string | null   // only set for the drawer
  wordChoices: string[]       // 3 options shown to drawer before they pick
  // Chat
  messages:   ChatMessage[]
  // Actions
  onWordSelect: (word: string) => void
  onSendChat:   (msg: string) => void
}

export default function GameScreen({
  myId, players, drawer, iAmDrawer,
  round, maxRounds, timer,
  wordLength, myWord, wordChoices,
  messages, onWordSelect, onSendChat,
}: Props) {

  // Drawing toolbar state lives here (only GameScreen + Toolbar need it)
  const [tool,      setTool]      = useState<Tool>("pen")
  const [color,     setColor]     = useState("#000000")
  const [brushSize, setBrushSize] = useState(4)

  // Get the canvas ref + clear handler from the hook
  const { canvasRef, handleClear } = useCanvas({ iAmDrawer, tool, color, brushSize })

  // Timer turns red under 10 seconds
  const timerColor =
    timer > 30 ? "#16a34a" :
    timer > 10 ? "#d97706" : "#dc2626"

  // Build the word hint: "_ _ _ _" for a 4-letter word
  const wordHint = wordLength
    ? Array(wordLength).fill("_").join(" ")
    : "Waiting…"

  return (
    <div style={styles.page}>

      {/* ── Top bar ── */}
      <div style={styles.topbar}>
        <span style={styles.logo}>✏ Scribble</span>

        <div style={styles.topCenter}>
          <span style={styles.roundInfo}>Round {round} / {maxRounds}</span>
          <span style={styles.hint}>
            {/* Drawer sees their word, others see blanks */}
            {iAmDrawer && myWord ? `Your word: ${myWord}` : wordHint}
          </span>
        </div>

        {/* Timer */}
        <span style={{ ...styles.timer, color: timerColor }}>
          ⏱ {timer}s
        </span>
      </div>

      {/* ── Main content ── */}
      <div style={styles.content}>

        {/* ── Left: canvas + toolbar ── */}
        <div style={styles.canvasArea}>

          {/* Info line above canvas */}
          <p style={styles.drawerInfo}>
            {drawer ? `${drawer.name} is drawing` : "Waiting for players…"}
            {iAmDrawer && <strong> (that's you!)</strong>}
          </p>

          {/* Canvas wrapper — position:relative so WordChoices overlay works */}
          <div style={styles.canvasWrap}>
            <canvas
              ref={canvasRef}
              width={700}
              height={380}
              style={{
                ...styles.canvas,
                cursor: iAmDrawer ? "crosshair" : "default",
              }}
            />

            {/* Word choices modal — only visible when server sends 3 options */}
            {iAmDrawer && wordChoices.length > 0 && (
              <WordChoices words={wordChoices} onSelect={onWordSelect} />
            )}
          </div>

          {/* Toolbar below canvas */}
          <Toolbar
            tool={tool}
            color={color}
            brushSize={brushSize}
            disabled={!iAmDrawer}
            onToolChange={setTool}
            onColorChange={c => { setColor(c); setTool("pen") }}
            onSizeChange={setBrushSize}
            onClear={handleClear}
          />
        </div>

        {/* ── Right: sidebar ── */}
        <div style={styles.sidebar}>
          <PlayerList
            players={players}
            drawerId={drawer?.id ?? ""}
            myId={myId}
          />
          <ChatBox
            messages={messages}
            disabled={iAmDrawer}
            onSendChat={onSendChat}
          />
        </div>

      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    height:        "100vh",
    display:       "flex",
    flexDirection: "column",
    background:    "#f3f4f6",
    fontFamily:    "sans-serif",
  },
  // top bar
  topbar: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    padding:        "8px 16px",
    background:     "#000",
    color:          "#fff",
    borderBottom:   "3px solid #facc15",
    flexShrink:     0,
  },
  logo: {
    fontWeight: 900,
    fontSize:   20,
    color:      "#facc15",
  },
  topCenter: {
    display:    "flex",
    alignItems: "center",
    gap:        16,
  },
  roundInfo: {
    fontSize:  12,
    color:     "#999",
    letterSpacing: 1,
  },
  hint: {
    fontSize:   16,
    fontWeight: 700,
    letterSpacing: 4,
    color:      "#fff",
  },
  timer: {
    fontWeight: 900,
    fontSize:   16,
    transition: "color 0.3s",
  },
  // main layout
  content: {
    flex:     1,
    display:  "flex",
    overflow: "hidden",
  },
  // canvas side
  canvasArea: {
    flex:          1,
    display:       "flex",
    flexDirection: "column",
    padding:       10,
    gap:           8,
    minWidth:      0,
  },
  drawerInfo: {
    margin:   0,
    fontSize: 13,
    color:    "#555",
  },
  canvasWrap: {
    position:     "relative",  // needed for the WordChoices overlay
    flex:         1,
    borderRadius: 12,
    border:       "3px solid #000",
    boxShadow:    "4px 4px 0 #000",
    overflow:     "hidden",
    background:   "#fff",
    minHeight:    260,
  },
  canvas: {
    display: "block",
    width:   "100%",
    height:  "100%",
  },
  // sidebar
  sidebar: {
    width:         230,
    borderLeft:    "2px solid #000",
    background:    "#fff",
    display:       "flex",
    flexDirection: "column",
    overflow:      "hidden",
  },
}