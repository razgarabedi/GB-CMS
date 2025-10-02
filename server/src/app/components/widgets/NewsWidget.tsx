'use client';

import { useEffect, useState } from 'react';

interface NewsWidgetProps {
  category?: string;
  limit?: number;
  theme?: 'light' | 'dark';
  refreshInterval?: number;
  newsSource?: string;
  apiKey?: string;
  showHeader?: boolean;
  cyclingInterval?: number;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  time: string;
  category: string;
  source?: string;
  url?: string;
  imageUrl?: string;
}

interface NewsSource {
  id: string;
  name: string;
  region: 'america' | 'europe' | 'global';
  apiUrl: string;
  requiresApiKey: boolean;
  category?: string;
}

// Available news sources
const NEWS_SOURCES: NewsSource[] = [
  {
    id: 'tagesschau',
    name: 'Tagesschau (Germany)',
    region: 'europe',
    apiUrl: 'https://www.tagesschau.de/api2u/homepage/',
    requiresApiKey: false
  },
  {
    id: 'newsapi',
    name: 'NewsAPI (Global)',
    region: 'global',
    apiUrl: 'https://newsapi.org/v2/top-headlines',
    requiresApiKey: true
  },
  {
    id: 'bbc',
    name: 'BBC News (UK)',
    region: 'europe',
    apiUrl: 'https://newsapi.org/v2/top-headlines',
    requiresApiKey: true,
    category: 'bbc-news'
  },
  {
    id: 'cnn',
    name: 'CNN (USA)',
    region: 'america',
    apiUrl: 'https://newsapi.org/v2/top-headlines',
    requiresApiKey: true,
    category: 'cnn'
  },
  {
    id: 'reuters',
    name: 'Reuters (Global)',
    region: 'global',
    apiUrl: 'https://newsapi.org/v2/top-headlines',
    requiresApiKey: true,
    category: 'reuters'
  },
  {
    id: 'associated-press',
    name: 'Associated Press (USA)',
    region: 'america',
    apiUrl: 'https://newsapi.org/v2/top-headlines',
    requiresApiKey: true,
    category: 'associated-press'
  }
];

export default function NewsWidget({
  category = 'general',
  limit = 5,
  theme = 'dark',
  refreshInterval = 300000, // 5 minutes
  newsSource = 'tagesschau',
  apiKey = '',
  showHeader = true,
  cyclingInterval = 5 // 5 seconds
}: NewsWidgetProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fetch news from different sources
  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const selectedSource = NEWS_SOURCES.find(source => source.id === newsSource);
      if (!selectedSource) {
        throw new Error('News source not found');
      }

      let newsData: NewsItem[] = [];

      if (selectedSource.id === 'tagesschau') {
        // Tagesschau API
        const response = await fetch(selectedSource.apiUrl);
        const data = await response.json();
        
        newsData = data.news?.slice(0, limit).map((item: any, index: number) => {
          // Try multiple image sources in order of preference
          let imageUrl = '';
          
          // Check if teaserImage exists
          if (item.teaserImage) {
            // Try different image variant structures
            if (item.teaserImage.imageVariants) {
              imageUrl = item.teaserImage.imageVariants['16x9-840']?.url || 
                        item.teaserImage.imageVariants['4x3-840']?.url ||
                        item.teaserImage.imageVariants['1x1-840']?.url ||
                        item.teaserImage.imageVariants['16x9-640']?.url ||
                        item.teaserImage.imageVariants['4x3-640']?.url ||
                        '';
            }
            
            // Try direct properties
            if (!imageUrl) {
              imageUrl = item.teaserImage.src || 
                        item.teaserImage.url || 
                        item.teaserImage.imageUrl ||
                        '';
            }
          }
          
          // Try other possible image properties
          if (!imageUrl) {
            imageUrl = item.image?.url || 
                      item.image?.src ||
                      item.imageUrl ||
                      item.backgroundImage ||
                      '';
          }
          
          return {
            id: `tagesschau-${index}`,
            title: item.title || 'No title',
            summary: item.firstSentence || item.text || 'No summary available',
            time: formatDate(item.date),
            category: item.topline || 'General',
            source: 'Tagesschau',
            url: item.details || '',
            imageUrl: imageUrl
          };
        }) || [];
      } else if (selectedSource.requiresApiKey && apiKey) {
        // NewsAPI.org for other sources
        const params = new URLSearchParams({
          apiKey: apiKey,
          pageSize: limit.toString(),
          ...(selectedSource.category && { sources: selectedSource.category }),
          ...(category !== 'general' && { category: category })
        });
        
        const response = await fetch(`${selectedSource.apiUrl}?${params}`);
        const data = await response.json();
        
        if (data.status === 'ok') {
          newsData = data.articles?.map((article: any, index: number) => {
            const imageUrl = article.urlToImage || '';
            console.log('NewsAPI image URL:', imageUrl); // Debug log
            
            return {
              id: `${selectedSource.id}-${index}`,
              title: article.title || 'No title',
              summary: article.description || 'No summary available',
              time: formatDate(article.publishedAt),
              category: article.source?.name || 'General',
              source: article.source?.name || selectedSource.name,
              url: article.url || '',
              imageUrl: imageUrl
            };
          }) || [];
        }
      } else {
        // Fallback to mock data if no API key or source not found
        newsData = [
          {
            id: '1',
            title: 'Sample News Article',
            summary: 'This is a sample news article. Please configure your API key to fetch real news.',
            time: formatDate(new Date().toISOString()),
            category: 'General',
            source: selectedSource.name,
            imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
          }
        ];
      }

      setNews(newsData);
    } catch (error) {
      console.error('Error fetching news:', error);
      // Fallback to mock data on error
      setNews([
        {
          id: 'error-1',
          title: 'Unable to load news',
          summary: 'There was an error loading news from the selected source. Please check your configuration.',
          time: formatDate(new Date().toISOString()),
          category: 'Error',
          source: 'System'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, refreshInterval);
    return () => clearInterval(interval);
  }, [category, limit, refreshInterval, newsSource, apiKey]);

  useEffect(() => {
    if (news.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % news.length);
        setImageError(false); // Reset image error when changing articles
      }, cyclingInterval * 1000); // Convert seconds to milliseconds
      return () => clearInterval(timer);
    }
  }, [news.length, cyclingInterval]);

  // Handle image loading errors
  const handleImageError = () => {
    console.log('Image failed to load:', currentNews.imageUrl);
    setImageError(true);
  };

  // Handle image loading success
  const handleImageLoad = () => {
    console.log('Image loaded successfully:', currentNews.imageUrl);
    setImageError(false);
  };

  const getCategoryIcon = (cat: string) => {
    const icons: { [key: string]: string } = {
      'Technology': 'T',
      'Business': 'B',
      'Sports': 'S',
      'Weather': 'W',
      'Science': 'S',
      'general': 'N'
    };
    return icons[cat] || 'N';
  };

  if (isLoading) {
    return (
      <div className="news-widget h-full w-full flex items-center justify-center bg-slate-800 rounded-lg">
        <div className="text-center text-slate-400">
          <div className="animate-spin text-2xl mb-2 w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full"></div>
          <div className="text-sm">Loading news...</div>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="news-widget h-full w-full flex items-center justify-center bg-slate-800 rounded-lg">
        <div className="text-center text-slate-400">
          <div className="text-2xl mb-2 w-8 h-8 mx-auto bg-slate-600 rounded flex items-center justify-center">
            <span className="text-slate-400 text-sm">!</span>
          </div>
          <div className="text-sm">No news available</div>
        </div>
      </div>
    );
  }

  const currentNews = news[currentIndex];
  
  // Get background image with fallback
  const getBackgroundImage = () => {
    if (currentNews.imageUrl && !imageError) {
      return `url(${currentNews.imageUrl})`;
    }
    
    // Fallback to gradient if no image
    return `linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)`;
  };

  return (
    <div 
      className="news-widget h-full w-full rounded-lg overflow-hidden relative"
      style={{
        background: getBackgroundImage(),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '200px'
      }}
    >
      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
      
      {/* Hidden image element to detect loading errors */}
      {currentNews.imageUrl && (
        <img
          src={currentNews.imageUrl}
          alt=""
          className="hidden"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}
      
      <div className="h-full flex flex-col relative z-10">
        {/* Header - conditionally rendered */}
        {showHeader && (
          <div className="p-3 bg-black bg-opacity-30 backdrop-blur-sm border-b border-white border-opacity-20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">N</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-white text-sm">Latest News</span>
                  {currentNews.source && (
                    <span className="text-xs text-slate-200">{currentNews.source}</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-slate-200">
                {currentIndex + 1} of {news.length}
              </div>
            </div>
            <div className="text-xs text-slate-300">
              {currentNews.time}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-center">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-slate-600 rounded flex items-center justify-center">
                <span className="text-xs text-white font-medium">{getCategoryIcon(currentNews.category)}</span>
              </div>
              <span className="text-xs text-slate-200 uppercase tracking-wide bg-black bg-opacity-30 px-2 py-1 rounded">
                {currentNews.category}
              </span>
            </div>
            
            <h3 className="text-white font-medium text-sm leading-tight line-clamp-2 bg-black bg-opacity-30 p-2 rounded">
              {currentNews.title}
            </h3>
            
            <p className="text-slate-100 text-xs leading-relaxed line-clamp-3 bg-black bg-opacity-30 p-2 rounded">
              {currentNews.summary}
            </p>
          </div>
        </div>

        {/* Progress indicators */}
        {news.length > 1 && (
          <div className="flex space-x-1 p-3 justify-center">
            {news.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-400' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
