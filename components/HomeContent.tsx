"use client";
import { useState, useEffect } from "react";
import { Toaster } from "../components/ui/toaster";
import { PointsDisplay, QuestsPanel } from "../components/rewards";
import Chat from "@/components/Chat";
import { useWallet } from "@suiet/wallet-kit";
import { WalletConnectButton } from "@/components/WalletProvider";
import { ConnectWalletPrompt } from "@/components/invite/ConnectWalletPrompt";
import { InviteCodePrompt } from "@/components/invite/InviteCodePrompt";

export default function HomeContent() {
    const [isVerified, setIsVerified] = useState<boolean | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const { address, connected, connecting } = useWallet();
  
    useEffect(() => {
      if (connecting || !connected || !address) {
        return;
      }
      
      if (isVerified === true) {
        return;
      }
      
      const checkVerification = async () => {
        setIsLoading(true); 
        try {
          const response = await fetch(`/api/verify-invite?address=${address}`);
          const data = await response.json();
          setIsVerified(data.verified);
        } catch (error) {
          console.error('Failed to check verification:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      checkVerification();
    }, [connecting, connected, address, isVerified]);
    
    const handleVerified = () => {
      setIsVerified(true);
    };
  
    if (connecting || isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-black">
          <div className="text-white">Loading...</div>
        </div>
      );
    }

    if (!connected && !connecting) {
      return <ConnectWalletPrompt />;
    }

    if (!isVerified && !connecting) {
      return <InviteCodePrompt onVerified={handleVerified} />;
    }

    return (
      <div className="flex flex-col h-screen bg-black">
        <div className="flex justify-between items-center p-4 z-50 flex-shrink-0">
          <PointsDisplay />
          <WalletConnectButton />
        </div>

        <div className="flex-grow overflow-hidden">
          <Chat />
        </div>

        <Toaster />
      </div>
    );
}