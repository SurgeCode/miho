import React from "react";

const GemIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2L2 9L12 22L22 9L12 2Z" fill="#F5B133" fillOpacity="0.9" />
    <path d="M12 2L2 9H22L12 2Z" fill="#F5B133" fillOpacity="1" />
  </svg>
);

export const PointsDisplay: React.FC = () => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black border border-white/20 shadow-md">
      <GemIcon />
      <span className="text-white text-sm font-medium">1000 Gems</span>
    </div>
  );
};

export default PointsDisplay;
