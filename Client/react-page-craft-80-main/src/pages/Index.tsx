
import React from 'react';
import Logo from '@/components/Logo';
import AuthButtons from '@/components/AuthButtons';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { toast } = useToast();

  const handleLogin = () => {
  };

  const handleSignUp = () => {
    toast({
      title: "Sign Up",
      description: "Sign up functionality will be implemented soon.",
    });
  };

  return (
    <div className="min-h-screen bg-seva-cream flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center">
        {/* Logo Section */}
        <div className="mb-16">
          <Logo />
        </div>
        
        {/* Main Content Section */}
        <div className="w-full text-center mb-12">
          <h2 className="text-2xl font-bold mb-2">Easy offline Payment</h2>
          <p className="text-gray-600 text-sm px-6">
            "Empowering Every Transaction, Even Without Internet."
          </p>
        </div>
        
        {/* Auth Buttons */}
        <AuthButtons onLogin={handleLogin} onSignUp={handleSignUp} />
        
        {/* Pagination Dots */}
        <div className="flex space-x-1 mt-8">
          <div className="w-2 h-2 rounded-full bg-gray-800"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;
