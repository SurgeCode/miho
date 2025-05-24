import { tool } from "ai";
import { z } from "zod";
import { getAllBalances, suiClient } from "./sui-utils";
import { Aftermath } from "aftermath-ts-sdk";
import { CURATED_POOLS_AND_FARMS } from "./curatedPoolsAndFarms";

interface BalanceItem {
  coinType: string;
  coinObjectCount: number;
  totalBalance: string;
  lockedBalance?: Record<string, string>;
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

export const getAllBalancesTool = tool({
  description: "Get all coin balances and staked positions for a given address on the Sui blockchain",
  parameters: z.object({
    address: z.string().describe("The Sui address to get balances for"),
  }),
  execute: async (args: { address: string }) => {
    try {
      const balances = await getAllBalances(args.address);
      const afSdk = new Aftermath("MAINNET");
      await afSdk.init();
      const prices = afSdk.Prices();
      const coinTypes = balances.map(b =>  b.coinType);
      const farms = afSdk.Farms();

      const stakedPositions = await farms.getOwnedStakedPositions({walletAddress: args.address}); 
    
      const poolFarmNameMap = new Map<string, string>();
      CURATED_POOLS_AND_FARMS.forEach(pair => {
        poolFarmNameMap.set(pair.pool.lpCoinType, pair.pool.name);
        if (pair.farm) poolFarmNameMap.set(pair.farm.objectId, pair.pool.name);
      });

      const allCoinTypes = new Set<string>(coinTypes);
      stakedPositions.forEach(pos => {
        if (pos.stakedPosition?.stakeCoinType) {
          allCoinTypes.add(pos.stakedPosition.stakeCoinType);
        }
      });

      const [priceData, decimalsData] = await Promise.all([
        prices.getCoinsToPrice({ coins: Array.from(allCoinTypes) }).catch(() => ({})),
        afSdk.Coin().getCoinsToDecimals({ coins: Array.from(allCoinTypes) }).catch(() => ({}))
      ]);
      
      let totalUsdValue = 0;
      const enrichedBalances = await Promise.all(balances.map(async balance => {
        let coinType = balance.coinType;
        const price = (priceData as Record<string, number>)[coinType] || 0;
        const metadata = await afSdk.Coin().getCoinMetadata(coinType)
        const decimals = metadata?.decimals || 9;
        const normalizedBalance = Number(balance.totalBalance) / Math.pow(10, decimals);
        const usdValue = normalizedBalance * price;
        totalUsdValue += usdValue;
        return {
          ...balance,
          normalizedBalance,
          usdValue,
          metadata: metadata ? {
            name: metadata.name || '',
            symbol: metadata.symbol || '',
            description: metadata.description,
            iconUrl: metadata.iconUrl || null,
            decimals
          } : undefined
        };
      }));

      const balancesWithManualMetadata = appendManualMetadata(enrichedBalances);
      
      const enrichedStakedPositions = stakedPositions.map(position => {
        const lpCoinType = position.stakedPosition.stakeCoinType;
        const poolName = poolFarmNameMap.get(lpCoinType) || poolFarmNameMap.get(position.stakedPosition.stakingPoolObjectId) || 'Unknown Pool';
        const lpPrice = (priceData as Record<string, number>)[lpCoinType] || 0;
        const lpDecimals = (decimalsData as Record<string, number>)[lpCoinType] || 9;
        const stakedAmount = Number(position.stakedPosition.stakedAmount);
        const normalizedAmount = stakedAmount / Math.pow(10, lpDecimals);
        const valueUsd = normalizedAmount * lpPrice;
        
        return {
          ...position,
          poolName,
          normalizedAmount,
          valueUsd,
          lpDecimals
        };
      });
      
      enrichedStakedPositions.forEach(pos => {
        if (pos.valueUsd) totalUsdValue += pos.valueUsd;
      });
      
      return {
        balances: balancesWithManualMetadata as BalanceItem[],
        stakedPositions: enrichedStakedPositions,
        totalUsdValue
      };
  
    } catch (error) {
      console.error("Error in getAllBalancesTool:", error);
      throw error;
    }
  },
});

export default getAllBalancesTool;

const appendManualMetadata = (balances: BalanceItem[]): BalanceItem[] =>
  balances.map(balance => 
    balance.coinType === "0x2::sui::SUI" 
      ? { ...balance, metadata: { ...balance.metadata!, iconUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcPIvII_n8A-fK_rZBTtIbZ1wWh4I9edzR5A&s" }}
      : balance
  );
