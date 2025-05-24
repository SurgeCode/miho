import React, { useMemo } from "react";
import { FarmsStakedPosition } from "aftermath-ts-sdk";

interface BalanceItem {
  coinType: string;
  totalBalance: string;
  coinObjectCount: number;
  normalizedBalance: number;
  usdValue?: number;
  metadata?: {
    name: string;
    symbol: string;
    description?: string;
    iconUrl?: string | null;
    decimals: number;
  };
}

interface GetAllBalancesComponentProps {
  data: {
    balances: BalanceItem[];
    stakedPositions?: FarmsStakedPosition[];
    totalUsdValue?: number;
  };
  isLoading?: boolean;
}

export const GetAllBalancesComponent: React.FC<
  GetAllBalancesComponentProps
> = ({ data, isLoading = false }) => {
  const balances = data?.balances || [];
  const stakedPositions = data?.stakedPositions || [];
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

  // Get coin symbol from metadata or coinType
  const getSymbol = (item: BalanceItem | { coinType: string }) => {
    if ('metadata' in item && item.metadata?.symbol) {
      return item.metadata.symbol;
    }
    const parts = item.coinType.split("::");
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

  const getProgressColor = (symbol: string) => {
    if (symbol === "SUI" || symbol.includes("SUI")) return "bg-blue-500";
    if (symbol === "USDC" || symbol === "USDT" || symbol.includes("USD"))
      return "bg-green-500";
    if (symbol === "CERT") return "bg-red-500";
    if (symbol === "LOFI") return "bg-gray-500";
    if (symbol === "BLUB") return "bg-indigo-500";
    return "bg-purple-500";
  };

  const formatTimeRemaining = (lockEndMs: number) => {
    const now = Date.now();
    const remaining = lockEndMs - now;
    
    if (remaining <= 0) return "Unlocked";
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const isLpToken = (coinType: string) => {
    return coinType.includes("af_lp") || coinType.includes("LP");
  };

  if (isLoading) {
    return (
      <div className="w-full bg-black/40 p-4 rounded-lg">
        <h3 className="text-white/90 text-lg font-medium mb-3">
          Portfolio Overview
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="bg-gray-900/30 rounded-lg border border-gray-800/40 p-3 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="h-8 w-8 rounded-full bg-gray-800/50 mr-3 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="h-5 bg-gray-800/50 rounded w-24 mb-2" />
                    <div className="h-3 bg-gray-800/30 rounded w-48" />
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="h-5 bg-gray-800/50 rounded w-20 mb-1" />
                  <div className="h-3 bg-gray-800/30 rounded w-24 mb-1" />
                  <div className="h-3 bg-gray-800/30 rounded w-16" />
                </div>
              </div>
              <div className="mt-2 bg-gray-800/40 rounded-full h-1.5 overflow-hidden relative">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-800/40 flex justify-between">
          <span className="text-gray-400 text-sm">Total Assets</span>
          <div className="h-5 bg-gray-800/50 rounded w-24 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!sortedBalances.length && !stakedPositions.length) {
    return <div className="text-gray-400">No significant balances found</div>;
  }

  return (
    <div className="w-full bg-black/40 p-4 rounded-lg">
      <h3 className="text-white/90 text-lg font-medium mb-3">
        Portfolio Overview
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {sortedBalances.map((coin, index) => {
          const symbol = getSymbol(coin);
          let percentage = 0;
          if (coin.usdValue && totalUsdValue > 0) {
            percentage = (coin.usdValue / totalUsdValue) * 100;
          }

          const iconUrl = coin.metadata?.iconUrl;
          const color = getCoinColor(symbol);
          const progressColor = getProgressColor(symbol);
          const isLp = isLpToken(coin.coinType);

          return (
            <div
              key={index}
              className="bg-gray-900/30 rounded-lg border border-gray-800/40 p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
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
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-white font-medium">
                        {symbol}
                      </span>
                      {isLp && (
                        <span className="text-blue-400 text-xs bg-blue-400/10 px-1.5 py-0.5 rounded">
                          LP
                        </span>
                      )}
                    </div>
                    <div className="text-gray-400 text-xs truncate">
                      <span className="truncate max-w-[220px] inline-block align-middle">{coin.coinType.slice(0, 16)}...{coin.coinType.slice(-8)}</span>
                      <button
                        className="ml-1 text-xs text-gray-400 hover:text-white"
                        onClick={() => navigator.clipboard.writeText(coin.coinType)}
                        title="Copy full coin type"
                        type="button"
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" strokeWidth="1.5" d="M7.5 4.5A2 2 0 0 1 9.5 2.5h6A2 2 0 0 1 17.5 4.5v9a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-9ZM4.5 7.5v7a2 2 0 0 0 2 2h7"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
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

        {/* Staked Positions */}
        {stakedPositions.map((position: any, index) => {
          const lockEndMs = position.stakedPosition.lockStartTimestamp + position.stakedPosition.lockDurationMs;
          const percentage = position.valueUsd && totalUsdValue > 0 
            ? (position.valueUsd / totalUsdValue) * 100 
            : 0;
          
          return (
            <div
              key={`staked-${index}`}
              className="bg-gray-900/30 rounded-lg border border-gray-800/40 p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <div className="h-8 w-8 rounded-full mr-3 flex-shrink-0 flex items-center justify-center bg-yellow-800/50">
                    <span className="text-yellow-400 text-sm">🌾</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-white font-medium">
                        {position.poolName}
                      </span>
                      <span className="text-yellow-400 text-xs bg-yellow-400/10 px-1.5 py-0.5 rounded">
                        Staked
                      </span>
                      {lockEndMs && lockEndMs > Date.now() && (
                        <span className="text-orange-400 text-xs bg-orange-400/10 px-1.5 py-0.5 rounded">
                          🔒 {formatTimeRemaining(lockEndMs)}
                        </span>
                      )}
                    </div>
                    <div className="text-gray-400 text-xs">
                      <span className="truncate max-w-[220px] inline-block align-middle">{position.stakedPosition.stakeCoinType.slice(0, 16)}...{position.stakedPosition.stakeCoinType.slice(-8)}</span>
                      <button
                        className="ml-1 text-xs text-gray-400 hover:text-white"
                        onClick={() => navigator.clipboard.writeText(position.stakedPosition.stakeCoinType)}
                        title="Copy full coin type"
                        type="button"
                      >
                        <svg width="14" height="14" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" strokeWidth="1.5" d="M7.5 4.5A2 2 0 0 1 9.5 2.5h6A2 2 0 0 1 17.5 4.5v9a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-9ZM4.5 7.5v7a2 2 0 0 0 2 2h7"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  {position.valueUsd > 0 && (
                    <div className="text-white font-medium">
                      ${position.valueUsd.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  )}
                  <div className="text-gray-400 text-xs">
                    {position.normalizedAmount?.toLocaleString(undefined, {
                      maximumFractionDigits: 4,
                    })} LP
                  </div>
                  {position.valueUsd > 0 && (
                    <div className="text-gray-400 text-xs">
                      {percentage.toFixed(2)}% of portfolio
                    </div>
                  )}
                </div>
              </div>

              {/* Portfolio distribution bar */}
              <div className="mt-2 bg-gray-800/40 rounded-full h-1.5">
                <div
                  className="h-full rounded-full bg-yellow-500"
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-800/40 flex justify-between">
        <span className="text-gray-400 text-sm">Total Assets</span>
        <div className="text-white font-medium">
          ${totalUsdValue.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
    </div>
  );
};
