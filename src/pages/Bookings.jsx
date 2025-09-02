// src/pages/Bookings.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { Eye, X, Check } from 'lucide-react'

const STORAGE_KEY = 'dd_bookings_v1'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}
function save(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent('dd:bookings:update'))
}

/* === NEW: helpers to display NET amount (after promo) safely === */
function money(n){ return (Math.max(0, Number(n) || 0)).toFixed(2) }
function displayAmount(b){
  // Preferred (new shape): persisted net total
  if (typeof b?.total === 'number') return money(b.total)
  // Alternate shapes we might have in localStorage from older saves
  if (typeof b?.net === 'number') return money(b.net)
  if (typeof b?.gross === 'number' && typeof b?.discount === 'number') return money(b.gross - b.discount)
  if (typeof b?.estimate === 'number' && typeof b?.discount === 'number') return money(b.estimate - b.discount)
  // Fallbacks
  if (typeof b?.amount === 'number') return money(b.amount)
  return money(b?.estimate)
}

function StatusBadge({ s }) {
  const cls =
    s === 'pending'   ? 'bg-yellow-100 text-yellow-700' :
    s === 'completed' ? 'bg-emerald-100 text-emerald-700' :
    s === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
  return <span className={`text-xs px-2 py-1 rounded-full font-semibold ${cls}`}>{s}</span>
}

export default function Bookings() {
  const [items, setItems] = useState(load())

  useEffect(() => {
    const sync = () => setItems(load())
    window.addEventListener('dd:bookings:update', sync)
    window.addEventListener('storage', sync)
    return () => { window.removeEventListener('dd:bookings:update', sync); window.removeEventListener('storage', sync) }
  }, [])

  const sorted = useMemo(() => [...items].sort((a,b)=> (b.createdAt||0)-(a.createdAt||0)), [items])

  const metrics = useMemo(() => {
    const total = items.length
    const completed = items.filter(b => b.status === 'completed').length
    const upcoming  = items.filter(b => b.status === 'pending').length
    const inprog    = items.filter(b => b.status === 'in_progress').length
    return { total, completed, upcoming, inprog }
  }, [items])

  function setStatus(id, status) {
    setItems(prev => {
      const next = prev.map(b => b.id === id ? { ...b, status } : b)
      save(next)
      return next
    })
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold">Bookings & History</h1>
      <p className="muted mt-2">View and manage all your past and upcoming moves.</p>

      <div className="grid md:grid-cols-4 gap-4 mt-6">
        <Stat label="Total Bookings" value={metrics.total}/>
        <Stat label="Completed"      value={metrics.completed}/>
        <Stat label="Upcoming"       value={metrics.upcoming}/>
        <Stat label="In Progress"    value={metrics.inprog}/>
      </div>

      <div className="card p-6 mt-6">
        <div className="font-semibold text-xl mb-3">Your Moves ({sorted.length})</div>
        {sorted.length === 0 && <div className="text-sm text-gray-600">No bookings yet.</div>}

        <div className="space-y-3">
          {sorted.map(b => (
            <div key={b.id} className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusBadge s={b.status}/>
                  <div className="font-semibold">Booking #{b.id.slice(0,6)}</div>
                </div>
                {/* === CHANGED: show NET amount instead of raw estimate === */}
                <div className="font-semibold">${displayAmount(b)}</div>
              </div>

              <div className="mt-2 text-sm text-gray-700">
                <div>From: {b.pickupLabel}</div>
                <div>To: {b.dropoffLabel}</div>
              </div>

              <div className="mt-3 flex items-center gap-3 text-gray-600">
                <Eye size={16} className="cursor-pointer" title="View (stub)"/>
                {b.status !== 'cancelled' && (
                  <button onClick={()=>setStatus(b.id, 'cancelled')} title="Cancel">
                    <X size={16} className="hover:text-red-600"/>
                  </button>
                )}
                {b.status !== 'completed' && (
                  <button onClick={()=>setStatus(b.id, 'completed')} title="Mark completed">
                    <Check size={16} className="hover:text-emerald-600"/>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
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
