 

import React, { useRef, useEffect, useState } from "react";
import type{ DrawLine } from "../utils/types";

type Props = {
  isDrawer: boolean;
  lines: DrawLine[];         
  onDraw: (line: DrawLine) => void;
};

const COLORS = [
  "#1a1a2e", "#e63946", "#f4a261", "#2a9d8f",
  "#457b9d", "#8338ec", "#ff006e", "#06d6a0",
  "#ffffff", "#adb5bd",
];
const WIDTHS = [3, 6, 12, 20];

const DrawingCanvas: React.FC<Props> = ({ isDrawer, lines, onDraw }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const [color, setColor] = useState("#1a1a2e");
  const [width, setWidth] = useState(6);

 
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    lines.forEach((line) => {
      ctx.beginPath();
      ctx.moveTo(line.x0, line.y0);
      ctx.lineTo(line.x1, line.y1);
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    });
  }, [lines]);

  
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawer) return;
    isDrawingRef.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawer || !isDrawingRef.current) return;
    e.preventDefault();

    const pos = getPos(e);
    const line: DrawLine = {
      x0: lastPos.current.x,
      y0: lastPos.current.y,
      x1: pos.x,
      y1: pos.y,
      color,
      width,
    };
    onDraw(line);
    lastPos.current = pos;
  };

  const stopDraw = () => {
    isDrawingRef.current = false;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    
      <div
        style={{
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          border: "2.5px solid #e2e8f0",
          cursor: isDrawer ? "crosshair" : "not-allowed",
          background: "#fff",
        }}
      >
        <canvas
          ref={canvasRef}
          width={700}
          height={550}
          style={{ display: "block", width: "100%", touchAction: "none" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>

      {isDrawer && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "#f8fafc",
            borderRadius: 12,
            padding: "8px 14px",
            border: "1.5px solid #e2e8f0",
            flexWrap: "wrap",
          }}
        >
    
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: c,
                  border: color === c ? "3px solid #6366f1" : "2px solid #cbd5e0",
                  cursor: "pointer",
                  transition: "transform 0.1s",
                  transform: color === c ? "scale(1.25)" : "scale(1)",
                }}
              />
            ))}
          </div>

      
          <div style={{ width: 1, height: 28, background: "#e2e8f0" }} />

       
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {WIDTHS.map((w) => (
              <button
                key={w}
                onClick={() => setWidth(w)}
                style={{
                  width: w + 14,
                  height: w + 14,
                  borderRadius: "50%",
                  background: width === w ? "#6366f1" : "#cbd5e0",
                  border: "none",
                  cursor: "pointer",
                  transition: "background 0.15s",
                  minWidth: 16,
                  minHeight: 16,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawingCanvas;