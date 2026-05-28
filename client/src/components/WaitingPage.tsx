import { useEffect, useRef } from "react";

const WaitingRoom = () => {
  const practiceCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawing = useRef(false);

  useEffect(() => {
    const canvas = practiceCanvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#2B2B2B";
    ctx.lineWidth = 4;
  }, []);

  const getCoords = (
    e: React.MouseEvent<HTMLCanvasElement>
  ) => {
    const canvas = practiceCanvasRef.current!;

    const rect = canvas.getBoundingClientRect();

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startPracticeDrawing = (
    e: React.MouseEvent<HTMLCanvasElement>
  ) => {
    drawing.current = true;

    const canvas = practiceCanvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const { x, y } = getCoords(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawPractice = (
    e: React.MouseEvent<HTMLCanvasElement>
  ) => {
    if (!drawing.current) return;

    const canvas = practiceCanvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const { x, y } = getCoords(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopPracticeDrawing = () => {
    drawing.current = false;
  };

  const clearPracticeCanvas = () => {
    const canvas = practiceCanvasRef.current!;

    const ctx = canvas.getContext("2d")!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="h-full w-full bg-[#FFF8E7] flex items-center justify-center px-6">

      <div className="w-full max-w-6xl grid grid-cols-[360px_1fr] gap-6">


        <div className="bg-white border-4 border-black rounded-[2rem] shadow-[6px_6px_0px_black] p-8 h-fit">





          <h1 className="text-3xl font-black text-[#2B2B2B] leading-tight">
            Waiting for
            <br />
            players...
          </h1>


          <p className="mt-4 text-sm font-semibold text-gray-500 leading-relaxed">
            Need 2 or more players to start the game.
            Practice your drawing skills while waiting.
          </p>


          <div className="mt-8 bg-[#FFF3BF] border-4 border-black rounded-2xl px-5 py-4 shadow-[4px_4px_0px_black]">

            <p className="text-sm font-black text-[#2B2B2B]">
              Lobby Status
            </p>

            <div className="flex items-center gap-2 mt-3">

              <div className="w-3 h-3 rounded-full bg-[#8CE99A] animate-pulse"></div>

              <p className="font-bold text-sm text-gray-700">
                Waiting for players...
              </p>

            </div>
          </div>


          <div className="flex gap-2 mt-8">

            <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B] animate-bounce"></div>

            <div className="w-2.5 h-2.5 rounded-full bg-[#FFD54A] animate-bounce [animation-delay:150ms]"></div>

            <div className="w-2.5 h-2.5 rounded-full bg-[#74C0FC] animate-bounce [animation-delay:300ms]"></div>

          </div>
        </div>


        <div className="bg-white border-4 border-black rounded-[2rem] shadow-[6px_6px_0px_black] overflow-hidden flex flex-col">


          <div className="h-16 border-b-4 border-black bg-[#FFD54A] flex items-center justify-between px-6">

            <div>
              <h2 className="font-black text-[#2B2B2B]">
                Practice Canvas
              </h2>

              <p className="text-xs font-semibold text-gray-700">
                freestyle mode
              </p>
            </div>

            <button
              onClick={clearPracticeCanvas}
              className="bg-white border-2 border-black rounded-xl px-4 py-2 text-sm font-black shadow-[3px_3px_0px_black] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              Clear
            </button>
          </div>

          {/* CANVAS */}
          <div className="flex-1 bg-[#FFFDF7] relative">

            <canvas
              ref={practiceCanvasRef}
              onMouseDown={startPracticeDrawing}
              onMouseMove={drawPractice}
              onMouseUp={stopPracticeDrawing}
              onMouseLeave={stopPracticeDrawing}
              className="w-full h-full cursor-crosshair"
            />


            <div className="absolute bottom-4 right-4 bg-white border-2 border-black rounded-xl px-3 py-2 text-xs font-bold shadow-[3px_3px_0px_black]">
              draw anything ✏️
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;