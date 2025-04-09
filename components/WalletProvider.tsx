import {
  WalletProvider as SuietWalletProvider,
  useWallet,
} from "@suiet/wallet-kit";
import { useState, useEffect } from "react";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return <SuietWalletProvider>{children}</SuietWalletProvider>;
}

// Define wallet interface
interface WalletInfo {
  name: string;
  icon?: string;
  downloadUrl?: string;
}

// Default wallets to show if none are detected from the wallet hook
const DEFAULT_WALLETS: WalletInfo[] = [
  { name: "Phantom", icon: "👻", downloadUrl: "https://phantom.app/" },
  {
    name: "Sui Wallet",
    icon: "💎",
    downloadUrl:
      "https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil",
  },
  {
    name: "Ethos",
    icon: "🌐",
    downloadUrl:
      "https://chrome.google.com/webstore/detail/ethos-sui-wallet/mcbigmjiafegjnnogedioegffbooigli",
  },
];

export function WalletConnectButton() {
  const wallet = useWallet();
  const { connected, select, disconnect, account } = wallet;
  const [showModal, setShowModal] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);

  useEffect(() => {
    // Always use default wallets since we know they should be available
    // This ensures Phantom and other wallets are always shown
    setAvailableWallets(DEFAULT_WALLETS);
  }, []);

  if (connected) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-white text-black font-medium py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-sm">
          {account?.address.slice(0, 6)}...{account?.address.slice(-4)}
        </div>
        <button
          onClick={disconnect}
          className="bg-white text-black font-medium p-1 w-9 h-9 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-white text-black font-medium px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm"
      >
        Connect Wallet
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-black p-6 rounded-lg max-w-md w-full border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-lg font-medium">Connect Wallet</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {availableWallets.map((walletInfo: WalletInfo) => (
                <button
                  key={walletInfo.name}
                  onClick={() => {
                    select(walletInfo.name);
                    setShowModal(false);
                  }}
                  className="w-full bg-zinc-900 text-white px-4 py-3 rounded-md hover:bg-zinc-800 transition-colors flex items-center gap-3 border border-white/10"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                    {walletInfo.name === "Phantom"
                      ? "👻"
                      : walletInfo.name === "Sui"
                      ? "💎"
                      : walletInfo.name === "Ethos"
                      ? "🌐"
                      : walletInfo.name === "Sui Wallet"
                      ? "💎"
                      : "🔑"}
                  </div>
                  <span className="font-medium">{walletInfo.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
