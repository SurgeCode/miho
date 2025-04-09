import { tool } from "ai";
import { z } from "zod";
import { supportedCoins } from "./constants";
import { Aftermath, CoinMetadaWithInfo } from "aftermath-ts-sdk";

export const listCoinsTool = tool({
  description:
    "Get a list of all supported coins that can be traded through Aftermath DEX",
  parameters: z.object({}),
  execute: async (): Promise<CoinMetadaWithInfo[]> => {
    const afSdk = new Aftermath("MAINNET");
    await afSdk.init();
    const coin = afSdk.Coin();

    const coinsMetadata = await coin.getCoinMetadatas({
      coins: supportedCoins,
    });

    return coinsMetadata;
  },
});
