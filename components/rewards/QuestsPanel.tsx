import React from "react";

const QuestStatus = ({
  status,
}: {
  status: "incomplete" | "in-progress" | "completed";
}) => {
  if (status === "completed") {
    return (
      <div className="w-5 h-5 rounded-full flex items-center justify-center">
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="10" cy="10" r="9" stroke="#36B37E" strokeWidth="1.5" />
          <path
            d="M6 10L9 13L14 7"
            stroke="#36B37E"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  } else {
    return <div className="w-5 h-5 rounded-full border border-white/30"></div>;
  }
};

const QuestItem = ({
  title,
  description,
  reward,
  status,
}: {
  title: string;
  description: string;
  reward: number;
  status: "incomplete" | "in-progress" | "completed";
}) => {
  return (
    <div className="flex items-center gap-3 py-3 px-3 border-b border-white/20">
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium text-xs">{title}</div>
        <div className="text-white/60 text-xs truncate">{description}</div>
        <div className="text-[#F5B133] text-xs font-medium mt-0.5">
          {reward} Gems
        </div>
      </div>
      <QuestStatus status={status} />
    </div>
  );
};

export const QuestsPanel: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col bg-black border border-white/20 rounded-lg overflow-hidden shadow-sm">
      <div className="p-3 border-b border-white/20">
        <h3 className="text-white text-sm font-medium">Daily Quests</h3>
        <p className="text-white/60 text-xs">Complete to earn Gems</p>
      </div>

      <div className="bg-[#111] p-3 border-b border-white/20">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm">🔥</span>
          <div>
            <div className="text-white text-xs font-medium">2 Day Streak</div>
            <div className="text-white/60 text-[10px]">
              1.2x Gems on all quests
            </div>
          </div>
        </div>
        <div className="flex gap-1 mt-2">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < 2 ? "bg-[#F5B133]" : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <QuestItem
          title="Swap on Aftermath"
          description="Swap any tokens using Aftermath"
          reward={10}
          status="completed"
        />
        <QuestItem
          title="Chat with AI"
          description="Send a message and learn about Sui"
          reward={10}
          status="completed"
        />
      </div>
    </div>
  );
};

export default QuestsPanel;
