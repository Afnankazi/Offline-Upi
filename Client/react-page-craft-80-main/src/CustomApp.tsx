
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomRegister from './pages/CustomRegister';
import Dashboard from './pages/Dashboard';
import CustomDashboard from './pages/CustomDashboard';
import QRCodeScanner from './pages/QRCodeScanner';
import MyQRCode from './pages/MyQRCode';
import UpiTransfer from './pages/UpiTransfer';
import TransactionHistory from './pages/TransactionHistory';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import { useUser } from './context/UserContext';

function CustomApp() {
  const { userData } = useUser();

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<CustomRegister />} />
        <Route path="/dashboard" element={<CustomDashboard />} />
        <Route path="/qrscanner" element={<QRCodeScanner />} />
        <Route path="/myqrcode" element={<MyQRCode />} />
        <Route path="/upitransfer" element={<UpiTransfer />} />
        <Route path="/transactionhistory" element={<TransactionHistory />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default CustomApp;
