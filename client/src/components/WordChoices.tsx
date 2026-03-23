type Props={
    words:string[]
    onSelect:(word:string)=>void
}


const WordChoices = ({words,onSelect}:Props) => {
  return (
    <div>
      <div>
        <h2>Pick a word to draw</h2>
        <div>
            {words.map(word=>(
                <button key={word} onClick={()=>onSelect(word)}>{word}</button>
            ))}
        </div>
      </div>
    </div>
  )
}

export default WordChoices
