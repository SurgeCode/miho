import React, { useState } from "react";
import { useWallet } from "@suiet/wallet-kit";
import { executeTransaction } from "../../lib/walletUtils";
import { toast } from "../../hooks/use-toast";

interface TokenInfo {
  type: string;
  metadata: {
    symbol: string;
    iconUrl: string | null;
    decimals: number;
  };
  amount: number;
}

interface LiquidStakingResult {
  success: boolean;
  txBytes?: Record<string, number>;
  action: "mint" | "redeem";
  tokenIn: TokenInfo;
  tokenOut: TokenInfo;
}

interface LiquidStakingComponentProps {
  data: LiquidStakingResult;
}

export const LiquidStakingComponent: React.FC<LiquidStakingComponentProps> = ({
  data,
}) => {
  const wallet = useWallet();
  const [isExecuting, setIsExecuting] = useState(false);
  const [txId, setTxId] = useState<string | undefined>();
  const { txBytes, action, tokenIn, tokenOut } = data;
  const hasTransactionBytes = !!txBytes;
  const hasTransactionId = !!txId;
  const showApproveButton = hasTransactionBytes && !isExecuting && !hasTransactionId;
  const showTransactionLink = hasTransactionId;
  const apr = 2.38;

  const prepareTransactionBytes = (txBytes: any): Uint8Array => {
    if (txBytes && typeof txBytes === "object" && !Array.isArray(txBytes)) {
      const byteArray = Object.entries(txBytes)
        .filter(([key]) => !isNaN(Number(key)))
        .sort(([keyA], [keyB]) => Number(keyA) - Number(keyB))
        .map(([_, value]) => Number(value));
      return new Uint8Array(byteArray);
    }
    return txBytes;
  };

  const handleExecuteTransaction = async () => {
    if (!wallet.connected) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }
    if (!txBytes) {
      toast({
        title: "Error",
        description: "No transaction data available",
        variant: "destructive",
      });
      return;
    }
    setIsExecuting(true);
    try {
      const txData = prepareTransactionBytes(txBytes);
      const result = await executeTransaction(
        wallet,
        txData,
        (txResult) => setTxId(txResult.digest),
        (error) => {
          throw error;
        }
      );
      if (result) setIsExecuting(false);
    } catch (error) {
      setIsExecuting(false);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to execute transaction",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full bg-black/40 p-4 rounded-lg">
      <h3 className="text-white/90 text-lg font-medium mb-3">
        {action === "mint" ? "SUI → sSUI Liquid Staking" : "sSUI → SUI Redemption"}
      </h3>
      <div className="py-5 px-4 border border-white/10 rounded-lg bg-black/30 mb-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            {tokenIn.metadata.iconUrl ? (
              <img src={tokenIn.metadata.iconUrl} alt={tokenIn.metadata.symbol} className="w-12 h-12 rounded-full bg-blue-600" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">{tokenIn.metadata.symbol}</div>
            )}
            <div>
              <div className="text-white/50 text-sm">From</div>
              <div className="text-white text-lg font-medium">{tokenIn.metadata.symbol}</div>
              <div className="text-white/70 text-sm">{tokenIn.amount}</div>
            </div>
          </div>
          <div className="text-white text-2xl transform rotate-90 md:rotate-0 my-2 md:my-0">→</div>
          <div className="flex items-center space-x-3">
            {tokenOut.metadata.iconUrl ? (
              <img src={tokenOut.metadata.iconUrl} alt={tokenOut.metadata.symbol} className="w-12 h-12 rounded-full bg-indigo-600" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">{tokenOut.metadata.symbol}</div>
            )}
            <div>
              <div className="text-white/50 text-sm">To</div>
              <div className="text-white text-lg font-medium">{tokenOut.metadata.symbol}</div>
              <div className="text-white/70 text-sm">{tokenOut.amount}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/70">
          {action === "mint" ? `Earning approximately ${apr}% APR` : "Redeeming sSUI for SUI"}
        </div>
        {showApproveButton && (
          <button
            onClick={handleExecuteTransaction}
            disabled={isExecuting || !wallet.connected}
            className={`bg-white text-black font-medium px-4 py-1 rounded-md transition-colors text-sm ${isExecuting ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-200"} ${!wallet.connected ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isExecuting ? "Processing..." : action === "mint" ? "Approve Staking" : "Approve Redemption"}
          </button>
        )}
      </div>
      {showTransactionLink && (
        <div className="pt-3 border-t border-white/10 mt-3">
          <a
            href={`https://suivision.xyz/txblock/${txId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm underline flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Transaction on Explorer
          </a>
        </div>
      )}
    </div>
  );
};
