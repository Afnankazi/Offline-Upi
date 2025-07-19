import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Settings, CheckCircle, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from '@/utils/axios';
import { SHA256 } from 'crypto-js';
import { AxiosError } from 'axios';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

// Define the Transaction interface based on the backend model
interface Transaction {
  transactionId: number;
  sender: {
    upiId: string;
  name: string;
  };
  receiverUpi: string;
  amount: number;
  transactionType: 'DEBIT' | 'CREDIT';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'OFFLINE_PENDING';
  initiatedAt: string;
  completedAt: string | null;
  type: string | null
}

// Group transactions by date
interface GroupedTransactions {
  today: Transaction[];
  yesterday: Transaction[];
  lastSevenDays: Transaction[];
  older: Transaction[];
}

const TransactionHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groupedTransactions, setGroupedTransactions] = useState<GroupedTransactions>({
    today: [],
    yesterday: [],
    lastSevenDays: [],
    older: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalDebit, setTotalDebit] = useState<number>(0);
  const [totalCredit, setTotalCredit] = useState<number>(0);
  const { t, i18n } = useTranslation();

  // Function to fetch transaction history
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
      setTransactions(response.data);
      
      // Calculate summary statistics
      let debitSum = 0;
      let creditSum = 0;
      response.data.forEach((transaction: Transaction) => {
        if (transaction.transactionType === 'DEBIT') {
          debitSum += transaction.amount;
        } else if (transaction.transactionType === 'CREDIT') {
          creditSum += transaction.amount;
        }
      });
      setTotalDebit(debitSum);
      setTotalCredit(creditSum);

      // Group transactions by date
      groupTransactionsByDate(response.data);
      
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
      setIsRefreshing(false);
    }
  };

  // Function to group transactions by date
  const groupTransactionsByDate = (transactions: Transaction[]) => {
    console.log('Grouping transactions:', transactions);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastSevenDays = new Date(today);
    lastSevenDays.setDate(lastSevenDays.getDate() - 7);
    
    const grouped: GroupedTransactions = {
      today: [],
      yesterday: [],
      lastSevenDays: [],
      older: []
    };
    
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.initiatedAt);
      transactionDate.setHours(0, 0, 0, 0);
      
      console.log('Processing transaction:', {
        id: transaction.transactionId,
        date: transactionDate,
        today: today,
        yesterday: yesterday,
        lastSevenDays: lastSevenDays
      });
      
      if (transactionDate.getTime() === today.getTime()) {
        grouped.today.push(transaction);
      } else if (transactionDate.getTime() === yesterday.getTime()) {
        grouped.yesterday.push(transaction);
      } else if (transactionDate.getTime() > lastSevenDays.getTime() && transactionDate.getTime() < yesterday.getTime()) {
        grouped.lastSevenDays.push(transaction);
      } else {
        grouped.older.push(transaction);
      }
    });
    
    console.log('Grouped transactions:', grouped);
    setGroupedTransactions(grouped);
  };

  // Fetch transaction history on component mount
  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  // Function to handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTransactionHistory();
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Function to get transaction color based on type
  const getTransactionColor = (transaction: Transaction) => {
    if (transaction.transactionType === 'DEBIT') {
      return 'bg-red-500';
    } else {
      return 'bg-green-500';
    }
  };

  // Function to get transaction icon based on type
  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.transactionType === 'DEBIT') {
      return <ArrowUpRight className="h-5 w-5 text-white" />;
    } else {
      return <ArrowDownLeft className="h-5 w-5 text-white" />;
    }
  };

  // Function to get transaction name
  const getTransactionName = (transaction: Transaction) => {
    const upiId = localStorage.getItem('upiId');
    
    if (transaction.transactionType === 'DEBIT') {
      return `To: ${transaction.receiverUpi}`;
    } else {
      return `From: ${transaction.sender?.upiId || 'Unknown'}`;
    }
  };

  // Function to get transaction amount with sign
  const getTransactionAmount = (transaction: Transaction) => {
    const sign = transaction.transactionType === 'DEBIT' ? '-' : '+';
    return `${sign}₹${transaction.amount.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center text-white">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{t("Transaction_History")}</h1>
            <p className="text-sm text-blue-100">{t("all_transactions")}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefresh}
          className="text-white hover:bg-white/10"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </header>

      {/* Main Content */}
      <div className="px-4 pb-8">
        <div className="max-w-3xl mx-auto">
          {/* Summary Statistics */}
          {!isLoading && transactions.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl mb-6 text-white">
              <h2 className="text-lg font-semibold mb-4">{t("Summary")}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-blue-100 text-sm mb-1">{t("Total_Sent")}</p>
                  <p className="text-2xl font-bold">₹{totalDebit.toFixed(2)}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl">
                  <p className="text-blue-100 text-sm mb-1">{t("Total_Received")}</p>
                  <p className="text-2xl font-bold">₹{totalCredit.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center text-white">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-blue-100">Loading transactions...</p>
              </div>
            </div>
          ) : (
            /* Transaction List Container */
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Transaction Sections */}
              <div className="divide-y divide-gray-100">
                {/* Today Section */}
                {groupedTransactions.today.length > 0 && (
                  <div className="p-4">
                    <p className="text-xs font-medium text-gray-500 mb-4">TODAY</p>
                    <div className="space-y-4">
                      {groupedTransactions.today.map((transaction) => (
                        <div key={transaction.transactionId} 
                          className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className={`w-12 h-12 ${
                            transaction.transactionType === 'DEBIT' ? 'bg-blue-600' : 'bg-green-600'
                          } rounded-xl flex items-center justify-center mr-4`}>
                            {getTransactionIcon(transaction)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">{getTransactionName(transaction)}</p>
                                <p className="text-xs text-gray-500">{formatDate(transaction.initiatedAt)}</p>
                              </div>
                              <div className="text-right">
                                <p className={`font-medium ${
                                  transaction.transactionType === 'DEBIT' ? 'text-blue-600' : 'text-green-600'
                                }`}>
                                  {getTransactionAmount(transaction)}
                                </p>
                                <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                                  transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                  transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                  transaction.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {transaction.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Yesterday Section */}
                {groupedTransactions.yesterday.length > 0 && (
                  <div className="p-4">
                    <p className="text-xs font-medium text-gray-500 mb-4">YESTERDAY</p>
                    <div className="space-y-4">
                      {groupedTransactions.yesterday.map((transaction) => (
                        <div key={transaction.transactionId} 
                          className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className={`w-12 h-12 ${
                            transaction.transactionType === 'DEBIT' ? 'bg-blue-600' : 'bg-green-600'
                          } rounded-xl flex items-center justify-center mr-4`}>
                            {getTransactionIcon(transaction)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">{getTransactionName(transaction)}</p>
                                <p className="text-xs text-gray-500">{formatDate(transaction.initiatedAt)}</p>
                              </div>
                              <div className="text-right">
                                <p className={`font-medium ${
                                  transaction.transactionType === 'DEBIT' ? 'text-blue-600' : 'text-green-600'
                                }`}>
                                  {getTransactionAmount(transaction)}
                                </p>
                                <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                                  transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                  transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                  transaction.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {transaction.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Last 7 Days Section */}
                {groupedTransactions.lastSevenDays.length > 0 && (
                  <div className="p-4">
                    <p className="text-xs font-medium text-gray-500 mb-4">LAST 7 DAYS</p>
                    <div className="space-y-4">
                      {groupedTransactions.lastSevenDays.map((transaction) => (
                        <div key={transaction.transactionId} 
                          className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className={`w-12 h-12 ${
                            transaction.transactionType === 'DEBIT' ? 'bg-blue-600' : 'bg-green-600'
                          } rounded-xl flex items-center justify-center mr-4`}>
                            {getTransactionIcon(transaction)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">{getTransactionName(transaction)}</p>
                                <p className="text-xs text-gray-500">{formatDate(transaction.initiatedAt)}</p>
                              </div>
                              <div className="text-right">
                                <p className={`font-medium ${
                                  transaction.transactionType === 'DEBIT' ? 'text-blue-600' : 'text-green-600'
                                }`}>
                                  {getTransactionAmount(transaction)}
                                </p>
                                <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                                  transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                  transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                  transaction.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {transaction.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Older Transactions Section */}
                {groupedTransactions.older.length > 0 && (
                  <div className="p-4">
                    <p className="text-xs font-medium text-gray-500 mb-4">OLDER TRANSACTIONS</p>
                    <div className="space-y-4">
                      {groupedTransactions.older.map((transaction) => (
                        <div key={transaction.transactionId} 
                          className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className={`w-12 h-12 ${
                            transaction.transactionType === 'DEBIT' ? 'bg-blue-600' : 'bg-green-600'
                          } rounded-xl flex items-center justify-center mr-4`}>
                            {getTransactionIcon(transaction)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">{getTransactionName(transaction)}</p>
                                <p className="text-xs text-gray-500">{formatDate(transaction.initiatedAt)}</p>
                              </div>
                              <div className="text-right">
                                <p className={`font-medium ${
                                  transaction.transactionType === 'DEBIT' ? 'text-blue-600' : 'text-green-600'
                                }`}>
                                  {getTransactionAmount(transaction)}
                                </p>
                                <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                                  transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                  transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                  transaction.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {transaction.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Transactions Section (if no groups match) */}
                {transactions.length > 0 && groupedTransactions.today.length === 0 && groupedTransactions.yesterday.length === 0 && groupedTransactions.lastSevenDays.length === 0 && groupedTransactions.older.length === 0 && (
                  <div className="p-4">
                    <p className="text-xs font-medium text-gray-500 mb-4">ALL TRANSACTIONS</p>
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div key={transaction.transactionId} 
                          className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className={`w-12 h-12 ${
                            transaction.transactionType === 'DEBIT' ? 'bg-blue-600' : 'bg-green-600'
                          } rounded-xl flex items-center justify-center mr-4`}>
                            {getTransactionIcon(transaction)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">{getTransactionName(transaction)}</p>
                                <p className="text-xs text-gray-500">{formatDate(transaction.initiatedAt)}</p>
                              </div>
                              <div className="text-right">
                                <p className={`font-medium ${
                                  transaction.transactionType === 'DEBIT' ? 'text-blue-600' : 'text-green-600'
                                }`}>
                                  {getTransactionAmount(transaction)}
                                </p>
                                <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                                  transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                  transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                  transaction.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {transaction.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Transactions Message */}
                {transactions.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="bg-blue-50 p-6 rounded-full mb-4">
                      <CheckCircle className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
                    <p className="text-gray-500 text-center max-w-sm">
                      Your transaction history will appear here once you start making transactions
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
