// src/components/RecentBookings.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Eye, X } from 'lucide-react'
import { getBookings, updateBooking } from '../lib/auth'

/* === show NET (after promo) with two decimals === */
function money(n){ return (Math.max(0, Number(n) || 0)).toFixed(2) }
function displayAmount(b){
  if (typeof b?.total === 'number') return money(b.total) // preferred: persisted net
  if (typeof b?.net === 'number') return money(b.net)
  if (typeof b?.gross === 'number' && typeof b?.discount === 'number') return money(b.gross - b.discount)
  if (typeof b?.estimate === 'number' && typeof b?.discount === 'number') return money(b.estimate - b.discount)
  if (typeof b?.amount === 'number') return money(b.amount)
  return money(b?.estimate)
}

export default function RecentBookings({ limit = 5 }) {
  // Read bookings for the **active user**
  const [items, setItems] = useState(() => getBookings())

  const refresh = useCallback(() => {
    setItems(getBookings())
  }, [])

  useEffect(() => {
    // initial + keep in sync if user switches or another tab updates users store
    refresh()
    const onStorage = () => refresh()
    window.addEventListener('storage', onStorage)
    // light polling handles same-tab updates after checkout
    const id = setInterval(refresh, 1000)
    return () => { window.removeEventListener('storage', onStorage); clearInterval(id) }
  }, [refresh])

  const display = useMemo(
    () => [...items].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, limit),
    [items, limit]
  )

  const cancel = useCallback((id) => {
    updateBooking(id, { status: 'cancelled' })
    refresh()
  }, [refresh])

  if (display.length === 0) return null

  return (
    <div className="card p-6">
      <div className="text-2xl font-extrabold mb-4">Recent Bookings</div>
      <div className="space-y-4">
        {display.map(b => (
          <div key={b.id} className="rounded-2xl border overflow-hidden">
            <div className="p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={
                      'text-xs px-2 py-1 rounded-full font-semibold ' +
                      (b.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : b.status === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700')
                    }
                  >
                    {b.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(b.createdAt || Date.now()).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-500">
                  <Eye size={16} className="cursor-pointer" title="View details" />
                  <button onClick={() => cancel(b.id)} title="Cancel booking">
                    <X size={16} className="hover:text-red-600" />
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>Pinned Location at {b.pickup || b.pickupLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>Pinned Location at {b.dropoff || b.dropoffLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🚚</span>
                  <span>{b.vehicle} · {b.helpers}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t font-semibold">${displayAmount(b)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
