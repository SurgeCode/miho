import React, { useState } from "react";
import { useWallet } from "@suiet/wallet-kit";
import { executeTransaction } from "../../lib/walletUtils";
import { toast } from "../../hooks/use-toast";

//TODO figure out how to get transaction payload from tool into frontend
//maybe message isnt passing it in
//maybe i need to stringify or serialize it

interface CoinMetadata {
  decimals: number;
  description: string;
  iconUrl?: string | null;
  id?: string | null;
  name: string;
  symbol: string;
}

interface SwapRoute {
  routes?: any[];
  coinIn?: {
    type?: string;
    amount?: string | number | bigint;
    tradeFee?: string | number | bigint;
  };
  coinOut?: {
    type?: string;
    amount?: string | number | bigint;
    tradeFee?: string | number | bigint;
  };
  spotPrice?: number;
  netTradeFeePercentage?: number;
}

interface SwapData {
  success: boolean;
  transactionId?: string;
  transaction?: any;
  transactionBytes?: any;
  route?: SwapRoute;
  coinMetadata?: {
    coinIn: CoinMetadata | null;
    coinOut: CoinMetadata | null;
  };
  error?: string;
}

interface SwapToolComponentProps {
  data: SwapData;
  action?: "getQuote" | "executeSwap";
}

export const SwapToolComponent: React.FC<SwapToolComponentProps> = ({
  data,
  action = "executeSwap",
}) => {
  const [loading, setLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [txId, setTxId] = useState<string | undefined>(data.transactionId);
  const wallet = useWallet();

  console.log(data);

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

    // Check for either transaction or transactionBytes
    if (!data.transaction && !data.transactionBytes) {
      toast({
        title: "Error",
        description: "No transaction data available",
        variant: "destructive",
      });
      return;
    }

    setIsExecuting(true);

    try {
      // Prepare transaction data - convert transactionBytes if available
      let txData;
      if (data.transactionBytes) {
        txData = prepareTransactionBytes(data.transactionBytes);
      } else {
        txData = data.transaction;
      }

      console.log("Executing transaction with prepared data");

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
      console.error("All transaction attempts failed:", error);
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

  if (!data.success && data.error) {
    return <div className="text-red-400 mt-1 text-sm">{data.error}</div>;
  }

  const route = data.route || {};

  // Extract coin symbols from type
  const getSymbol = (coinType: string = "") => {
    const parts = coinType.split("::");
    return parts.length > 2 ? parts[2] : coinType;
  };

  // Format amounts for display (handles bigint with 'n' suffix)
  const formatAmount = (
    amount: string | number | bigint | undefined,
    metadata?: CoinMetadata | null
  ) => {
    if (amount === undefined) return "0.0000";

    try {
      // Convert to string first to handle BigInt
      let amountStr = amount.toString();
      // Remove the 'n' suffix if present (from BigInt)
      if (amountStr.endsWith("n")) {
        amountStr = amountStr.slice(0, -1);
      }
      const amountNum = parseFloat(amountStr);

      // Apply appropriate decimals based on token metadata
      if (metadata?.decimals) {
        return (amountNum / 10 ** metadata.decimals).toFixed(4);
      } else {
        // Fallback decimal handling
        const tokenSymbol = metadata?.symbol || "";
        if (tokenSymbol === "SUI") {
          return (amountNum / 1000000000).toFixed(4);
        } else if (tokenSymbol === "USDC" || tokenSymbol === "USDT") {
          return (amountNum / 1000000).toFixed(3);
        } else {
          return amountNum.toLocaleString(undefined, {
            maximumFractionDigits: 6,
          });
        }
      }
    } catch (e) {
      return amount.toString().replace(/n$/, "");
    }
  };

  // Calculate proper exchange rate
  const calculateExchangeRate = (
    fromAmount: string | number | bigint | undefined,
    toAmount: string | number | bigint | undefined,
    fromMetadata?: CoinMetadata | null,
    toMetadata?: CoinMetadata | null
  ) => {
    if (!fromAmount || !toAmount) return "N/A";

    try {
      // Convert to string and remove 'n' suffix if present
      const fromStr = fromAmount.toString().replace(/n$/, "");
      const toStr = toAmount.toString().replace(/n$/, "");

      // Parse as numbers
      const fromNum = parseFloat(fromStr);
      const toNum = parseFloat(toStr);

      if (fromNum <= 0 || toNum <= 0) return "N/A";

      // Get decimals for each token
      const fromDecimals = fromMetadata?.decimals ?? 9;
      const toDecimals = toMetadata?.decimals ?? 9;

      // Calculate the rate: convert both to their base units then divide
      const rate = toNum / 10 ** toDecimals / (fromNum / 10 ** fromDecimals);

      return rate.toFixed(6);
    } catch (e) {
      return "N/A";
    }
  };

  const fromSymbol =
    data.coinMetadata?.coinIn?.symbol || getSymbol(route.coinIn?.type || "");
  const toSymbol =
    data.coinMetadata?.coinOut?.symbol || getSymbol(route.coinOut?.type || "");

  const fromAmount = formatAmount(
    route.coinIn?.amount,
    data.coinMetadata?.coinIn
  );
  const toAmount = formatAmount(
    route.coinOut?.amount,
    data.coinMetadata?.coinOut
  );

  const exchangeRate = calculateExchangeRate(
    route.coinIn?.amount,
    route.coinOut?.amount,
    data.coinMetadata?.coinIn,
    data.coinMetadata?.coinOut
  );

  const tradeFee = (() => {
    if (route.netTradeFeePercentage !== undefined) {
      // Ensure we're working with a number
      const feeValue =
        typeof route.netTradeFeePercentage === "string"
          ? parseFloat(route.netTradeFeePercentage)
          : route.netTradeFeePercentage;

      // Check if the value is already in percentage form
      if (feeValue > 1) {
        return feeValue.toFixed(4) + "%";
      } else {
        return (feeValue * 100).toFixed(4) + "%";
      }
    }
    return "N/A";
  })();

  // Get coin metadata
  const fromCoinMetadata = data.coinMetadata?.coinIn;
  const toCoinMetadata = data.coinMetadata?.coinOut;

  // Determine UI state - simplified to just show execution button or transaction link
  const hasTransactionData = !!data.transactionBytes;
  const hasTransactionId = !!txId;

  // Show approve button only if we have transaction data and no transaction ID
  const showApproveButton =
    hasTransactionData && !hasTransactionId && !isExecuting;
  const showTransactionLink = hasTransactionId;

  return (
    <div className="flex flex-col space-y-4 mt-2 w-full bg-black/40 p-4 rounded-lg border border-gray-800/70">
      <div className="flex items-center w-full">
        <div className="bg-gray-900/70 px-4 py-3 rounded-lg border border-gray-800/40 flex items-center flex-1">
          {fromCoinMetadata?.iconUrl ? (
            <img
              src={fromCoinMetadata.iconUrl}
              alt={fromSymbol}
              className="h-8 w-8 rounded-full mr-3 object-contain"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-800/40 flex items-center justify-center mr-3">
              <span className="text-white/90 text-sm font-medium">
                {fromSymbol.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-white font-medium text-lg">
              {fromAmount} {fromSymbol}
            </span>
            <span className="text-gray-400 text-xs">From</span>
          </div>
        </div>

        <svg
          className="w-8 h-8 text-gray-600 mx-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>

        <div className="bg-gray-900/70 px-4 py-3 rounded-lg border border-gray-800/40 flex items-center flex-1">
          {toCoinMetadata?.iconUrl ? (
            <img
              src={toCoinMetadata.iconUrl}
              alt={toSymbol}
              className="h-8 w-8 rounded-full mr-3 object-contain"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-800/40 flex items-center justify-center mr-3">
              <span className="text-white/90 text-sm font-medium">
                {toSymbol.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-white font-medium text-lg">
              {toAmount} {toSymbol}
            </span>
            <span className="text-gray-400 text-xs">To</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex gap-4 pt-3">
          <span>
            Rate:{" "}
            <span className="text-white/90">
              1 {fromSymbol} ≈ {exchangeRate} {toSymbol}
            </span>
          </span>
          <span>
            Fee: <span className="text-white/90">{tradeFee}</span>
          </span>
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
            {isExecuting ? "Processing..." : "Approve Swap"}
          </button>
        )}

        {/* Transaction link when available */}
        {showTransactionLink && (
          <a
            href={`https://suiscan.xyz/mainnet/tx/${txId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:underline"
          >
            View Transaction →
          </a>
        )}
      </div>

      {loading && (
        <div className="text-center text-sm text-gray-400">
          Loading coin data...
        </div>
      )}
    </div>
  );
};
