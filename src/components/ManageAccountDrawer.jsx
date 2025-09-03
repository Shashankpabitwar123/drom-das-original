import React from 'react'
import { X, LogOut, User, Wallet, Gift, FileClock, MessageSquare } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
//new
import { getActiveRole, setActiveRole } from '../lib/auth'

export default function ManageAccountDrawer({ open, onClose }) {
  const nav = useNavigate()
  const activeRole = getActiveRole()

  
  function switchRole(next) {
    setActiveRole(next)
    onClose?.()
    if (next === 'driver') nav('/driver')
    else nav('/home')
    window.dispatchEvent(new CustomEvent('dd:auth:changed'))
  }

  function signOut() {
    localStorage.removeItem('dormdash_authed')
    onClose?.()
    nav('/auth')
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-[420px] max-w-[92vw] bg-white rounded-l-3xl shadow-xl p-6 transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-3xl font-extrabold">Manage Account</h2>
          <button onClick={onClose} aria-label="Close drawer"><X /></button>
        </div>

        <div className="mt-6 space-y-8">
          <div>
            <div className="text-gray-500 font-semibold uppercase tracking-wide">Profile</div>
            <nav className="mt-3 grid gap-4 text-lg">
              <Link to="/profile" onClick={onClose} className="flex items-center gap-3 text-left">
                <User/> <span>Profile & Verification</span>
              </Link>
              <Link to="/wallet" onClick={onClose} className="flex items-center gap-3 text-left">
                <Wallet/> <span>Wallet</span>
              </Link>
              <Link to="/offers" onClick={onClose} className="flex items-center gap-3 text-left">
                <Gift/> <span>Offers & Promo Codes</span>
              </Link>
            </nav>
          </div>

          <div>
            <div className="text-gray-500 font-semibold uppercase tracking-wide">Account</div>
            <nav className="mt-3 grid gap-4 text-lg">
              <Link to="/bookings" onClick={onClose} className="flex items-center gap-3 text-left">
                <FileClock/> <span>Bookings & History</span>
              </Link>
              <button
                type="button"
                onClick={() => { window.dispatchEvent(new CustomEvent('dd:chat:open')); onClose?.(); }}
                className="flex items-center gap-3 text-left"
              >
                <MessageSquare/> <span>Talk with AI</span>
              </button>

            </nav>
          </div>

          
//-----new------------------//
        <div>
          <div className="text-gray-500 font-semibold uppercase tracking-wide">Role</div>
          <div className="mt-2 flex gap-3">
            <button
              onClick={()=>switchRole('customer')}
              className={`h-11 px-4 rounded-xl border w-full ${activeRole==='customer'?'bg-gray-900 text-white':''}`}
            >
              Customer
            </button>
            <button
              onClick={()=>switchRole('driver')}
              className={`h-11 px-4 rounded-xl border w-full ${activeRole==='driver'?'bg-gray-900 text-white':''}`}
            >
              Driver
            </button>
          </div>
        </div>


          
          <button onClick={signOut} className="text-red-600 flex items-center gap-2 text-lg">
            <LogOut/> <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </div>
  )
}
