import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Bell, Home, Wallet, BarChart2, UserRound, ChevronDown, SendIcon, CreditCard, Clock, History, Globe, RefreshCw, ArrowRight } from 'lucide-react';
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
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const userName = localStorage.getItem('name');
  const upiId = localStorage.getItem('upiId');
  const [balance, setBalance] = useState("");
  const [balanceLoaded, setBalanceLoaded] = useState(false);

  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [news, setNews] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
   const { t, i18n : trans } = useTranslation();

   // Initialize language state with persisted value
const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
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
    console.log(value);
    localStorage.setItem('language', value); // First store the value
    setLanguage(value); // Update local state
    trans.changeLanguage(value); // Update i18n language
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

 

 

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 transform hover:scale-105 transition-transform">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl rotate-6 opacity-75 blur-sm"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl"></div>
              <div className="absolute inset-0 bg-white rounded-xl flex items-center justify-center transform -rotate-6">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                Digital Bharat Pay
              </h1>
              <p className="text-xs text-gray-500 font-medium">{t("Welcome_Message")}, {userName}</p>
            </div>
          </div>
          
        <div className="flex items-center gap-2">
  <Select value={language} onValueChange={handleLanguageChange}>
    <SelectTrigger className="w-[120px] h-8 text-xs">
      <div className="flex items-center gap-1">
        <Globe className="h-3 w-3" />
        {/* The SelectValue component automatically displays the content of the selected item.
          You can provide a placeholder for when no value is selected.
        */}
        <SelectValue placeholder="Language" />
      </div>
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="en">English</SelectItem>
      <SelectItem value="hi">हिंदी</SelectItem>
      <SelectItem value="ml">മലയാളം</SelectItem>
      <SelectItem value="te">తెలుగు</SelectItem>
      <SelectItem value="ta">தமிழ்</SelectItem>
      <SelectItem value="gu">ગુજરાતી</SelectItem>
      <SelectItem value="pa">ਪੰਜਾਬੀ</SelectItem>
      <SelectItem value="mr">मराठी</SelectItem>
    </SelectContent>
  </Select>
</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-6">
        {/* Balance Card */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 rounded-2xl shadow-lg p-8 mb-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-700/20 rounded-full translate-y-32 -translate-x-32 blur-3xl"></div>
          
          <div className="relative">
            <div className="mb-6">
              <h2 className="text-lg text-white/90 font-medium">{t("Balance_Label")}</h2>
              <div className="flex items-center gap-3 mt-2">
                {balanceLoaded ? (
                  <p className="text-5xl font-bold text-white tracking-tight">₹{balance}</p>
                ) : (
                  <p className="text-5xl font-bold text-white tracking-tight">•••••</p>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-xl text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm" 
                  onClick={handleBalanceCheck}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/20">
              <Button
                variant="ghost"
                onClick={handleTransferClick}
                className="flex-1 mr-4 text-white hover:bg-white/10 backdrop-blur-sm rounded-xl h-12"
              >
                <SendIcon className="h-5 w-5 mr-2" />
                {t("Send_Money_Button")}
              </Button>
              <Button
                variant="outline"
                onClick={handleMyQRCodeClick}
                className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm rounded-xl h-12"
              >
                <QrCodeScannerIcon className="h-5 w-5 mr-2" />
                {t("My_QR_Code_Button")}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[
            {
              icon: <SendIcon />,
              label: t("Transfer_Card_Title"),
              onClick: handleTransferClick,
              gradient: 'from-blue-500 to-blue-400'
            },
            {
              icon: <CreditCard />,
              label: t("Top_Up_Card_Title"),
              gradient: 'from-purple-500 to-purple-400'
            },
            {
              icon: <History />,
              label: t("History_Card_Title"),
              onClick: handleHistoryClick,
              gradient: 'from-green-500 to-green-400'
            }
          ].map((action, index) => (
            <Button 
              key={index}
              variant="ghost" 
              className="relative group bg-white hover:bg-gray-50 shadow-sm rounded-2xl h-28 flex flex-col items-center justify-center space-y-2 border border-gray-100 overflow-hidden transition-all duration-300 hover:scale-105"
              onClick={action.onClick}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${action.gradient} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}>
                <div className="text-blue-600">{action.icon}</div>
              </div>
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-8 hover:border-blue-100 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">{t("recentPayments")}</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleHistoryClick} 
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
            >
              <span className="hidden sm:inline">View All</span> 
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          {/* Grid container with responsive columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {recentContacts.map((transaction) => (
              <div 
                key={transaction.transactionId} 
                className="flex flex-col items-center p-2 sm:p-4 rounded-xl hover:bg-blue-50/50 transition-all duration-300 group cursor-pointer"
              >
                {/* Avatar with responsive sizing */}
                <Avatar className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 mb-2 sm:mb-3 ring-2 ring-blue-50 transform group-hover:scale-105 transition-transform">
                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 font-semibold text-xs sm:text-sm">
                    {transaction.transactionType === 'DEBIT' 
                      ? transaction.receiverUpi.charAt(0).toUpperCase()
                      : transaction.sender?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                {/* Transaction details with responsive text */}
                <p className="text-xs sm:text-sm text-gray-900 text-center truncate w-full font-medium group-hover:text-blue-600 transition-colors">
                  {transaction.transactionType === 'DEBIT' 
                    ? transaction.receiverUpi.split('@')[0]
                    : transaction.sender?.name?.split(' ')[0] || 'Unknown'}
                </p>
                <p className={`text-[10px] sm:text-xs font-semibold mt-1 ${
                  transaction.transactionType === 'DEBIT' 
                    ? 'text-red-500 group-hover:text-red-600' 
                    : 'text-green-500 group-hover:text-green-600'
                } transition-colors`}>
                  {transaction.transactionType === 'DEBIT' ? '-' : '+'}₹{transaction.amount}
                </p>
              </div>
            ))}
          </div>
          
          {/* Empty state for no transactions */}
          {recentContacts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No recent transactions</p>
            </div>
          )}
        </div>

        {/* Finance Blogs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-20">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{t("financeBlogs")}</h2>
          <div className="divide-y divide-gray-100">
            {news.map((item, index) => (
              <div key={index} className="py-4 first:pt-0 last:pb-0">
                <BLog Title={item.title} Description={item.description} Url={item.url} />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-5xl mx-auto px-6 py-2">
          <div className="flex justify-between items-center">
          {[
            {
              icon: <Home className="h-5 w-5" />,
              label: t("home"),
              active: true
            },
            {
              icon: <BarChart2 className="h-5 w-5" />,
              label: t("report"),
              onClick: handleHistoryClick
            },
            {
              icon: <Wallet className="h-6 w-6" />,
              label: '',
              onClick: handleWalletClick,
              special: true
            },
            {
              icon: <Bell className="h-5 w-5" />,
              label: t("notify")
            },
            {
              icon: <UserRound className="h-5 w-5" />,
              label: t("profile"),
              onClick: handleProfileClick
            }
          ].map((item, index) => (
            item.special ? (
              <Button 
                key={index}
                onClick={item.onClick}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-14 w-14 flex items-center justify-center -mt-5 shadow-lg"
              >
                {item.icon}
              </Button>
            ) : (
              <Button 
                key={index}
                variant="ghost" 
                className={`flex flex-col items-center ${
                  item.active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
                onClick={item.onClick}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
              </Button>
            )
          ))}
          </div>
        </div>
      </footer>

      {/* PIN Dialog */}
      <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("enterPin")}</DialogTitle>
            <DialogDescription>
              {t("pinDescription")}
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
                  {t("cancel")}
            </Button>
            <Button onClick={handlePinSubmit} disabled={isLoading}>
              {isLoading ? "Checking..." : t("submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
