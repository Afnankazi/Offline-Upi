import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Newspaper, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useToast } from "@/components/ui/use-toast";

// Interface for a single news item
interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

// --- Cache Configuration ---
const CACHE_KEY = 'news_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// --- Fallback Data ---
const FALLBACK_NEWS: NewsItem[] = [
    {
      title: "UPI Transactions Hit Record High in 2024",
      description: "Digital payments through UPI reached a new milestone with over 10 billion transactions in a single month, showcasing the rapid adoption of digital finance across India.",
      url: "#", // Using placeholder URL for fallback
      publishedAt: new Date().toISOString(),
      source: { name: "Digital Bharat Pay" }
    },
    {
      title: "New Security Measures for Digital Payments",
      description: "The latest update introduces enhanced, multi-layered security protocols for all UPI transactions to better protect users from fraud and ensure safer digital payments.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: { name: "FinTech Times" }
    }
];


const Blogs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Caching Functions ---
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

  // --- Data Fetching Logic ---
  const fetchNews = async (useCache = true) => {
    setIsLoading(true);
    try {
      // 1. Check cache first
      if (useCache) {
        const cachedData = getCachedNews();
        if (cachedData) {
          setNews(cachedData.slice(0, 10));
          setIsLoading(false);
          return;
        }
      }

      // 2. Attempt to fetch from API
      try {
        const response = await axios.get('https://gnews.io/api/v4/search', {
          params: {
            q: 'upi OR digital payment OR fintech india',
            lang: 'en',
            country: 'in',
            max: 10,
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
          return; // Success, exit function
        }
      } catch (apiError) {
        console.error("API Fetch Error:", apiError);
        // If API fails, proceed to use fallback data
      }

      // 3. Use fallback data if API fails
      setNews(FALLBACK_NEWS);
      setCachedNews(FALLBACK_NEWS); // Cache fallback data as well

    } catch (error) {
      console.error("General Error in fetchNews:", error);
      // Use fallback data on any other error
      setNews(FALLBACK_NEWS);
      toast({
        title: t("News_Update_Error"),
        description: t("Using_Available_Data"),
        variant: "destructive" // More prominent error
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleRefresh = () => {
    fetchNews(false); // Skip cache on manual refresh
  };
  
  // --- Skeleton Loader Component ---
  const SkeletonCard = () => (
    <div className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
        <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-4"></div>
        <div className="h-3 bg-gray-200 rounded-md w-full mb-2"></div>
        <div className="h-3 bg-gray-200 rounded-md w-5/6 mb-4"></div>
        <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded-md w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded-md w-1/3"></div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100/50 font-sans">
      {/* --- Header --- */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/80 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-gray-800">{t("Financial_News")}</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            className="rounded-full text-gray-600 hover:bg-gray-200 hover:text-gray-900 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="space-y-5">
          {isLoading ? (
            // --- Loading State ---
            [...Array(5)].map((_, index) => <SkeletonCard key={index} />)
          ) : news.length > 0 ? (
            // --- News Content ---
            news.map((item, index) => (
              <a 
                href={item.url} 
                key={index} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block bg-white border border-gray-200 rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <article className="flex flex-col h-full">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2 leading-tight">{item.title}</h2>
                    <p className="text-sm text-gray-600 flex-grow mb-4">{item.description}</p>
                    <footer className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
                        <span className="font-medium truncate pr-4">{item.source.name}</span>
                        <time dateTime={item.publishedAt}>{new Date(item.publishedAt).toLocaleDateString()}</time>
                    </footer>
                </article>
              </a>
            ))
          ) : (
            // --- Empty State ---
            <div className="text-center py-16 px-6 bg-white rounded-xl border border-dashed">
                <Newspaper className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-800">{t("No_News_Available")}</h3>
                <p className="mt-1 text-sm text-gray-500">{t("Check_Back_Later")}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Blogs;
