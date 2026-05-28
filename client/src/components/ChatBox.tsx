import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../utils/types";
import Avatar from "./Avatar";

type Props = {
  messages: ChatMessage[];
  isDrawer: boolean;
  onSend: (msg: string) => void;
};

const ChatPanel: React.FC<Props> = ({
  messages,
  isDrawer,
  onSend,
}) => {
  const [input, setInput] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const submit = () => {
    const trimmed = input.trim();

    if (!trimmed) return;

    onSend(trimmed);

    setInput("");
  };

  const handleKey = (
    e: React.KeyboardEvent
  ) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div className="
      flex
      flex-col
      h-full
      bg-white
      rounded-[24px]
      border
      border-[#E9ECEF]
      overflow-hidden
    ">

       
      <div className="
        px-5
        py-4
        border-b
        border-[#E9ECEF]
        bg-[#FFFDF7]
      ">
        <p className="font-semibold text-[#2B2B2B]">
          Chat
        </p>
      </div>

     
      <div className="
        flex-1
        overflow-y-auto
        px-4
        py-4
        space-y-3
        bg-white
      ">
        {messages.map((msg, i) => (
          <MessageRow key={i} msg={msg} />
        ))}

        <div ref={bottomRef} />
      </div>

    
      <div className="
        p-2
        border-t
        border-[#E9ECEF]
        flex
        gap-3
        bg-[#FFFDF7] 
      ">

        <input
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          onKeyDown={handleKey}
          disabled={isDrawer}
          placeholder={
            isDrawer
              ? "You're drawing..."
              : "Type your guess..."
          }
          className="
            flex-1
            bg-white
            border
            border-[#DEE2E6]
            rounded-2xl
            px-4
            py-3
            text-sm
            outline-none
            focus:border-[#F4A261]
            transition-colors
          "
        />

        <button
          onClick={submit}
          disabled={isDrawer}
          className="
            px-2
            rounded-2xl
            bg-[#F4A261]
            text-white
            font-semibold
            hover:opacity-90
            transition-opacity
            disabled:opacity-50
            cursor-pointer
          "
        >
          Send
        </button>
      </div>
    </div>
  );
};


const MessageRow: React.FC<{
  msg: ChatMessage;
}> = ({ msg }) => {


  if (msg.type === "system") {
    return (
      <div className="
        text-center
        text-xs
        text-[#868E96]
      ">
        {msg.message}
      </div>
    );
  }


  if (msg.type === "correct") {
    return (
      <div className="
        bg-[#EBFBEE]
        text-[#2B8A3E]
        px-4
        py-3
        rounded-2xl
        text-sm
        font-medium
      ">
        {msg.player!.name} guessed correctly
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">

      <Avatar
        name={msg.player!.name}
        size={34}
      />

      <div>

        <p className="
          text-xs
          font-semibold
          text-[#F4A261]
          mb-1
        ">
          {msg.player!.name}
        </p>

        <div className="
          bg-[#F8F9FA]
          rounded-2xl
          px-4
          py-3
          text-sm
          text-[#2B2B2B]
          max-w-[220px]
          break-words
        ">
          {msg.message}
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;