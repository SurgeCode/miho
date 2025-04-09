"use client";

import Chat from "../chat";
import {
  WalletProvider,
  WalletConnectButton,
} from "../components/WalletProvider";
import { Toaster } from "../components/ui/toaster";
import { PointsDisplay, QuestsPanel } from "../components/rewards";

export default function SyntheticV0PageForDeployment() {
  return (
    <WalletProvider>
      <div className="relative min-h-screen bg-black">
        <div className="flex justify-between items-center p-4 z-50">
          <PointsDisplay />
          <WalletConnectButton />
        </div>

        <div className="flex pt-2">
          <div className="absolute left-4 w-[240px]">
            <div className="h-[calc(100vh-160px)]">
              <QuestsPanel />
            </div>
          </div>

          <div className="w-full">
            <Chat />
          </div>
        </div>

        <Toaster />
      </div>
    </WalletProvider>
  );
}
