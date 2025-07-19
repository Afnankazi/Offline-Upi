import React from 'react';
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  animate?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className,
  animate = false 
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center",
      animate && "animate-in fade-in-50 zoom-in-95 duration-1000",
      className
    )}>
      <div className={cn(
        sizes[size],
        "relative",
        animate && "animate-bounce"
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full opacity-75 blur-sm" />
        <div className="absolute inset-0 bg-white rounded-full flex items-center justify-center">
          <div className="w-[75%] h-[75%] bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold" style={{ fontSize: size === 'lg' ? '1.2rem' : '1rem' }}>
              ₹
            </span>
          </div>
        </div>
      </div>
      {showText && (
        <h1 className={cn(
          "text-2xl font-bold mt-3 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent",
          animate && "animate-in slide-in-from-bottom duration-1000 delay-200"
        )}>
          Digital Bharat Pay
        </h1>
      )}
    </div>
  );
};

export default Logo;

