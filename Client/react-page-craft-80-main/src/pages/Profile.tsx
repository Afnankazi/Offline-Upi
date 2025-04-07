
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Calendar, Save } from 'lucide-react';
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

const profileFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  birthDate: z.date({ required_error: "Please select a date of birth" }),
  upiId: z.string().min(5, { message: "UPI ID must be at least 5 characters" })
    .regex(/^[\w.-]+@[\w.-]+$/, { message: "UPI ID must be in the format username@bankname" }),
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  pin: z.string().length(6, { message: "PIN must be exactly 6 digits" }).regex(/^\d+$/, { message: "PIN must contain only numbers" }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      upiId: "",
      phoneNumber: "",
      pin: "",
    }
  });

  // Load user data from localStorage
  useEffect(() => {
    // In a real app, this would be fetched from an API
    // For demo, we're simulating data retrieval from localStorage
    const loadMockData = () => {
      // Simulate API call delay
      setTimeout(() => {
        try {
          // Get stored PIN
          const storedPin = localStorage.getItem('userPin') || "";
          
          // Mock data for demo - in a real app, this would come from a database
          const userData = {
            firstName: localStorage.getItem('firstName') || "Afnan",
            lastName: localStorage.getItem('lastName') || "Kumar",
            email: localStorage.getItem('email') || "afnan@example.com",
            birthDate: new Date(localStorage.getItem('birthDate') || "2000-01-01"),
            upiId: localStorage.getItem('upiId') || "afnan@ybl",
            phoneNumber: localStorage.getItem('phoneNumber') || "9876543210",
            pin: storedPin,
          };

          // Set form values
          form.reset(userData);
          setIsLoading(false);
        } catch (error) {
          console.error("Error loading profile data", error);
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive"
          });
          setIsLoading(false);
        }
      }, 500);
    };

    loadMockData();
  }, [form, toast]);

  const handleSubmit = (data: ProfileFormValues) => {
    setIsLoading(true);
    
    // In a real app, this would be an API call to update user data
    // For demo purposes, we'll simulate by saving to localStorage
    setTimeout(() => {
      try {
        // Save data to localStorage
        localStorage.setItem('firstName', data.firstName);
        localStorage.setItem('lastName', data.lastName);
        localStorage.setItem('email', data.email);
        localStorage.setItem('birthDate', data.birthDate.toISOString());
        localStorage.setItem('upiId', data.upiId);
        localStorage.setItem('phoneNumber', data.phoneNumber);
        localStorage.setItem('userPin', data.pin);
        
        toast({
          title: "Profile updated",
          description: "Your profile information has been updated successfully.",
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error saving profile data", error);
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-seva-green text-white p-4">
        <div className="container max-w-md mx-auto">
          <button 
            onClick={() => navigate('/dashboard')}
            className="mb-2 text-white flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
          </button>
          
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-white/80 text-sm">
            Edit your profile information
          </p>
        </div>
      </header>
      
      {/* Profile Form */}
      <div className="container max-w-md mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-pulse">Loading profile...</div>
          </div>
        ) : (
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Name Fields - row with two inputs */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
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
              
              {/* Birth Date Field */}
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-gray-700">Birth of date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* UPI ID Field */}
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
                    <FormLabel className="text-gray-700">PIN</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPin ? "text" : "password"} 
                          placeholder="6-digit PIN" 
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
              
              {/* Update Button */}
              <Button 
                type="submit" 
                className="w-full bg-seva-green hover:bg-seva-green/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                    Updating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Save className="w-4 h-4 mr-2" />
                    Update Profile
                  </div>
                )}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};

export default Profile;
