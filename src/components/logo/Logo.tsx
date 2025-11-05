import React from "react";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img src="/favicon.ico" className="w-[73px] h-[73px]" alt="Brain Icon" />
    </div>
  );
};
