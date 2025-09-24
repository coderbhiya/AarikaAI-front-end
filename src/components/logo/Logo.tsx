import React from "react";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/f19f25668e181713412371900d6963ffcadf62db?placeholderIfAbsent=true"
        className="w-[73px] h-[62px]"
        alt="Brain Icon"
      />
    </div>
  );
};
