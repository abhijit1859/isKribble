import type { Player } from "../utils/types"

type Props = {
  leaderboard: Player[]
  onPlayAgain: () => void
}

const MEDALS = ["🥇", "🥈", "🥉"]

export default function GameOver({ leaderboard, onPlayAgain }: Props) {
  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <h1 style={styles.title}>Game Over!</h1>

        <div style={styles.list}>
          {leaderboard.map((player, index) => (
            <div
              key={player.id}
              style={{
                ...styles.row,
                // Gold highlight for first place
                background:   index === 0 ? "#fefce8" : "#f9fafb",
                border:       index === 0 ? "2px solid #facc15" : "2px solid #e5e7eb",
              }}
            >
              <span style={styles.medal}>{MEDALS[index] ?? index + 1}</span>
              <span style={styles.name}>{player.name}</span>
              <span style={styles.pts}>{player.points} pts</span>
            </div>
          ))}
        </div>

        <button style={styles.button} onClick={onPlayAgain}>
          Play Again
        </button>

      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    height:         "100vh",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    background:     "#f5f5f5",
    fontFamily:     "sans-serif",
  },
  card: {
    background:   "#fff",
    border:       "2px solid #000",
    borderRadius: 16,
    padding:      "36px 32px",
    width:        380,
    boxShadow:    "4px 4px 0 #000",
    display:      "flex",
    flexDirection: "column",
    gap:          16,
  },
  title: {
    margin:     0,
    fontSize:   28,
    fontWeight: 900,
  },
  list: {
    display:       "flex",
    flexDirection: "column",
    gap:           8,
  },
  row: {
    display:      "flex",
    alignItems:   "center",
    gap:          12,
    padding:      "10px 14px",
    borderRadius: 10,
  },
  medal: {
    fontSize: 22,
    width:    28,
  },
  name: {
    flex:       1,
    fontSize:   15,
    fontWeight: 700,
  },
  pts: {
    fontSize:   15,
    fontWeight: 700,
    color:      "#555",
  },
  button: {
    padding:      "12px 0",
    background:   "#000",
    color:        "#fff",
    border:       "none",
    borderRadius: 10,
    fontSize:     16,
    fontWeight:   700,
    cursor:       "pointer",
    fontFamily:   "sans-serif",
  },
}