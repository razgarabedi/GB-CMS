import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Player from './routes/Player'
import Instructions from './routes/Instructions'

const router = createBrowserRouter([
  { path: '/', element: <Instructions /> },
  { path: '/player/:screenId', element: <Player /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
