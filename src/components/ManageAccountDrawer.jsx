import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  X, LogOut, User, Wallet, Gift, FileClock, MessageSquare, Star
} from 'lucide-react'
import { getActiveUser, updateActiveUser, logoutUser } from '../lib/auth'

export default function ManageAccountDrawer({ open, onClose }) {
  const nav = useNavigate()
  const role = getActiveUser()?.role || 'customer'   // 'customer' | 'driver'

  function signOut() {
    try { logoutUser?.() } catch {}
    onClose?.()
    nav('/auth')
    window.dispatchEvent(new CustomEvent('dd:auth:changed'))
  }

  function switchRole(next) {
    updateActiveUser({ role: next })
    onClose?.()
    if (next === 'driver') nav('/driver')
    else nav('/home')
    window.dispatchEvent(new CustomEvent('dd:auth:changed'))
  }

  const customerLinks = [
    { to: '/profile',   icon: User,        label: 'Profile' },
    { to: '/wallet',    icon: Wallet,      label: 'Wallet' },
    { to: '/offers',    icon: Gift,        label: 'Offers' },
    { to: '/bookings',  icon: FileClock,   label: 'Booking History' },
    { to: '/chatai',    icon: MessageSquare, label: 'Talk with AI' },
  ]

  const driverLinks = [
    { to: '/profile',          icon: User,        label: 'Driver Profile & Verification' },
    { to: '/driver/earnings',  icon: Wallet,      label: 'Earnings' },
    { to: '/driver/reviews',   icon: Star,        label: 'Reviews & Ratings' },
    { to: '/driver/jobs',      icon: FileClock,   label: 'Job History' },
    { to: '/chatai',           icon: MessageSquare, label: 'Talk with AI' },
  ]

  const links = role === 'driver' ? driverLinks : customerLinks
  const sectionTitle = role === 'driver' ? 'Driver Menu' : 'Menu'

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      {/* overlay */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      {/* drawer */}
      <aside
        className={`absolute right-0 top-0 h-full w-[420px] max-w-[92vw] bg-white shadow-xl transition-transform
                    ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-label="Manage Account"
      >
        <div className="p-6 h-full flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold">Manage Account</h2>
            <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-xl border border-gray-200">
              <X />
            </button>
          </div>

          {/* role-specific menu */}
          <div className="space-y-4">
            <div className="text-gray-500 font-semibold">{sectionTitle}</div>
            <nav className="grid gap-3">
              {links.map(({ to, icon:Icon, label }) => (
                <Link key={to} to={to} onClick={onClose}
                      className="h-12 px-4 rounded-xl border flex items-center gap-3 hover:bg-gray-50">
                  <Icon size={20} />
                  <span className="text-lg">{label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* switch role */}
          <div className="space-y-2 mt-auto">
            <div className="text-gray-500 font-semibold">Switch Role</div>
            <div className="mt-2 flex gap-3">
              <button
                className={`h-11 px-4 rounded-xl border w-full chip ${role==='customer' ? 'chip--active' : ''}`}
                onClick={() => switchRole('customer')}>
                Customer
              </button>
              <button
                className={`h-11 px-4 rounded-xl border w-full chip ${role==='driver' ? 'chip--active' : ''}`}
                onClick={() => switchRole('driver')}>
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
