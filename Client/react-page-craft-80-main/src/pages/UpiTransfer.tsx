import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Send, QrCode, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PinConfirmation from '@/components/PinConfirmation';
import { useToast } from "@/components/ui/use-toast";
import { SHA256 } from 'crypto-js';
import { compressAndEncrypt, createSecureSmsPayload } from '@/utils/encryption';
import { sendTransactionSMS } from '@/utils/twilioService';

const UpiTransfer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [currentStep, setCurrentStep] = useState('upi-input'); // 'upi-input', 'amount-input', 'pin-confirmation'
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if we have UPI ID from QR scanner
  useEffect(() => {
    if (location.state && location.state.upiId) {
      setUpiId(location.state.upiId);
      
      // If coming from QR scanner, go directly to amount input
      if (location.state.fromQR) {
        setCurrentStep('amount-input');
      }
    }
  }, [location]);
  
  const handleBack = () => {
    if (currentStep === 'amount-input') {
      setCurrentStep('upi-input');
    } else if (currentStep === 'pin-confirmation') {
      setCurrentStep('amount-input');
    } else {
      navigate(-1);
    }
  };

  const handleContinue = () => {
    if (currentStep === 'upi-input' && upiId.trim()) {
      setCurrentStep('amount-input');
    } else if (currentStep === 'amount-input' && amount.trim()) {
      setCurrentStep('pin-confirmation');
    }
  };

  const handlePinCancel = () => {
    setCurrentStep('amount-input');
  };

  const handlePinConfirm = async (pin: string) => {
    setIsLoading(true);
    
    try {
      // Get the sender's UPI ID from localStorage
      const senderUpiId = localStorage.getItem('upiId');
      
      // Check if sender UPI ID exists
      if (!senderUpiId) {
        toast({
          title: "Error",
          description: "Please log in to make a transfer",
          variant: "destructive"
        });
        return;
      }
      
      // Create the transaction object
      const transactionData = {
        sender: {
          upiId: senderUpiId
        },
        receiverUpi: upiId,
        amount: parseFloat(amount),
        transactionType: "DEBIT",
        type: "food" // add the type
      };
      
      // Validate transaction data
      // ... (existing validation logic, if any) ...
      
      // Add security metadata if needed
      // ... (optional, if you want to add device fingerprint, etc.) ...
      
      // Convert to JSON string
      const jsonString = JSON.stringify(transactionData);
      
      // Create secure SMS payload (timestamp:nonce:hmac:encryptedData)
      const smsPayload = createSecureSmsPayload(jsonString);
      console.log("new payload",smsPayload);
      
      // Show a message that the SMS app will open
      toast({
        title: "Preparing SMS",
        description: "Your device's SMS app will open. Please send the message to complete the transaction.",
      });
      
      // Send SMS with the secure payload
      await sendTransactionSMS(smsPayload, true);
      
      // Note: We don't navigate away immediately since the user needs to send the SMS
      // The user will manually return to the app after sending the SMS
      
    } catch (error) {
      console.error("Transfer error:", error);
      
      toast({
        title: "Transfer Failed",
        description: "There was an error preparing your transfer",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers with up to 2 decimal places
    const value = e.target.value;
    const regex = /^\d*\.?\d{0,2}$/;
    
    if (regex.test(value) || value === '') {
      setAmount(value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600">
      {currentStep === 'pin-confirmation' ? (
        <PinConfirmation 
          onCancel={handlePinCancel}
          onConfirm={handlePinConfirm}
          isLoading={isLoading}
        />
      ) : (
        <>
          {/* Header */}
          <header className="flex items-center px-6 py-4 text-white">
            <button 
              onClick={handleBack} 
              className="hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="ml-4 text-xl font-semibold">UPI Transfer</h1>
          </header>

          {/* Content */}
          <div className="flex-1 px-6 pb-8">
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6">
                  {currentStep === 'upi-input' ? (
                    <>
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Send Money</h2>
                        <p className="text-gray-500">
                          Pay any <span className="text-blue-600 font-medium">UPI</span> app using UPI ID
                        </p>
                      </div>

                      {/* UPI Input Field */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                            Enter UPI ID
                          </label>
                          <Input
                            type="text" 
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="h-12 border-gray-200"
                            placeholder="username@bankname"
                            autoFocus
                          />
                        </div>

                        <button 
                          onClick={() => navigate('/scan')}
                          className="w-full flex items-center justify-center space-x-2 py-3 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <QrCode className="h-5 w-5" />
                          <span>Scan QR Code</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter Amount</h2>
                        <p className="text-gray-500">
                          Sending money to <span className="text-blue-600 font-medium">{upiId}</span>
                        </p>
                      </div>

                      {/* Amount Input Field */}
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                          <label className="text-sm font-medium text-gray-600 mb-2 block">
                            Amount
                          </label>
                          <div className="flex items-baseline space-x-2">
                            <span className="text-2xl text-gray-700">₹</span>
                            <Input
                              type="text"
                              inputMode="decimal"
                              value={amount}
                              onChange={handleAmountChange}
                              className="text-4xl font-bold border-none bg-transparent focus-visible:ring-0 h-auto p-0 w-full"
                              placeholder="0.00"
                              autoFocus
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Transfer fee: <span className="font-medium">Free</span></span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Continue Button */}
                <div className="px-6 pb-6">
                  <Button
                    onClick={handleContinue}
                    disabled={
                      currentStep === 'upi-input' 
                        ? !upiId.trim()
                        : !amount.trim()
                    }
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center space-x-2"
                  >
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center text-white/80">
                <div className="flex items-center space-x-2 text-sm">
                  <Send className="w-4 h-4" />
                  <span>Secure • Instant • Free</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UpiTransfer;
