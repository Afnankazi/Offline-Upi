
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/context/UserContext';

const CustomDashboard = () => {
  const navigate = useNavigate();
  const { userData } = useUser();

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 p-4">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Pay Seva</h1>
        <Button variant="outline" onClick={() => navigate('/profile')}>
          Profile
        </Button>
      </header>
      
      <main className="flex-1">
        <section className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {userData.firstName ? userData.firstName[0] : 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Welcome, {userData.firstName}!</h2>
              <p className="text-gray-500">Your balance: ₹10,000</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button className="h-20 bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/qrscanner')}>
              Scan QR Code
            </Button>
            <Button className="h-20 bg-green-600 hover:bg-green-700" onClick={() => navigate('/myqrcode')}>
              My QR Code
            </Button>
          </div>
          
          <Button className="w-full h-14 bg-purple-600 hover:bg-purple-700 mb-6" onClick={() => navigate('/upitransfer')}>
            UPI Transfer
          </Button>
        </section>
        
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <Button variant="link" onClick={() => navigate('/transactionhistory')}>
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Grocery Store</p>
                    <p className="text-sm text-gray-500">Yesterday</p>
                  </div>
                  <p className="text-red-500 font-semibold">-₹500</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Salary</p>
                    <p className="text-sm text-gray-500">Apr 1</p>
                  </div>
                  <p className="text-green-500 font-semibold">+₹25,000</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Electric Bill</p>
                    <p className="text-sm text-gray-500">Mar 28</p>
                  </div>
                  <p className="text-red-500 font-semibold">-₹1,200</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CustomDashboard;
