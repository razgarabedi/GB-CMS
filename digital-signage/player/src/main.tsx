import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Player from './routes/Player'
import Preview from './routes/Preview'
import Instructions from './routes/Instructions'
import DynamicPlayer from './routes/DynamicPlayer'
import AdminInterface from './routes/AdminInterface'

const router = createBrowserRouter([
  { path: '/', element: <Instructions /> },
  { path: '/player/:screenId', element: <Player /> },
  { path: '/preview', element: <Preview /> },
  { path: '/dynamic/:screenId', element: <DynamicPlayer /> },
  { path: '/dynamic/:screenId/edit', element: <DynamicPlayer showEditor={true} /> },
  { path: '/editor', element: <DynamicPlayer showEditor={true} /> },
  { path: '/admin', element: <AdminInterface /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
