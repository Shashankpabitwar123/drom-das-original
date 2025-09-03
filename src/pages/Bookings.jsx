// src/pages/Bookings.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { Eye, X, Check } from 'lucide-react'
import { getBookings, setBookings } from '../lib/auth'

function money(n){ return (Math.max(0, Number(n) || 0)).toFixed(2) }

export default function Bookings() {
  const [items, setItems] = useState(getBookings())

  // keep in sync if another tab or the active user changes
  useEffect(() => {
    const refresh = () => setItems(getBookings())
    window.addEventListener('storage', refresh)
    // small custom event you can dispatch from anywhere if needed
    window.addEventListener('dd:auth:changed', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('dd:auth:changed', refresh)
    }
  }, [])

  function update(id, patch) {
    const next = items.map(b => (b.id === id ? { ...b, ...patch } : b))
    setItems(next)
    setBookings(next)
  }
  function remove(id) {
    const next = items.filter(b => b.id !== id)
    setItems(next)
    setBookings(next)
  }

  const stats = useMemo(() => {
    const total = items.length
    const completed = items.filter(b => b.status === 'completed').length
    const upcoming = items.filter(b => b.status === 'pending' || b.status === 'accepted' || b.status === 'in_progress').length
    const inProgress = items.filter(b => b.status === 'in_progress').length
    return { total, completed, upcoming, inProgress }
  }, [items])

  return (
    <main className="page">
      <h1 className="page-title">Bookings &amp; History</h1>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Stat label="Total Bookings" value={stats.total} />
        <Stat label="Completed" value={stats.completed} />
        <Stat label="Upcoming" value={stats.upcoming} />
        <Stat label="In Progress" value={stats.inProgress} />
      </div>

      <h2 className="font-bold text-xl mb-3">Your Moves ({items.length})</h2>

      <div className="space-y-4">
        {items.map(b => (
          <div key={b.id} className="rounded-2xl border bg-white p-4 md:p-5 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full ${b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {b.status || 'pending'}
                </span>
                <div className="font-semibold">Booking #{b.shortId || b.id.slice(0,6)}</div>
              </div>
              <div className="text-sm text-gray-600">
                <div>From: {b.from || b.pickup}</div>
                <div>To: {b.to || b.dropoff}</div>
              </div>

              <div className="flex gap-3 pt-2">
                <button title="View" className="icon-btn"><Eye size={18}/></button>
                <button title="Cancel" onClick={()=>update(b.id, { status: 'cancelled' })} className="icon-btn"><X size={18}/></button>
                <button title="Mark Done" onClick={()=>update(b.id, { status: 'completed' })} className="icon-btn"><Check size={18}/></button>
              </div>
            </div>
            <div className="text-xl font-bold">${money(b.net ?? b.total ?? b.estimate)}</div>
          </div>
        ))}
      </div>
    </main>
  )
}

function Stat({label, value}) {
  return (
    <div className="rounded-2xl border bg-white p-5 text-center">
      <div className="text-3xl font-extrabold">{value}</div>
      <div className="muted">{label}</div>
    </div>
  )
}

