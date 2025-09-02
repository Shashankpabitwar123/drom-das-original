import React, { useState } from 'react'
import { useWallet } from '../context/WalletContext'

export default function Wallet() {
  const { cards, setDefaultCard, addCard, balance, addFunds, txns, monthStats } = useWallet()
  const [addingCard, setAddingCard] = useState(false)
  const [card, setCard] = useState({ number:'', name:'', expMonth:'', expYear:'' })
  const [fundsInput, setFundsInput] = useState('')

  function submitCard(e){
    e.preventDefault()
    addCard({
      number: card.number,
      name: card.name,
      expMonth: parseInt(card.expMonth||'0',10),
      expYear: parseInt(card.expYear||'0',10),
    })
    setCard({ number:'', name:'', expMonth:'', expYear:'' })
    setAddingCard(false)
  }

  function submitFunds(e){
    e.preventDefault()
    const amt = parseFloat(fundsInput||'0')
    if (!amt) return
    addFunds(amt)
    setFundsInput('')
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold">Wallet</h1>
      <p className="muted mt-2">Manage your payment methods and view transaction history.</p>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 card p-6">
          <div className="font-semibold text-xl mb-4">Payment Methods</div>

          <div className="space-y-3">
            {cards.map(c => (
              <div key={c.id} className="border rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{c.brand} •••• {c.last4}</div>
                  <div className="text-sm text-gray-500">Expires {String(c.expMonth).padStart(2,'0')}/{String(c.expYear).padStart(2,'0')}</div>
                </div>
                <div className="text-sm">
                  {c.isDefault
                    ? <span className="text-gray-500">Default</span>
                    : <button onClick={()=>setDefaultCard(c.id)} className="text-brand-600">Set Default</button>}
                </div>
              </div>
            ))}
          </div>

          <button onClick={()=>setAddingCard(a=>!a)} className="mt-4 h-10 px-4 rounded-xl border">
            {addingCard ? 'Close' : 'Add Card'}
          </button>

          {addingCard && (
            <form onSubmit={submitCard} className="grid grid-cols-2 gap-3 mt-4">
              <input
                placeholder="Card number"
                value={card.number}
                onChange={e=>setCard({...card, number:e.target.value})}
                className="col-span-2 h-11 px-3 rounded-xl border"
              />
              <input
                placeholder="Name on card"
                value={card.name}
                onChange={e=>setCard({...card, name:e.target.value})}
                className="col-span-2 h-11 px-3 rounded-xl border"
              />
              <input placeholder="MM" value={card.expMonth} onChange={e=>setCard({...card, expMonth:e.target.value})} className="h-11 px-3 rounded-xl border"/>
              <input placeholder="YY" value={card.expYear} onChange={e=>setCard({...card, expYear:e.target.value})} className="h-11 px-3 rounded-xl border"/>
              <button className="col-span-2 h-11 rounded-xl bg-brand-500 text-white font-semibold">Save Card</button>
            </form>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="font-semibold text-xl">Account Balance</div>
            <div className="text-4xl font-extrabold mt-2">${balance.toFixed(2)}</div>

            <form onSubmit={submitFunds} className="mt-3 flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={fundsInput}
                onChange={e=>setFundsInput(e.target.value)}
                placeholder="Amount"
                className="h-10 px-3 rounded-xl border w-32"
              />
              <button className="h-10 px-4 rounded-xl border">Add Funds</button>
            </form>
          </div>

          <div className="card p-6">
            <div className="font-semibold text-xl">$ This Month</div>
            <div className="mt-3 space-y-1 text-sm text-gray-700">
              <div>Total Spent: <span className="font-semibold">${monthStats.totalSpent.toFixed(2)}</span></div>
              <div>Moves Completed: <span className="font-semibold">{monthStats.moves}</span></div>
              <div>Avg. per Move: <span className="font-semibold">${monthStats.avg.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 mt-6">
        <div className="font-semibold text-xl mb-4">Transaction History</div>

        {txns.length === 0 && <div className="text-sm text-gray-600">No transactions yet.</div>}

        <div className="space-y-3">
          {txns.map(t => (
            <div key={t.id} className="flex items-center justify-between border rounded-xl px-4 py-3">
              <div>
                <div className="font-medium">{t.label}</div>
                <div className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()}</div>
              </div>
              <div className={(t.amount >= 0 ? 'text-emerald-600' : 'text-red-600') + ' font-semibold'}>
                {t.amount >= 0 ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
