import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooking } from '../context/BookingContext'
import { usePromo } from '../context/PromoContext'
import { useWallet } from '../context/WalletContext'      // wallet (cards, balance, pay)
import { addBooking } from '../lib/auth'                  // per-user booking save

export default function Payment() {
  const nav = useNavigate()

  // booking details we’ll store into the user’s booking history
  const {
    estimate,
    pickup, dropoff,
    vehicle, helpers,
    suppliesPrice,
    quickItems,          // NEW: store selected items
    distanceKm,          // NEW: store distance
  } = useBooking()

  const { promo, applyPromo, computeDiscount } = usePromo()

  // Wallet (defensive: if provider missing, we’ll still allow “pay”)
  let cards = [], addCard = () => {}, setDefaultCard = () => {}, balance = 0, pay = () => ({ ok: true }), haveWallet = false
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const w = useWallet()
    cards = w.cards
    addCard = w.addCard
    setDefaultCard = w.setDefaultCard
    balance = w.balance
    pay = w.pay
    haveWallet = true
  } catch {}

  const [promoInput, setPromoInput] = useState('')
  const [promoMsg, setPromoMsg] = useState('')

  const discount = computeDiscount(estimate)
  const payable  = Math.max(0, estimate - discount)

  // wallet UI state
  const [selectedCard, setSelectedCard] = useState(cards.find(c => c.isDefault)?.id || cards[0]?.id || null)
  const [showAddCard, setShowAddCard]   = useState(cards.length === 0)
  const [newCard, setNewCard] = useState({ number:'', name:'', expMonth:'', expYear:'' })
  const [useFunds, setUseFunds] = useState(0)
  const maxFundsUsable = Math.min(balance, payable)

  // Keep selected card valid if the list changes (e.g., after adding a card)
  useEffect(() => {
    if (!haveWallet) return
    if (cards.length === 0) { setSelectedCard(null); return }
    const stillExists = selectedCard && cards.some(c => c.id === selectedCard)
    if (!stillExists) {
      const def = cards.find(c => c.isDefault)?.id || cards[0].id
      setSelectedCard(def)
    }
  }, [cards, selectedCard, haveWallet])

  function handleApplyPromo() {
    const res = applyPromo(promoInput.trim())
    setPromoMsg(res.ok ? `Promo "${res.promo.code}" applied.` : res.message)
  }

  function handleAddCard(e){
    e.preventDefault()
    addCard({
      number: newCard.number,
      name: newCard.name,
      expMonth: parseInt(newCard.expMonth || '0', 10),
      expYear: parseInt(newCard.expYear || '0', 10),
    })
    // selection will auto-fix in the effect above
    setShowAddCard(false)
    setNewCard({ number:'', name:'', expMonth:'', expYear:'' })
  }

  function handlePay(e){
    e.preventDefault()

    // Sanitize wallet funds
    const walletToUse = Math.max(0, Math.min(Number(useFunds) || 0, maxFundsUsable))
    const finalTotal  = payable   // what the user owes after promo

    try {
      if (haveWallet) {
        // Optional: require a card if remainder > 0
        const remainder = Math.max(0, finalTotal - walletToUse)
        if (remainder > 0 && !selectedCard) {
          alert('Please add/select a card to pay the remaining amount.')
          return
        }

        const label = `Move: ${pickup || 'Pickup'} → ${dropoff || 'Dropoff'}${promo && discount ? ` (promo ${promo.code})` : ''}`

        // ✅ correct signature
        pay({ funds: walletToUse, amountDue: finalTotal, cardId: selectedCard, label })
      }

      // ✅ per-user booking save
      addBooking({
        status: 'scheduled',
        createdAt: Date.now(),
        pickup,
        dropoff,
        vehicle,
        helpers,
        items: quickItems,     // object of selected items & qty
        distanceKm,
        total: finalTotal,     // store what they actually paid after promo
      })

      nav('/confirmation')
    } catch (err) {
      alert(err?.message || 'Payment failed')
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
                <input
                  type="number"
                  min="0"
                  max={maxFundsUsable}
                  step="0.01"
                  value={useFunds}
                  onChange={(e)=> {
                    const v = Math.min(maxFundsUsable, Math.max(0, parseFloat(e.target.value||0)))
                    setUseFunds(Number.isFinite(v) ? v : 0)
                  }}
                  className="h-11 px-3 rounded-xl border w-40"
                />
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

