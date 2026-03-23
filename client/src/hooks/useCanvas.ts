import { useEffect, useRef } from "react"
import socket from "../utils/socket"
import type { Tool } from "../utils/types"

type Props = {
  iAmDrawer: boolean
  tool: Tool
  color: string
  brushSize: number
}

export function useCanvas({ iAmDrawer, tool, color, brushSize }: Props) {

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Track whether the mouse is held down
  const isDrawing = useRef(false)
  const lastX = useRef(0)
  const lastY = useRef(0)

  // ── Helper: draw a line on the canvas ─────────────────────────────────────
  function drawLine(
    x1: number, y1: number,
    x2: number, y2: number,
    lineColor: string,
    lineSize: number
  ) {
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return

    ctx.strokeStyle = lineColor
    ctx.lineWidth   = lineSize
    ctx.lineCap     = "round"  // rounded ends look nicer
    ctx.lineJoin    = "round"

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  // ── Helper: fill the whole canvas with a color ────────────────────────────
  function fillCanvas(fillColor: string) {
    const canvas = canvasRef.current
    const ctx    = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.fillStyle = fillColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  // ── Helper: clear the whole canvas ────────────────────────────────────────
  function clearCanvas() {
    const canvas = canvasRef.current
    const ctx    = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  // ── Helper: get mouse position relative to canvas ─────────────────────────
  function getMousePos(e: MouseEvent) {
    const canvas = canvasRef.current!
    const rect   = canvas.getBoundingClientRect()

    // Scale mouse position in case CSS resizes the canvas
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY,
    }
  }

  // ── Attach mouse event listeners to the canvas ────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function onMouseDown(e: MouseEvent) {
      if (!iAmDrawer) return

      const pos = getMousePos(e)

      // Fill tool: just fill and emit, no dragging needed
      if (tool === "fill") {
        fillCanvas(color)
        socket.emit("fill", { color })
        return
      }

      // Pen or eraser: start drawing
      isDrawing.current = true
      lastX.current = pos.x
      lastY.current = pos.y
    }

    function onMouseMove(e: MouseEvent) {
      if (!isDrawing.current || !iAmDrawer) return

      const pos = getMousePos(e)

      // Eraser uses white, pen uses the selected color
      const lineColor = tool === "eraser" ? "#ffffff" : color
      const lineSize  = tool === "eraser" ? brushSize * 3 : brushSize

      // Draw locally
      drawLine(lastX.current, lastY.current, pos.x, pos.y, lineColor, lineSize)

      // Send to other players
      socket.emit("draw", {
        x1: lastX.current,
        y1: lastY.current,
        x2: pos.x,
        y2: pos.y,
        color: lineColor,
        size: lineSize,
      })

      // Update last position
      lastX.current = pos.x
      lastY.current = pos.y
    }

    function onMouseUp()    { isDrawing.current = false }
    function onMouseLeave() { isDrawing.current = false }

    canvas.addEventListener("mousedown",  onMouseDown)
    canvas.addEventListener("mousemove",  onMouseMove)
    canvas.addEventListener("mouseup",    onMouseUp)
    canvas.addEventListener("mouseleave", onMouseLeave)

    return () => {
      canvas.removeEventListener("mousedown",  onMouseDown)
      canvas.removeEventListener("mousemove",  onMouseMove)
      canvas.removeEventListener("mouseup",    onMouseUp)
      canvas.removeEventListener("mouseleave", onMouseLeave)
    }
  }, [iAmDrawer, tool, color, brushSize]) // re-run if any of these change

  // ── Listen for drawing events from other players ──────────────────────────
  useEffect(() => {
    socket.on("draw", (data: { x1: number; y1: number; x2: number; y2: number; color: string; size: number }) => {
      drawLine(data.x1, data.y1, data.x2, data.y2, data.color, data.size)
    })

    socket.on("fill", (data: { color: string }) => {
      fillCanvas(data.color)
    })

    socket.on("clear-canvas", () => {
      clearCanvas()
    })

    // Clear canvas at the start of every new turn
    socket.on("start-turn", () => {
      clearCanvas()
    })

    return () => {
      socket.off("draw")
      socket.off("fill")
      socket.off("clear-canvas")
      socket.off("start-turn")
    }
  }, [])

  // ── Clear button handler (called from Toolbar) ─────────────────────────────
  function handleClear() {
    if (!iAmDrawer) return
    clearCanvas()
    socket.emit("clear-canvas")
  }

  return { canvasRef, handleClear }
}