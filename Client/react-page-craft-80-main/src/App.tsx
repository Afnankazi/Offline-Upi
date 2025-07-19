import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import QRCodeScanner from "./pages/QRCodeScanner";
import TransactionHistory from "./pages/TransactionHistory";
import UpiTransfer from "./pages/UpiTransfer";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import MyQRCode from "./pages/MyQRCode";
import Blog from "./pages/BLog"; // Import the Blogs component

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scan-qr" element={<QRCodeScanner />} />
        <Route path="/history" element={<TransactionHistory />} />
        <Route path="/upi-transfer" element={<UpiTransfer />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-qr-code" element={<MyQRCode />} />
        <Route path="/blogs" element={<Blog Title={""} Description={""} Url={""} />} /> {/* Add the new route here */}
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
