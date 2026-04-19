import React from 'react';

interface BrainLogoProps {
  className?: string;
  size?: number;
}

const BrainLogo = ({ className = "", size = 24 }: BrainLogoProps) => {
  return (
    <img 
      src="/aarika-logo.png" 
      alt="AarikaAI Logo"
      className={className}
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default BrainLogo;
