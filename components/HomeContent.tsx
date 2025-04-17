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
    const [error, setError] = useState<string | null>(null);
    const { address, connected, connecting } = useWallet();
  
    useEffect(() => {
      if (connecting) {
        return;
      }
      
      if (!connected || !address) {
        setIsLoading(false);
        return;
      }
      
      if (isVerified === true) {
        setIsLoading(false);
        return;
      }

      const checkVerification = async () => {
        setIsLoading(true); 
        setError(null);
        
        try {
          const response = await fetch(`/api/verify-invite?address=${address}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store',
            },
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('API error:', response.status, errorText);
            throw new Error(`API error: ${response.status} ${errorText}`);
          }
          
          const data = await response.json();
          setIsVerified(data.verified);
        } catch (error) {
          console.error('Failed to check verification:', error);
          setError(`Verification failed: ${error instanceof Error ? error.message : String(error)}`);
          setIsVerified(false);
        } finally {
          setIsLoading(false);
        }
      };

      checkVerification();
    }, [connecting, connected, address, isVerified]);
    
    const handleVerified = () => {
      setIsVerified(true);
    };
  
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      );
    }

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