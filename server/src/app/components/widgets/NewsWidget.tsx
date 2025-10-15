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
  width?: number;
  height?: number;
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
  cyclingInterval = 5, // 5 seconds
  width = 400,
  height = 300
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

  // Helper function to determine optimal image size based on widget dimensions
  const getOptimalImageSize = (widgetWidth: number, widgetHeight: number): string => {
    const area = widgetWidth * widgetHeight;
    
    // Determine optimal image variant based on widget size
    if (area >= 800000) { // Large widgets (e.g., 1000x800)
      return '16x9-1920'; // High resolution for large displays
    } else if (area >= 400000) { // Medium widgets (e.g., 800x500)
      return '16x9-1280';
    } else if (area >= 200000) { // Medium-small widgets (e.g., 600x400)
      return '16x9-840';
    } else if (area >= 100000) { // Small widgets (e.g., 400x300)
      return '16x9-640';
    } else { // Very small widgets
      return '16x9-480';
    }
  };

  // Normalize Tagesschau/relative URLs to absolute HTTPS
  const normalizeTagesschauUrl = (url?: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('/')) return `https://www.tagesschau.de${url}`;
    return url;
  };

  // Extract URL from image variant entry which may be a string or object
  const getUrlFromVariantEntry = (entry: any): string => {
    if (!entry) return '';
    if (typeof entry === 'string') return entry;
    return entry.url || entry.src || '';
  };

  // Choose best variant by scanning available keys and picking closest to target width
  const chooseBestVariant = (variants: any, targetWidth: number): string => {
    if (!variants || typeof variants !== 'object') return '';
    const candidates: { key: string; width: number; url: string }[] = [];
    for (const key of Object.keys(variants)) {
      // Expect keys like "16x9-840", "4x3-640", etc. Capture trailing width
      const match = key.match(/-(\d+)$/);
      const width = match ? parseInt(match[1], 10) : NaN;
      const url = getUrlFromVariantEntry(variants[key]);
      if (!isNaN(width) && url) {
        candidates.push({ key, width, url });
      }
    }
    if (candidates.length === 0) return '';
    // Sort by width ascending
    candidates.sort((a, b) => a.width - b.width);
    // Pick the smallest width >= targetWidth; otherwise the largest available
    const atLeast = candidates.find(c => c.width >= targetWidth);
    return (atLeast ? atLeast.url : candidates[candidates.length - 1].url) || '';
  };

  // Helper function to extract image URL with improved logic
  const extractImageUrl = (item: any, widgetWidth: number, widgetHeight: number): string => {
    let imageUrl = '';
    const optimalSize = getOptimalImageSize(widgetWidth, widgetHeight);
    const targetWidth = parseInt(optimalSize.split('-')[1] || '840', 10);
    
    // Try multiple image sources in order of preference
    if (item.teaserImage) {
      // Try different image variant structures with optimal size first
      if (item.teaserImage.imageVariants) {
        const variants = item.teaserImage.imageVariants;
        
        // Try optimal size first, then fallback to other sizes
        const directOptimal = getUrlFromVariantEntry(variants[optimalSize]);
        imageUrl = directOptimal ||
                  chooseBestVariant(variants, targetWidth) ||
                  getUrlFromVariantEntry(variants['16x9-840']) ||
                  getUrlFromVariantEntry(variants['4x3-840']) ||
                  getUrlFromVariantEntry(variants['1x1-840']) ||
                  getUrlFromVariantEntry(variants['16x9-640']) ||
                  getUrlFromVariantEntry(variants['4x3-640']) ||
                  getUrlFromVariantEntry(variants['16x9-480']) ||
                  getUrlFromVariantEntry(variants['4x3-480']) ||
                  getUrlFromVariantEntry(variants['1x1-480']) ||
                  '';
      }
      
      // Try direct properties if variants didn't work
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
                item.media?.image?.url ||
                item.media?.image?.src ||
                '';
    }
    
    // If still no image, try to extract from content or other fields
    if (!imageUrl && item.content && typeof item.content === 'string') {
      // Try to extract image URL from content HTML
      const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/i);
      if (imgMatch) {
        imageUrl = imgMatch[1];
      }
    }
    
    // If still no image, provide a fallback based on category
    if (!imageUrl) {
      const fallbackImages = {
        'Politik': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop',
        'Wirtschaft': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=600&fit=crop',
        'Sport': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
        'Kultur': 'https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=800&h=600&fit=crop',
        'Wissenschaft': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop',
        'default': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop'
      };
      
      const category = item.topline || item.category || 'default';
      imageUrl = fallbackImages[category] || fallbackImages.default;
    }
    
    // Normalize to absolute URL
    return normalizeTagesschauUrl(imageUrl);
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
          // Use the improved image extraction function
          const rawImageUrl = extractImageUrl(item, width, height);
          // Route image through proxy to avoid CORS/hotlink restrictions
          const imageUrl = rawImageUrl ? `/api/image?url=${encodeURIComponent(rawImageUrl)}` : '';
          
          // Only log if there's an issue with image extraction
          if (!rawImageUrl) {
            console.warn(`Tagesschau item ${index} has no image:`, item.title);
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
            // NewsAPI image URL available
            
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
    setImageError(true);
  };

  // Handle image loading success
  const handleImageLoad = () => {
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
  
  // Get background image with fallback and responsive sizing
  const getBackgroundImage = () => {
    if (currentNews.imageUrl && !imageError) {
      return `url("${currentNews.imageUrl}")`;
    }
    
    // Fallback to gradient if no image
    return `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`;
  };

  // Get responsive background size based on widget dimensions
  const getBackgroundSize = () => {
    const area = width * height;
    
    // Use different background sizing strategies based on widget size
    if (area >= 800000) {
      return 'cover'; // Large widgets - cover the entire area
    } else if (area >= 200000) {
      return 'cover'; // Medium widgets - cover with good quality
    } else {
      return 'cover'; // Small widgets - cover to fill space
    }
  };

  return (
    <div 
      className="news-widget h-full w-full rounded-lg overflow-hidden relative"
      style={{
        backgroundImage: getBackgroundImage(),
        backgroundSize: getBackgroundSize(),
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'transparent',
        minHeight: '200px',
        width: `${width}px`,
        height: `${height}px`
      }}
    >
      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 bg-black/15"></div>
      
      
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
          <div className="p-3 bg-black/25 backdrop-blur-sm border-b border-white/20">
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
              <span className="text-xs text-slate-200 uppercase tracking-wide bg-black/25 px-2 py-1 rounded">
                {currentNews.category}
              </span>
            </div>
            
            <h3 className="text-white font-medium text-sm leading-tight line-clamp-2 bg-black/25 p-2 rounded">
              {currentNews.title}
            </h3>
            
            <p className="text-slate-100 text-xs leading-relaxed line-clamp-3 bg-black/25 p-2 rounded">
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
