// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import App from './App'
import Splash from './pages/Splash'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Landing from './pages/Landing'
import Payment from './pages/Payment'
import Confirmation from './pages/Confirmation'
import Profile from './pages/Profile'
import Wallet from './pages/Wallet'
import Offers from './pages/Offers'
import Bookings from './pages/Bookings'
import ChatAI from './pages/ChatAI'
import NotFound from './pages/NotFound'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      errorElement: <NotFound />,
      children: [
        { index: true, element: <Splash /> },
        { path: 'auth', element: <Auth /> },
        { path: 'landing', element: <Landing /> },
        { path: 'home', element: <Home /> },
        { path: 'payment', element: <Payment /> },
        { path: 'confirmation', element: <Confirmation /> },
        { path: 'profile', element: <Profile /> },
        { path: 'wallet', element: <Wallet /> },
        { path: 'offers', element: <Offers /> },
        { path: 'bookings', element: <Bookings /> },
        { path: 'chat', element: <ChatAI /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  {
    // 👇 Important for GitHub Pages: matches vite.config.js `base`
    basename: import.meta.env.BASE_URL,
  }
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
