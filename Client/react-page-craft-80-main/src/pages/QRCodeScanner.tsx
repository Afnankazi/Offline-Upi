import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { ChevronLeft, Home, Camera, CameraOff } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PinConfirmation from '@/components/PinConfirmation';

const QRCodeScanner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState('');
  const [scanning, setScanning] = useState(true);
  const [currentStep, setCurrentStep] = useState('scanning');
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const qrCodeScannerRef = useRef<Html5Qrcode | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to start the camera
  const startCamera = async () => {
    if (qrCodeScannerRef.current) {
      try {
        // Stop any existing camera session
        await qrCodeScannerRef.current.stop();
      } catch (error) {
        console.error("Error stopping previous camera session:", error);
      }
    }

    try {
      // Create a new instance of Html5Qrcode
      const html5QrCode = new Html5Qrcode("qr-reader");
      qrCodeScannerRef.current = html5QrCode;

      // Start the camera with optimized settings
      await html5QrCode.start(
        { 
          facingMode: "environment",
          // focusMode: "continuous" // Helps with focus stability
        },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
          videoConstraints: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        },
        (decodedText) => {
          // Clear any existing timeout
          if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
          }

          // Set a timeout to prevent multiple rapid scans
          scanTimeoutRef.current = setTimeout(() => {
            handleSuccessfulScan(decodedText, html5QrCode);
          }, 500);
        },
        (errorMessage) => {
          // Only show error if it's not a common scanning error
          if (!errorMessage.includes("QR code parse error")) {
            console.error("QR Scanner error:", errorMessage);
            setCameraError("Camera access error: " + errorMessage);
            toast({
              title: "Camera Error",
              description: "Could not access camera. Please check permissions.",
              variant: "destructive",
            });
          }
        }
      );
      
      setIsCameraActive(true);
      setCameraError(null);
    } catch (err) {
      console.error("Error starting camera:", err);
      setCameraError("Failed to start camera: " + (err instanceof Error ? err.message : String(err)));
      setIsCameraActive(false);
    }
  };

  // Function to handle successful scan
  const handleSuccessfulScan = async (decodedText: string, scanner: Html5Qrcode) => {
    try {
      // Stop the scanner
      await scanner.stop();
      setIsCameraActive(false);
      setScanning(false);
      
      // Extract UPI ID from the QR code
      let extractedUpiId = decodedText;
      
      // If it's a URL, try to extract the UPI ID
      if (decodedText.includes('upi://')) {
        try {
          const urlParams = new URLSearchParams(decodedText.replace('upi://', ''));
          extractedUpiId = urlParams.get('pa') || decodedText;
        } catch (parseError) {
          console.error("Error parsing UPI URL:", parseError);
          // Fall back to the original text if parsing fails
        }
      }
      
      // Store the UPI ID
      setUpiId(extractedUpiId);
      
      // Show success message
      toast({
        title: "QR Code Scanned",
        description: `UPI ID: ${extractedUpiId}`,
      });
      
      // Redirect to transfer page with the UPI ID
      navigate('/transfer', { 
        state: { 
          upiId: extractedUpiId,
          fromQR: true
        } 
      });
    } catch (error) {
      console.error("Error handling scan result:", error);
      toast({
        title: "Error",
        description: "Failed to process QR code. Please try again.",
        variant: "destructive",
      });
      // Restart the camera
      startCamera();
    }
  };

  // Initialize camera on component mount
  useEffect(() => {
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Your browser doesn't support camera access. Please try a different browser.");
      return;
    }

    // Start the camera
    startCamera();

    // Cleanup on unmount
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      
      if (qrCodeScannerRef.current) {
        try {
          qrCodeScannerRef.current.stop();
        } catch (error) {
          console.error("Error stopping scanner:", error);
        }
      }
    };
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleRetry = () => {
    setCameraError(null);
    setScanning(true);
    startCamera();
  };

  const toggleCamera = async () => {
    if (isCameraActive && qrCodeScannerRef.current) {
      try {
        await qrCodeScannerRef.current.stop();
        setIsCameraActive(false);
      } catch (error) {
        console.error("Error stopping camera:", error);
      }
    } else {
      startCamera();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-teal-800">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-teal-900">
        <button onClick={handleBack} className="text-white">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-medium text-white">Scan QR Code</h1>
        <button onClick={() => navigate('/dashboard')} className="text-white">
          <Home className="h-6 w-6" />
        </button>
      </header>

      {/* Scanner Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
          {cameraError ? (
            <div className="text-center p-4">
              <p className="text-red-500 mb-4">{cameraError}</p>
              <Button onClick={handleRetry} className="bg-teal-600 hover:bg-teal-700">
                Retry Camera Access
              </Button>
            </div>
          ) : (
            <>
              <div id="qr-reader" className="w-full relative"></div>
              <div className="flex justify-center mt-4">
                <Button 
                  onClick={toggleCamera} 
                  className={`${isCameraActive ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-600 hover:bg-teal-700'} text-white`}
                >
                  {isCameraActive ? (
                    <>
                      <CameraOff className="h-4 w-4 mr-2" />
                      Stop Camera
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Start Camera
                    </>
                  )}
                </Button>
              </div>
              <p className="text-center mt-4 text-gray-600">
                Position the QR code within the frame to scan
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;
