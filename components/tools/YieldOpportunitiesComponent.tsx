import React, { useState } from "react";
import { formatNumber, formatPercent } from "../../lib/utils";
import { useChat } from "@ai-sdk/react";

interface AprBreakdown {
  poolFeeApr: number;
  farmingApr: number;
  totalApr: number;
  farmingAprRange?: {
    min: number;
    max: number;
  };
}

interface PoolWithApr {
  objectId: string;
  name: string;
  lpCoinType: string;
  coins: Record<string, {
    coinType: string;
    weight: number;
    balance: string;
    normalizedBalance: number;
    symbol?: string;
    name?: string;
    iconUrl?: string;
    userBalance?: number;
  }>;
  tvl: number;
  volume24h: number;
  apr: AprBreakdown;
  userHoldsAllTokens: boolean;
  farm?: {
    objectId: string;
    rewardCoins: Array<{
      coinType: string;
      symbol?: string;
    }>;
    lockDurationOptions?: Array<{
      durationDays: number;
      multiplier: number;
      boostedApr: number;
    }>;
  };
}

interface YieldOpportunitiesComponentProps {
  data: {
    opportunities: PoolWithApr[];
    summary: {
      totalOpportunities: number;
      userEligiblePools: number;
      averageTotalApr: number;
      totalTvl: number;
    };
  };
}

export const YieldOpportunitiesComponent: React.FC<YieldOpportunitiesComponentProps> = ({ data }) => {
  const [sortBy, setSortBy] = useState<"totalApr" | "poolFeeApr" | "farmingApr" | "tvl" | "volume24h">("totalApr");
  const [showOnlyEligible, setShowOnlyEligible] = useState(false);
  const { append } = useChat({ id: "main-chat" });
  
  const opportunities = showOnlyEligible 
    ? data.opportunities.filter(o => o.userHoldsAllTokens)
    : data.opportunities;

  const sortOpportunities = (a: PoolWithApr, b: PoolWithApr): number => {
    switch (sortBy) {
      case "totalApr":
        return b.apr.totalApr - a.apr.totalApr;
      case "poolFeeApr":
        return b.apr.poolFeeApr - a.apr.poolFeeApr;
      case "farmingApr":
        return b.apr.farmingApr - a.apr.farmingApr;
      case "tvl":
        return b.tvl - a.tvl;
      case "volume24h":
        return b.volume24h - a.volume24h;
      default:
        return 0;
    }
  };

  const handleProvideLiquidity = (pool: PoolWithApr) => {
    const tokenList = Object.values(pool.coins)
      .map(coin => coin.symbol)
      .join(" and ");

    append({
      role: "user",
      content: `Guide me through how to add liquidity to the ${pool.name} pool.${pool.farm ? " I want to farm as well." : ""} The pool requires ${tokenList}.`
    });
  };

  return (
    <div className="w-full bg-black/40 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white/90 text-lg font-medium">
          Yield Opportunities
        </h3>
        <div className="flex items-center gap-2">
          {data.summary.userEligiblePools > 0 && (
            <button
              onClick={() => setShowOnlyEligible(!showOnlyEligible)}
              className={`px-3 py-1 rounded-md text-sm ${
                showOnlyEligible
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700/50 text-gray-300"
              }`}
            >
              {showOnlyEligible ? "Show All" : `Eligible (${data.summary.userEligiblePools})`}
            </button>
          )}
          <div className="text-sm text-gray-400">
            {opportunities.length} pools • ${formatNumber(data.summary.totalTvl / 1e6)}M TVL
          </div>
        </div>
      </div>

      <div className="mb-3 flex overflow-x-auto pb-2 gap-2">
        <button
          onClick={() => setSortBy("totalApr")}
          className={`px-2 py-1 rounded-md text-xs whitespace-nowrap ${
            sortBy === "totalApr"
              ? "bg-blue-600/70 text-white"
              : "bg-gray-800/50 text-gray-300"
          }`}
        >
          Total APR
        </button>
        <button
          onClick={() => setSortBy("poolFeeApr")}
          className={`px-2 py-1 rounded-md text-xs whitespace-nowrap ${
            sortBy === "poolFeeApr"
              ? "bg-blue-600/70 text-white"
              : "bg-gray-800/50 text-gray-300"
          }`}
        >
          Pool Fees
        </button>
        <button
          onClick={() => setSortBy("farmingApr")}
          className={`px-2 py-1 rounded-md text-xs whitespace-nowrap ${
            sortBy === "farmingApr"
              ? "bg-blue-600/70 text-white"
              : "bg-gray-800/50 text-gray-300"
          }`}
        >
          Farm Rewards
        </button>
        <button
          onClick={() => setSortBy("tvl")}
          className={`px-2 py-1 rounded-md text-xs whitespace-nowrap ${
            sortBy === "tvl"
              ? "bg-blue-600/70 text-white"
              : "bg-gray-800/50 text-gray-300"
          }`}
        >
          TVL
        </button>
        <button
          onClick={() => setSortBy("volume24h")}
          className={`px-2 py-1 rounded-md text-xs whitespace-nowrap ${
            sortBy === "volume24h"
              ? "bg-blue-600/70 text-white"
              : "bg-gray-800/50 text-gray-300"
          }`}
        >
          Volume
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {[...opportunities].sort(sortOpportunities).map((pool) => (
          <div
            key={pool.objectId}
            className={`bg-gray-900/30 rounded-lg border ${
              pool.userHoldsAllTokens
                ? "border-blue-500/30"
                : "border-gray-800/40"
            } p-3 relative overflow-hidden`}
          >
            {pool.userHoldsAllTokens && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-bl-md">
                You Hold All Tokens
              </div>
            )}
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {Object.values(pool.coins).map((coin, i) => (
                    <div
                      key={i}
                      className="h-7 w-7 rounded-full ring-2 ring-black overflow-hidden bg-gray-700 flex items-center justify-center text-xs font-bold"
                    >
                      {coin.iconUrl ? (
                        <img
                          src={coin.iconUrl}
                          alt={coin.symbol}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div>{coin.symbol?.charAt(0)}</div>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="font-medium text-white">{pool.name}</div>
                  <div className="text-xs text-gray-400">
                    {Object.values(pool.coins)
                      .map((coin) => `${Math.round(coin.weight * 100)}% ${coin.symbol}`)
                      .join(" / ")}
                  </div>
                  {pool.farm && (
                    <div className="text-xs text-green-400 mt-0.5">
                      Pool + Farm Package
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-white text-xl font-medium">
                  {pool.apr.farmingAprRange ? (
                    <span>{formatPercent(pool.apr.farmingAprRange.min)} - {formatPercent(pool.apr.farmingAprRange.max)}</span>
                  ) : (
                    formatPercent(pool.apr.totalApr)
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {pool.apr.farmingAprRange ? "Total APR Range" : "Total APR"}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="bg-gray-800/40 p-2 rounded-md">
                <div className="text-gray-400">Pool Fees</div>
                <div className="text-white font-medium mt-1">
                  {formatPercent(pool.apr.poolFeeApr)}
                </div>
              </div>
              <div className="bg-gray-800/40 p-2 rounded-md">
                <div className="text-gray-400">{pool.farm ? "Farm Base" : "No Farm"}</div>
                <div className="text-white font-medium mt-1">
                  {pool.farm ? formatPercent(pool.apr.farmingApr) : "-"}
                </div>
              </div>
              <div className="bg-gray-800/40 p-2 rounded-md">
                <div className="text-gray-400">TVL</div>
                <div className="text-white font-medium mt-1">
                  ${formatNumber(pool.tvl / 1e6)}M
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-gray-400">
                24h Vol: ${formatNumber(pool.volume24h / 1e3)}K
              </div>
              <button 
                onClick={() => handleProvideLiquidity(pool)}
                className="bg-white hover:bg-gray-100 text-black text-xs px-3 py-1.5 rounded-md font-medium"
              >
                {pool.farm ? "Add Liquidity & Farm" : "Provide Liquidity"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {opportunities.length === 0 && (
        <div className="text-center py-6 text-gray-400">
          {showOnlyEligible 
            ? "You don't hold tokens for any pools. Try 'Show All' to see all opportunities."
            : "No yield opportunities found"
          }
        </div>
      )}
    </div>
  );
}; 