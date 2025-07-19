import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center p-4">
      {/* 404 Card */}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 bg-blue-600 rounded-2xl rotate-6"></div>
              <div className="absolute inset-0 bg-white rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl"></div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Oops! This page doesn't exist
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="h-12 px-6 border-2 border-blue-100 text-blue-600 hover:bg-blue-50 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="h-12 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl flex items-center justify-center gap-2 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <HomeIcon className="w-4 h-4" />
            Return Home
          </Button>
        </div>

        {/* Additional Info */}
        <p className="text-center mt-8 text-sm text-gray-500">
          If you believe this is a mistake, please contact support
        </p>
      </div>
    </div>
  );
};

export default NotFound;
