import { tool } from "ai";
import { z } from "zod";
import { suiClient } from "./sui-utils";
import { Aftermath } from "aftermath-ts-sdk";
import { supportedCoins } from "./constants";
export const swapTool = tool({
  description:
    "Execute swaps using Aftermath DEX on Sui. Provide the coin types and amount to swap. Set isAutonomous=true to execute the swap automatically or isAutonomous=false to return the transaction for wallet approval. The response will show the input and output amounts. Only use supported coins: " +
    supportedCoins.join(", "),
  parameters: z.object({
    coinInType: z.string().describe('Input coin type (e.g. "0x2::sui::SUI")'),
    coinOutType: z.string().describe("Output coin type"),
    amount: z.string().describe("Amount to swap in base units"),
    slippage: z.number().describe("Slippage tolerance (e.g. 0.01 for 1%)"),
    isAutonomous: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "If true, executes the transaction. If false, just returns the transaction payload for wallet approval."
      ),
    address: z.string().describe("Sui wallet address of user"),
  }),
  execute: async (args) => {
    const afSdk = new Aftermath("MAINNET");
    await afSdk.init();
    const router = afSdk.Router();

    const coinInMetadata = await suiClient.getCoinMetadata({
      coinType: args.coinInType,
    });
    const coinOutMetadata = await suiClient.getCoinMetadata({
      coinType: args.coinOutType,
    });
    const coinInMetadataWithIcon = addMissingIcons(
      coinInMetadata,
      args.coinInType
    );
    const coinOutMetadataWithIcon = addMissingIcons(
      coinOutMetadata,
      args.coinOutType
    );
    const amountBigInt = BigInt(args.amount);

    try {
      const route = await router.getCompleteTradeRouteGivenAmountIn({
        coinInType: args.coinInType,
        coinOutType: args.coinOutType,
        coinInAmount: amountBigInt,
        referrer:
          "0x06c08cca282ea5f05ed81d3ce08872a99451571971f7ff4b63ee8dddad4b43c4",
      });

      let transaction;

      try {
        transaction = await router.getTransactionForCompleteTradeRoute({
          walletAddress: args.address,
          completeRoute: route,
          slippage: args.slippage,
        });

        const txBytes = await transaction.build({ client: suiClient });

        return {
          success: true,
          transactionBytes: txBytes,
          route,
          coinMetadata: {
            coinIn: coinInMetadataWithIcon,
            coinOut: coinOutMetadataWithIcon,
          },
        };
      } catch (txError) {
        console.error("Error getting transaction from Aftermath:", txError);
        return {
          success: false,
          error:
            txError instanceof Error
              ? txError.message
              : "Failed to generate transaction",
          route,
          coinMetadata: {
            coinIn: coinInMetadataWithIcon,
            coinOut: coinOutMetadataWithIcon,
          },
        };
      }
    } catch (error) {
      console.error("Swap tool error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  },
});

const SUI_ICON_URL =
  "https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png";
function addMissingIcons(metadata: any, coinType: string) {
  if (metadata && coinType.includes("::sui::SUI")) {
    return { ...metadata, iconUrl: SUI_ICON_URL };
  }
  return metadata;
}
