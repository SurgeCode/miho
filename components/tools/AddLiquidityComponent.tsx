import React, { useState } from "react";
import { useWallet } from "@suiet/wallet-kit";
import { executeTransaction } from "@/lib/walletUtils";

interface DepositInfo {
  coinType: string;
  amount: string;
  symbol: string;
  decimals: number;
}

interface AddLiquidityComponentProps {
  data: {
    success: boolean;
    error?: string;
    message?: string;
    missingTokens?: Array<{
      coinType: string;
      symbol: string;
    }>;
    poolInfo?: {
      poolId: string;
      poolName: string;
      lpCoinType?: string;
      estimatedLpTokens?: string;
      requiredTokens?: Array<{
        coinType: string;
        symbol: string;
      }>;
    };
    transactions?: {
      deposit: {
        transactionBytes: number[];
        description: string;
      };
      stake?: {
        transactionBytes: number[];
        description: string;
      } | null;
    };
    depositsInfo?: DepositInfo[];
    farmInfo?: {
      farmId: string;
      lockDurationDays: number;
      lpAmountToStake: string;
    };
  };
}

export const AddLiquidityComponent: React.FC<AddLiquidityComponentProps> = ({ data }) => {
  const wallet = useWallet();
  const [step, setStep] = useState<"deposit" | "stake" | "complete">("deposit");
  const [depositTxHash, setDepositTxHash] = useState<string | null>(null);

  // Convert transaction bytes object to Uint8Array
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

    // If it's already a Uint8Array or other format, return as is
    return txBytes;
  };

  if (!data.success) {
    // Handle insufficient balance case
    if (data.error === "INSUFFICIENT_BALANCE") {
      return (
        <div className="w-full bg-black/40 p-4 rounded-lg">
          <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-yellow-300 font-medium">Insufficient Balance</h3>
            </div>
            <p className="text-yellow-200 text-sm mb-3">
              {data.message}
            </p>
            
            {data.poolInfo?.requiredTokens && (
              <div className="mt-3 bg-black/30 rounded p-3">
                <div className="text-xs text-gray-400 mb-2">Pool requires:</div>
                <div className="flex gap-2">
                  {data.poolInfo.requiredTokens.map((token, i) => (
                    <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                      {token.symbol}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-400">
            💡 You only need one of the pool tokens to provide liquidity. The AI will help you swap for the tokens you need.
          </div>
        </div>
      );
    }
    
    // Generic error
    return (
      <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-4 text-red-400">
        Error: {data.error || "Failed to create transaction"}
      </div>
    );
  }

  if (!data.transactions) {
    return (
      <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-4 text-red-400">
        Error: No transactions created
      </div>
    );
  }

  const handleDeposit = async () => {
    try {
      console.log(data)
      const preparedTxBytes = prepareTransactionBytes(data.transactions!.deposit.transactionBytes);
      const result = await executeTransaction(wallet, preparedTxBytes);
      setDepositTxHash(result.digest);
      
      if (data.transactions!.stake) {
        setStep("stake");
      } else {
        setStep("complete");
      }
    } catch (error) {
      console.error("Failed to execute deposit transaction:", error);
    }
  };

  const handleStake = async () => {
    try {
      if (data.transactions!.stake) {
        const preparedTxBytes = prepareTransactionBytes(data.transactions!.stake.transactionBytes);
        await executeTransaction(wallet, preparedTxBytes);
      }
      setStep("complete");
    } catch (error) {
      console.error("Failed to execute stake transaction:", error);
    }
  };

  if (step === "complete") {
    return (
      <div className="w-full bg-black/40 p-4 rounded-lg">
        <div className="bg-green-900/20 border border-green-800/40 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="text-green-300 font-medium">Success!</h3>
          </div>
          <p className="text-green-200 text-sm">
            {data.farmInfo 
              ? "Liquidity added and LP tokens staked successfully!"
              : "Liquidity added successfully!"}
          </p>
        </div>
      </div>
    );
  }

  if (step === "stake" && data.transactions!.stake) {
    return (
      <div className="w-full bg-black/40 p-4 rounded-lg">
        <h3 className="text-white/90 text-lg font-medium mb-3">
          Step 2: Stake LP Tokens
        </h3>

        <div className="bg-green-900/20 border border-green-800/40 rounded-lg p-3 mb-4">
          <div className="text-sm text-green-300">
            ✓ Liquidity added successfully! Now stake your LP tokens in the farm.
          </div>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-400">🌾</span>
            <div className="text-sm text-yellow-300 font-medium">
              Farm Staking Details
            </div>
          </div>
          <div className="text-sm text-yellow-200">
            Lock Duration: {data.farmInfo!.lockDurationDays} days
          </div>
          <div className="text-sm text-yellow-200">
            LP Tokens to Stake: {Number(data.farmInfo!.lpAmountToStake) / 1e9} LP
          </div>
        </div>

        {wallet.connected ? (
          <button
            onClick={handleStake}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Stake LP Tokens
          </button>
        ) : (
          <button
            className="w-full bg-gray-700 text-gray-400 font-medium py-3 rounded-lg cursor-not-allowed"
            disabled
          >
            Connect Wallet to Stake
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full bg-black/40 p-4 rounded-lg">
      <h3 className="text-white/90 text-lg font-medium mb-3">
        {data.farmInfo ? "Step 1: " : ""}Add Liquidity to {data.poolInfo?.poolName}
      </h3>

      {/* Deposits Info */}
      <div className="space-y-3 mb-4">
        <div className="text-sm text-gray-400">You will deposit:</div>
        {data.depositsInfo?.map((deposit, index) => (
          <div key={index} className="bg-gray-900/30 rounded-lg border border-gray-800/40 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-800/50 flex items-center justify-center text-white font-bold">
                  {deposit.symbol.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-medium">{deposit.symbol}</div>
                  <div className="text-gray-400 text-xs truncate max-w-[200px]">
                    {deposit.coinType}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">
                  {(Number(deposit.amount) / Math.pow(10, deposit.decimals)).toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })}
                </div>
                <div className="text-gray-400 text-xs">{deposit.symbol}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* LP Token Info */}
      <div className="bg-blue-900/20 border border-blue-800/40 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-300">
            You will receive ~{Number(data.poolInfo?.estimatedLpTokens || 0) / 1e9} LP tokens
          </div>
        </div>
      </div>

      {/* Action Button */}
      {wallet.connected ? (
        <button
          onClick={handleDeposit}
          className="w-full bg-white text-black font-medium py-3 rounded-lg transition-colors hover:bg-gray-200"
        >
          Add Liquidity
        </button>
      ) : (
        <button
          className="w-full bg-gray-700 text-gray-400 font-medium py-3 rounded-lg cursor-not-allowed"
          disabled
        >
          Connect Wallet to Add Liquidity
        </button>
      )}
    </div>
  );
}; 


