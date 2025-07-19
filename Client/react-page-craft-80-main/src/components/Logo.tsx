import React from 'react';
import { DollarSign } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 bg-white rounded-full flex items-center justify-center">
          <div className="w-[75%] h-[75%] bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold" style={{ fontSize: size === 'lg' ? '1.2rem' : '1rem' }}>
              ₹
            </span>
          </div>
        </div>
      </div>
      <h1 className="text-seva-green text-2xl font-bold mt-3">Pay Seva</h1>
    </div>
  );
};

export default Logo;

// Example usage in any file:
import Logo from '@/components/Logo';

// In the JSX:
<div className="flex items-center space-x-3">
  <Logo size="md" />
  <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
    Digital Bharat Pay
  </h1>
</div>
