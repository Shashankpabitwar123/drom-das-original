import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const WalletContext = createContext(null)

const STORAGE = {
  cards: 'dd_cards',
  defaultCard: 'dd_default_card',
  balance: 'dd_balance',
  txns: 'dd_txns',
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent('dd:wallet:update'))
}

function seedCardsIfEmpty(cards) {
  if (cards && cards.length) return cards
  // Seed with demo cards to match the screenshot; remove if you want empty by default.
  return [
    { id:'c_4242', brand:'Visa',       last4:'4242', expMonth:12, expYear:25, name:'Demo Visa', isDefault:true },
    { id:'c_5555', brand:'Mastercard', last4:'5555', expMonth:12, expYear:25, name:'Demo MC',   isDefault:false },
  ]
}

export function WalletProvider({ children }) {
  const [cards, setCards]   = useState(() => seedCardsIfEmpty(loadJSON(STORAGE.cards, [])))
  const [balance, setBalance] = useState(() => {
    const v = localStorage.getItem(STORAGE.balance)
    return v ? parseFloat(v) : 0
  })
  const [txns, setTxns] = useState(() => loadJSON(STORAGE.txns, []))

  useEffect(() => {
    if (!cards.some(c => c.isDefault) && cards.length) {
      const next = cards.map((c,i)=> ({...c, isDefault: i===0}))
      setCards(next)
    }
  }, [])

  useEffect(() => {
    const sync = () => {
      setCards(loadJSON(STORAGE.cards, []))
      setBalance(parseFloat(localStorage.getItem(STORAGE.balance) || '0') || 0)
      setTxns(loadJSON(STORAGE.txns, []))
    }
    window.addEventListener('dd:wallet:update', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('dd:wallet:update', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  function persistCards(next)   { setCards(next);   saveJSON(STORAGE.cards, next) }
  function persistTxns(next)    { setTxns(next);    saveJSON(STORAGE.txns, next) }
  function persistBalance(next) {
    setBalance(next)
    localStorage.setItem(STORAGE.balance, String(next))
    window.dispatchEvent(new CustomEvent('dd:wallet:update'))
  }

  function addCard({ number, expMonth, expYear, name }) {
    const digits = String(number || '').replace(/\D/g, '')
    const last4 = digits.slice(-4) || '0000'
    const brand = digits.startsWith('4') ? 'Visa' : digits.startsWith('5') ? 'Mastercard' : 'Card'
    const id = 'c_' + Math.random().toString(36).slice(2)
    const card = { id, brand, last4, expMonth, expYear, name, isDefault: cards.length===0 }
    persistCards([card, ...cards])
    return card
  }
  function removeCard(id)     { persistCards(cards.filter(c => c.id !== id)) }
  function setDefaultCard(id) { persistCards(cards.map(c => ({...c, isDefault: c.id === id }))) }

  function addFunds(amount) {
    const amt = Math.max(0, parseFloat(amount || 0))
    if (!amt) return
    const next = parseFloat((balance + amt).toFixed(2))
    persistBalance(next)
    const txn = {
      id: 't_' + Math.random().toString(36).slice(2),
      date: Date.now(),
      label: 'Add Funds',
      amount: amt, // positive
      type: 'funds',
    }
    persistTxns([txn, ...txns])
    return next
  }

  // Pay for a booking
  function pay(amount, opts = {}) {
    const total = Math.max(0, parseFloat(amount || 0))
    if (!total) return

    const useFunds = Math.min(Math.max(0, parseFloat(opts.funds || 0)), balance, total)
    const remaining = parseFloat((total - useFunds).toFixed(2))

    if (useFunds) persistBalance(parseFloat((balance - useFunds).toFixed(2)))

    let card = null
    if (remaining > 0) {
      const cardId = opts.cardId || (cards.find(c=>c.isDefault)?.id)
      card = cards.find(c => c.id === cardId) || null
      if (!card) throw new Error('No card selected')
    }

    const txn = {
      id: 't_' + Math.random().toString(36).slice(2),
      date: Date.now(),
      label: opts.label || 'Move booking',
      amount: -total, // negative spend
      type: 'move',
      meta: { useFunds, cardLast4: card?.last4 || null }
    }
    persistTxns([txn, ...txns])

    return { useFunds, chargedOnCard: remaining, txn }
  }

  const monthStats = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear(), m = now.getMonth()
    const inMonth = txns.filter(t => {
      const d = new Date(t.date)
      return d.getFullYear()===y && d.getMonth()===m && t.type==='move'
    })
    const totalSpent = inMonth.reduce((s,t)=> s + Math.abs(Math.min(0, t.amount)), 0)
    const moves = inMonth.length
    const avg = moves ? totalSpent / moves : 0
    return { totalSpent, moves, avg }
  }, [txns])

  const value = {
    cards, balance, txns,
    addCard, removeCard, setDefaultCard,
    addFunds, pay,
    monthStats,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  return useContext(WalletContext)
}
