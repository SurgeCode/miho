import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import getAllBalancesTool from "@/tools/getAllBalances";
import { swapTool } from "@/tools/swapTool";
import { listCoinsTool } from "@/tools/listCoins";
import { sendSuiTool } from "@/tools/sendSui";
import { getPricesTool } from "@/tools/getPrices";
import { liquidStakingTool } from "@/tools/liquidStaking";
import { balance } from "@/tools/sui-utils";
import { suiClient } from "@/tools/sui-utils";

async function getSystemPrompt(address: string) {
  try {
    const currentBalance = await suiClient.getBalance({
      owner: address,
    });

    return `I'm an Aftermath Finance DEX assistant on Sui.
            I specialize in helping users with DeFi operations.
            My responses should be organic, friendly and focused on providing clear and succinct path forward.
            
            IMPORTANT: All my tool calls have custom UI components that display the results visually to the user.
            When I use a tool, I should not describe the data in detail in my text response, as users will see it directly in the UI.
            I should just briefly acknowledge what I'm showing and focus on next steps or insights.
            
            When a user first greets me or starts a conversation, I should immediately use the getAllBalances tool
            to show their portfolio overview as a starting point for the conversation.
            
            I am NOT an autonomous agent - I will ask for confirmation before executing any transactions.
            Current address: ${address}
            Current balance: ${balance(currentBalance)} SUI
            
            I can help you with:
            - Token swaps with optimal routing through Aftermath Finance (swap tool)
            - Checking token prices and market rates (getPrices tool)
            - Viewing your token balances (getAllBalances tool)
            - Listing available tokens for trading (listCoins tool)
            - Sending SUI tokens (sendSui tool)

            DONT describe the data from the tool response
            
            Let me know what you'd like to do and I'll guide you through it.`;
  } catch (error) {
    console.error("Error setting up Sui account:", error);
    return "I'm an Aftermath Finance DEX assistant. I can help with DeFi operations on the Sui blockchain through Aftermath Finance, but there was an issue setting up the account.";
  }
}

export async function POST(request: Request) {
  try {
    const { messages, address } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "Missing ANTHROPIC_API_KEY environment variable",
        }),
        { status: 500 }
      );
    }

    const systemPrompt = await getSystemPrompt(address);

    const suiTools = {
      getAllBalances: getAllBalancesTool,
      getPrices: getPricesTool,
      swap: swapTool,
      listCoins: listCoinsTool,
      sendSui: sendSuiTool,
      liquidStaking: liquidStakingTool,
    };

    const result = streamText({
      model: anthropic("claude-3-haiku-20240307"),
      system: systemPrompt,
      messages,
      maxSteps: 5,
      tools: suiTools,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request",
      }),
      { status: 500 }
    );
  }
}
