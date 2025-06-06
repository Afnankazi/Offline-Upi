import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Bell, Home, Wallet, BarChart2, UserRound, ChevronDown, SendIcon, CreditCard, Clock, History, Globe, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';
import { SHA256 } from 'crypto-js';
import { API_BASE_URL } from '@/config';
import axiosInstance from '@/utils/axios';
import { AxiosError } from 'axios';
import BLog from './BLog';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userName = localStorage.getItem('name');
  const upiId = localStorage.getItem('upiId');
  const [balance, setBalance] = useState("");
  const [balanceLoaded, setBalanceLoaded] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [news, setNews] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  // Fetch balance on component mount
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('https://api.mediastack.com/v1/news', {
          params: {
            access_key: '93074874edf9c762ce948a83830a3505',
            sources: 'business',
            limit: 5
          }
        });
        if (response.data && response.data.data) {
          setNews(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        setNews([]); // Set empty array on error
      }
    };
  
    fetchNews();
  }, []);
  
  // Fetch transaction history on component mount
  useEffect(() => {
    console.log('useEffect for transaction history is running');
    const fetchTransactionHistory = async () => {
      try {
        setIsLoading(true);
        
        // Get user data from localStorage
        const upiId = localStorage.getItem('upiId');
        const pin = localStorage.getItem('userPin');
        
        if (!upiId || !pin) {
          toast({
            title: "Authentication Error",
            description: "Please log in again to view your transaction history",
            variant: "destructive"
          });
          navigate('/');
          return;
        }
        
        // Hash the PIN using SHA-256
        const hashedPin = SHA256(pin).toString();
        
        console.log('Fetching transactions for UPI ID:', upiId);
        
        // Make API call to get transaction history
        const response = await axiosInstance.get('/api/users/history', {
          params: {
            upiId: upiId,
            hashedPin: hashedPin
          }
        });
        
        console.log('Received transactions:', response.data);
        
        // Update transactions state
        const sorted = response.data.sort((a, b) => new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime());
        const recentFive = sorted.slice(0, 5);
        console.log('Recent 5 transactions after sorting and slicing:', recentFive);
        setRecentContacts(recentFive);
        
      } catch (error) {
        console.error("Error fetching transaction history:", error);
        
        // Extract error message if available
        let errorMessage = "Failed to fetch transaction history";
        if (error instanceof AxiosError) {
          if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error.response?.status === 401) {
            errorMessage = "Invalid PIN";
          } else if (error.response?.status === 404) {
            errorMessage = "User not found";
          } else if (!error.response) {
            errorMessage = "Network error. Please check your connection.";
          }
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionHistory();
  }, [navigate, toast]);

  // Handler for the wallet button to navigate to QR scanner
  const handleWalletClick = () => {
    navigate('/scan-qr');
  };
  
  // Handler for the report (history) button
  const handleHistoryClick = () => {
    navigate('/history');
  };

  // Handler for transfer button to navigate to UPI transfer
  const handleTransferClick = () => {
    navigate('/upi-transfer');
  };

  // Handler for the profile button
  const handleProfileClick = () => {
    navigate('/profile');
  };
  
  // Handler for my QR code button
  const handleMyQRCodeClick = () => {
    navigate('/my-qr-code');
  };

  // Handler for language change
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    // In a real app, you would update the app's language context/state here
  };

  // Handler for balance check
  const handleBalanceCheck = () => {
    setIsPinDialogOpen(true);
  };

  // Handler for PIN submission
  const handlePinSubmit = async () => {
    if (!pin || pin.length !== 6) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a 6-digit PIN",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get the stored PIN from localStorage
      const storedPin = localStorage.getItem('userPin');
      
      // Validate PIN locally first
      if (pin !== storedPin) {
        toast({
          title: "Invalid PIN",
          description: "The PIN you entered is incorrect",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Hash the PIN using SHA-256 (same as in registration)
      const hashedPin = SHA256(pin).toString();
      
      // Make request to backend
      const response = await axiosInstance.get('/api/users/Balance', {
        params: {
          upiId: upiId,
          hashedPin: hashedPin
        }
      });
      
      // Update balance state
      setBalance(response.data.balance);
      setBalanceLoaded(true);
      
      toast({
        title: "Balance Updated",
        description: `Your current balance is ₹${response.data.balance}`,
      });
      
      // Close the dialog
      setIsPinDialogOpen(false);
      setPin('');
      
    } catch (error) {
      console.error("Error fetching balance:", error);
      
      // Extract error message if available
      let errorMessage = "Failed to fetch balance";
      if (error instanceof AxiosError) {
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.status === 401) {
          errorMessage = "Invalid PIN";
        } else if (error.response?.status === 404) {
          errorMessage = "User not found";
        } else if (!error.response) {
          errorMessage = "Network error. Please check your connection.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Text content based on selected language
  const text = {
    en: {
      hello: "Hello",
      availableBalance: "Your available balance",
      transfer: "Transfer",
      topUp: "Top Up",
      history: "History",
      recentPayments: "Recent Payments",
      financeBlogs: "Finance Blogs",
      ladkiBahinTitle: "Ladki bahin yojana",
      ladkiBahinDesc: "Get 2700 for Ladki bahin transfer by Government",
      specialGuide: "Special Guide",
      savingTips: "10 tips to save more from your monthly income",
      home: "Home",
      report: "Report",
      notify: "Notify",
      profile: "Profile",
      pickOption: "Pick an option",
      checkBalance: "Check Balance",
      enterPin: "Enter your PIN",
      pinDescription: "Please enter your 6-digit PIN to check your balance",
      submit: "Submit",
      cancel: "Cancel",
    },
    hi: {
      hello: "नमस्ते",
      availableBalance: "आपका उपलब्ध शेष",
      transfer: "स्थानांतरण",
      topUp: "टॉप अप",
      history: "इतिहास",
      recentPayments: "हाल के भुगतान",
      financeBlogs: "वित्त ब्लॉग",
      ladkiBahinTitle: "लड़की बहिन योजना",
      ladkiBahinDesc: "सरकार द्वारा लड़की बहिन हस्तांतरण के लिए 2700 प्राप्त करें",
      specialGuide: "विशेष गाइड",
      savingTips: "अपनी मासिक आय से अधिक बचाने के लिए 10 टिप्स",
      home: "होम",
      report: "रिपोर्ट",
      notify: "सूचना",
      profile: "प्रोफाइल",
      pickOption: "विकल्प चुनें",
      checkBalance: "शेष जांचें",
      enterPin: "अपना पिन दर्ज करें",
      pinDescription: "अपना शेष जांचने के लिए कृपया अपना 6-अंक का पिन दर्ज करें",
      submit: "जमा करें",
      cancel: "रद्द करें",
    }
  };

  const t = language === 'en' ? text.en : text.hi;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="px-4 py-3 flex justify-between items-center bg-white border-b">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 bg-seva-green rounded-full flex items-center justify-center cursor-pointer"
            onClick={handleMyQRCodeClick}
          >
            <QrCodeScannerIcon  className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                <SelectValue>{language === 'en' ? 'English' : 'हिंदी'}</SelectValue>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिंदी</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {/* Balance Section */}
        <section className="mb-6">
          <h2 className="text-lg font-medium">{t.hello} {userName},</h2>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t.availableBalance}</p>
            <div className="flex items-center gap-2">
              {balanceLoaded ? (
                <p className="text-2xl font-bold">₹{balance}</p>
              ) : (
                <p className="text-2xl font-bold">•••••</p>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={handleBalanceCheck}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <div className="bg-white rounded-lg h-20 mt-7 shadow-sm grid grid-cols-3 divide-x">
            <Button 
              variant="ghost" 
              className="flex flex-col items-center py-4 rounded-l-lg"
              onClick={handleTransferClick}
            >
              <SendIcon className="h-5 w-5 mt-8 text-seva-green mb-1" />
              <span className="text-xs">{t.transfer}</span>
            </Button>
            <Button variant="ghost" className="flex flex-col items-center py-4">
              <CreditCard className="h-5 w-5 mt-8 text-seva-green mb-1" />
              <span className="text-xs">{t.topUp}</span>
            </Button>
            <Button 
              variant="ghost" 
              className="flex flex-col items-center py-4 rounded-r-lg"
              onClick={handleHistoryClick}
            >
              <History className="h-5 w-5 mt-8 text-seva-green mb-1" />
              <span className="text-xs">{t.history}</span>
            </Button>
          </div>
        </section>

        {/* Recent Payments */}
        <section className="mb-6">
          <h2 className="text-base font-medium mb-3">{t.recentPayments}</h2>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {recentContacts.map((transaction) => (
              <div key={transaction.transactionId} className="flex flex-col items-center">
                <Avatar className="h-12 w-12 mb-1">
                  <AvatarFallback>{transaction.transactionType === 'DEBIT' ? transaction.receiverUpi.charAt(0) : transaction.sender?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <p className="text-xs">{transaction.transactionType === 'DEBIT' ? transaction.receiverUpi : transaction.sender?.name || 'Unknown'}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Finance Blogs */}
        <section className="mb-6">
          <h2 className="text-base font-medium mb-3">{t.financeBlogs}</h2>
          <div className="space-y-3">
            {
              news.map((item,index) => (
                <BLog key={index} Title={item.title} Description={item.description} Url={item.url} />
              ))
            }
            
            <div className="bg-orange-100 text-orange-800 p-4 rounded-lg">
              <h3 className="font-medium text-sm">{t.specialGuide}</h3>
              <p className="text-xs">{t.savingTips}</p>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      <footer className="bg-white border-t py-2 px-4">
        <div className="flex justify-between items-center">
          <button className="flex flex-col items-center">
            <Home className="h-5 w-5 text-seva-green" />
            <span className="text-xs">{t.home}</span>
          </button>
          <button 
            className="flex flex-col items-center"
            onClick={handleHistoryClick}
          >
            <BarChart2 className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-400">{t.report}</span>
          </button>
          <div className="flex items-center justify-center">
            <div 
              className="w-10 h-10 bg-seva-gold rounded-full flex items-center justify-center text-white cursor-pointer"
              onClick={handleWalletClick}
            >
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          <button className="flex flex-col items-center">
            <Bell className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-400">{t.notify}</span>
          </button>
          <button 
            className="flex flex-col items-center"
            onClick={handleProfileClick}
          >
            <UserRound className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-400">{t.profile}</span>
          </button>
        </div>
      </footer>

      {/* PIN Dialog */}
      <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.enterPin}</DialogTitle>
            <DialogDescription>
              {t.pinDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pin" className="text-right">
                PIN
              </Label>
              <Input
                id="pin"
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="col-span-3"
                placeholder="Enter 6-digit PIN"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPinDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handlePinSubmit} disabled={isLoading}>
              {isLoading ? "Checking..." : t.submit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
