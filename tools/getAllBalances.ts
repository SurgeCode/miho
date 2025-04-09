import { tool } from "ai";
import { z } from "zod";
import { getAllBalances } from "./sui-utils";
import { Aftermath } from "aftermath-ts-sdk";

const SUI_TYPE = "0x2::sui::SUI";

export const getAllBalancesTool = tool({
  description:
    "Get all coin balances for a given address on the Sui blockchain",
  parameters: z.object({
    address: z.string().describe("The Sui address to get balances for"),
  }),
  execute: async (args: { address: string }) => {
    const balances = await getAllBalances(args.address);
    const afSdk = new Aftermath("MAINNET");
    await afSdk.init();
    const coin = afSdk.Coin();
    const prices = afSdk.Prices();

    // Make sure we include SUI in our price request
    const coinTypes = balances.map((b) => b.coinType);
    if (
      !coinTypes.includes(SUI_TYPE) &&
      balances.some((b) => b.coinType.includes("sui::SUI"))
    ) {
      coinTypes.push(SUI_TYPE);
    }

    const decimals = await coin.getCoinsToDecimals({ coins: coinTypes });

    // Get price data for all coin types
    let priceData;
    try {
      // Get SUI price specifically first
      const suiPrice = await prices.getCoinPrice({ coin: SUI_TYPE });

      // Then get all other coin prices
      priceData = await prices.getCoinsToPrice({ coins: coinTypes });

      // Ensure SUI price is included
      if (!priceData[SUI_TYPE] && suiPrice) {
        priceData[SUI_TYPE] = suiPrice;
      }
    } catch (error) {
      console.error("Error fetching prices:", error);
      priceData = {};
    }

    let totalUsdValue = 0;
    const formattedBalances = balances.map((b) => {
      const decimal = decimals[b.coinType] || 9; // Default to 9 if not found
      const normalizedBalance = Number(b.totalBalance) / Math.pow(10, decimal);

      // Determine if this is a SUI token - match both exact and variant forms
      const isSuiToken =
        b.coinType === SUI_TYPE || b.coinType.endsWith("::sui::SUI");

      // Calculate USD value if price exists
      let price = priceData[b.coinType];

      // For SUI tokens, use the canonical SUI price if the specific variant doesn't have a price
      if (!price && isSuiToken && priceData[SUI_TYPE]) {
        price = priceData[SUI_TYPE];
      }

      const usdValue = price ? normalizedBalance * price : undefined;

      if (usdValue) {
        totalUsdValue += usdValue;
      }

      return {
        ...b,
        normalizedBalance,
        usdValue,
      };
    });

    return {
      balances: formattedBalances,
      totalUsdValue,
    };
  },
});

export default getAllBalancesTool;
