import { tool } from "ai";
import { z } from "zod";
import { getAllBalances, suiClient } from "./sui-utils";
import { Aftermath } from "aftermath-ts-sdk";

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
  description: "Get all coin balances for a given address on the Sui blockchain",
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

      const [priceData] = await Promise.all([
        prices.getCoinsToPrice({ coins: coinTypes }).catch(() => ({})),
      ]);
      
      let totalUsdValue = 0;
      const enrichedBalances = await Promise.all(balances.map(async balance => {
        let coinType = balance.coinType;
        const price = (priceData as Record<string, number>)[coinType] || 0;
        const metadata = await suiClient.getCoinMetadata({coinType})
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
            iconUrl: metadata.iconUrl && metadata.iconUrl.startsWith("https") ? metadata.iconUrl : undefined,
            decimals
          } : undefined
        };
      }));

      const balancesWithManualMetadata = appendManualMetadata(enrichedBalances);
      return {
        balances: balancesWithManualMetadata as BalanceItem[],
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
      ? { ...balance, metadata: { ...balance.metadata!, iconUrl: "https://raw.githubusercontent.com/MystenLabs/sui/main/apps/icons/sui.svg" }}
      : balance
  );