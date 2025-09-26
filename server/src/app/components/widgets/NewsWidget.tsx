'use client';

import { useEffect, useState } from 'react';

interface NewsWidgetProps {
  category?: string;
  limit?: number;
  theme?: 'light' | 'dark';
  refreshInterval?: number;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  time: string;
  category: string;
}

export default function NewsWidget({
  category = 'general',
  limit = 5,
  theme = 'dark',
  refreshInterval = 300000 // 5 minutes
}: NewsWidgetProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching news data
    const fetchNews = () => {
      setIsLoading(true);
      setTimeout(() => {
        const mockNews: NewsItem[] = [
          {
            id: '1',
            title: 'Technology Advances in Digital Signage',
            summary: 'Latest innovations in display technology are revolutionizing the digital signage industry.',
            time: '2 hours ago',
            category: 'Technology'
          },
          {
            id: '2',
            title: 'Global Market Trends Show Growth',
            summary: 'Economic indicators point to continued expansion in key sectors worldwide.',
            time: '4 hours ago',
            category: 'Business'
          },
          {
            id: '3',
            title: 'Sports Championship Finals This Weekend',
            summary: 'Top teams prepare for the ultimate showdown in this season\'s championship.',
            time: '6 hours ago',
            category: 'Sports'
          },
          {
            id: '4',
            title: 'Weather Alert: Sunny Skies Ahead',
            summary: 'Meteorologists predict clear weather conditions for the next week.',
            time: '8 hours ago',
            category: 'Weather'
          },
          {
            id: '5',
            title: 'New Research in Renewable Energy',
            summary: 'Scientists make breakthrough discovery in solar panel efficiency.',
            time: '10 hours ago',
            category: 'Science'
          }
        ].slice(0, limit);
        
        setNews(mockNews);
        setIsLoading(false);
      }, 1000);
    };

    fetchNews();
    const interval = setInterval(fetchNews, refreshInterval);
    return () => clearInterval(interval);
  }, [category, limit, refreshInterval]);

  useEffect(() => {
    if (news.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % news.length);
      }, 5000); // Change news item every 5 seconds
      return () => clearInterval(timer);
    }
  }, [news.length]);

  const getCategoryIcon = (cat: string) => {
    const icons: { [key: string]: string } = {
      'Technology': '💻',
      'Business': '📈',
      'Sports': '⚽',
      'Weather': '🌤️',
      'Science': '🔬',
      'general': '📰'
    };
    return icons[cat] || '📰';
  };

  if (isLoading) {
    return (
      <div className="news-widget h-full w-full flex items-center justify-center bg-slate-800 rounded-lg">
        <div className="text-center text-slate-400">
          <div className="animate-spin text-2xl mb-2">📰</div>
          <div className="text-sm">Loading news...</div>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="news-widget h-full w-full flex items-center justify-center bg-slate-800 rounded-lg">
        <div className="text-center text-slate-400">
          <div className="text-2xl mb-2">📰</div>
          <div className="text-sm">No news available</div>
        </div>
      </div>
    );
  }

  const currentNews = news[currentIndex];

  return (
    <div className="news-widget h-full w-full bg-slate-800 rounded-lg overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-slate-700 border-b border-slate-600">
          <div className="flex items-center space-x-2">
            <span className="text-lg">📰</span>
            <span className="font-medium text-white text-sm">Latest News</span>
          </div>
          <div className="text-xs text-slate-400">
            {currentIndex + 1} of {news.length}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-center">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm">{getCategoryIcon(currentNews.category)}</span>
              <span className="text-xs text-slate-400 uppercase tracking-wide">
                {currentNews.category}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">{currentNews.time}</span>
            </div>
            
            <h3 className="text-white font-medium text-sm leading-tight line-clamp-2">
              {currentNews.title}
            </h3>
            
            <p className="text-slate-300 text-xs leading-relaxed line-clamp-3">
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
                  index === currentIndex ? 'bg-blue-500' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
