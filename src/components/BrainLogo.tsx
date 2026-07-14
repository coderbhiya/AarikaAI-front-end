import React from 'react';
import Image from 'next/image';

interface BrainLogoProps {
  className?: string;
  size?: number;
}

const BrainLogo = ({ className = "", size = 24 }: BrainLogoProps) => {
  return (
    <Image 
      src="/aarika-logo.png" 
      alt="AarikaAI Logo"
      className={className}
      width={size}
      height={size}
      priority={true}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default BrainLogo;
