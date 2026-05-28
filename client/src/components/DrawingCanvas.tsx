import React, { useRef, useEffect, useState } from "react";
import type { DrawLine } from "../utils/types";

type Props = {
  isDrawer: boolean;
  lines: DrawLine[];
  onDraw: (line: DrawLine) => void;
};

const COLORS = [
  "#2B2B2B",
  "#FF6B6B",
  "#FFD54A",
  "#74C0FC",
  "#8CE99A",
  "#B197FC",
  "#F4A261",
  "#FFFFFF",
];

const WIDTHS = [4, 8, 14, 22];

const DrawingCanvas: React.FC<Props> = ({
  isDrawer,
  lines,
  onDraw,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isDrawingRef = useRef(false);

  const lastPos = useRef({ x: 0, y: 0 });

  const [color, setColor] = useState("#2B2B2B");

  const [width, setWidth] = useState(8);

  /* DRAW EXISTING LINES */
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#FFFDF7";
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

  /* GET POSITION */
  const getPos = (
    e: React.MouseEvent | React.TouchEvent
  ) => {
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

  /* START DRAW */
  const startDraw = (
    e: React.MouseEvent | React.TouchEvent
  ) => {
    if (!isDrawer) return;

    isDrawingRef.current = true;

    lastPos.current = getPos(e);
  };

  /* DRAW */
  const draw = (
    e: React.MouseEvent | React.TouchEvent
  ) => {
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

  /* STOP DRAW */
  const stopDraw = () => {
    isDrawingRef.current = false;
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 bg-[#FFF8E7]">

      {/* CANVAS */}
      <div className="flex-1 bg-white border-4 border-black rounded-[2rem] shadow-[6px_6px_0px_black] overflow-hidden relative">

        {/* BADGE */}
        <div className="absolute top-4 left-4 z-10 bg-[#FFD54A] border-4 border-black rounded-2xl px-4 py-2 shadow-[3px_3px_0px_black]">
          <p className="text-sm font-black text-[#2B2B2B]">
            {isDrawer
              ? "Your turn to draw ✏️"
              : "Watch carefully 👀"}
          </p>
        </div>

        <canvas
          ref={canvasRef}
          width={900}
          height={650}
          className={`
            w-full
            h-full
            touch-none
            ${isDrawer ? "cursor-crosshair" : "cursor-not-allowed"}
          `}
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
        <div className="bg-white border-4 border-black rounded-[1.5rem] shadow-[6px_6px_0px_black] px-5 py-4 flex items-center justify-between flex-wrap gap-4">

          {/* COLORS */}
          <div className="flex items-center gap-3 flex-wrap">

            <p className="text-sm font-black text-[#2B2B2B]">
              Colors
            </p>

            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`
                    w-8
                    h-8
                    rounded-full
                    border-4
                    transition-all
                    ${
                      color === c
                        ? "border-black scale-110"
                        : "border-gray-300"
                    }
                  `}
                  style={{
                    background: c,
                  }}
                />
              ))}
            </div>
          </div>

       
          <div className="flex items-center gap-3">

            <p className="text-sm font-black text-[#2B2B2B]">
              Brush
            </p>

            <div className="flex gap-2">
              {WIDTHS.map((w) => (
                <button
                  key={w}
                  onClick={() => setWidth(w)}
                  className={`
                    rounded-full
                    border-4
                    border-black
                    bg-white
                    flex
                    items-center
                    justify-center
                    transition-all
                    ${
                      width === w
                        ? "scale-110 bg-[#FFD54A]"
                        : ""
                    }
                  `}
                  style={{
                    width: w + 18,
                    height: w + 18,
                  }}
                >
                  <div
                    className="rounded-full bg-[#2B2B2B]"
                    style={{
                      width: w,
                      height: w,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawingCanvas;