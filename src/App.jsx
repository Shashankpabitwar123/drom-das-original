import React, { useState } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import ManageAccountDrawer from './components/ManageAccountDrawer'
import { BookingProvider } from './context/BookingContext'
import { WalletProvider } from './context/WalletContext'
import { PromoProvider } from './context/PromoContext'
import Chatbot from './components/Chatbot'

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  const { pathname } = useLocation()
  const showHeader = pathname !== '/'

  // Global open/close listeners so any button can trigger the same chatbot
  React.useEffect(() => {
    const open = () => setChatOpen(true)
    const close = () => setChatOpen(false)
    window.addEventListener('dd:chat:open', open)
    window.addEventListener('dd:chat:close', close)
    return () => {
      window.removeEventListener('dd:chat:open', open)
      window.removeEventListener('dd:chat:close', close)
    }
  }, [])

  return (
    <div className="min-h-screen font-sans">
      {showHeader && (
        <>
          <header className="bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500 grid place-items-center text-white font-extrabold">D</div>
              <Link to="/home" className="text-lg font-semibold tracking-tight">DormDash</Link>

              <div className="ml-auto flex items-center gap-3">
                {/* Optional header entry point for AI */}
               

                <button onClick={() => setDrawerOpen(true)} aria-label="Open Manage Account">
                  <Menu className="text-gray-500" />
                </button>
              </div>
            </div>
          </header>

          <ManageAccountDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </>
      )}

      {/* Providers wrap both the app routes and the global Chatbot */}
      <PromoProvider>
        <WalletProvider>
          <BookingProvider>
            <Outlet />

            {/* Global chatbot modal. Open it from anywhere by dispatching dd:chat:open */}
            <Chatbot open={chatOpen} onClose={() => setChatOpen(false)} />
          </BookingProvider>
        </WalletProvider>
      </PromoProvider>
    </div>
  )
}
