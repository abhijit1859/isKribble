import type { Player } from "../utils/types"
import Avatar from "./Avatar"

type Props={
  players:Player[]
  drawerId:string
  myId:string
}

const PlayerList:React.FC<Props> = ({players,drawerId,myId}) => {
  const sorted=[...players].sort((a,b)=>b.points-a.points)
  return (
    <div className="bg-white border-slate-200 rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
      <div className="px-4 py-2 border-b text-xs font-bold text-slate-500 uppercase tracking-wide bg-slate-50">
        Players
      </div>

      <div className="flex-1 overflow-y-auto py-1">

        {sorted.map((player,idx)=>{
          const isMe=player.id===myId
          const isDrawing=player.id===drawerId

          return (
            <div key={player.id}
            className={`flex items-center gap-3 px-3 py-2 transition-all ${isMe?"bg-indigo border-l-4 border-[#FCBF49]":"border-l-4 border-transparent"
              
            } hover:bg-slate-50`}
            >
              <span className="w-5 text-center text-xs font-bold text-slate-400">{idx+1}</span>
              <Avatar name={player.name} size={34} isDrawer={isDrawing}/>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-slate-800 truncate">{player.name}</span>

                  {isMe&&(
                    <span className="text-[10px] font-semibold text-[#D62828]">you</span>
                  )}
                </div>

                {isDrawing&&(
                  <div className="text-[11px] font-semibold text-[#D62828]">Drawing....</div>
                )}
              </div>

              <div className="text-sm font-semibold text-orange-500">{player.points}</div>
            </div>
          )
        })}
      </div>
      
    </div>
  )
}

export default PlayerList
