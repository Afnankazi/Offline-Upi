import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { UserRound, ArrowLeft, Lock, User, Save, LogOut } from 'lucide-react';
import { backendApi } from '@/utils/axios';
import { SHA256 } from 'crypto-js';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('name');
    const storedUpiId = localStorage.getItem('upiId');
    if (storedName) setName(storedName);
    if (storedUpiId) setUpiId(storedUpiId);
  }, []);

  const handleNameUpdate = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await backendApi.put('/api/users/update-name', {
        upiId: upiId,
        name: name.trim()
      });

      if (response.data.success) {
        localStorage.setItem('name', name.trim());
        toast({
          title: "Success",
          description: "Name updated successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update name",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinUpdate = async () => {
    if (!currentPin || !newPin || !confirmPin) {
      toast({
        title: "Error",
        description: "All PIN fields are required",
        variant: "destructive"
      });
      return;
    }

    if (newPin.length !== 6) {
      toast({
        title: "Error",
        description: "PIN must be 6 digits",
        variant: "destructive"
      });
      return;
    }

    if (newPin !== confirmPin) {
      toast({
        title: "Error",
        description: "New PINs do not match",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const hashedCurrentPin = SHA256(currentPin).toString();
      const hashedNewPin = SHA256(newPin).toString();

      const response = await backendApi.put('/api/users/update-pin', {
        upiId,
        currentPin: hashedCurrentPin,
        newPin: hashedNewPin
      });

      if (response.data.success) {
        localStorage.setItem('userPin', newPin);
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        toast({
          title: "Success",
          description: "PIN updated successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update PIN. Please check your current PIN.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    
    // Clear all user data from localStorage
    localStorage.removeItem('name');
    localStorage.removeItem('upiId');
    localStorage.removeItem('userPin');
    
    // Show success message
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    
    // Navigate to login page
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-seva-green text-white p-4">
        <div className="container max-w-md mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="mb-2 text-white flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
          </button>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-white/80 text-sm">
            Update your profile information
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="container max-w-md mx-auto">
          {/* Profile Section */}
          <section className="mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-seva-green rounded-full flex items-center justify-center mr-3">
                  <UserRound className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">{name}</h2>
                  <p className="text-sm text-gray-500">{upiId}</p>
                </div>
              </div>

              {/* Name Update Form */}
              <div className="mb-6">
                <Label htmlFor="name" className="flex items-center mb-2 text-gray-700">
                  <User className="h-4 w-4 mr-2 text-seva-green" />
                  Update Name
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1"
                    placeholder="Enter your name"
                  />
                  <Button 
                    onClick={handleNameUpdate}
                    disabled={isLoading}
                    className="bg-seva-green hover:bg-seva-green/90 text-white"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                        Updating...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Save className="w-4 h-4 mr-2" />
                        Update
                      </div>
                    )}
                  </Button>
                </div>
              </div>

              {/* PIN Update Form */}
              <div className="mb-6">
                <Label className="flex items-center mb-2 text-gray-700">
                  <Lock className="h-4 w-4 mr-2 text-seva-green" />
                  Update PIN
                </Label>
                <div className="space-y-3">
                  <Input
                    type="password"
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    placeholder="Current PIN"
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="border-gray-300 focus:border-seva-green focus:ring-seva-green"
                  />
                  <Input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="New PIN (6 digits)"
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="border-gray-300 focus:border-seva-green focus:ring-seva-green"
                  />
                  <Input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Confirm New PIN"
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="border-gray-300 focus:border-seva-green focus:ring-seva-green"
                  />
                  <Button 
                    onClick={handlePinUpdate}
                    disabled={isLoading}
                    className="w-full bg-seva-green hover:bg-seva-green/90 text-white"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                        Updating...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Save className="w-4 h-4 mr-2" />
                        Update PIN
                      </div>
                    )}
                  </Button>
                </div>
              </div>

              {/* Logout Button */}
              <Button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full border-red-500 text-red-500 hover:bg-red-50"
                variant="outline"
              >
                {isLoggingOut ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-red-500 rounded-full"></div>
                    Logging out...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </div>
                )}
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;
