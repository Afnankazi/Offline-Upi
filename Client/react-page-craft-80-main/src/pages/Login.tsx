import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Fingerprint } from 'lucide-react';
import Logo from '@/components/Logo';
import { SHA256 } from 'crypto-js';
import axiosInstance from '@/utils/axios';
import { AxiosError } from 'axios';
import { isBiometricSupported, authenticateWithBiometric } from '../utils/biometrics';

const Login = () => {
  const [upiId, setUpiId] = useState('');
  const [pin, setPin] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpiIdFocused, setIsUpiIdFocused] = useState(false);
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const pinInputRef = React.useRef<HTMLInputElement>(null);

  // Check for remembered UPI ID on component mount
  useEffect(() => {
    const rememberedUpiId = localStorage.getItem('rememberedUpiId');
    if (rememberedUpiId) {
      setUpiId(rememberedUpiId);
      setRememberMe(true);
      // Focus on PIN input after a short delay
      setTimeout(() => {
        if (pinInputRef.current) {
          pinInputRef.current.focus();
        }
      }, 300);
    }
  }, []);

  // Check biometric support
  useEffect(() => {
    const checkBiometricSupport = async () => {
      const isSupported = await isBiometricSupported();
      setIsBiometricsAvailable(isSupported);
      // Check if user has enabled biometrics for their account
      const biometricsEnabled = localStorage.getItem(`biometrics_${upiId}`);
      setBiometricsEnabled(!!biometricsEnabled);
    };
    
    checkBiometricSupport();
  }, [upiId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Hash the PIN using SHA-256
      const hashedPin = SHA256(pin).toString();
      
      // Check if we have stored credentials for this UPI ID
      const storedUpiId = localStorage.getItem('upiId');
      const storedHashedPin = localStorage.getItem('hashedPin');
      const storedName = localStorage.getItem('name');
      
      // If we have stored credentials and the UPI ID matches
      if (storedUpiId === upiId && storedHashedPin) {
        // Validate locally
        if (hashedPin === storedHashedPin) {
          // Save or remove remembered UPI ID based on checkbox
          if (rememberMe) {
            localStorage.setItem('rememberedUpiId', upiId);
          } else {
            localStorage.removeItem('rememberedUpiId');
          }
          
          toast({
            title: "Login Successful",
            description: `Welcome back, ${storedName}!`,
          });
          
          // Navigate to dashboard after login
          navigate('/dashboard');
        } else {
          throw new Error("Invalid PIN");
        }
      } else {
        // First time login or different UPI ID - validate with server
        const response = await axiosInstance.post('/api/users/validate', {
          upiId: upiId,
          hashedPin: hashedPin
        });
        
        if (response.status === 200) {
          const userData = response.data;
          
          // Store user data in localStorage
          localStorage.setItem('name', userData.name);
          localStorage.setItem('upiId', userData.upiId);
          localStorage.setItem('email', userData.email);
          localStorage.setItem('phoneNumber', userData.phoneNumber);
          localStorage.setItem('userPin', pin); // Store original PIN for future use
          localStorage.setItem('hashedPin', hashedPin); // Store hashed PIN for local validation
          
          // Save or remove remembered UPI ID based on checkbox
          if (rememberMe) {
            localStorage.setItem('rememberedUpiId', upiId);
          } else {
            localStorage.removeItem('rememberedUpiId');
          }
          
          toast({
            title: "Login Successful",
            description: `Welcome back, ${userData.name}!`,
          });
          
          // Navigate to dashboard after login
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = "An unexpected error occurred";
      
      if (error instanceof AxiosError) {
        // Safely extract error message from Axios error
        errorMessage = error.response?.data?.message || 
                      error.response?.data?.error ||
                      error.message ||
                      "Server error occurred";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Ensure we're passing a string to the toast
      toast({
        title: "Login Failed",
        description: String(errorMessage),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  const togglePinVisibility = () => {
    setShowPin(!showPin);
  };

  const handleBiometricLogin = async () => {
    try {
      setIsLoading(true);
      
      if (!upiId) {
        toast({
          title: "UPI ID Required",
          description: "Please enter your UPI ID first",
          variant: "destructive"
        });
        return;
      }

      const isAuthenticated = await authenticateWithBiometric(upiId);
      
      if (isAuthenticated) {
        const storedPin = localStorage.getItem('userPin');
        if (storedPin) {
          setPin(storedPin);
          handleLogin(new Event('submit') as any);
        }
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      let errorMessage = "Please use your PIN instead";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Biometric authentication was denied";
        } else if (error.name === 'NotSupportedError') {
          errorMessage = "Your device doesn't support biometric authentication";
        }
      }
      
      toast({
        title: "Biometric Authentication Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Attempts to create a passkey (biometric credential) for the given UPI ID.
   * Returns true if successful, false otherwise.
   */
  async function createPasskey(upiId: string): Promise<boolean> {
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      return false;
    }

    try {
      // Create a random challenge (in real apps, get from server)
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Use UPI ID as user ID (should be unique per user)
      const userId = new TextEncoder().encode(upiId);

      const publicKey: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "Offline UPI",
        },
        user: {
          id: userId,
          name: upiId,
          displayName: upiId,
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }, // ES256
          { type: "public-key", alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
        attestation: "none",
      };

      // Prompt user to register a credential
      const credential = await navigator.credentials.create({ publicKey });

      // In a real app, send credential to server for verification and storage
      // Here, we just check if credential was created
      return !!credential;
    } catch (error) {
      console.error("createPasskey error:", error);
      return false;
    }
  }
  return (
    <div className="min-h-screen bg-seva-green p-4">
      <div className="max-w-md mx-auto pt-10">
        <div className="bg-white rounded-lg p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Sign in to your Account</h1>
            <div className="flex items-center mt-2">
              <p className="text-sm text-gray-600">Don't have an account?</p>
              <button 
                onClick={handleSignUp}
                className="text-sm text-blue-600 ml-1 hover:underline"
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upiId">UPI ID</Label>
              <Input 
                id="upiId"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@bankname"
                required
                onFocus={() => setIsUpiIdFocused(true)}
                onBlur={() => setIsUpiIdFocused(false)}
                className={isUpiIdFocused ? "ring-2 ring-seva-green" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <div className="relative">
                <Input 
                  id="pin"
                  ref={pinInputRef}
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 6-digit PIN"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  className="pr-10"
                />
                <button 
                  type="button"
                  onClick={togglePinVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rememberMe" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label 
                  htmlFor="rememberMe" 
                  className="text-sm cursor-pointer"
                >
                  Remember UPI ID
                </Label>
              </div>
              
              <button 
                type="button"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot PIN?
              </button>
            </div>

            {/* Biometric Login */}
            {isBiometricsAvailable && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="enableBiometrics" 
                  checked={biometricsEnabled}
                  onCheckedChange={async (checked) => {
                    try {
                      if (checked) {
                        // Try to create passkey when enabling biometrics
                        const created = await createPasskey(upiId);
                        if (!created) {
                          toast({
                            title: "Setup Failed",
                            description: "Could not set up biometric authentication",
                            variant: "destructive"
                          });
                          return;
                        }
                        localStorage.setItem(`biometrics_${upiId}`, 'true');
                      } else {
                        localStorage.removeItem(`biometrics_${upiId}`);
                      }
                      setBiometricsEnabled(checked as boolean);
                    } catch (error) {
                      console.error('Error setting up biometrics:', error);
                      toast({
                        title: "Setup Failed",
                        description: "Could not set up biometric authentication",
                        variant: "destructive"
                      });
                    }
                  }}
                />
                <Label 
                  htmlFor="enableBiometrics" 
                  className="text-sm cursor-pointer"
                >
                  Enable fingerprint login
                </Label>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-seva-green hover:bg-seva-green/90 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>

            {/* Biometric login button */}
            {biometricsEnabled && (
              <Button
                type="button"
                onClick={handleBiometricLogin}
                className="w-full flex items-center justify-center space-x-2 bg-seva-green/10 hover:bg-seva-green/20 text-seva-green"
                disabled={isLoading}
              >
                <Fingerprint className="w-5 h-5" />
                <span>Login with Fingerprint</span>
              </Button>
            )}
          </form>

          {/* Terms */}
          <p className="text-xs text-gray-500 mt-6 text-center">
            By signing up, you agree to the <span className="text-blue-600">Terms of Service</span> and <span className="text-blue-600">Data Processing Agreement</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
