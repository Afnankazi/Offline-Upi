import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Fingerprint, Shield, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 hover:opacity-80"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div>
            <div className="font-semibold text-lg">Digital Bharat Pay</div>
            <div className="text-xs text-blue-200 flex items-center">
              <Shield className="w-3 h-3 mr-1" />
              Secure Login
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your account to continue</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="upiId" className="text-gray-700">UPI ID</Label>
                <Input 
                  id="upiId"
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@bankname"
                  required
                  onFocus={() => setIsUpiIdFocused(true)}
                  onBlur={() => setIsUpiIdFocused(false)}
                  className={`h-12 ${isUpiIdFocused ? "ring-2 ring-blue-500" : ""}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin" className="text-gray-700">PIN</Label>
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
                    className="h-12 pr-10"
                  />
                  <button 
                    type="button"
                    onClick={togglePinVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    Remember UPI ID
                  </Label>
                </div>
                
                <button 
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700"

                >
                  Forgot PIN?
                </button>
              </div>

              {/* Biometric Option */}
              {isBiometricsAvailable && (
                <div className="flex items-center space-x-2 py-2">
                  <Checkbox 
                    id="enableBiometrics" 
                    checked={biometricsEnabled}
                    onCheckedChange={(checked) => {
                      setBiometricsEnabled(checked as boolean);
                      if (checked) {
                        localStorage.setItem(`biometrics_${upiId}`, 'true');
                      } else {
                        localStorage.removeItem(`biometrics_${upiId}`);
                      }
                    }}
                  />
                  <Label 
                    htmlFor="enableBiometrics" 
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    Enable fingerprint login
                  </Label>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </Button>

              {biometricsEnabled && (
                <Button
                  type="button"
                  onClick={handleBiometricLogin}
                  className="w-full h-12 flex items-center justify-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg"
                  disabled={isLoading}
                >
                  <Fingerprint className="w-5 h-5" />
                  <span>Login with Fingerprint</span>
                </Button>
              )}
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button 
                  onClick={() => navigate('/register')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign Up
                </button>
              </p>
            </div>

            {/* Security Badge */}
            <div className="mt-8 flex items-center justify-center text-gray-500">
              <Shield className="w-4 h-4 mr-2" />
              <span className="text-sm">Bank grade security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
