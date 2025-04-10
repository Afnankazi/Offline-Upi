import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PinConfirmation from '@/components/PinConfirmation';
import { useToast } from "@/components/ui/use-toast";
import { SHA256 } from 'crypto-js';
import { compressAndEncrypt } from '@/utils/encryption';
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
        transactionType: "DEBIT"
      };
      
      // Log the original transaction object
      console.log("Original Transaction Data:", transactionData);
      
      // Convert to JSON string
      const jsonString = JSON.stringify(transactionData);
      
      // Compress and encrypt the transaction data
      const encryptedData = compressAndEncrypt(jsonString);
      
      // Log the encrypted data
      console.log("Encrypted Transaction Data:", encryptedData);
      
      // Hash the PIN using SHA-256
      const hashedPin = SHA256(pin).toString();
      
      // Show a message that the SMS app will open
      toast({
        title: "Preparing SMS",
        description: "Your device's SMS app will open. Please send the message to complete the transaction.",
      });
      
      // Send SMS with encrypted data to the Twilio phone number
      await sendTransactionSMS(encryptedData);
      
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
    <div className="min-h-screen flex flex-col bg-white">
      {currentStep === 'pin-confirmation' ? (
        <PinConfirmation 
          onCancel={handlePinCancel}
          onConfirm={handlePinConfirm}
          isLoading={isLoading}
        />
      ) : (
        <>
          {/* Header */}
          <header className="flex items-center px-4 py-3 border-b">
            <button onClick={handleBack} className="text-gray-700">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="ml-4 text-lg font-medium text-gray-800">UPI Transfer</h1>
          </header>

          {/* Content */}
          <div className="flex-1 flex flex-col p-6">
            {currentStep === 'upi-input' ? (
              <>
                <h2 className="text-xl font-medium text-gray-800 mb-2">Enter UPI ID</h2>
                <p className="text-gray-500 text-sm mb-8">
                  Pay any <span className="font-semibold">UPI</span> app using UPI ID
                </p>

                {/* UPI Input Field */}
                <div className="mb-8">
                  <label className="text-xs text-gray-500 mb-1 block">UPI ID</label>
                  <Input
                    type="text" 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="border-gray-300 text-lg py-6"
                    placeholder="Enter UPI ID"
                    autoFocus
                  />
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-medium text-gray-800 mb-2">Enter Amount</h2>
                <p className="text-gray-500 text-sm mb-6">
                  How much would you like to send to <span className="font-semibold">{upiId}</span>?
                </p>

                {/* Amount Input Field */}
                <div className="mb-8">
                  <div className="flex items-center bg-seva-cream rounded-lg p-4 mb-6">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Amount</p>
                      <div className="flex items-center">
                        <span className="text-gray-700 mr-2 text-xl">₹</span>
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={amount}
                          onChange={handleAmountChange}
                          className="border-none bg-transparent text-3xl font-bold text-gray-800 p-0 focus-visible:ring-0 h-auto"
                          placeholder="0.00"
                          autoFocus
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Transfer fee: <span className="font-semibold">Free</span>
                  </p>
                </div>
              </>
            )}

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              disabled={
                currentStep === 'upi-input' 
                  ? !upiId.trim()
                  : !amount.trim()
              }
              className="w-full bg-seva-green hover:bg-green-600 text-white py-6 rounded-md text-lg mt-auto"
            >
              Continue
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default UpiTransfer;
