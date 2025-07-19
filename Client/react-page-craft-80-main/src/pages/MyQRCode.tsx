import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, MoreVertical, Copy, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import QRCode from 'react-qr-code';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const MyQRCode = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Load user data when component mounts
  useEffect(() => {
    const storedFirstName = localStorage.getItem('firstName') || 'Afnan';
    const storedLastName = localStorage.getItem('lastName') || 'Kazi';
    const storedUpiId = localStorage.getItem('upiId') || 'afnanarifkazi3@okhdfc';
    
    setFirstName(storedFirstName);
    setLastName(storedLastName);
    setUserName(`${storedFirstName} ${storedLastName}`);
    setUpiId(storedUpiId);
  }, []);

  // Function to copy UPI ID to clipboard
  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId).then(() => {
      toast({
        title: "UPI ID Copied",
        description: "UPI ID has been copied to clipboard",
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    });
  };

  // Function to download QR code (in a real app, this would download the image)
  const handleDownloadQR = () => {
    toast({
      title: "Download Started",
      description: "QR Code is being downloaded",
    });
  };

  // Function to share QR code (in a real app, this would use the Web Share API)
  const handleShareQR = () => {
    // Check if Web Share API is supported
    if (navigator.share) {
      navigator.share({
        title: 'My UPI QR Code',
        text: `Pay me using my UPI ID: ${upiId}`,
        url: window.location.href,
      }).then(() => {
        console.log('Successfully shared');
      }).catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      toast({
        title: "Sharing not supported",
        description: "Your browser doesn't support sharing",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-white border-b sticky top-0 z-50">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
          My QR Code
        </h1>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownloadQR}
            className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
          >
            <Download className="w-5 h-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border-gray-100 shadow-lg">
              <DropdownMenuItem onClick={handleCopyUpiId} className="cursor-pointer hover:bg-blue-50">
                <Copy className="mr-2 h-4 w-4 text-blue-600" />
                <span>Copy UPI ID</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareQR} className="cursor-pointer hover:bg-blue-50">
                <Share2 className="mr-2 h-4 w-4 text-blue-600" />
                <span>Share</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* QR Code Card */}
      <div className="mx-auto max-w-md p-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          {/* User Info */}
          <div className="mb-6 flex items-center gap-3 justify-center">
            <Avatar className="h-12 w-12 ring-4 ring-blue-100">
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-lg">
                {firstName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-900">{userName}</span>
              <span className="text-sm text-gray-500">{upiId}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-6 rounded-xl mb-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCode 
                value={`upi://pay?pa=${upiId}&pn=${userName.replace(' ', '%20')}&am=&cu=INR`}
                size={200}
                level="H"
                className="mx-auto"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 text-center mb-6">
            Scan to pay with any UPI app
          </p>

          {/* UPI ID with copy option */}
          <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3 mb-6">
            <div className="text-sm text-gray-700">UPI ID: {upiId}</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyUpiId}
              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 border-2 border-blue-100 hover:bg-blue-50 text-blue-600"
              onClick={() => navigate('/scan-qr')}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="bg-blue-100 p-1.5 rounded-lg">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
                    <rect x="7" y="7" width="10" height="10" rx="1" />
                  </svg>
                </span>
                <span>Open scanner</span>
              </div>
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Share2 className="h-4 w-4" />
                    <span>Share QR code</span>
                  </div>
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-white">
                <div className="mt-6 flex flex-col gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">Share via</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {['WhatsApp', 'Telegram', 'Facebook', 'Messages'].map((app) => (
                      <button 
                        key={app} 
                        className="flex flex-col items-center gap-2 group"
                        onClick={() => {
                          toast({
                            title: `Sharing via ${app}`,
                            description: "Opening share dialog...",
                          });
                        }}
                      >
                        <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                          {app[0]}
                        </div>
                        <span className="text-xs text-gray-600">{app}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyQRCode;
