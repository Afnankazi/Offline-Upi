
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AuthButtonsProps {
  onLogin: () => void;
  onSignUp: () => void;
}

const AuthButtons = ({ onLogin, onSignUp }: AuthButtonsProps) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Call the original onLogin prop function
    onLogin();
    
    // Navigate to the login page
    navigate('/login');
  };

  const handleSignUp = () => {
    // Call the original onSignUp prop function
    onSignUp();
    
    // Navigate to the register page
    navigate('/register');
  };

  return (
    <div className="w-full max-w-xs space-y-3">
      <Button 
        className="w-full bg-seva-green hover:bg-seva-green/90 text-white font-medium"
        onClick={handleLogin}
      >
        Login
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full border-gray-300 hover:bg-gray-50 text-gray-800 font-medium"
        onClick={handleSignUp}
      >
        Sign Up
      </Button>
    </div>
  );
};

export default AuthButtons;
