type Props = {
  round: number;
  maxRounds: number;
  secondsLeft: number;
  wordLength: number;
  isDrawer: boolean;
  myWord: string;
};

const GameHUD: React.FC<Props> = ({
  round,
  maxRounds,
  secondsLeft,
  wordLength,
  isDrawer,
  myWord,
}) => {
  const blanks =
    wordLength > 0
      ? Array.from({ length: wordLength }, () => "_").join(" ")
      : "Waiting for word...";

  const isLowTime = secondsLeft <= 10;

  return (
    <div className="flex items-center gap-4 px-5 py-4 bg-white border-4 border-black rounded-[1.5rem] shadow-[6px_6px_0px_black]">

      {/* ROUND */}
      <div className="bg-[#FFD54A] border-4 border-black rounded-2xl px-4 py-2 shadow-[3px_3px_0px_black]">

        <p className="text-xs font-black text-[#5c4b00] uppercase tracking-wide">
          Round
        </p>

        <p className="text-lg font-black text-[#2B2B2B]">
          {round}/{maxRounds}
        </p>
      </div>

      {/* WORD */}
      <div className="flex-1 flex justify-center">

        {isDrawer && myWord ? (
          <div className="bg-[#FFF3BF] border-4 border-black rounded-2xl px-6 py-3 shadow-[3px_3px_0px_black]">

            <span className="text-2xl font-black tracking-[0.2em] text-[#2B2B2B] uppercase">
              {myWord}
            </span>

          </div>
        ) : (
          <div className="bg-[#F8F9FA] border-4 border-black rounded-2xl px-6 py-3 shadow-[3px_3px_0px_black]">

            <span className="font-mono text-2xl font-black tracking-[0.35em] text-[#495057]">
              {blanks}
            </span>

          </div>
        )}
      </div>

      {/* TIMER */}
      <div
        className={`
          min-w-[85px]
          text-center
          border-4
          border-black
          rounded-2xl
          px-4
          py-2
          shadow-[3px_3px_0px_black]
          ${
            isLowTime
              ? "bg-[#FF6B6B] text-white"
              : "bg-[#74C0FC] text-[#2B2B2B]"
          }
        `}
      >

        <p className="text-xs font-black uppercase tracking-wide">
          Time
        </p>

        <p className="text-2xl font-black tabular-nums">
          {secondsLeft}s
        </p>
      </div>
    </div>
  );
};

export default GameHUD;