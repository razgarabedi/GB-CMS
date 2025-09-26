import React, { useEffect, useState } from 'react';
import './NewsWidget.css';

interface NewsWidgetProps {
  category: string;
  limit: number;
  theme: 'light' | 'dark';
}

const NewsWidget: React.FC<NewsWidgetProps> = ({ category, limit, theme }) => {
  const [news, setNews] = useState<string[]>([]);

  useEffect(() => {
    // Simulate fetching news
    const fetchedNews = Array.from({ length: limit }, (_, i) => `News item ${i + 1} in ${category}`);
    setNews(fetchedNews);
  }, [category, limit]);

  return (
    <div className={`news-widget ${theme}`}>
      <h3>News - {category}</h3>
      <ul>
        {news.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default NewsWidget;
