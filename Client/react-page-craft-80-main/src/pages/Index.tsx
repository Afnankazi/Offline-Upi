import React, { useState } from "react";
import  Logo  from "../components/Logo";
import { useToast } from "@/components/ui/use-toast";
import { Wifi, Shield, Smartphone, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
   const { t, i18n : trans } = useTranslation();
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );

  const handleLogin = () => {
    navigate("/login"); // Navigate to login page
  };

  const handleSignUp = () => {
    navigate("/register"); // Navigate to register page
  };
   const handleLanguageChange = (value: string) => {
    console.log(value);
    localStorage.setItem('language', value); // First store the value
    setLanguage(value); // Update local state
    trans.changeLanguage(value); // Update i18n language
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-blue-600 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <div className="text-xs text-white">₹</div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-lg">Digital Bharat Pay</div>
              <div className="text-xs text-blue-200 flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                {t("Verified_by_Govt")}
              </div>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center">
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[120px] h-8 text-xs bg-white/10 border-white/20">
                <div className="flex items-center gap-1 text-white">
                  <Globe className="h-3 w-3" />
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
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl mx-auto">
          <Logo size="lg" animate={true} className="mx-auto mb-12" />

          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t("Easy Offline Payment")}
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              {t("Empowering Every Transaction, Even Without Internet")}
            </p>
            <p className="text-lg text-gray-500">
              {t("Trusted by millions across rural India")}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {/* Works Offline Card */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t("Works Offline")}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("No internet connection required for transactions")}
              </p>
            </div>

            {/* Bank Grade Security Card */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t("Bank Grade Security")}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("Advanced_Security")}
              </p>
            </div>

            {/* Simple Interface Card */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t("Simple Interface")}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("Easy_Interface")}
              </p>
            </div>

            {/* Multilingual Support Card */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t("Multilingual_Support")}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("Language_Support_Description")}
              </p>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex justify-center px-6">
            <div className="w-full max-w-md space-y-4">
              <Button 
                className="w-full h-12 text-base font-medium" 
                variant="default"
                onClick={handleLogin}
              >
                {t("Login to Account")}
              </Button>
              <Button 
                className="w-full h-12 text-base font-medium" 
                variant="outline"
                onClick={handleSignUp}
              >
                {t("Create Account")}
              </Button>
              
              {/* Trust message */}
              <div className="text-center mt-6 text-sm text-gray-500">
                <p>{t("Join millions of users across India")}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
