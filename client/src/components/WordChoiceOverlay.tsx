type Props={
    words:string[]
    onSelect:(word:string)=>void
}

const WordChoiceOverlay:React.FC<Props> = ({words,onSelect}) => {
  return (
    <div className="fixed inset-0 items-center justify-center bg-slate-900/70 backdrop-blue-sm">
        <div className="w-[90%] max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center animate-[scaleIn_0.2s_ease">
            <div></div>
            <h2 className="text-xl font-extrabold text-slate-800 mb-1">Choose a word</h2>

            <p>Pick one - others will try to guess it</p>

            <div className="flex flex-col gap-3">
                {words.map((word)=>(
                    <button
                    key={word}
                    onClick={()=>onSelect(word)}
                   className=" py-3 px-4 rounded-xl font-extrabold tracking-wide border-2 border-slate-200 text-slate-800 transition-all duration-150 hover:bg-linear-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-whote hover:border-tranparent  uppercase"
                    >{word}</button>
                ))}
            </div>
        </div>
      
    </div>
  )
}

export default WordChoiceOverlay
