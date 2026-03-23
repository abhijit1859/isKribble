import { useState } from "react"

interface Props{
    onJoin:(name:string)=>void
}
const Lobby = ({onJoin}:Props) => {
    
    const [name,setName]=useState("")
    const [error,setError]=useState(false)
    const [joining,setJoining]=useState(false)

    const handleJoin=()=>{
        if(!name.trim()){
            setError(true)
            return
        }

        setJoining(true)
        onJoin(name.trim())
    }

    const handleKey=(e:KeyboardEvent<HTMLInputElement>)=>{
        if(e.key==="ENTER") handleJoin()
    }
  return (
    <div>
        <div>
            
            <div>
                <h1>Scribble</h1>
                <p>
                    Drawing Game
                </p>
            </div>

            <div>
                <label htmlFor="">Your name</label>
                <input type="text" 
                value={name}
                onChange={e=>setName(e.target.value)
                }
                onKeyDown={handleKey}
                maxLength={20}
                autoFocus
                
                />
                {error&&<p>Please enter name</p>}
                <button onClick={handleJoin}>
                    {joining?"Joining...":"Join game"}
                </button>
            </div>
        </div>
      
    </div>
  )
}

export default Lobby
