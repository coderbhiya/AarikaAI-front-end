"use client";

import Link from "next/link";

const NotFound = () => {
  return (
    <div className="h-screen w-full relative flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Blurred Background Overlay to fill empty sides */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center blur-2xl opacity-60 scale-110"
        style={{ backgroundImage: 'url("/404.png")' }}
      />
      
      {/* Main Image */}
      <Link href="/" className="relative z-10 w-full h-full flex items-center justify-center cursor-pointer">
        <img
          src="/404.png"
          alt="404 Not Found"
          className="max-w-full max-h-full object-contain drop-shadow-2xl"
        />
      </Link>
    </div>
  );
};

export default NotFound;
