import { useEffect, useRef, useState } from "react"
import type { ChatMessage } from "../utils/types"
import Avatar from "./Avatar"

type Props = {
  messages: ChatMessage[]
  isDrawer: boolean
  onSend: (msg: string) => void
}

const ChatPanel: React.FC<Props> = ({ messages, isDrawer, onSend }) => {
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const submit = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    onSend(trimmed)
    setInput("")
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submit()
  }

  return (
    <div className="flex flex-col h-full max-h-[600px] w-full bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      
     
      <div className="px-3 py-2 border-b text-xs font-bold text-slate-500 uppercase bg-white">
        💬 Chat & Guess
      </div>
 
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg, i) => (
          <MessageRow key={i} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      
      <div className="flex p-2 border-t bg-white gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={isDrawer}
          placeholder={isDrawer ? "You're drawing 🎨" : "Type guess..."}
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-100"
        />
        <button
          onClick={submit}
          disabled={isDrawer}
          className="px-4 py-2 rounded-lg bg-indigo-500 text-white font-bold hover:bg-indigo-600 disabled:bg-slate-300"
        >
          ➤
        </button>
      </div>
    </div>
  )
}

 
const MessageRow: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
 
  if (msg.type === "system") {
    return (
      <div className="text-center text-xs text-slate-400 italic">
        {msg.message}
      </div>
    )
  }

 
  if (msg.type === "correct") {
    return (
      <div className="flex items-center gap-2 bg-green-100 text-green-700 px-2 py-1 rounded-lg text-sm font-semibold">
        <Avatar name={msg.player!.name} size={24} />
        🎉 {msg.player!.name} guessed it!
      </div>
    )
  }

  
  return (
    <div className="flex items-start gap-2">
      <Avatar name={msg.player!.name} size={26} />
      <div>
        <span className="text-xs font-bold text-indigo-500">
          {msg.player!.name}
        </span>
        <div className="text-sm text-slate-700 leading-snug">
          {msg.message}
        </div>
      </div>
    </div>
  )
}

export default ChatPanel