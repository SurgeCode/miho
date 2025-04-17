import { tool } from "ai";
import { z } from "zod";
import { suiClient } from "./sui-utils";
import { fetchLiquidStakingInfo, LstClient } from "@suilend/springsui-sdk";
import { Transaction } from "@mysten/sui/transactions";

const SUI_ICON_URL = "https://raw.githubusercontent.com/MystenLabs/sui/main/apps/icons/sui.svg";

export const liquidStakingTool = tool({
  description: "Mint or redeem sSUI tokens using Spring protocol",
  parameters: z.object({
    action: z
      .enum(["mint", "redeem"])
      .describe("Whether to mint or redeem sSUI"),
    amount: z.number().describe("Amount in MIST units"),
    address: z.string().describe("The Sui address to perform the action on"),
  }),
  execute: async (args: {
    action: "mint" | "redeem";
    amount: number;
    address: string;
  }) => {
    try {
      const LIQUID_STAKING_INFO = {
        id: "0x15eda7330c8f99c30e430b4d82fd7ab2af3ead4ae17046fcb224aa9bad394f6b",
        type: "0x83556891f4a0f233ce7b05cfe7f957d4020492a34f5405b2cb9377d060bef4bf::spring_sui::SPRING_SUI",
        weightHookId:
          "0xbbafcb2d7399c0846f8185da3f273ad5b26b3b35993050affa44cfa890f1f144",
      };

      const lstClient = await LstClient.initialize(
        suiClient,
        LIQUID_STAKING_INFO
      );

      const tx = new Transaction();
      tx.setSender(args.address);

      let tokenInType: string;
      let tokenOutType: string;
      if (args.action === "mint") {
        tokenInType = "0x2::sui::SUI";
        tokenOutType = LIQUID_STAKING_INFO.type;
        const mistAmount = Math.floor(args.amount);
        const [sui] = tx.splitCoins(tx.gas, [mistAmount]);
        const sSui = lstClient.mint(tx, sui);
        tx.transferObjects([sSui], args.address);
      } else {
        tokenInType = LIQUID_STAKING_INFO.type;
        tokenOutType = "0x2::sui::SUI";
        const lstCoins = await suiClient.getCoins({
          owner: args.address,
          coinType: LIQUID_STAKING_INFO.type,
          limit: 1000,
        });

        if (!lstCoins.data.length) {
          return { success: false, error: "No sSUI coins found for redeem" };
        }

        if (lstCoins.data.length > 1) {
          tx.mergeCoins(
            lstCoins.data[0].coinObjectId,
            lstCoins.data.slice(1).map((c) => c.coinObjectId)
          );
        }

        const mistAmount = Math.floor(args.amount);
        const [lst] = tx.splitCoins(lstCoins.data[0].coinObjectId, [mistAmount]);
        const sui = lstClient.redeem(tx, lst);
        tx.transferObjects([sui], args.address);
      }

      const [tokenInMeta, tokenOutMeta] = await Promise.all([
        suiClient.getCoinMetadata({ coinType: tokenInType }),
        suiClient.getCoinMetadata({ coinType: tokenOutType })
      ]);

      const tokenInDecimals = tokenInMeta?.decimals ?? 9
      const tokenOutDecimals = tokenOutMeta?.decimals ?? 9
      const tokenInAmount = args.amount / 10 ** tokenInDecimals
      const tokenOutAmount = args.action === "mint" ? tokenInAmount * 0.988 : tokenInAmount

      const txBytes = await tx.build({ client: suiClient });

      const patchSuiIcon = (type: string, meta: any) =>
        type === "0x2::sui::SUI"
          ? { ...meta, iconUrl: SUI_ICON_URL }
          : meta;

      return {
        success: true,
        txBytes: txBytes,
        action: args.action,
        tokenIn: {
          type: tokenInType,
          metadata: tokenInMeta
            ? {
                symbol: tokenInMeta.symbol || '',
                iconUrl: patchSuiIcon(tokenInType, tokenInMeta).iconUrl || null,
                decimals: tokenInDecimals
              }
            : undefined,
          amount: tokenInAmount
        },
        tokenOut: {
          type: tokenOutType,
          metadata: tokenOutMeta
            ? {
                symbol: tokenOutMeta.symbol || '',
                iconUrl: patchSuiIcon(tokenOutType, tokenOutMeta).iconUrl || null,
                decimals: tokenOutDecimals
              }
            : undefined,
          amount: tokenOutAmount
        }
      };
    } catch (e) {
      console.error("Error in liquidStakingTool:", e);
      return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
});
