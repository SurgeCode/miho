"use client";
import { useState, useEffect } from "react";
import { Toaster } from "../components/ui/toaster";
import { PointsDisplay, QuestsPanel } from "../components/rewards";
import Chat from "@/components/Chat";
import { WalletProvider } from "@suiet/wallet-kit";
import { WalletConnectButton } from "@/components/WalletProvider";
import { InviteComponent } from "@/components/InviteComponent";

export default function Home() {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  
  useEffect(() => {
    const checkVerification = async () => {
      try {
        const response = await fetch('/api/verify-invite');
        const data = await response.json();
        setIsVerified(data.verified);
      } catch (error) {
        console.error('Failed to check verification:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkVerification();
  }, []);
  
  const handleVerified = () => {
    setIsVerified(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <WalletProvider>
      {!isVerified ? (
        <InviteComponent onVerified={handleVerified} />
      ) : (
        <div className="relative min-h-screen bg-black">
          <div className="flex justify-between items-center p-4 z-50">
            <PointsDisplay />
            <WalletConnectButton />
          </div>

          <div className="flex pt-2">
            <div className="w-full">
              <Chat />
            </div>
          </div>

          <Toaster />
        </div>
      )}
    </WalletProvider>
  );
}
