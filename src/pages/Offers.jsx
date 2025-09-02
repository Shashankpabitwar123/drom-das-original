import React, { useState } from 'react'
import { usePromo } from '../context/PromoContext'

export default function Offers() {
  const { applyPromo, catalog, promo } = usePromo()
  const [input, setInput] = useState('')
  const [msg, setMsg] = useState('')

  const offers = [
    { name: 'New Student Special', code: 'NEWSTUDENT25', off: '25% off', meta: 'Min: $50'  },
    { name: 'Midterm Move Deal',   code: 'MIDTERM20',    off: '$20 off', meta: 'Min: $100' },
    { name: 'Weekend Warrior',     code: 'WEEKEND15',    off: '15% off', meta: 'Min: $75'  },
  ]

  function doApply(code) {
    const res = applyPromo(code)
    setMsg(res.ok ? `Promo "${res.promo.code}" applied!` : res.message)
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold">Offers & Promo Codes</h1>
      <p className="muted mt-2">Save money on your moves with exclusive discounts and promo codes.</p>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2 card p-6">
          <div className="font-semibold text-xl mb-3">Student Exclusive Offers</div>
          {offers.map(o => (
            <div key={o.code} className="rounded-xl border p-4 mb-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{o.name}</div>
                  <div className="text-sm text-gray-500">Expires: Ongoing · {o.meta}</div>
                </div>
                <span className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm">{o.off}</span>
                <div className="flex items-center gap-2">
                  <code className="px-3 py-1 rounded-lg bg-gray-100">{o.code}</code>
                  <button onClick={()=>doApply(o.code)} className="h-10 px-4 rounded-xl border">Apply</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-6">
          <div className="font-semibold text-xl mb-3">Enter Promo Code</div>
          <input
            value={input}
            onChange={e=>setInput(e.target.value)}
            placeholder="ENTER CODE"
            className="w-full h-11 px-3 rounded-xl border"
          />
          <button onClick={()=>doApply(input)} className="mt-3 h-11 px-4 rounded-xl bg-brand-500 text-white font-semibold">
            Apply
          </button>
          {msg && <div className="text-sm mt-3">{msg}</div>}
          {promo && <div className="text-xs text-gray-500 mt-1">Current: {promo.code}</div>}
        </div>
      </div>
    </main>
  )
}
