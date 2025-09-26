import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Player from './routes/Player'
import Preview from './routes/Preview'
import Instructions from './routes/Instructions'
import DynamicPlayer from './routes/DynamicPlayer'

const router = createBrowserRouter([
  { path: '/', element: <Instructions /> },
  { path: '/player/:screenId', element: <Player /> },
  { path: '/preview', element: <Preview /> },
  { path: '/dynamic/:screenId', element: <DynamicPlayer /> },
  { path: '/dynamic/:screenId/edit', element: <DynamicPlayer showEditor={true} /> },
  { path: '/editor', element: <DynamicPlayer showEditor={true} /> },
  { 
    path: '/admin', 
    element: <AdminRedirect /> 
  },
])

// Component to redirect admin requests to the server
function AdminRedirect() {
  React.useEffect(() => {
    // Redirect to the server's advanced admin interface
    window.location.href = `${import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'}/admin-advanced`;
  }, []);
  
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#111827',
      color: 'white',
      fontFamily: 'system-ui'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
        <div>Redirecting to admin interface...</div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
