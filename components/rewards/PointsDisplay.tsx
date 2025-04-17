import React from "react";

const BubbleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
    <path d="M14.5 9.5C14.5 10.3284 13.8284 11 13 11C12.1716 11 11.5 10.3284 11.5 9.5C11.5 8.67157 12.1716 8 13 8C13.8284 8 14.5 8.67157 14.5 9.5Z" fill="white" fillOpacity="0.8"/>
  </svg>
);

export const BubblesDisplay: React.FC = () => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black border border-white/20 shadow-md text-blue-300">
      <BubbleIcon />
      <span className="text-sm font-medium">0 Bubbles</span>
    </div>
  );
};

export default BubblesDisplay;
