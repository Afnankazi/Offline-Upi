import React from 'react';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

interface AuthButtonsProps {
  onLogin: () => void;
  onSignUp: () => void;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ onLogin, onSignUp }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
      <Button
        onClick={onLogin}
        className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl 
          transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg
          flex items-center justify-center gap-2"
      >
        Login to Account
        <ArrowRight className="w-4 h-4" />
      </Button>
      
      <Button
        onClick={onSignUp}
        variant="outline"
        className="flex-1 h-12 border-2 border-blue-600 text-blue-600 font-medium rounded-xl
          hover:bg-blue-50 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg
          flex items-center justify-center gap-2"
      >
        Create Account
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default AuthButtons;
