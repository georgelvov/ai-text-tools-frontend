import React from 'react';

const ErrorMessage = ({ error, className = "error-message" }) => {
  if (!error) return null;
  
  return (
    <div className={className}>
      {error}
    </div>
  );
};

export default ErrorMessage; 