type Props={
    round:number;
    maxRounds:number;
    secondsLeft:number;
    wordLength:number;
    isDrawer:boolean;
    myWord:string;

}

const GameHUD:React.FC<Props>=({
    round,
    maxRounds,
    secondsLeft,
    wordLength,
    isDrawer,
    myWord
})=>{
    const blanks=wordLength>0?Array.from({length:wordLength},()=>"_").join(" "):"Waiting for word..."

    const isLowTime=secondsLeft<=10;

    return(
        <div className="flex items-center justify-center flex-wrap gap-3 px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="px-2 py-1 text-xs font-bold text-indigo-600 bg-indigo rounded-full">
                Rounde {round}/{maxRounds}
            </div>

            <div className="flex-1 text-center">
                {isDrawer&&myWord?(
                    <span className="text-xl font-extrabold tracking-widest text-slate-800 uppercase">{myWord}</span>
                ):(
                    <span className="font-mono text-xl font-semibold tracking-[0.4em] text-slate-600">{blanks}</span>
                )}
            </div>

            <div
        className={`min-w-14 text-center text-2xl font-extrabold tabular-nums transition-colors ${
          isLowTime ? "text-red-500" : "text-indigo-500"
        }`}
      >
        {secondsLeft}s
      </div>
        </div>
    )

}

export default GameHUD