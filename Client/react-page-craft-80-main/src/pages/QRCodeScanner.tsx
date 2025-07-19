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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button 
            onClick={handleBack} 
            className="p-2 rounded-xl hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
            Scan QR Code
          </h1>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="p-2 rounded-xl hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Home className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Scanner Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Scanner Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {cameraError ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <CameraOff className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-red-500 mb-6">{cameraError}</p>
                <Button 
                  onClick={handleRetry}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Retry Camera Access
                </Button>
              </div>
            ) : (
              <>
                <div className="relative bg-gray-900 aspect-square">
                  {/* Scanner overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                  
                  {/* Scanner frame */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-white/50 rounded-2xl relative">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400" />
                    </div>
                  </div>
                  
                  {/* QR reader container */}
                  <div id="qr-reader" className="w-full h-full"></div>
                </div>

                {/* Controls */}
                <div className="p-6 bg-white border-t border-gray-100">
                  <div className="flex flex-col items-center space-y-4">
                    <Button 
                      onClick={toggleCamera}
                      className={`w-full h-12 rounded-xl flex items-center justify-center transition-all ${
                        isCameraActive 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
                      }`}
                    >
                      {isCameraActive ? (
                        <>
                          <CameraOff className="h-5 w-5 mr-2" />
                          Stop Camera
                        </>
                      ) : (
                        <>
                          <Camera className="h-5 w-5 mr-2" />
                          Start Camera
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-gray-500 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2" />
                      Position the QR code within the frame
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;