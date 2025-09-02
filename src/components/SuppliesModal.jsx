import React from 'react'
import { useBooking } from '../context/BookingContext'

const SUPPLIES = [
  { name: 'Small Box', price: 2.5 },
  { name: 'Medium Box', price: 3.5 },
  { name: 'Large Box', price: 4.5 },
  { name: 'Packing Tape', price: 3.0 },
]

export default function SuppliesModal({ onClose }) {
  const { suppliesCart, setSuppliesCart } = useBooking()
  const total = SUPPLIES.reduce((s, it) => s + (suppliesCart[it.name] || 0) * it.price, 0)

  function inc(name) {
    setSuppliesCart(prev => ({ ...prev, [name]: (prev[name] || 0) + 1 }))
  }
  function dec(name) {
    setSuppliesCart(prev => {
      const q = (prev[name] || 0) - 1
      const copy = { ...prev }
      if (q <= 0) delete copy[name]
      else copy[name] = q
      return copy
    })
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[700px] max-w-[92vw] bg-white rounded-3xl shadow-xl p-6 md:p-8">
        <div className="flex items-start justify-between">
          <h3 className="text-2xl md:text-3xl font-extrabold">Order Packing Supplies</h3>
          <button onClick={onClose} className="text-2xl leading-none">×</button>
        </div>
        <p className="text-gray-500 mt-2 mb-4">Supplies will be delivered with your driver.</p>

        <div className="space-y-4 max-h-[50vh] overflow-auto pr-1">
          {SUPPLIES.map(item => (
            <div key={item.name} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border">
              <div>
                <div className="font-semibold text-lg">{item.name}</div>
                <div className="text-gray-500">${item.price.toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => dec(item.name)} className="w-10 h-10 rounded-full border">−</button>
                <div className="w-6 text-center">{suppliesCart[item.name] || 0}</div>
                <button onClick={() => inc(item.name)} className="w-10 h-10 rounded-full border">+</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t flex items-center justify-between">
          <div className="text-xl font-extrabold">Total</div>
          <div className="text-2xl font-extrabold">${total.toFixed(2)}</div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          <button onClick={onClose} className="h-12 px-5 rounded-xl border">Cancel</button>
          <button onClick={onClose} className="h-12 px-5 rounded-xl bg-brand-500 text-white font-semibold">Add to Move</button>
        </div>
      </div>
    </div>
  )
}
