import React, { useState } from 'react';

const CopyButton = ({ text, className = '', title = 'Copy text' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text || text.trim() === '') return;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!text || text.trim() === '') return null;

  return (
    <button 
      type="button" 
      className={`btn btn-sm btn-outline-secondary copy-btn ${className}`}
      onClick={handleCopy}
      title={title}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

export default CopyButton; 