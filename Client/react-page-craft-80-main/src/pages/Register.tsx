import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Calendar, Shield } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import axios from 'axios';
import { SHA256 } from 'crypto-js';
import { API_BASE_URL } from '@/config';
import axiosInstance from '@/utils/axios';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

const registerFormSchema = z.object({
  name: z.string().min(2, { message: "Name_Min_Length" }),
  email: z.string().email({ message: "Invalid_Email" }),
  birthDate: z.date().optional(),
  upiId: z.string().min(5, { message: "UPI_ID_Min_Length" })
    .regex(/^[\w.-]+@[\w.-]+$/, { message: "UPI_ID_Format" }),
  phoneNumber: z.string().min(10, { message: "Phone_Min_Length" }),
  pin: z.string().length(6, { message: "PIN_Length" }).regex(/^\d+$/, { message: "PIN_Numbers_Only" }),
  confirmPin: z.string().length(6, { message: "PIN_Length" }).regex(/^\d+$/, { message: "PIN_Numbers_Only" })
}).refine((data) => data.pin === data.confirmPin, {
  message: "PINs_Do_Not_Match",
  path: ["confirmPin"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      upiId: "",
      phoneNumber: "",
      pin: "",
      confirmPin: ""
    }
  });

  const handleSubmit = async (data: RegisterFormValues) => {
    console.log("Form submission started with data:", data);
    try {
      setIsSubmitting(true);
      
      // Hash the PIN using SHA-256
      const hashedPin = SHA256(data.pin).toString();
      console.log("PIN hashed successfully");
      
      // Prepare the data for the API
      const userData = {
        upiId: data.upiId,
        name: data.name,
        phoneNumber: data.phoneNumber,
        hashedPin: hashedPin,
        email: data.email
      };
      
      console.log("Sending data to API:", userData);
      
      // Make the POST request to the API
      const response = await axiosInstance.post('/api/users', userData);
      
      console.log("API Response:", response.data);
      
      // Save all form data to localStorage for profile access
      localStorage.setItem('name', data.name);
      localStorage.setItem('upiId', data.upiId);
      localStorage.setItem('email', data.email);
      localStorage.setItem('phoneNumber', data.phoneNumber);
      localStorage.setItem('userPin', data.pin);
      
      toast({
        title: t("Account_Created"),
        description: t("Account_Created_Description"),
      });
      
      // Redirect to login page after registration
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      
      // Extract error message if available
      let errorMessage = t("Account_Creation_Failed");
      if (error instanceof AxiosError) {
        if (error.response?.data?.error) {
          errorMessage = t(error.response.data.error);
        } else if (error.response?.status === 409) {
          errorMessage = t("UPI_ID_Exists");
        } else if (!error.response) {
          errorMessage = t("Network_Error");
        }
      }
      
      toast({
        title: t("Registration_Failed"),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 hover:opacity-80"
        >
          <ArrowLeft size={20} />
          <span>{t("Back")}</span>
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <span className="font-semibold">Digital Bharat Pay</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-8">
        {/* Welcome Section */}
        <div className="text-center text-white mb-8">
          <h1 className="text-2xl font-bold mb-2">{t("Create Account")}</h1>
          <p className="text-blue-100">{t("Join millions of users across India")}</p>
        </div>

        {/* Registration Form Container */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Security Indicators */}
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">{t("Secure_Registration")}</span>
              </div>
            </div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-4">
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">{t("Full_Name")}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t("Enter_Full_Name")} 
                          className="h-12 border-gray-200" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs">{t(form.formState.errors.name?.message || "")}</FormMessage>
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">{t("Email")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="you@example.com" 
                          className="h-12 border-gray-200" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* UPI ID Field */}
                <FormField
                  control={form.control}
                  name="upiId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">{t("UPI ID")}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t("username@bankname")} 
                          className="h-12 border-gray-200" 
                          {...field} 
                        />
                      </FormControl>
                      <p className="text-xs text-gray-500 mt-1">{t("Format:_username@bankname")}</p>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Phone Number Field */}
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">{t("Phone Number")}</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="bg-gray-50 border border-gray-200 rounded-l-md px-3 flex items-center">
                            <span className="text-gray-500">+91</span>
                          </div>
                          <Input 
                            className="h-12 rounded-l-none border-gray-200" 
                            type="tel" 
                            placeholder={t("Enter_phone_number")} 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* PIN Fields */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="pin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">{t("Create Pin")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPin ? "text" : "password"} 
                              placeholder={t("6-digit_PIN")} 
                              className="h-12 border-gray-200" 
                              maxLength={6}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              {...field} 
                            />
                            <button 
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowPin(!showPin)}
                            >
                              {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">{t("Conf_pin")}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showConfirmPin ? "text" : "password"} 
                              placeholder={t("Confirm_6-digit_PIN")} 
                              className="h-12 border-gray-200" 
                              maxLength={6}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              {...field} 
                            />
                            <button 
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowConfirmPin(!showConfirmPin)}
                            >
                              {showConfirmPin ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("Creating_Account") : t("Create_Account")}
                </Button>

                {/* Login Link */}
                <div className="text-center text-sm text-gray-600">
                  {t("Already_Have_Account")}{' '}
                  <button 
                    type="button"
                    onClick={() => navigate('/')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t("Log_In")}
                  </button>
                </div>
              </form>
            </Form>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-center text-white">
            <div className="flex items-center space-x-2 text-sm">
              <Shield className="w-4 h-4" />
              <span>{t("Security_Footer")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
