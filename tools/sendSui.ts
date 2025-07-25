import { tool } from "ai";
import { z } from "zod";

export const sendSuiTool = tool({
  description:
    "Send SUI tokens to another address on the Sui blockchain. This tool allows transferring SUI from your wallet to any recipient address. The amount should be specified in MIST units (1 SUI = 1,000,000,000 MIST).",
  parameters: z.object({
    to: z.string().describe("The recipient Sui address to send tokens to"),
    amount: z.number().describe("The amount to send in MIST units"),
  }),
  execute: async (args: { to: string; amount: number }) => {
    return "TODO";
  },
});
