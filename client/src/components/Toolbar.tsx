import type { Tool } from "../utils/types"

const COLORS = [
  "#000000", "#ffffff", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#3b82f6", "#a855f7",
]

type Props = {
  tool: Tool
  color: string
  brushSize: number
  disabled: boolean   // true when I am NOT the drawer
  onToolChange:  (tool: Tool) => void
  onColorChange: (color: string) => void
  onSizeChange:  (size: number) => void
  onClear:       () => void
}

export default function Toolbar({
  tool, color, brushSize, disabled,
  onToolChange, onColorChange, onSizeChange, onClear
}: Props) {
  return (
    <div style={styles.toolbar}>

      {/* Tool buttons */}
      <div style={styles.group}>
        {(["pen", "eraser", "fill"] as Tool[]).map(t => (
          <button
            key={t}
            style={{
              ...styles.toolBtn,
              // Highlight the active tool
              background: tool === t ? "#000" : "#fff",
              color:      tool === t ? "#fff" : "#000",
            }}
            onClick={() => onToolChange(t)}
            disabled={disabled}
          >
            {t === "pen" ? "✏ Pen" : t === "eraser" ? "◻ Eraser" : "⬛ Fill"}
          </button>
        ))}
      </div>

      <div style={styles.divider} />

      {/* Color swatches */}
      <div style={styles.group}>
        {COLORS.map(c => (
          <button
            key={c}
            style={{
              ...styles.swatch,
              background: c,
              // Show a ring around the selected color
              outline: color === c ? "3px solid #000" : "2px solid #ccc",
              outlineOffset: color === c ? "2px" : "0px",
            }}
            onClick={() => onColorChange(c)}
            disabled={disabled}
          />
        ))}
      </div>

      <div style={styles.divider} />

      {/* Brush size slider */}
      <div style={styles.group}>
        <span style={styles.label}>Size</span>
        <input
          type="range"
          min={1} max={24} step={1}
          value={brushSize}
          onChange={e => onSizeChange(Number(e.target.value))}
          disabled={disabled}
          style={{ width: 80 }}
        />
        {/* Preview dot showing current size + color */}
        <div style={{
          width:      Math.max(6, brushSize),
          height:     Math.max(6, brushSize),
          background: color,
          borderRadius: "50%",
          border:     "2px solid #000",
          flexShrink: 0,
        }} />
      </div>

      <div style={styles.divider} />

      {/* Clear canvas button */}
      <button
        style={styles.clearBtn}
        onClick={onClear}
        disabled={disabled}
      >
        🗑 Clear
      </button>

    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    display:    "flex",
    flexWrap:   "wrap",
    alignItems: "center",
    gap:        10,
    padding:    "10px 12px",
    background: "#fff",
    border:     "2px solid #000",
    borderRadius: 12,
    boxShadow:  "3px 3px 0 #000",
  },
  group: {
    display:    "flex",
    alignItems: "center",
    gap:        6,
  },
  divider: {
    width:      1,
    height:     28,
    background: "#ddd",
  },
  toolBtn: {
    padding:      "5px 10px",
    border:       "2px solid #000",
    borderRadius: 8,
    cursor:       "pointer",
    fontFamily:   "sans-serif",
    fontSize:     12,
    fontWeight:   700,
  },
  swatch: {
    width:        22,
    height:       22,
    borderRadius: 6,
    cursor:       "pointer",
    border:       "none",
    transition:   "outline 0.1s",
  },
  label: {
    fontSize:   11,
    color:      "#999",
    fontFamily: "sans-serif",
  },
  clearBtn: {
    padding:      "5px 10px",
    background:   "#fff",
    color:        "#e00",
    border:       "2px solid #faa",
    borderRadius: 8,
    cursor:       "pointer",
    fontFamily:   "sans-serif",
    fontSize:     12,
    fontWeight:   700,
  },
}