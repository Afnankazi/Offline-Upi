import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { UserRound, ArrowLeft, Lock, User, Save, LogOut, AtSign } from 'lucide-react';
import axiosInstance from '@/utils/axios';
import { SHA256 } from 'crypto-js';
import { useTranslation } from 'react-i18next';
const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const storedName = localStorage.getItem('name');
    const storedUpiId = localStorage.getItem('upiId');
    if (storedName) setName(storedName);
    if (storedUpiId) setUpiId(storedUpiId);
  }, []);

  const handleProfileUpdate = async () => {
    if (!name.trim() || !upiId.trim()) {
      toast({
        title: "Error",
        description: "Name and UPI ID cannot be empty",
        variant: "destructive"
      });
      return;
    }

    if (!upiId.includes('@')) {
      toast({
        title: "Error",
        description: "UPI ID must contain '@' symbol",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.put('/api/users/update-profile', {
        currentUpiId: localStorage.getItem('upiId'),
        newUpiId: upiId.trim(),
        name: name.trim()
      });

      if (response.data.success) {
        localStorage.setItem('name', name.trim());
        localStorage.setItem('upiId', upiId.trim());
        toast({
          title: "Success",
          description: "Profile updated successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
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

      const response = await axiosInstance.put('/api/users/update-pin', {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 hover:opacity-80"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <span className="font-semibold">Digital Bharat Pay</span>
        </div>
        
        <div className="w-8"></div> {/* Spacer for layout balance */}
      </div>

      {/* Main Content */}
      <div className="px-4 pb-8">
        {/* Welcome Section */}
        <div className="text-center text-white mb-8">
          <h1 className="text-2xl font-bold mb-2">{t("Profile_Settings")}</h1>
          <p className="text-blue-100">{t("account_information")}</p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Profile Avatar */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-6">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-4">
                  <UserRound className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-semibold">{name}</h2>
                  <p className="text-blue-100">{upiId}</p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6">
              {/* Profile Update Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="flex items-center text-gray-700 mb-2">
                    <User className="h-4 w-4 mr-2 text-blue-600" />
                    {t("Update_Name")}
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 border-gray-200"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <Label htmlFor="upiId" className="flex items-center text-gray-700 mb-2">
                    <AtSign className="h-4 w-4 mr-2 text-blue-600" />
                    {t("Update_UPI")}
                  </Label>
                  <Input
                    id="upiId"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="h-12 border-gray-200"
                    placeholder="username@bankname"
                  />
                </div>

                <Button 
                  onClick={handleProfileUpdate}
                  disabled={isLoading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                      Updating...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Save className="w-4 h-4 mr-2" />
                      {t("Update_Profile")}
                    </div>
                  )}
                </Button>
              </div>

              {/* PIN Update Form */}
              <div className="space-y-4 pt-4 border-t">
                <Label className="flex items-center text-gray-700 mb-2">
                  <Lock className="h-4 w-4 mr-2 text-blue-600" />
                  {t("Update_PIN")}
                </Label>
                <div className="space-y-3">
                  <Input
                    type="password"
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    placeholder={t("Current_pin")}
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="h-12 border-gray-200"
                  />
                  <Input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder={t("New_pin")}
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="h-12 border-gray-200"
                  />
                  <Input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder={t("Conf_pin")}
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="h-12 border-gray-200"
                  />
                  <Button 
                    onClick={handlePinUpdate}
                    disabled={isLoading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                        Updating...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Save className="w-4 h-4 mr-2" />
                        {t("Update_PIN")}
                      </div>
                    )}
                  </Button>
                </div>
              </div>

              {/* Logout Button */}
              <Button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full h-12 border-2 border-red-500 text-red-500 hover:bg-red-50"
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
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-center text-white">
            <div className="flex items-center space-x-2 text-sm">
              <Lock className="w-4 h-4" />
              <span>Your data is secure with us</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
