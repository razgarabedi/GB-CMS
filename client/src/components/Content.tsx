

export interface Content {
  id: number;
  type: string;
  data: string;
  duration: number;
}

interface ContentProps {
  content: Content[];
}

const Content = ({ content }: ContentProps) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Content</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">ID</th>
            <th className="py-2">Type</th>
            <th className="py-2">Data</th>
            <th className="py-2">Duration</th>
          </tr>
        </thead>
        <tbody>
          {content.map((item) => (
            <tr key={item.id}>
              <td className="border px-4 py-2">{item.id}</td>
              <td className="border px-4 py-2">{item.type}</td>
              <td className="border px-4 py-2">{item.data}</td>
              <td className="border px-4 py-2">{item.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Content;
