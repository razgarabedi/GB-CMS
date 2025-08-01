import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ContentComponent from '../components/Content';
import type { Content as ContentType } from '../components/Content';
import ContentForm from '../components/ContentForm';
import { AuthContext } from '../contexts/AuthContext';

const DashboardPage = () => {
  const [content, setContent] = useState<ContentType[]>([]);
  const { token } = useContext(AuthContext);

  const fetchContent = async () => {
    const { data } = await axios.get('http://localhost:3000/api/content', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setContent(data);
  };

  useEffect(() => {
    if (token) {
      fetchContent();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white p-4 mb-4">
        <Link to="/" className="mr-4">Dashboard</Link>
        <Link to="/screens">Screens</Link>
      </nav>
      <ContentForm onContentCreated={fetchContent} />
      <ContentComponent content={content} />
    </div>
  );
};

export default DashboardPage;
