import { tool } from "ai";
import { z } from "zod";
import { Aftermath, PoolStats, FarmsStakingPoolObject, FarmsStakingPool, FarmsStakingPoolRewardCoin } from "aftermath-ts-sdk";
import { getAllBalances, suiClient } from "./sui-utils";
import { CURATED_POOLS_AND_FARMS } from "./curatedPoolsAndFarms";

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

// Define proper types for the Aftermath SDK
interface PoolData {
  id: string;
  name: string;
  lpCoinType: string;
  tvlUsd: number;
  volume24h: number;
  aprUsd: number;
  coins: Record<string, {
    weight: number;
    balance: string;
    normalizedBalance: number;
  }>;
}

interface FarmData {
  id: string;
  stakeCoinType: string;
  maxLockupDuration: number;
  calcTotalApr: (params: { coinsToPrice: any; coinsToDecimals: any; tvlUsd: number }) => number;
  calcMultiplier: (params: { lockDurationMs: number }) => number | bigint;
}

interface FarmInfo {
  farm: { id: string };
  data: FarmData;
}

export const getYieldOpportunitiesTool = tool({
  description: "Get curated liquidity pool and farming yield opportunities with detailed APR breakdown",
  parameters: z.object({
    address: z.string().describe("The Sui address to get recommendations for"),
    sortBy: z.enum(["totalApr", "poolFeeApr", "farmingApr", "tvl", "volume24h"]).optional().describe("Criteria to sort opportunities by"),
    minTvl: z.number().optional().describe("Minimum TVL filter"),
    onlyUserTokens: z.boolean().optional().describe("Filter to only show pools containing tokens the user already holds"),
    limit: z.number().optional().describe("Number of opportunities to return (default 5)"),
  }),
  execute: async (args) => {
    try {
      console.log("Starting yield opportunities tool execution");
      
      const afSdk = new Aftermath("MAINNET");
      await afSdk.init();
      const poolsClient = afSdk.Pools();
      const farmsClient = afSdk.Farms();
      const pricesClient = afSdk.Prices();
      const coinClient = afSdk.Coin();
      
      console.log(`Getting balances for address: ${args.address}`);
      const userBalancesResult = await getAllBalances(args.address);
      const userBalances = userBalancesResult || [];
      const userBalanceMap = new Map(userBalances.map(b => [b.coinType, b.totalBalance]));

      // Get pool IDs from our curated list
      const poolIds = CURATED_POOLS_AND_FARMS.map(p => p.pool.objectId);
      
      console.log("Fetching pool stats for curated pools");
      const poolStats = await poolsClient.getPoolsStats({ poolIds });

      console.log("Fetching all farm instances");
      const allFarmInstances = await farmsClient.getAllStakingPools();
      const farmMap = new Map(allFarmInstances.map(f => [f.stakingPool.objectId, f]));

      console.log("Collecting coin types for price fetching");
      const coinTypesToPriceSet = new Set<string>();

      CURATED_POOLS_AND_FARMS.forEach(pair => {
        pair.pool.coins.forEach(coin => coinTypesToPriceSet.add(coin.coinType));
        coinTypesToPriceSet.add(pair.pool.lpCoinType);
        if (pair.farm) {
          pair.farm.rewardCoins.forEach(reward => coinTypesToPriceSet.add(reward.coinType));
        }
      });

      const uniqueCoinTypes = Array.from(coinTypesToPriceSet);
      console.log(`Fetching prices and decimals for ${uniqueCoinTypes.length} coin types`);
      
      const [prices, decimals, coinMetadata] = await Promise.all([
        pricesClient.getCoinsToPrice({ coins: uniqueCoinTypes }),
        coinClient.getCoinsToDecimals({ coins: uniqueCoinTypes }),
        Promise.all(uniqueCoinTypes.map(async (coinType) => {
          try {
            const metadata = await suiClient.getCoinMetadata({ coinType });
            return { coinType, metadata };
          } catch (e) {
            return { coinType, metadata: null };
          }
        }))
      ]);

      const coinMetadataMap = new Map(coinMetadata.map(item => [item.coinType, item.metadata]));

      const poolsWithApr: PoolWithApr[] = [];

      for (let i = 0; i < CURATED_POOLS_AND_FARMS.length; i++) {
        const curatedPair = CURATED_POOLS_AND_FARMS[i];
        const stats = poolStats[i];
        
        if (!stats) continue;

        const coins: PoolWithApr['coins'] = {};
        let userHoldsAllTokens = true;

        curatedPair.pool.coins.forEach(coin => {
          const metadata = coinMetadataMap.get(coin.coinType);
          const userBalance = Number(userBalanceMap.get(coin.coinType) || 0);
          
          if (userBalance <= 0) {
            userHoldsAllTokens = false;
          }

          coins[coin.coinType] = {
            coinType: coin.coinType,
            weight: coin.weight / 100, // Convert percentage to decimal
            balance: "0", // We don't have this from stats
            normalizedBalance: 0,
            symbol: metadata?.symbol || coin.symbol,
            name: metadata?.name,
            iconUrl: metadata?.iconUrl || undefined,
            userBalance
          };
        });

        if (args.onlyUserTokens && !userHoldsAllTokens) {
          continue;
        }

        const poolFeeApr = stats.apr || 0;

        let farmingApr = 0;
        let farmingAprRange;
        let lockDurationOptions;
        let farmData;

        if (curatedPair.farm) {
          const farmInstance = farmMap.get(curatedPair.farm.objectId);
          
          if (farmInstance && farmInstance.calcTotalApr) {
            let farmTvl = 0;
            if (farmInstance.stakingPool.stakedAmount && prices[curatedPair.pool.lpCoinType]) {
              const stakedAmount = Number(farmInstance.stakingPool.stakedAmount);
              const lpDecimals = decimals[curatedPair.pool.lpCoinType] || 9;
              const lpPrice = prices[curatedPair.pool.lpCoinType];
              
              farmTvl = (stakedAmount / Math.pow(10, lpDecimals)) * lpPrice;
            }
            
            farmingApr = farmInstance.calcTotalApr({
              coinsToPrice: prices,
              coinsToDecimals: decimals,
              tvlUsd: farmTvl
            });

            if (farmInstance.stakingPool.maxLockDurationMs > 0) {
              const lockOptions = [
                { days: 7, multiplier: 1.25 },
                { days: 30, multiplier: 1.5 },
                { days: 90, multiplier: 2 },
                { days: 180, multiplier: 2.5 }
              ];

              lockDurationOptions = lockOptions
                .filter(opt => opt.days * 86400000 <= farmInstance.stakingPool.maxLockDurationMs)
                .map(opt => ({
                  durationDays: opt.days,
                  multiplier: opt.multiplier,
                  boostedApr: farmingApr * opt.multiplier
                }));

              if (lockDurationOptions.length > 0) {
                const maxBoost = lockDurationOptions[lockDurationOptions.length - 1];
                farmingAprRange = {
                  min: farmingApr,
                  max: maxBoost.boostedApr
                };
              }
            }

            const rewardCoins = curatedPair.farm.rewardCoins.map(reward => {
              const metadata = coinMetadataMap.get(reward.coinType);
              return {
                coinType: reward.coinType,
                symbol: metadata?.symbol || reward.symbol
              };
            });

            farmData = {
              objectId: curatedPair.farm.objectId,
              rewardCoins,
              lockDurationOptions
            };
          }
        }

        const poolWithApr: PoolWithApr = {
          objectId: curatedPair.pool.objectId,
          name: curatedPair.pool.name,
          lpCoinType: curatedPair.pool.lpCoinType,
          coins,
          tvl: stats.tvl,
          volume24h: stats.volume,
          apr: {
            poolFeeApr,
            farmingApr,
            totalApr: poolFeeApr + farmingApr,
            farmingAprRange
          },
          userHoldsAllTokens,
          farm: farmData
        };

        if (!args.minTvl || poolWithApr.tvl >= args.minTvl) {
          poolsWithApr.push(poolWithApr);
        }
      }

      poolsWithApr.sort((a, b) => {
        switch (args.sortBy) {
          case "poolFeeApr":
            return b.apr.poolFeeApr - a.apr.poolFeeApr;
          case "farmingApr":
            return b.apr.farmingApr - a.apr.farmingApr;
          case "tvl":
            return b.tvl - a.tvl;
          case "volume24h":
            return b.volume24h - a.volume24h;
          case "totalApr":
          default:
            return b.apr.totalApr - a.apr.totalApr;
        }
      });

      const limit = typeof args.limit === "number" && args.limit > 0 ? args.limit : 5;

      return {
        opportunities: poolsWithApr.slice(0, limit),
        summary: {
          totalOpportunities: poolsWithApr.length,
          userEligiblePools: poolsWithApr.filter(p => p.userHoldsAllTokens).length,
          averageTotalApr: poolsWithApr.length > 0 
            ? poolsWithApr.reduce((sum, p) => sum + p.apr.totalApr, 0) / poolsWithApr.length
            : 0,
          totalTvl: poolsWithApr.reduce((sum, p) => sum + p.tvl, 0)
        }
      };
    
    } catch (error) {
      console.error("Error in getYieldOpportunitiesTool:", error);
      throw error;
    }
  }
});
