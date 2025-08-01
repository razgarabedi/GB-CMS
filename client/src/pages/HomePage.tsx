import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Content {
  id: number;
  title: string;
  body: string;
  imageUrl: string;
}

const HomePage = () => {
  const [content, setContent] = useState<Content[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/content');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setContent(result);
      } catch (error) {
        setError(error instanceof Error ? error.message : String(error));
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">Content</h1>
      {error && <p className="text-red-500">Error: {error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {content.length > 0 ? (
          content.map((item) => (
            <div key={item.id} className="border rounded p-4">
              <h2 className="text-2xl font-bold">{item.title}</h2>
              <p className="text-gray-700 truncate">{item.body}</p>
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="mt-2 h-48 w-full object-cover"
                />
              )}
              <Link
                to={`/content/${item.id}`}
                className="text-blue-500 hover:underline mt-2 inline-block"
              >
                Read more
              </Link>
            </div>
          ))
        ) : (
          <p className="text-gray-700">No content found.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage; 