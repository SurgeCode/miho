import React from "react";

interface SendSuiData {
  success: boolean;
  sender?: string;
  recipient?: string;
  amount?: number;
  transactionId?: string;
  error?: string;
}

interface SendSuiComponentProps {
  data: SendSuiData;
}

export const SendSuiComponent: React.FC<SendSuiComponentProps> = ({ data }) => {
  if (!data.success && data.error) {
    return <div className="text-red-400 mt-1 text-sm">{data.error}</div>;
  }

  // Format SUI amount
  const suiAmount = data.amount ? (data.amount / 1000000000).toFixed(9) : "0";

  // Truncate addresses for display
  const truncateAddress = (address: string = "") => {
    if (address.length <= 12) return address;
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <div className="flex flex-col space-y-2 mt-1">
      <div className="flex items-center">
        <div className="flex flex-1">
          <div className="bg-gray-900/30 px-2 py-1 rounded-md border border-gray-800/50 flex items-center">
            <span className="text-gray-400 text-xs mr-1">From:</span>
            <span className="text-white/90 text-sm font-mono">
              {truncateAddress(data.sender)}
            </span>
          </div>
        </div>

        <svg
          className="w-4 h-4 text-gray-600 mx-2"
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

        <div className="flex flex-1">
          <div className="bg-gray-900/30 px-2 py-1 rounded-md border border-gray-800/50 flex items-center">
            <span className="text-gray-400 text-xs mr-1">To:</span>
            <span className="text-white/90 text-sm font-mono">
              {truncateAddress(data.recipient)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <div className="bg-gray-900/30 px-3 py-1.5 rounded-md border border-gray-800/50 flex items-center">
          <div className="h-4 w-4 rounded-full bg-blue-900/40 flex items-center justify-center mr-2">
            <span className="text-blue-300 text-[10px]">S</span>
          </div>
          <span className="text-white text-sm font-medium">
            {suiAmount} SUI
          </span>
        </div>

        {data.transactionId && (
          <a
            href={`https://suiscan.xyz/mainnet/tx/${data.transactionId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-xs text-gray-500 hover:text-blue-400 transition-colors"
          >
            View Transaction
          </a>
        )}
      </div>
    </div>
  );
};
