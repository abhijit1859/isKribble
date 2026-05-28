import { useState } from "react"
import { X } from "lucide-react"

const JoinScreen = ({ onJoin }) => {
  const [name, setName] = useState("")
  const [roomName, setRoomName] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}

    if (!name.trim()) {
      newErrors.name = "Username is required"
    } else if (name.trim().length < 3) {
      newErrors.name = "Minimum 3 characters"
    } else if (name.trim().length > 12) {
      newErrors.name = "Maximum 12 characters"
    }

    if (!roomName.trim()) {
      newErrors.room = "Room name is required"
    } else if (roomName.trim().length < 4) {
      newErrors.room = "Minimum 4 characters"
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const startGame = (e) => {
    e.preventDefault()

    if (!validate()) return

    onJoin(name.trim(), roomName.trim())
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#FFF8E7] relative text-[#2B2B2B]">

      <section className="grid lg:grid-cols-2 px-6 py-20 gap-16 items-center mx-auto max-w-6xl">

        
        <div>

          <p className="text-sm font-extrabold text-red-600 uppercase tracking-wider mb-6">
            Multiplayer Drawing Chaos
          </p>

          <h1 className="hero-text text-7xl md:text-8xl font-extrabold leading-none">
            DRAW.
            <br />
            GUESS.
            <br />
            CHAOS.
          </h1>

          <p className="hero-text mt-6 text-2xl text-[#555] max-w-lg font-semibold">
            The chaotic multiplayer drawing game where bad drawings create the best moments.
          </p>

          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-200 hover:bg-amber-300 cursor-pointer transition-all duration-300 mt-8 px-10 py-5 border-4 border-black rounded-[4rem] hover:-translate-y-1 hover:shadow-[6px_6px_0px_black] active:translate-y-1 active:shadow-none font-black text-lg"
          >
            Join Game
          </button>
        </div>

     
        <div className="bg-white border-black p-6 border-4 rounded-[4xl rotate-1 shadow-[10px_10px_0px_black]">

          <div className="flex items-center justify-between">
            <div>
              <p className="font-extrabold text-xl">Room: banana123</p>
              <p className="font-bold text-gray-400">Round: 2/3</p>
            </div>

            <div className="px-5 py-3 border-3 border-black rounded-xl text-white bg-red-500 font-black">
              60s
            </div>
          </div>

          <div className="bg-[#FFF3BF] mt-6 rounded-4xl border-4 border-black h-80"></div>
        </div>
      </section>

 
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">

          <div className="w-full border-4 border-black p-7 bg-[#FFF8E7] rounded-4xl max-w-md relative shadow-[12px_12px_0px_black] animate-in zoom-in-95 duration-200">

       
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 bg-white hover:bg-red-100 border-3 border-black rounded-full p-2 transition-all hover:rotate-12"
            >
              <X size={24} strokeWidth={3} />
            </button>
 
            <h2 className="text-4xl font-black text-center">
              Join the Chaos
            </h2>

            <p className="text-center text-gray-500 font-semibold mt-2">
              Enter a room and start drawing badly.
            </p>

           
            <form
              onSubmit={startGame}
              className="mt-8 space-y-6"
            >

              
              <div>
                <label className="font-black text-lg block mb-2">
                  Username
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setErrors((prev) => ({ ...prev, name: "" }))
                  }}
                  placeholder="slayer100"
                  maxLength={12}
                  className={`w-full border-4 rounded-2xl text-xl font-bold px-5 py-4 outline-none transition-all
                    ${
                      errors.name
                        ? "border-red-500 focus:ring-red-300"
                        : "border-black focus:ring-[#FF6B6B]/30"
                    }
                    focus:ring-4`}
                />

                {errors.name && (
                  <p className="text-red-500 font-bold mt-2">
                    {errors.name}
                  </p>
                )}
              </div>

           
              <div>
                <label className="font-black text-lg block mb-2">
                  Room Name
                </label>

                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => {
                    setRoomName(e.target.value)
                    setErrors((prev) => ({ ...prev, room: "" }))
                  }}
                  placeholder="room45"
                  className={`w-full border-4 rounded-2xl text-xl font-bold px-5 py-4 outline-none transition-all
                    ${
                      errors.room
                        ? "border-red-500 focus:ring-red-300"
                        : "border-black focus:ring-[#FF6B6B]/30"
                    }
                    focus:ring-4`}
                />

                {errors.room && (
                  <p className="text-red-500 font-bold mt-2">
                    {errors.room}
                  </p>
                )}
              </div>
 
              <button
                type="submit"
                disabled={!name.trim() || !roomName.trim()}
                className="w-full mt-2 bg-[#FFD54A] disabled:opacity-50 disabled:cursor-not-allowed border-4 border-black rounded-2xl px-6 py-4 text-2xl font-black shadow-[6px_6px_0px_black] active:translate-y-2 active:shadow-none hover:-translate-y-1 hover:shadow-[8px_8px_0px_black] transition-all"
              >
                Enter Room
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default JoinScreen