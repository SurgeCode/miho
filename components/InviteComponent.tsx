"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWallet } from "@suiet/wallet-kit";
import { WalletConnectButton } from "@/components/WalletProvider";
import { motion } from "framer-motion";

function TypewriterText({ 
  text, 
  onComplete 
}: { 
  text: string, 
  onComplete?: () => void 
}) {
  const [displayedText, setDisplayedText] = useState("");
  const hasCompletedRef = useRef(false);
  const lastTextRef = useRef(text);
  
  useEffect(() => {
    if (text !== lastTextRef.current || !hasCompletedRef.current) {
      lastTextRef.current = text;
      setDisplayedText("");
      
      let index = 0;
      const timer = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.substring(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
          hasCompletedRef.current = true;
          if (onComplete) onComplete();
        }
      }, 30);
      
      return () => clearInterval(timer);
    }
  }, [text, onComplete]);
  
  if (hasCompletedRef.current && text !== displayedText) {
    return text;
  }
  
  return displayedText;
}

interface InviteComponentProps {
  onVerified: () => void;
}

export function InviteComponent({ onVerified }: InviteComponentProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [textComplete, setTextComplete] = useState(false);
  
  const wallet = useWallet();
  const [initialMessage] = useState("Hey there! ✨ I'm Miho, your Sui DeFi sidekick! Ready to dive in? Just connect your wallet and let's get this party started!");
  const [connectedMessage] = useState("Woohoo, wallet connected! 🎉 Now, this is kinda like a VIP club situation. Got an invite code from a friend? Let's see it! 🔑");
  const initialAnimationCompleted = useRef(false);
  
  useEffect(() => {
    if (wallet.connected && initialAnimationCompleted.current) {
      setTextComplete(true);
    }
  }, [wallet.connected]);
  
  const handleTypingComplete = () => {
    initialAnimationCompleted.current = true;
    setTextComplete(true);
  };
  
  const verifyInviteCode = async () => {
    if (!inviteCode.trim()) {
      setError("Please enter an invite code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch("/api/verify-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode, address: wallet.address }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        onVerified();
      } else {
        setError(data.message || "Invalid invite code");
      }
    } catch (err) {
      setError("Failed to verify invite code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const welcomeMessage = wallet.connected ? connectedMessage : initialMessage;

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
                text={welcomeMessage}
                onComplete={handleTypingComplete}
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
            {!wallet.connected ? (
              <div className="flex justify-center my-4">
                <WalletConnectButton />
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  className="bg-gray-900 border-white/20 text-white"
                  placeholder="Enter your invite code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && verifyInviteCode()}
                />
                
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
                
                <Button 
                  className="w-full bg-white/90 text-black hover:bg-white/80"
                  onClick={verifyInviteCode}
                  disabled={isVerifying}
                >
                  {isVerifying ? "Verifying..." : "Enter App"}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 