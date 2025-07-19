import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import { ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

const CustomRegister = () => {
  const navigate = useNavigate();
  const { setUserData } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Store the user data in context
      setUserData({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
      });

      // Show success message
      toast.success('Registration successful!');
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Header */}
      <div className="p-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 bg-blue-600 rounded-xl rotate-6"></div>
                <div className="absolute inset-0 bg-white rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg"></div>
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Digital Bharat Pay
            </h1>
            <p className="text-sm text-gray-500 mt-2">Create your secure account</p>
          </div>

          <Card className="border-0 shadow-lg shadow-blue-100">
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">First Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John" 
                              {...field} 
                              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
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
                            <Input 
                              placeholder="Doe" 
                              {...field} 
                              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="your@email.com" 
                            {...field} 
                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            placeholder="1234567890" 
                            {...field} 
                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="********" 
                            {...field} 
                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Creating Account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 border-2 border-gray-200 hover:bg-gray-50 font-medium"
                  >
                    <img src="/google.svg" alt="Google" className="w-5 h-5 mr-2" />
                    Sign up with Google
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <p className="text-center mt-6 text-sm text-gray-600">
            Already have an account?{' '}
            <Button 
              variant="link" 
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700 font-medium p-0"
            >
              Sign in
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomRegister;
