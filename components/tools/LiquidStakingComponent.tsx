import React, { useState } from "react";
import { useWallet } from "@suiet/wallet-kit";
import { executeTransaction } from "../../lib/walletUtils";
import { toast } from "../../hooks/use-toast";

interface LiquidStakingResult {
  success?: boolean;
  transactionId?: string;
  txBytes?: string;
  action?: "mint" | "redeem";
}

interface LiquidStakingComponentProps {
  data: LiquidStakingResult;
}

export const LiquidStakingComponent: React.FC<LiquidStakingComponentProps> = ({
  data,
}) => {
  console.log("RENDERING LIQUID STAKING COMPONENT:", data);
  const wallet = useWallet();
  const [isExecuting, setIsExecuting] = useState(false);
  const [txId, setTxId] = useState<string | undefined>(data.transactionId);

  // Default to mint if action is not provided
  const action = data?.action || "mint";
  const success = data?.success ?? true;

  // Check if this is an autonomous transaction that needs approval
  const isAutonomous = !!data.txBytes;

  // Prepare transaction bytes for execution
  const prepareTransactionBytes = (txBytes: any): Uint8Array => {
    // Check if txBytes is an object with numeric keys
    if (txBytes && typeof txBytes === "object" && !Array.isArray(txBytes)) {
      // Convert object with numeric indices to array
      const byteArray = Object.entries(txBytes)
        .filter(([key]) => !isNaN(Number(key)))
        .sort(([keyA], [keyB]) => Number(keyA) - Number(keyB))
        .map(([_, value]) => Number(value));

      return new Uint8Array(byteArray);
    }

    // If it's already a Uint8Array or string, convert appropriately
    if (typeof txBytes === "string") {
      try {
        // Try to parse JSON if it's a stringified object
        const parsed = JSON.parse(txBytes);
        return prepareTransactionBytes(parsed);
      } catch (e) {
        // If not a JSON string, it might be base64 or another format
        console.log("txBytes is not a JSON string:", txBytes);
      }
    }

    return txBytes;
  };

  // Handle transaction execution
  const handleExecuteTransaction = async () => {
    if (!wallet.connected) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!data.txBytes) {
      toast({
        title: "Error",
        description: "No transaction data available",
        variant: "destructive",
      });
      return;
    }

    setIsExecuting(true);

    try {
      const txData = prepareTransactionBytes(data.txBytes);

      console.log("Executing liquid staking transaction with data:", txData);

      const result = await executeTransaction(
        wallet,
        txData,
        (txResult) => {
          console.log("Transaction success with result:", txResult);
          setTxId(txResult.digest);
        },
        (error) => {
          console.error("Transaction execution error:", error);
          throw error;
        }
      );

      if (result) {
        setIsExecuting(false);
        return;
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      setIsExecuting(false);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to execute transaction",
        variant: "destructive",
      });
    }
  };

  // Determine UI state
  const hasTransactionBytes = !!data.txBytes;
  const hasTransactionId = !!txId;

  // Show approve button only if we have transaction bytes and no transaction ID
  const showApproveButton = hasTransactionBytes && !isExecuting;
  const showTransactionLink = hasTransactionId;

  return (
    <div className="border border-white/20 rounded-lg p-4 bg-black/50 shadow-md w-full">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">
            {action === "mint"
              ? "SUI → sSUI Liquid Staking"
              : "sSUI → SUI Redemption"}
          </h3>
          <div
            className={`px-3 py-1 rounded-full text-sm ${
              success
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {success ? "Success" : "Failed"}
          </div>
        </div>

        <div className="py-5 px-4 border border-white/10 rounded-lg bg-black/30">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {action === "mint" ? "SUI" : "sSUI"}
              </div>
              <div>
                <div className="text-white/50 text-sm">From</div>
                <div className="text-white text-lg font-medium">
                  {action === "mint" ? "SUI" : "sSUI"}
                </div>
              </div>
            </div>

            <div className="text-white text-2xl transform rotate-90 md:rotate-0 my-2 md:my-0">
              →
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                {action === "mint" ? "sSUI" : "SUI"}
              </div>
              <div>
                <div className="text-white/50 text-sm">To</div>
                <div className="text-white text-lg font-medium">
                  {action === "mint" ? "sSUI" : "SUI"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-white/70">
            {action === "mint"
              ? "Earning approximately 4.2% APY"
              : "Redeeming sSUI for SUI"}
          </div>

          {/* Show the approve button */}
          {showApproveButton && (
            <button
              onClick={handleExecuteTransaction}
              disabled={isExecuting || !wallet.connected}
              className={`bg-white text-black font-medium px-4 py-1 rounded-md transition-colors text-sm ${
                isExecuting
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-gray-200"
              } ${!wallet.connected ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isExecuting
                ? "Processing..."
                : action === "mint"
                ? "Approve Staking"
                : "Approve Redemption"}
            </button>
          )}
        </div>

        {/* Transaction ID display */}
        {showTransactionLink && (
          <div className="pt-3 border-t border-white/10 mt-3">
            <a
              href={`https://suivision.xyz/txblock/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm underline flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              View Transaction on Explorer
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
