import React from "react";

// Based on Aftermath CoinMetadaWithInfo type
interface CoinMetadata {
  name?: string;
  symbol?: string;
  decimals?: number;
  coinType?: string;
  iconUrl?: string;
  description?: string;
  id?: string;
}

interface ListCoinsComponentProps {
  data: CoinMetadata[];
}

export const ListCoinsComponent: React.FC<ListCoinsComponentProps> = ({
  data,
}) => {
  if (!data || !data.length) {
    return <div className="text-gray-400">No coins found</div>;
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2">
        {data.map((coin, index) => (
          <div
            key={index}
            className="flex items-center px-2 py-1.5 bg-gray-900/30 hover:bg-gray-800/40 rounded-md"
          >
            {coin.iconUrl ? (
              <img
                src={coin.iconUrl}
                alt={coin.symbol}
                className="h-5 w-5 rounded-full mr-1.5"
              />
            ) : (
              <div
                className={`h-5 w-5 rounded-full mr-1.5 flex items-center justify-center text-white text-xs font-bold
                ${
                  coin.symbol?.startsWith("S")
                    ? "bg-blue-800/50"
                    : coin.symbol?.startsWith("U")
                    ? "bg-green-800/50"
                    : coin.symbol?.startsWith("B")
                    ? "bg-purple-800/50"
                    : coin.symbol?.startsWith("C")
                    ? "bg-red-800/50"
                    : "bg-gray-800/50"
                }`}
              >
                {coin.symbol?.charAt(0)}
              </div>
            )}
            <span className="text-white/90 text-sm">{coin.symbol}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
