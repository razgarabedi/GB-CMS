import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface Content {
  id: number;
  title: string;
  body: string;
  imageUrl: string;
}

const DetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState<Content | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/content/${id}`);
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
  }, [id]);

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (!content) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
      {content.imageUrl && (
        <img
          src={content.imageUrl}
          alt={content.title}
          className="mb-4 h-96 w-full object-cover"
        />
      )}
      <p className="text-gray-700">{content.body}</p>
    </div>
  );
};

export default DetailPage; 