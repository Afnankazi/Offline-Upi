import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { QrReader } from 'react-qr-reader';
import { ChevronLeft, Home } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PinConfirmation from '@/components/PinConfirmation';

const QRCodeScanner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState('');
  const [scanning, setScanning] = useState(true);
  const [currentStep, setCurrentStep] = useState('scanning'); // 'scanning', 'amount-input', 'pin-confirmation'
  const [amount, setAmount] = useState('');

  const handleScan = (result: any) => {
    if (result) {
      setData(result?.text);
      setScanning(false);
      toast({
        title: "QR Code Detected",
        description: `Code Scanned Successfully`,
      });
      
      // Show amount input screen instead of PIN confirmation
      setCurrentStep('amount-input');
    }
  };

  const handleError = (error: any) => {
    console.error(error);
    toast({
      title: "Error",
      description: "Could not access camera",
      variant: "destructive",
    });
  };

  const handleBack = () => {
    if (currentStep === 'amount-input') {
      // Go back to scanning
      setScanning(true);
      setCurrentStep('scanning');
    } else if (currentStep === 'pin-confirmation') {
      // Go back to amount input
      setCurrentStep('amount-input');
    } else {
      navigate(-1);
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

  const handleContinue = () => {
    if (currentStep === 'amount-input' && amount.trim()) {
      setCurrentStep('pin-confirmation');
    }
  };

  const handlePinCancel = () => {
    setCurrentStep('amount-input');
  };

  const handlePinConfirm = () => {
    toast({
      title: "Payment Confirmed",
      description: "Your transaction has been processed successfully",
    });
    
    // Navigate to dashboard after successful confirmation
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-teal-800">
      {currentStep === 'pin-confirmation' ? (
        <PinConfirmation 
          onCancel={handlePinCancel}
          onConfirm={handlePinConfirm}
        />
      ) : currentStep === 'amount-input' ? (
        <div className="fixed inset-0 bg-white flex flex-col z-50">
          {/* Header */}
          <header className="flex items-center px-4 py-3 border-b">
            <button onClick={handleBack} className="text-gray-700">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="ml-4 text-lg font-medium text-gray-800">Enter Amount</h1>
          </header>

          {/* Content */}
          <div className="flex-1 flex flex-col p-6">
            <h2 className="text-xl font-medium text-gray-800 mb-2">Enter Amount</h2>
            <p className="text-gray-500 text-sm mb-6">
              How much would you like to send?
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

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              disabled={!amount.trim()}
              className="w-full bg-seva-green hover:bg-green-600 text-white py-6 rounded-md text-lg mt-auto"
            >
              Continue
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <header className="flex items-center justify-between px-4 py-3">
            <button onClick={handleBack} className="text-white">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-white text-lg font-medium">Scan to Pay</h1>
            <div className="w-6"></div> {/* Placeholder for right side alignment */}
          </header>

          {/* Scanner Area */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
            <div className="relative w-full max-w-xs aspect-square">
              {/* Scanner Border Effect */}
              <div className="absolute inset-0 border-2 border-white/30 rounded-lg">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-green-400"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-green-400"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-green-400"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-green-400"></div>
              </div>

              {scanning ? (
                <div className="overflow-hidden rounded-lg w-full h-full">
                  <QrReader
                    constraints={{ facingMode: 'environment' }}
                    onResult={handleScan}
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg w-full h-full flex items-center justify-center">
                  <p className="text-green-500 font-bold">QR Code Detected!</p>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-t-2xl p-6 pb-20">
            <h2 className="text-center font-semibold text-lg mb-2">Payment with QR Code</h2>
            <p className="text-center text-gray-500 text-sm">
              Hold the code inside the frame, it will be scanned automatically
            </p>
            
            {/* Bottom navigation for mobile - simplified */}
            <div className="fixed bottom-0 left-0 right-0 bg-white py-3 px-6 flex justify-center">
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center shadow-md"
              >
                <Home className="h-6 w-6 text-white" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QRCodeScanner;
