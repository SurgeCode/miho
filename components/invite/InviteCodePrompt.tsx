import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWallet } from "@suiet/wallet-kit";
import { motion } from "framer-motion";
import { TypewriterText } from "../TypewriterText";

interface InviteCodePromptProps {
  onVerified: () => void;
}

export function InviteCodePrompt({ onVerified }: InviteCodePromptProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [textComplete, setTextComplete] = useState(false);
  const wallet = useWallet();
  const [welcomeMessage] = useState("Woohoo, wallet connected! 🎉 Now, this is kinda like a VIP club situation. Got an invite code from a friend? Let's see it! 🔑");
  
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
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 