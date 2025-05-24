import { useChat } from "@ai-sdk/react"
import { SendHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Message } from "@/components/Message"
import { useWallet } from "@suiet/wallet-kit"
import { useEffect, useRef } from "react"

export default function Chat() {
  const { address } = useWallet();
    
  const { messages, input, handleInputChange, handleSubmit, isLoading, append  } = useChat({
    api: "/api/chat",
    body: { 
      address,
    },
    experimental_throttle: 50,
    onToolCall: async ({ toolCall }: { toolCall: any }) => {
 
      return null;
    }
  });

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current && messages.length === 0) {
      append({ role: "user", content: "hi" });
      initialized.current = true;
    }
  }, [messages, append]);

  return (
    <div className="flex flex-col h-full bg-black text-white">
      <div className="flex-1 overflow-y-auto px-4">
        <div className="mx-auto w-full pb-3 max-w-[700px]">
          {messages.slice(1).map((message) => (
            <Message key={message.id} message={message as any} />
          ))}
        </div>
      </div>

      <div className="py-3 border-t border-white/20 sticky bottom-0 bg-black flex-shrink-0">
        <form 
          onSubmit={handleSubmit} 
          style={{ maxWidth: "700px" }}
          className="mx-auto flex gap-2 w-full px-4"
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

