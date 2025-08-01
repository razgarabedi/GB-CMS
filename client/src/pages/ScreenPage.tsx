import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

interface Screen {
  id: number;
  name: string;
  description: string;
}

const ScreenPage = () => {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { token } = useContext(AuthContext);

  const fetchScreens = async () => {
    const { data } = await axios.get('http://localhost:3000/api/screens', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setScreens(data);
  };

  useEffect(() => {
    if (token) {
      fetchScreens();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post(
      'http://localhost:3000/api/screens',
      { name, description },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    fetchScreens();
    setName('');
    setDescription('');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Screens</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Create Screen
          </button>
        </div>
      </form>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">ID</th>
            <th className="py-2">Name</th>
            <th className="py-2">Description</th>
          </tr>
        </thead>
        <tbody>
          {screens.map((screen) => (
            <tr key={screen.id}>
              <td className="border px-4 py-2">{screen.id}</td>
              <td className="border px-4 py-2">{screen.name}</td>
              <td className="border px-4 py-2">{screen.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScreenPage;
