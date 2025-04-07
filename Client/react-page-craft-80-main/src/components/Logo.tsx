
import React from 'react';
import { DollarSign } from 'lucide-react';

const Logo = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-40 w-40 rounded-full border-2 border-seva-green flex items-center justify-center">
        <div className="h-24 w-24 bg-seva-green rounded-full flex items-center justify-center relative">
          {/* Money bag top */}
          <div className="absolute top-1 w-12 h-4 bg-seva-green rounded-t-full"></div>
          
          {/* Dollar sign */}
          <DollarSign className="text-seva-gold h-12 w-12" />
        </div>
      </div>
      <h1 className="text-seva-green text-2xl font-bold mt-3">Pay Seva</h1>
    </div>
  );
};

export default Logo;
