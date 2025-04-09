import React from "react";
import { Message as AIMessage } from "ai";
import {
  SendSuiComponent,
  ListCoinsComponent,
  SwapToolComponent,
  GetAllBalancesComponent,
  LiquidStakingComponent,
} from "./tools";

interface MessageProps {
  message: AIMessage;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const hasTools =
    message.toolInvocations && message.toolInvocations.length > 0;
  let toolComponent = null;
  if (hasTools && message.toolInvocations?.[0]) {
    const tool = message.toolInvocations[0];

    if (tool.state === "result" && tool.result) {
      console.log(tool.result);
      switch (tool.toolName) {
        case "sendSui":
          toolComponent = <SendSuiComponent data={tool.result} />;
          break;
        case "listCoins":
          toolComponent = <ListCoinsComponent data={tool.result} />;
          break;
        case "swap":
          toolComponent = <SwapToolComponent data={tool.result} />;
          break;
        case "getAllBalances":
          toolComponent = <GetAllBalancesComponent data={tool.result} />;
          break;
        case "liquidStakingTool":
          toolComponent = <LiquidStakingComponent data={tool.result} />;
          break;
        default:
          console.log("No component found for tool:", tool.toolName);
          toolComponent = (
            <div>
              <pre className="bg-gray-900 p-2 rounded text-xs text-white/80 overflow-x-auto">
                {JSON.stringify(tool.result, null, 2)}
              </pre>
            </div>
          );
      }
    }
  }

  return (
    <div className="mb-6">
      {message.role === "user" ? (
        <div className="flex items-start gap-4 border border-white/20 rounded-lg p-4 bg-black shadow-sm">
          <div className="w-16 flex-shrink-0 text-right text-white/70">
            You:
          </div>
          <div className="flex-1">
            <p className="text-white text-lg pl-7">{message.content}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex items-start gap-6 mb-2 mx-1">
            <div className="w-[100px] flex-shrink-0">
              <img
                src="https://i.imgur.com/I855R4c.jpeg"
                alt="AI Assistant"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-white text-lg">{message.content}</p>
            </div>
          </div>

          {hasTools && toolComponent && (
            <div className="mt-2 w-full">{toolComponent}</div>
          )}
        </div>
      )}
    </div>
  );
};
