import React from "react";

const LoadingDots = () => {
  return (
    <div className="inline-flex justify-center items-center bg-black">
      <div className="loading-dot w-3 h-3 mx-2 rounded-full bg-white animate-color-change delay-0"></div>
      <div className="loading-dot w-3 h-3 mx-2 rounded-full bg-gray-400 animate-color-change delay-200"></div>
      <div className="loading-dot w-3 h-3 mx-2 rounded-full bg-gray-600 animate-color-change delay-400"></div>
    </div>
  );
};

export default LoadingDots;
