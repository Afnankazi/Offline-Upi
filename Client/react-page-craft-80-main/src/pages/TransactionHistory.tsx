
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Settings, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface Transaction {
  id: number;
  name: string;
  time: string;
  amount: string;
  color: string;
}

const TransactionHistory = () => {
  const navigate = useNavigate();

  // Mock transaction data
  const today: Transaction[] = [
    { id: 1, name: 'Transaction History', time: '', amount: '', color: 'bg-green-500' },
  ];

  const yesterday: Transaction[] = [
    { id: 2, name: 'Siddhart Gupt', time: '8:00 AM', amount: '', color: 'bg-orange-300' },
    { id: 3, name: 'Afnan Kazi', time: '3:40 PM', amount: '', color: 'bg-teal-700' },
    { id: 4, name: 'Rutuja Bhalekar', time: '10:30 AM', amount: '', color: 'bg-orange-200' },
    { id: 5, name: 'Piyush motwani', time: '6:15 PM', amount: '', color: 'bg-teal-700' },
  ];

  const lastSevenDays: Transaction[] = [
    { id: 6, name: 'Yash srivastav', time: '4:30 PM', amount: '', color: 'bg-orange-300' },
  ];

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
        <h1 className="text-lg font-medium">History</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-teal-700"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      {/* Transaction List */}
      <div className="flex-1 px-4 py-2">
        {/* Today Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-medium text-gray-500">TODAY</p>
            <button className="text-xs text-green-500 font-medium">Mark as read</button>
          </div>
          {today.map((transaction) => (
            <div key={transaction.id} className="flex items-center mb-4">
              <div className={`w-10 h-10 ${transaction.color} rounded-lg flex items-center justify-center mr-3`}>
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{transaction.name}</p>
                <div className="flex items-center">
                  <span className="text-xs text-green-500">See more</span>
                  <ChevronLeft className="h-3 w-3 text-green-500 rotate-180" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Yesterday Section */}
        <div className="mb-4">
          <div className="mb-2">
            <p className="text-xs font-medium text-gray-500">YESTERDAY</p>
          </div>
          {yesterday.map((transaction) => (
            <div key={transaction.id} className="flex items-center mb-4">
              <div className={`w-10 h-10 ${transaction.color} rounded-lg mr-3`}></div>
              <div className="flex-1">
                <p className="font-medium">{transaction.name}</p>
                <p className="text-xs text-gray-500">{transaction.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Last 7 Days Section */}
        <div>
          <div className="mb-2">
            <p className="text-xs font-medium text-gray-500">LAST 7 DAY</p>
          </div>
          {lastSevenDays.map((transaction) => (
            <div key={transaction.id} className="flex items-center mb-4">
              <div className={`w-10 h-10 ${transaction.color} rounded-lg mr-3`}></div>
              <div className="flex-1">
                <p className="font-medium">{transaction.name}</p>
                <p className="text-xs text-gray-500">{transaction.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
