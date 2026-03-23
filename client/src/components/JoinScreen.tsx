import { useState } from "react"
import { PaintBucket } from "lucide-react"
import bg from "../assets/bg.png"
import Avatar from "./Avatar"
const JoinScreen = ({ onJoin }: { onJoin: (name: string, room: string) => void }) => {
  const [name, setName] = useState("")
  const [room, setRoom] = useState("room1")
  const [error, setError] = useState("")

  const handleJoin = () => {
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters")
      return
    }

    if (room.trim().length < 1) {
      setError("Room code can't be empty")
      return
    }

    setError("")
    onJoin(name.trim(), room.trim())
  }

  return (
    <div
      className="w-full h-screen flex justify-center items-center"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-5">

       
        <div className="flex justify-center">
          {name.trim().length>=1?(<div
          className="m-5 flex justify-center "
          >
            <Avatar name={name} size={64} showName/>
          </div>):(   <div className="p-4 rounded-xl border border-neutral-200 shadow-sm bg-gray-50">
            <PaintBucket size={40} className="text-red-500" />
          </div>)}
       
        </div>

         {/* {name.trim().length>=1&&(
          
         )} */}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">What's your name?</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mr.Snake"
            maxLength={20}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>


        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Room Code</label>
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="e.g. room1"
            maxLength={20}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}


        <button
          onClick={handleJoin}
          className="w-full py-2 rounded-lg bg-violet-400 text-white font-medium 
                     hover:bg-violet-600 transition duration-200"
        >
          Join Game
        </button>

      </div>
    </div>
  )
}

export default JoinScreen