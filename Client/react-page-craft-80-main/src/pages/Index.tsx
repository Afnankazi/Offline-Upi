import React from 'react';
import Logo from '@/components/Logo';
import AuthButtons from '@/components/AuthButtons';
import { useToast } from '@/components/ui/use-toast';
import { Wifi, Shield, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login'); // Navigate to login page
  };

  const handleSignUp = () => {
    toast({
      title: "Sign Up",
      description: "Sign up functionality will be implemented soon.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="text-xs text-white">₹</div>
            </div>
          </div>
          <div>
            <div className="font-semibold text-lg">Digital Bharat Pay</div>
            <div className="text-xs text-blue-200 flex items-center">
              <Shield className="w-3 h-3 mr-1" />
              Verified by Govt. of India
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-sm">
          <div className="w-4 h-4 border border-white rounded-sm flex items-center justify-center">
            <div className="text-xs">🌐</div>
          </div>
          <span>English</span>
          <div className="text-xs">▼</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-4xl mx-auto">
        
        {/* Central Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 border-4 border-blue-600 rounded-full flex items-center justify-center bg-white">
            <div className="text-blue-600">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">Easy Offline Payment</h1>
          <p className="text-gray-600 text-lg mb-6">
            Empowering Every Transaction, Even Without Internet
          </p>
          
          {/* Trust Badge */}
          <div className="flex items-center justify-center text-gray-500">
            <Shield className="w-4 h-4 mr-2" />
            <span className="text-sm">Trusted by millions across rural India</span>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Works Offline Card */}
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wifi className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Works Offline</h3>
            <p className="text-gray-600 text-sm">
              No internet connection required for transactions
            </p>
          </div>

          {/* Bank Grade Security Card */}
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Bank Grade Security</h3>
            <p className="text-gray-600 text-sm">
              Advanced encryption and security protocols
            </p>
          </div>

          {/* Simple Interface Card */}
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Simple Interface</h3>
            <p className="text-gray-600 text-sm">
              Easy to use interface for everyone
            </p>
          </div>
        </div>

        {/* Auth Buttons with container styling */}
        <div className="flex justify-center px-6 mb-8">
          <div className="w-full max-w-md">
            <AuthButtons onLogin={handleLogin} onSignUp={handleSignUp} />
            
            {/* Optional: Add a trust message below buttons */}
            <div className="text-center mt-4 text-sm text-gray-500">
              <p>100% secure login • Government verified</p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Index;