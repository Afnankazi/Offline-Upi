import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useToast } from "@/components/ui/use-toast";
import BLog from './BLog';

interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string; // Changed from published_at to match GNews API
  source: {
    name: string;
  };
}

// Create a simple cache mechanism
const CACHE_KEY = 'news_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const Blogs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const getCachedNews = () => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
    return null;
  };

  const setCachedNews = (data: NewsItem[]) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  };

  // Add static fallback news data
  const FALLBACK_NEWS: NewsItem[] = [
    {
      title: "UPI Transactions Hit Record High in 2024",
      description: "Digital payments through UPI reached a new milestone with over 10 billion transactions...",
      url: "https://www.digitalbharatpay.com/news/upi-milestone",
      publishedAt: new Date().toISOString(),
      source: { name: "Digital Bharat Pay" }
    },
    {
      title: "Digital Payment Security Updates",
      description: "New security measures implemented for UPI transactions to enhance user protection...",
      url: "https://www.digitalbharatpay.com/news/security-update",
      publishedAt: new Date().toISOString(),
      source: { name: "Digital Bharat Pay" }
    }
    // Add more fallback news items as needed
  ];

  const fetchNews = async (useCache = true) => {
    try {
      setIsLoading(true);

      // Check cache first if useCache is true
      if (useCache) {
        const cachedData = getCachedNews();
        if (cachedData) {
          setNews(cachedData.slice(0, 10)); // Limit to 10 items
          setIsLoading(false);
          return;
        }
      }

      // First try the API
      try {
        const response = await axios.get('https://gnews.io/api/v4/search', {
          params: {
            q: 'upi OR digital payment OR fintech india',
            lang: 'en',
            country: 'in',
            max: 10, // Limit to 10 results
            apikey: '2833e6f0922bf31ce0ae232c6f862703'
          },
          timeout: 5000
        });

        if (response.data && response.data.articles) {
          const formattedNews = response.data.articles.map((article: any) => ({
            title: article.title,
            description: article.description,
            url: article.url,
            publishedAt: article.publishedAt,
            source: article.source
          }));
          setNews(formattedNews);
          setCachedNews(formattedNews);
          return;
        }
      } catch (apiError) {
        console.error("API Error:", apiError);
        // If API fails, continue to fallback
      }

      // If API fails, use fallback data
      setNews(FALLBACK_NEWS);
      setCachedNews(FALLBACK_NEWS);

    } catch (error: any) {
      console.error("Error in fetchNews:", error);
      
      // Try to use cached data first
      const cachedData = getCachedNews();
      if (cachedData) {
        setNews(cachedData.slice(0, 10));
      } else {
        // If no cached data, use fallback
        setNews(FALLBACK_NEWS);
      }

      toast({
        title: t("News_Update_Error"),
        description: t("Using_Available_Data"),
        variant: "warning"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Add refresh functionality
  const handleRefresh = () => {
    fetchNews(false); // Skip cache on manual refresh
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="rounded-xl hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">{t("Financial_News")}</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            className="rounded-xl hover:bg-gray-100"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {isLoading ? (
          // Loading state
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          // News content
          <div className="space-y-4">
            {news.map((item, index) => (
              <div key={index} className="transition-all duration-300 hover:transform hover:translate-y-[-2px]">
                <BLog
                  Title={item.title}
                  Description={item.description}
                  Url={item.url}
                  Source={item.source.name} // Add source to BLog component
                  PublishedAt={new Date(item.publishedAt).toLocaleDateString()} // Format date
                />
              </div>
            ))}

            {/* Empty state */}
            {news.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <h3 className="text-gray-500 text-lg">{t("No_News_Available")}</h3>
                <p className="text-gray-400 mt-2">{t("Check_Back_Later")}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Blogs;