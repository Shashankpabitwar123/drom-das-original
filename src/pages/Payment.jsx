import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooking } from '../context/BookingContext'
import { usePromo } from '../context/PromoContext'
import { useWallet } from '../context/WalletContext' // keep if you added wallet

export default function Payment() {
  const nav = useNavigate()
  const { estimate, pickup, dropoff, vehicle, helpers, suppliesPrice } = useBooking()
  const { promo, applyPromo, computeDiscount } = usePromo()

  // Wallet pieces (optional but recommended)
  let cards=[], addCard=()=>{}, setDefaultCard=()=>{}, balance=0, pay=(a)=>({}), haveWallet=false
  try {
    // if WalletContext exists
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const w = useWallet()
    cards = w.cards; addCard = w.addCard; setDefaultCard = w.setDefaultCard; balance = w.balance; pay = w.pay; haveWallet=true
  } catch {}

  const [promoInput, setPromoInput] = useState('')
  const [promoMsg, setPromoMsg] = useState('')

  const discount = computeDiscount(estimate)
  const payable  = Math.max(0, estimate - discount)

  // wallet UI state
  const [selectedCard, setSelectedCard] = useState(cards.find(c=>c.isDefault)?.id || (cards[0]?.id))
  const [showAddCard, setShowAddCard] = useState(cards.length===0)
  const [newCard, setNewCard] = useState({ number:'', name:'', expMonth:'', expYear:'' })
  const [useFunds, setUseFunds] = useState(0)
  const maxFundsUsable = Math.min(balance, payable)

  function handleApplyPromo() {
    const res = applyPromo(promoInput)
    setPromoMsg(res.ok ? `Promo "${res.promo.code}" applied.` : res.message)
  }

  function handleAddCard(e){
    e.preventDefault()
    const c = addCard({
      number:newCard.number,
      name:newCard.name,
      expMonth: parseInt(newCard.expMonth||'0',10),
      expYear: parseInt(newCard.expYear||'0',10),
    })
    setSelectedCard(c.id)
    setShowAddCard(false)
  }

  function handlePay(e){
    e.preventDefault()
    const finalTotal = payable
    if (haveWallet) {
      try{
        const label = `Move: ${pickup || 'Pickup'} → ${dropoff || 'Dropoff'}${promo && discount ? ` (promo ${promo.code})` : ''}`
        pay(finalTotal, { funds: useFunds, cardId: selectedCard, label })
        nav('/confirmation')
      } catch(err) {
        alert(err.message || 'Payment failed')
      }
    } else {
      // fallback if no wallet context
      nav('/confirmation')
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold">Payment</h1>

      <form onSubmit={handlePay} className="grid gap-6 mt-6">
        {/* Promo */}
        <div className="card p-6">
          <div className="font-semibold">Promo Code</div>
          <div className="mt-2 flex gap-2">
            <input value={promoInput} onChange={e=>setPromoInput(e.target.value)} placeholder="ENTER CODE" className="h-11 px-3 rounded-xl border flex-1"/>
            <button type="button" onClick={handleApplyPromo} className="h-11 px-4 rounded-xl border">Apply</button>
          </div>
          {promo && <div className="text-sm text-gray-600 mt-2">Current: <span className="font-semibold">{promo.code}</span></div>}
          {promoMsg && <div className="text-sm mt-1">{promoMsg}</div>}
        </div>

        {/* Saved cards + Add Card (if using wallet) */}
        {haveWallet && (
          <>
            <div className="card p-6">
              <div className="font-semibold mb-2">Saved payment methods</div>
              {cards.length === 0 && <div className="text-sm text-gray-600">No saved cards yet.</div>}
              <div className="space-y-3">
                {cards.map(c => (
                  <label key={c.id} className="flex items-center justify-between border rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <input type="radio" name="card" checked={selectedCard===c.id} onChange={()=>setSelectedCard(c.id)} />
                      <div className="font-semibold">{c.brand} •••• {c.last4}</div>
                    </div>
                    {!c.isDefault
                      ? <button type="button" onClick={()=>setDefaultCard(c.id)} className="text-sm text-brand-600">Set Default</button>
                      : <span className="text-sm text-gray-500">Default</span>}
                  </label>
                ))}
              </div>
              <button type="button" onClick={()=>setShowAddCard(s=>!s)} className="mt-4 h-10 px-4 rounded-xl border">
                {showAddCard ? 'Close' : 'Add card'}
              </button>
              {showAddCard && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <input placeholder="Card number" value={newCard.number} onChange={e=>setNewCard({...newCard, number:e.target.value})} className="col-span-2 h-11 px-3 rounded-xl border" />
                  <input placeholder="Name on card" value={newCard.name} onChange={e=>setNewCard({...newCard, name:e.target.value})} className="col-span-2 h-11 px-3 rounded-xl border" />
                  <input placeholder="MM" value={newCard.expMonth} onChange={e=>setNewCard({...newCard, expMonth:e.target.value})} className="h-11 px-3 rounded-xl border" />
                  <input placeholder="YY" value={newCard.expYear} onChange={e=>setNewCard({...newCard, expYear:e.target.value})} className="h-11 px-3 rounded-xl border" />
                  <button onClick={handleAddCard} className="col-span-2 h-11 rounded-xl bg-brand-500 text-white font-semibold">Save Card</button>
                </div>
              )}
            </div>

            {/* Funds split */}
            <div className="card p-6">
              <div className="font-semibold">Use wallet funds</div>
              <div className="text-sm text-gray-600 mt-1">Available balance: ${balance.toFixed(2)}</div>
              <div className="mt-3 flex items-center gap-2">
                <input type="number" min="0" max={maxFundsUsable} step="0.01"
                  value={useFunds}
                  onChange={(e)=> {
                    const v = Math.min(maxFundsUsable, Math.max(0, parseFloat(e.target.value||0)))
                    setUseFunds(Number.isFinite(v) ? v : 0)
                  }}
                  className="h-11 px-3 rounded-xl border w-40" />
                <button type="button" onClick={()=>setUseFunds(maxFundsUsable)} className="h-11 px-3 rounded-xl border">Use Max</button>
              </div>
            </div>
          </>
        )}

        {/* Summary + Pay */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="font-semibold mb-2">Order Summary</div>
            <div className="text-sm text-gray-600">Vehicle: {vehicle}</div>
            <div className="text-sm text-gray-600">Helpers: {helpers}</div>
            <div className="text-sm text-gray-600">Supplies: ${suppliesPrice.toFixed(2)}</div>

            <div className="mt-3 pt-3 border-t space-y-1">
              <div className="flex items-center justify-between text-sm text-gray-700">
                <span>Estimated Total</span>
                <span className="font-semibold">${estimate.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-sm text-emerald-700">
                  <span>Promo {promo?.code}</span>
                  <span>- ${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-lg font-extrabold mt-1">
                <span>Amount Due</span>
                <span>${payable.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="card p-6 flex items-end">
            <button type="submit" className="h-12 px-5 rounded-xl bg-brand-500 text-white font-semibold w-full">
              Pay & Confirm
            </button>
          </div>
        </div>
      </form>
    </main>
  )
}
