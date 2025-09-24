import React from "react";

interface CenteredLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const CenteredLayout: React.FC<CenteredLayoutProps> = ({
  children,
  className = "",
}) => {
  return (
    <main className={`w-full h-full min-h-screen bg-[#141718] ${className}`}>
      {children}
    </main>
  );
};
