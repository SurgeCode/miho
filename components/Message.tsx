import React, { memo, ReactNode, useEffect, useRef, useState } from "react";
import { Message as AIMessage } from "ai";
import {
  SendSuiComponent,
  ListCoinsComponent,
  SwapToolComponent,
  GetAllBalancesComponent,
  LiquidStakingComponent,
  YieldOpportunitiesComponent,
  AddLiquidityComponent,
} from "./tools";

interface MessageProps {
  message: AIMessage;
}

type Part = {
  type: string;
  text?: string;
  toolInvocation?: any;
};

// Default loading component
const DefaultLoadingComponent = () => (
  <div className="w-full bg-black/40 p-4 rounded-lg animate-pulse">
    <div className="h-4 bg-gray-800/50 rounded w-full" />
  </div>
);

// Tool configuration
const TOOL_CONFIG: Record<string, {
  component: (data: any) => ReactNode;
  loadingComponent?: () => ReactNode;
}> = {
  sendSui: {
    component: (data) => <SendSuiComponent data={data} />,
  },
  listCoins: {
    component: (data) => <ListCoinsComponent data={data} />,
  },
  swap: {
    component: (data) => <SwapToolComponent data={data} />,
  },
  getAllBalances: {
    component: (data) => <GetAllBalancesComponent data={data} isLoading={false} />,
    loadingComponent: () => <GetAllBalancesComponent data={{ balances: [] }} isLoading={true} />,
  },
  liquidStaking: {
    component: (data) => <LiquidStakingComponent data={data} />,
  },
  getYieldOpportunities: {
    component: (data) => <YieldOpportunitiesComponent data={data} />,
    loadingComponent: () => (
      <div className="w-full bg-black/40 p-4 rounded-lg animate-pulse">
        <div className="h-6 bg-gray-800/50 rounded w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-900/30 rounded-lg border border-gray-800/40" />
          ))}
        </div>
      </div>
    ),
  },
  addLiquidity: {
    component: (data) => <AddLiquidityComponent data={data} />,
  },
};

export const Message = memo(function Message({ message }: MessageProps) {
  if (message.role === "system") {
    return null;
  }

  const hasParts = message.parts && message.parts.length > 0;
  let toolComponent: ReactNode = null;

  if (hasParts && message.parts) {
    for (let i = message.parts.length - 1; i >= 0; i--) {
      const part = message.parts[i] as Part;
      if (part.type === "tool-invocation") {
        const toolInvocation = part.toolInvocation;
        const toolName = toolInvocation.toolName;
        const toolConfig = TOOL_CONFIG[toolName];

        if (toolInvocation.state === "pending" || toolInvocation.state === "call") {
          if (toolConfig?.loadingComponent) {
            toolComponent = toolConfig.loadingComponent();
          } else {
            toolComponent = <DefaultLoadingComponent />;
          }
          break;
        }

        if (toolInvocation.state === "result" && toolInvocation.result) {
          if (toolConfig) {
            toolComponent = toolConfig.component(toolInvocation.result);
          } else {
            toolComponent = (
              <div>
                <pre className="bg-gray-900 p-2 rounded text-xs text-white/80 overflow-x-auto">
                  {JSON.stringify(toolInvocation.result, null, 2)}
                </pre>
              </div>
            );
          }
          break;
        }
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

          {toolComponent && (
            <div className="mt-2 w-full">{toolComponent}</div>
          )}
        </div>
      )}
    </div>
  );
});
