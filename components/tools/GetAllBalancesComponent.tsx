import React, { useMemo } from "react";

interface BalanceItem {
  coinType: string;
  totalBalance: string;
  coinObjectCount: number;
  normalizedBalance: number;
  usdValue?: number; 
}

interface GetAllBalancesComponentProps {
  data: {
    balances: BalanceItem[];
    totalUsdValue?: number; 
  };
}

export const GetAllBalancesComponent: React.FC<
  GetAllBalancesComponentProps
> = ({ data }) => {
  const balances = data?.balances || [];
  const totalUsdValue = data?.totalUsdValue || 0;

  const sortedBalances = useMemo(() => {
    return [...balances]
      .filter((coin) => coin.normalizedBalance > 0.000001)
      .sort((a, b) => {
        if (a.usdValue && b.usdValue) {
          return b.usdValue - a.usdValue;
        }
        return b.normalizedBalance - a.normalizedBalance;
      });
  }, [balances]);

  const totalValue = useMemo(() => {
    return sortedBalances.reduce(
      (sum, coin) => sum + coin.normalizedBalance,
      0
    );
  }, [sortedBalances]);

  // Get coin symbol from coinType
  const getSymbol = (coinType: string) => {
    const parts = coinType.split("::");
    return parts.length > 2 ? parts[2] : "Unknown";
  };

  // Get coin color based on first letter of symbol
  const getCoinColor = (symbol: string) => {
    const firstChar = symbol.charAt(0).toUpperCase();
    switch (firstChar) {
      case "S":
        return "bg-blue-800/50";
      case "U":
        return "bg-green-800/50";
      case "B":
        return "bg-purple-800/50";
      case "C":
        return "bg-red-800/50";
      case "L":
        return "bg-gray-700/50";
      default:
        return "bg-gray-800/50";
    }
  };

  const getCoinLogo = (symbol: string) => {
    if (symbol === "SUI")
      return "https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png";
    if (symbol === "USDC")
      return "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png";
    if (symbol === "USDT")
      return "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png";
    return undefined;
  };

  const getProgressColor = (symbol: string) => {
    if (symbol === "SUI" || symbol.includes("SUI")) return "bg-blue-500";
    if (symbol === "USDC" || symbol === "USDT" || symbol.includes("USD"))
      return "bg-green-500";
    if (symbol === "CERT") return "bg-red-500";
    if (symbol === "LOFI") return "bg-gray-500";
    if (symbol === "BLUB") return "bg-indigo-500";
    return "bg-purple-500";
  };

  const formatCoinType = (coinType: string) => {
    const parts = coinType.split("::");
    if (parts.length >= 1) {
      const address = parts[0];
      if (address.length > 16) {
        return `0x${address.slice(2, 10)}...`;
      }
    }
    return parts[0];
  };

  if (!sortedBalances.length) {
    return <div className="text-gray-400">No significant balances found</div>;
  }

  return (
    <div className="w-full bg-black/40 p-4 rounded-lg">
      <h3 className="text-white/90 text-lg font-medium mb-3">
        Portfolio Overview
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {sortedBalances.map((coin, index) => {
          const symbol = getSymbol(coin.coinType);
          // Calculate percentage based on USD value if available
          let percentage = 0;
          if (coin.usdValue && totalUsdValue > 0) {
            percentage = (coin.usdValue / totalUsdValue) * 100;
          } else if (totalValue > 0) {
            // Fallback to token amount percentage if USD value not available
            percentage = (coin.normalizedBalance / totalValue) * 100;
          }

          const iconUrl = getCoinLogo(symbol);
          const color = getCoinColor(symbol);
          const progressColor = getProgressColor(symbol);

          return (
            <div
              key={index}
              className="bg-gray-900/30 rounded-lg border border-gray-800/40 p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center max-w-[60%]">
                  {iconUrl ? (
                    <img
                      src={iconUrl}
                      alt={symbol}
                      className="h-8 w-8 rounded-full mr-3 flex-shrink-0"
                    />
                  ) : (
                    <div
                      className={`h-8 w-8 rounded-full mr-3 flex-shrink-0 flex items-center justify-center text-white font-bold ${color}`}
                    >
                      {symbol.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-white font-medium truncate">
                        {symbol}
                      </span>
                      <span className="text-gray-400 text-xs truncate">
                        {formatCoinType(coin.coinType)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {coin.usdValue && (
                    <div className="text-white font-medium">
                      $
                      {coin.usdValue.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  )}
                  <div className="text-gray-400 text-xs">
                    {coin.normalizedBalance.toLocaleString(undefined, {
                      maximumFractionDigits: 6,
                    })}{" "}
                    {symbol}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {percentage.toFixed(2)}% of portfolio
                  </div>
                </div>
              </div>

              {/* Portfolio distribution bar */}
              <div className="mt-2 bg-gray-800/40 rounded-full h-1.5">
                <div
                  className={`h-full rounded-full ${progressColor}`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-800/40 flex justify-between">
        <span className="text-gray-400 text-sm">Total Assets</span>
        <div className="text-right">
          {totalUsdValue > 0 && (
            <div className="text-white font-medium">
              $
              {totalUsdValue.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </div>
          )}
          <div className="text-gray-400 text-sm">
            {totalValue.toLocaleString(undefined, { maximumFractionDigits: 4 })}{" "}
            tokens
          </div>
        </div>
      </div>
    </div>
  );
};
