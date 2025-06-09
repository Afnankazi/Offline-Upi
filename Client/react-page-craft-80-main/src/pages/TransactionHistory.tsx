import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Settings, CheckCircle, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from '@/utils/axios';
import { SHA256 } from 'crypto-js';
import { AxiosError } from 'axios';
import { format } from 'date-fns';

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
  isOfflineTransaction: boolean;
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex justify-between items-center bg-teal-800 text-white">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="text-white hover:bg-teal-700"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
        <h1 className="text-lg font-medium">Transaction History</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleRefresh}
          className="text-white hover:bg-teal-700"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </header>

      {/* Summary Statistics */}
      {!isLoading && transactions.length > 0 && (
        <div className="bg-white p-4 m-4 rounded-lg shadow-sm">
          <h2 className="text-base font-medium mb-2">Summary</h2>
          <div className="flex justify-between text-sm">
            <p className="text-red-600">Total Sent:</p>
            <p className="text-red-600">₹{totalDebit.toFixed(2)}</p>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <p className="text-green-600">Total Received:</p>
            <p className="text-green-600">₹{totalCredit.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-teal-800 mb-2" />
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        </div>
      ) : (
        /* Transaction List */
      <div className="flex-1 px-4 py-2">
        {/* Today Section */}
          {groupedTransactions.today.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-medium text-gray-500">TODAY</p>
              </div>
              {groupedTransactions.today.map((transaction) => (
                <div key={transaction.transactionId} className="flex items-center mb-4 bg-white p-3 rounded-lg shadow-sm">
                  <div className={`w-10 h-10 ${getTransactionColor(transaction)} rounded-lg flex items-center justify-center mr-3`}>
                    {getTransactionIcon(transaction)}
              </div>
              <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{getTransactionName(transaction)}</p>
                      <p className={`font-medium ${transaction.transactionType === 'DEBIT' ? 'text-red-500' : 'text-green-500'}`}>
                        {getTransactionAmount(transaction)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">{formatDate(transaction.initiatedAt)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
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
          ))}
        </div>
          )}

        {/* Yesterday Section */}
          {groupedTransactions.yesterday.length > 0 && (
        <div className="mb-4">
          <div className="mb-2">
            <p className="text-xs font-medium text-gray-500">YESTERDAY</p>
          </div>
              {groupedTransactions.yesterday.map((transaction) => (
                <div key={transaction.transactionId} className="flex items-center mb-4 bg-white p-3 rounded-lg shadow-sm">
                  <div className={`w-10 h-10 ${getTransactionColor(transaction)} rounded-lg flex items-center justify-center mr-3`}>
                    {getTransactionIcon(transaction)}
                  </div>
              <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{getTransactionName(transaction)}</p>
                      <p className={`font-medium ${transaction.transactionType === 'DEBIT' ? 'text-red-500' : 'text-green-500'}`}>
                        {getTransactionAmount(transaction)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">{formatDate(transaction.initiatedAt)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
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
          ))}
        </div>
          )}

        {/* Last 7 Days Section */}
          {groupedTransactions.lastSevenDays.length > 0 && (
        <div className="mb-4">
          <div className="mb-2">
                <p className="text-xs font-medium text-gray-500">LAST 7 DAYS</p>
              </div>
              {groupedTransactions.lastSevenDays.map((transaction) => (
                <div key={transaction.transactionId} className="flex items-center mb-4 bg-white p-3 rounded-lg shadow-sm">
                  <div className={`w-10 h-10 ${getTransactionColor(transaction)} rounded-lg flex items-center justify-center mr-3`}>
                    {getTransactionIcon(transaction)}
          </div>
              <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{getTransactionName(transaction)}</p>
                      <p className={`font-medium ${transaction.transactionType === 'DEBIT' ? 'text-red-500' : 'text-green-500'}`}>
                        {getTransactionAmount(transaction)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">{formatDate(transaction.initiatedAt)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
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
              ))}
            </div>
          )}

          {/* Older Transactions Section */}
          {groupedTransactions.older.length > 0 && (
            <div>
              <div className="mb-2">
                <p className="text-xs font-medium text-gray-500">OLDER TRANSACTIONS</p>
              </div>
              {groupedTransactions.older.map((transaction) => (
                <div key={transaction.transactionId} className="flex items-center mb-4 bg-white p-3 rounded-lg shadow-sm">
                  <div className={`w-10 h-10 ${getTransactionColor(transaction)} rounded-lg flex items-center justify-center mr-3`}>
                    {getTransactionIcon(transaction)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{getTransactionName(transaction)}</p>
                      <p className={`font-medium ${transaction.transactionType === 'DEBIT' ? 'text-red-500' : 'text-green-500'}`}>
                        {getTransactionAmount(transaction)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">{formatDate(transaction.initiatedAt)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
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
              ))}
            </div>
          )}

          {/* All Transactions Section (if no groups match) */}
          {transactions.length > 0 && groupedTransactions.today.length === 0 && groupedTransactions.yesterday.length === 0 && groupedTransactions.lastSevenDays.length === 0 && groupedTransactions.older.length === 0 && (
            <div>
              <div className="mb-2">
                <p className="text-xs font-medium text-gray-500">ALL TRANSACTIONS</p>
              </div>
              {transactions.map((transaction) => (
                <div key={transaction.transactionId} className="flex items-center mb-4 bg-white p-3 rounded-lg shadow-sm">
                  <div className={`w-10 h-10 ${getTransactionColor(transaction)} rounded-lg flex items-center justify-center mr-3`}>
                    {getTransactionIcon(transaction)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{getTransactionName(transaction)}</p>
                      <p className={`font-medium ${transaction.transactionType === 'DEBIT' ? 'text-red-500' : 'text-green-500'}`}>
                        {getTransactionAmount(transaction)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">{formatDate(transaction.initiatedAt)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
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
              ))}
            </div>
          )}

          {/* No Transactions Message */}
          {transactions.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-center">No transactions found</p>
              <p className="text-gray-400 text-sm text-center mt-1">Your transaction history will appear here</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
