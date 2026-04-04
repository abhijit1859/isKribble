type Props={
    words:string[]
    onSelect:(word:string)=>void
}

const WordChoiceOverlay:React.FC<Props> = ({words,onSelect}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900/70 backdrop-blue-sm">
        <div className="w-[90%] max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center animate-[scaleIn_0.2s_ease">
            
            <h2 className="text-xl font-extrabold text-[#E87F24] mb-1">Choose a word</h2>

            <p>Pick <span className="text-[#F26076] font-semibold">one</span> - others will <span className="text-[#F26076] font-bold">try to guess it</span></p>

            <div className=" flex gap-3 mt-4">
                {words.map((word)=>(
                    <button
                    key={word}
                    onClick={()=>onSelect(word)}
                   className=" py-3 px-4 rounded-xl font-extrabold tracking-wide border-2 transition-all duration-150 hover:bg-[#FFC81E]  uppercase text-gray-600 border-slate-400 hover:border-[#FFA95A] "
                    >{word}</button>
                ))}
            </div>
        </div>
      
    </div>
  )
}

export default WordChoiceOverlay
