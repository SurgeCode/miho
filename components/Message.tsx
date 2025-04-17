import React, { memo, ReactNode, useEffect, useRef, useState } from "react";
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

type Part = {
  type: string;
  text?: string;
  toolInvocation?: any;
};


export const Message = memo(function Message({ message }: MessageProps) {
  if (message.role === "system") {
    return null;
  }

  const hasParts = message.parts && message.parts.length > 0;

  let toolComponent: ReactNode = null;

  if (!toolComponent && hasParts && message.parts) {
    message.parts.forEach((part: Part) => {
      if (part.type === "tool-invocation") {
        const toolInvocation = part.toolInvocation;
        if (toolInvocation.state === "result" && toolInvocation.result) {
          switch (toolInvocation.toolName) {
            case "sendSui":
              toolComponent = <SendSuiComponent data={toolInvocation.result} />;
              break;
            case "listCoins":
              toolComponent = <ListCoinsComponent data={toolInvocation.result} />;
              break;
            case "swap":
              toolComponent = <SwapToolComponent data={toolInvocation.result} />;
              break;
            case "getAllBalances":
              toolComponent = <GetAllBalancesComponent data={toolInvocation.result} />;
              break;
            case "liquidStaking":
              toolComponent = <LiquidStakingComponent data={toolInvocation.result} />;
              break;
            default:
              if (!toolComponent) {
                toolComponent = (
                  <div>
                    <pre className="bg-gray-900 p-2 rounded text-xs text-white/80 overflow-x-auto">
                      {JSON.stringify(toolInvocation.result, null, 2)}
                    </pre>
                  </div>
                );
              }
          }
        }
      }
    });
  }

  return (
    <div className="mb-6">
      {message.role === "user" ? (
        <div className="flex items-start gap-4 border border-white/20 rounded-lg p-4 bg-black shadow-sm">
          <div className="w-16 flex-shrink-0 text-right text-white/70">
            You:
          </div>
          <div className="flex-1">
            <p className="text-white text-lg pl-7">
              {message.content}
            </p>
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
              {message.content}
            </div>
          </div>

          {(hasParts && toolComponent) && toolComponent && (
            <div className="mt-2 w-full">{toolComponent}</div>
          )}
        </div>
      )}
    </div>
  );
});
