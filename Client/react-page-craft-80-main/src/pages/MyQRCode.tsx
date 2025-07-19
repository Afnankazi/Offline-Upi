
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-4">
          <button onClick={handleDownloadQR}>
            <Download className="w-6 h-6" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button>
                <MoreVertical className="w-6 h-6" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 text-white border-gray-700">
              <DropdownMenuItem onClick={handleCopyUpiId} className="cursor-pointer hover:bg-gray-700">
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy UPI ID</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareQR} className="cursor-pointer hover:bg-gray-700">
                <Share2 className="mr-2 h-4 w-4" />
                <span>Share</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* QR Code Card */}
      <div className="mx-auto max-w-md p-4">
        <div className="bg-gray-900 rounded-lg p-4 flex flex-col items-center">
          {/* User Info */}
          <div className="mb-4 flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-teal-500">
              <AvatarFallback>{firstName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-lg font-medium">{userName}</span>
          </div>

          {/* QR Code */}
          <div className="bg-white p-4 rounded-lg mb-3">
            <QRCode 
              value={`upi://pay?pa=${upiId}&pn=${userName.replace(' ', '%20')}&am=&cu=INR`}
              size={200}
              level="H"
              className="mx-auto"
            />
          </div>
          <p className="text-sm text-gray-400 mb-4">Scan to pay with any UPI app</p>

          {/* Bank Info */}

          {/* UPI ID with copy option */}
          <div className="w-full mt-3 flex items-center justify-between bg-gray-800 rounded-md px-4 py-2">
            <div className="text-sm">UPI ID: {upiId}</div>
            <button onClick={handleCopyUpiId}>
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6">
          <Button 
            variant="outline" 
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            onClick={() => navigate('/scan-qr')}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="bg-gray-700 p-1 rounded">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 7V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 17V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="7" y="7" width="10" height="10" rx="1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span>Open scanner</span>
            </div>
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <div className="flex items-center justify-center gap-2">
                  <Share2 className="h-4 w-4" />
                  <span>Share QR code</span>
                </div>
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-gray-900 text-white">
              <div className="mt-6 flex flex-col gap-4">
                <h3 className="text-lg font-medium">Share via</h3>
                <div className="grid grid-cols-4 gap-4">
                  {['WhatsApp', 'Telegram', 'Facebook', 'Messages'].map((app) => (
                    <button 
                      key={app} 
                      className="flex flex-col items-center gap-1"
                      onClick={() => {
                        toast({
                          title: `Sharing via ${app}`,
                          description: "Opening share dialog...",
                        });
                      }}
                    >
                      <div className="bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center">{app[0]}</div>
                      <span className="text-xs">{app}</span>
                    </button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

       
      </div>
    </div>
  );
};

export default MyQRCode;
