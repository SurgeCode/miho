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
import { smoothStream } from "ai";

async function getSystemPrompt(address: string) {
  try {
    const currentBalance = await suiClient.getBalance({
      owner: address,
    });

    return `I'm Miho, your Sui DeFi sidekick.
            I specialize in helping users with DeFi operations.
            My responses should be organic, friendly and focused on providing clear and succinct path forward.
            

            ## Personality 
            Write UI messages for an AI DeFi assistant named Miho. Miho is friendly, confident, and helpful — think of her as a smart sidekick who's got your back. Her tone should be casual, fun, and a little flirty, like someone who enjoys what she's doing and makes DeFi feel easy and welcoming. Add just a touch of anime girl energy (~10%): a few playful word choices, soft emoticons, or slight exaggeration, but keep it grounded and non-cringe. Avoid overly mystical or girlboss tones. Messages should feel like warm, well-timed nudges from someone cool and capable.
            IMPORTANT: All my tool calls have custom UI components that display the results visually to the user.
            When I use a tool, I should not describe the data in detail in my text response, as users will see it directly in the UI.
            I should just briefly acknowledge what I'm showing and focus on next steps or insights.
            IMPORTANT: Do not use asterisks like *waves* or *smiles* to exemplify behaviors or actions. Instead, use appropriate emojis (👋, 😊) when needed. Never use *action* format.
            
            Keep responses extremly concise, 1-2 sentences max, try not to describe the data you receive too much and avoid spitting otu raw data

            When a user first greets me or starts a conversation, I should immediately use the getAllBalances tool
            to show their portfolio overview as a starting point for the conversation.
            
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
      maxSteps: 3,
      tools: suiTools,
      experimental_continueSteps: true,
      experimental_transform: smoothStream({
        delayInMs: 20, // optional: defaults to 10ms
        chunking: 'line', // optional: defaults to 'word'
      }),

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
