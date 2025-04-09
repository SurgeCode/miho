"use client"

import { useChat } from "@ai-sdk/react"
import { SendHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Message } from "@/components/Message"
import { useWallet } from "@suiet/wallet-kit"
export default function Chat() {
  const { address } = useWallet();
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      address: address
    }
  })

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-black text-white">
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div style={{ maxWidth: "700px" }} className="mx-auto w-full">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-white/20">
        <form 
          onSubmit={handleSubmit} 
          style={{ maxWidth: "700px" }}
          className="mx-auto flex gap-2 w-full"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="bg-transparent border-white/20 text-white placeholder:text-white/50"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="p-2 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0" 
            disabled={isLoading || !input.trim()}
          >
            <SendHorizontal className="w-5 h-5" />
            <span className="sr-only">Send message</span>
          </button>
        </form>
      </div>
    </div>
  )
}

