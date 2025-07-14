import React from 'react';

const LoadingDots = ({ className = "loading-dots" }) => {
  return (
    <div className={className}>
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </div>
  );
};

export default LoadingDots; 