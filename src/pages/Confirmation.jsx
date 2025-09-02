import React from 'react'
import { useBooking } from '../context/BookingContext'
import { useNavigate } from 'react-router-dom'
import { usePromo } from '../context/PromoContext' 

export default function Confirmation() {
  const { vehicle, helpers, suppliesCart, estimate, pickup, dropoff } = useBooking()
  const nav = useNavigate()


const addedRef = React.useRef(false)
const promo = safe(() => usePromo())
const discount = promo ? promo.computeDiscount(estimate) : 0
const total = Math.max(0, estimate - discount)

React.useEffect(() => {
  if (addedRef.current) return
  addedRef.current = true

  try {
    const id = Math.random().toString(36).slice(2)
    const rec = {
      id,
      status: 'pending',
      createdAt: Date.now(),
      vehicle, helpers,
      pickupLabel: window.dd_pickupLabel || '33.4223, -111.9329',
      dropoffLabel: window.dd_dropoffLabel || '33.4215, -111.9270',
      gross: round2(estimate),      // keep the original
      discount: round2(discount),   // how much promo removed
      total: round2(total),         // ***net after discount*** (use this everywhere)

    }
    const raw = localStorage.getItem('dd_bookings_v1')
    const list = raw ? JSON.parse(raw) : []
    list.unshift(rec)
    localStorage.setItem('dd_bookings_v1', JSON.stringify(list))
    window.dispatchEvent(new CustomEvent('dd:bookings:update'))
  } catch {}
}, [vehicle, helpers, estimate])

  

  return (
    <main className="max-w-3xl mx-auto px-4 py-12 text-center">
      <div className="text-4xl font-extrabold">🎉 Booking Confirmed!</div>
      <p className="muted mt-2">Your DormDash move has been scheduled. A confirmation email will arrive shortly.</p>
      <div className="card p-6 mt-6 text-left">
        <div className="font-semibold">Summary</div>
        <div className="mt-2 text-sm text-gray-700">Vehicle: {vehicle}</div>
        <div className="text-sm text-gray-700">Helpers: {helpers}</div>
        <div className="text-sm text-gray-700">Pickup: {window.dd_pickupLabel || pickup || '—'}</div>
        <div className="text-sm text-gray-700">Dropoff: {window.dd_dropoffLabel || dropoff || '—'}</div>
        <div className="mt-2 text-sm text-gray-700">Supplies:</div>
        <ul className="list-disc pl-6 text-sm text-gray-700">
          {Object.keys(suppliesCart).length===0 && <li>None</li>}
          {Object.entries(suppliesCart).map(([k,v])=> <li key={k}>{k} x{v}</li>)}
        </ul>
        <div className="mt-3 pt-3 border-t">
          <div className="text-gray-600 text-sm">Estimated Total</div>
          <div className="text-3xl font-extrabold">${estimate.toFixed(2)}</div>
        </div>
      </div>
      <button onClick={()=>nav('/home')} className="mt-8 h-12 px-6 rounded-xl bg-brand-500 text-white font-semibold">Back to Home</button>
    </main>
  )
function round2(n){ return Math.round((n + Number.EPSILON) * 100) / 100 }
function safe(fn){ try { return fn() } catch { return null } }
}
