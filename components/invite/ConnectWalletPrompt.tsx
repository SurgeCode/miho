import { useState, useEffect } from "react";
import { WalletConnectButton } from "@/components/WalletProvider";
import { motion } from "framer-motion";
import { TypewriterText } from "../TypewriterText";

export function ConnectWalletPrompt() {
  const [textComplete, setTextComplete] = useState(false);
  const [initialMessage] = useState("Hey there! ✨ I'm Miho, your Sui DeFi sidekick! Ready to dive in? Just connect your wallet and let's get this party started!");

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-white/20 bg-black text-white w-[500px] p-6 rounded-lg"
      >
        <div className="flex items-start gap-5 mb-6">
          <img
            alt="AI Assistant"
            className="w-[90px] h-[90px] object-cover rounded-md shadow-lg"
            src="https://i.imgur.com/I855R4c.jpeg"
          />
          <div className="flex-1">
            <p className="text-white text-lg">
              <TypewriterText 
                text={initialMessage}
                onComplete={() => setTextComplete(true)}
              />
            </p>
          </div>
        </div>
        
        {textComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-center my-4">
              <WalletConnectButton />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 