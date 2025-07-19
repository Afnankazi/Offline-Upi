import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Calendar } from 'lucide-react';
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

const registerFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  birthDate: z.date().optional(),
  upiId: z.string().min(5, { message: "UPI ID must be at least 5 characters" })
    .regex(/^[\w.-]+@[\w.-]+$/, { message: "UPI ID must be in the format username@bankname" }),
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  pin: z.string().length(6, { message: "PIN must be exactly 6 digits" }).regex(/^\d+$/, { message: "PIN must contain only numbers" }),
  confirmPin: z.string().length(6, { message: "PIN must be exactly 6 digits" }).regex(/^\d+$/, { message: "PIN must contain only numbers" })
}).refine((data) => data.pin === data.confirmPin, {
  message: "PINs do not match",
  path: ["confirmPin"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
        title: "Account created",
        description: "Your account has been created successfully. Please log in.",
      });
      
      // Redirect to login page after registration
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      
      // Extract error message if available
      let errorMessage = "Failed to create account";
      if (error instanceof AxiosError) {
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.status === 409) {
          errorMessage = "UPI ID already exists";
        } else if (!error.response) {
          errorMessage = "Network error. Please check your connection.";
        }
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-seva-green">
      <div className="container max-w-md mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="mb-6 text-white flex items-center"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
        </button>
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Register</h1>
          <p className="text-white/80 text-sm">
            Already have an account? <a href="/" className="text-white underline">Log in</a>
          </p>
        </div>
        
        {/* Registration Form */}
        <Form {...form}>
          <form 
            onSubmit={(e) => {
              console.log("Form submitted");
              form.handleSubmit(handleSubmit)(e);
            }}
            className="space-y-4 bg-white rounded-lg p-4 shadow-md"
          >
            {/* Debug button to check form state */}
            <button 
              type="button" 
              onClick={() => {
                console.log("Form values:", form.getValues());
                console.log("Form errors:", form.formState.errors);
                console.log("Form is valid:", form.formState.isValid);
              }}
              className="mb-2 text-xs text-gray-500"
            >
              Debug Form State
            </button>
            
            {/* Name Fields - row with two inputs */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* UPI ID Field - Added below Birth Date */}
            <FormField
              control={form.control}
              name="upiId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">UPI ID</FormLabel>
                  <FormControl>
                    <Input placeholder="username@bankname" {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500 mt-1">Format: username@bankname or username@upi</p>
                </FormItem>
              )}
            />
            
            {/* Phone Number Field */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Phone Number</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <div className="bg-gray-100 border border-gray-300 rounded-l-md px-3 flex items-center">
                        <span className="text-red-500 font-bold">+</span>
                      </div>
                      <Input 
                        className="rounded-l-none" 
                        type="tel" 
                        placeholder="Phone Number" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* PIN Field */}
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Create 6-Digit PIN</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPin ? "text" : "password"} 
                        placeholder="Enter 6-digit PIN" 
                        maxLength={6}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        {...field} 
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowPin(!showPin)}
                      >
                        {showPin ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Confirm PIN Field */}
            <FormField
              control={form.control}
              name="confirmPin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Confirm PIN</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showConfirmPin ? "text" : "password"} 
                        placeholder="Confirm 6-digit PIN" 
                        maxLength={6}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        {...field} 
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowConfirmPin(!showConfirmPin)}
                      >
                        {showConfirmPin ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Register Button */}
            <Button 
              type="submit" 
              className="w-full bg-seva-green hover:bg-seva-green/90 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Register;
