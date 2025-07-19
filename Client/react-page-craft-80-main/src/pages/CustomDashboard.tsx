import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/context/UserContext';
import { QrCode, Send, Wallet, ArrowRight, History, Shield } from 'lucide-react';

const CustomDashboard = () => {
  const navigate = useNavigate();
  const { userData } = useUser();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-blue-600 rounded-xl rotate-6"></div>
              <div className="absolute inset-0 bg-white rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg"></div>
              </div>
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Digital Bharat Pay
            </h1>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
          >
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {userData.firstName ? userData.firstName[0] : 'U'}
              </span>
            </div>
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-500 text-white mb-8 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center">
                <Wallet className="h-8 w-8" />
              </div>
              <div>
                <p className="text-blue-100">Available Balance</p>
                <h2 className="text-3xl font-bold">₹10,000</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/10">
              <Button 
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-0"
                onClick={() => navigate('/upitransfer')}
              >
                <Send className="h-5 w-5 mr-2" />
                Send Money
              </Button>
              <Button 
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border-0"
                onClick={() => navigate('/myqrcode')}
              >
                <QrCode className="h-5 w-5 mr-2" />
                My QR Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Button
            className="h-24 bg-white hover:bg-gray-50 text-blue-600 border border-gray-100 shadow-sm rounded-xl flex flex-col items-center justify-center space-y-2"
            onClick={() => navigate('/qrscanner')}
          >
            <QrCode className="h-6 w-6" />
            <span className="text-sm">Scan QR Code</span>
          </Button>
          <Button
            className="h-24 bg-white hover:bg-gray-50 text-blue-600 border border-gray-100 shadow-sm rounded-xl flex flex-col items-center justify-center space-y-2"
            onClick={() => navigate('/upitransfer')}
          >
            <Send className="h-6 w-6" />
            <span className="text-sm">UPI Transfer</span>
          </Button>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/transactionhistory')}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-4">
            {/*
              Ideally, transaction data should be fetched from an API and mapped here.
              For demo purposes, we're using static data.
            */}
            {/*
              transactionData.map((transaction, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                      {transaction.amount > 0 ? (
                        <ArrowUpCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.name}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </p>
                </div>
              ))
            */}
            {/*
              Static demo transactions
            */}
            {['Grocery Store', 'Salary', 'Electric Bill'].map((name, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${index === 1 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <History className={`h-5 w-5 ${index === 1 ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{name}</p>
                    <p className="text-sm text-gray-500">{index === 1 ? 'Apr 1' : index === 2 ? 'Mar 28' : 'Yesterday'}</p>
                  </div>
                </div>
                <p className={`font-semibold ${index === 1 ? 'text-green-600' : 'text-red-600'}`}>
                  {index === 1 ? '+' : ''}{index === 1 ? 25000 : -500}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Security Badge */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center">
        <div className="bg-white/80 backdrop-blur-lg px-4 py-2 rounded-full shadow-sm border border-gray-100 flex items-center space-x-2">
          <Shield className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-gray-600">Bank Grade Security</span>
        </div>
      </div>
    </div>
  );
};

export default CustomDashboard;
