import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { ChevronLeft, Home, Camera, CameraOff } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const QRCodeScanner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [upiId, setUpiId] = useState('');
  const [cameraError, setCameraError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const scannerRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  
  // Function to extract UPI ID from QR code data
  const extractUpiId = (decodedText) => {
    // If it's a direct UPI ID (e.g., "username@bank")
    if (decodedText.includes('@') && !decodedText.includes('upi://')) {
      return decodedText;
    }
    
    // If it's a UPI URL
    if (decodedText.includes('upi://')) {
      try {
        // Remove the upi:// prefix
        const upiUrl = decodedText.replace('upi://', '');
        
        // Try to parse as URL parameters
        const urlParams = new URLSearchParams(upiUrl);
        const extractedUpiId = urlParams.get('pa');
        
        if (extractedUpiId) {
          return extractedUpiId;
        }
        
        // If no 'pa' parameter, try to extract from the path
        // Some UPI URLs have format like upi://pay?pa=username@bank
        const pathParts = upiUrl.split('?');
        if (pathParts.length > 1) {
          const queryParams = new URLSearchParams(pathParts[1]);
          const pathUpiId = queryParams.get('pa');
          if (pathUpiId) {
            return pathUpiId;
          }
        }
        
        // If we can't extract, return the original text
        return decodedText;
      } catch (parseError) {
        console.error("Error parsing UPI URL:", parseError);
        return decodedText;
      }
    }
    
    // If it's not a UPI format, return the original text
    return decodedText;
  };

  // Function to handle successful scan
  const handleSuccessfulScan = async (decodedText) => {
    try {
      // Stop the scanner
      if (scannerRef.current) {
        await scannerRef.current.stop();
        setIsCameraActive(false);
      }
      
      // Extract UPI ID from the QR code
      const extractedUpiId = extractUpiId(decodedText);
      
      // Store the UPI ID
      setUpiId(extractedUpiId);
      
      // Show success message
      toast({
        title: "QR Code Scanned",
        description: `UPI ID: ${extractedUpiId}`,
      });
      
      // Redirect to transfer page with the UPI ID
      navigate('/upi-transfer', { 
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
    }
  };

  // Function to start the camera
  const startCamera = async () => {
    // If camera is already active, don't try to start it again
    if (isCameraActive) return;
    
    // Clear any existing scanner
    await stopCamera();

    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Your browser doesn't support camera access. Please try a different browser.");
      return;
    }

    try {
      // Create a new instance of Html5Qrcode
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      // Start the camera with optimized settings
      await html5QrCode.start(
        { 
          facingMode: { exact: "environment" }, // Force back camera
        },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText) => {
          // Clear any existing timeout
          if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
          }

          // Set a timeout to prevent multiple rapid scans
          scanTimeoutRef.current = setTimeout(() => {
            handleSuccessfulScan(decodedText);
          }, 500);
        },
        (errorMessage) => {
          // Only show error if it's not a common scanning error
          if (!errorMessage.includes("QR code parse error")) {
            console.error("QR Scanner error:", errorMessage);
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

  // Function to stop the camera
  const stopCamera = async () => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (error) {
        console.error("Error stopping camera:", error);
      } finally {
        setIsCameraActive(false);
      }
    }
  };

  // Toggle camera on/off
  const toggleCamera = async () => {
    if (isCameraActive) {
      await stopCamera();
    } else {
      await startCamera();
    }
  };

  // Handle camera errors with a more user-friendly approach
  const handleCameraError = (error) => {
    console.error("Camera error:", error);
    setCameraError(
      typeof error === 'string' 
        ? error 
        : "Camera access failed. Please check your camera permissions."
    );
    setIsCameraActive(false);
    
    toast({
      title: "Camera Error",
      description: "Could not access camera. Please check permissions.",
      variant: "destructive",
    });
  };

  // Initialize camera on component mount - but only if not already active
  useEffect(() => {
    if (!isCameraActive) {
      startCamera().catch(handleCameraError);
    }
    
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleRetry = () => {
    setCameraError(null);
    startCamera().catch(handleCameraError);
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
              <div className="w-full relative">
                {/* Only render the qr-reader div when camera is active or about to be activated */}
                <div id="qr-reader" className="w-full"></div>
              </div>
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