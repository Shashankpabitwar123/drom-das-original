// src/context/WalletContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  getActiveUser,
  getActiveUserId,
  updateActiveUser,
  createUser, // not used here, but handy if you import elsewhere
} from '../lib/auth'

const WalletCtx = createContext(null)

export function WalletProvider({ children }) {
  const [activeUserId, setActiveUserId] = useState(getActiveUserId())
  const [balance, setBalance] = useState(0)
  const [cards, setCards] = useState([])   // [{id, brand, last4, expMonth, expYear, isDefault, name}]
  const [txns, setTxns] = useState([])     // [{id, label, amount, date}]

  // ---- helpers to read/write wallet fields on the active user record ----
  function loadFromUser(u) {
    // New accounts may not have wallet fields yet; initialize safely.
    const b = Number(u?.wallet ?? 0)
    const c = Array.isArray(u?.walletCards) ? u.walletCards : []
    const t = Array.isArray(u?.walletTxns) ? u.walletTxns : []
    setBalance(b)
    setCards(c)
    setTxns(t)
  }

  function writeToUser(patch) {
    const updated = updateActiveUser(patch)
    if (updated) loadFromUser(updated)
  }

  // ---- initial load + respond to account switches (e.g., login/logout) ----
  useEffect(() => {
    const u = getActiveUser()
    setActiveUserId(getActiveUserId())

    // Ensure new users start at 0 and have arrays defined
    if (u && (u.wallet == null || u.walletCards == null || u.walletTxns == null)) {
      writeToUser({
        wallet: Number(u.wallet ?? 0),      // default 0
        walletCards: Array.isArray(u.walletCards) ? u.walletCards : [],
        walletTxns: Array.isArray(u.walletTxns) ? u.walletTxns : [],
      })
      return
    }

    loadFromUser(u)
    // Listen to storage changes (another tab) and auth changes
    const onStorage = () => {
      setActiveUserId(getActiveUserId())
      loadFromUser(getActiveUser())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Expose a way to refresh after login/logout if your auth flow doesn’t reload the page
  function refreshFromAuthChange() {
    setActiveUserId(getActiveUserId())
    loadFromUser(getActiveUser())
  }

  // ---- card helpers ----
  function brandFromNumber(num = '') {
    const n = (num || '').replace(/\s+/g, '')
    if (/^4/.test(n)) return 'Visa'
    if (/^5[1-5]/.test(n)) return 'Mastercard'
    if (/^3[47]/.test(n)) return 'Amex'
    if (/^6(?:011|5)/.test(n)) return 'Discover'
    return 'Card'
  }

  function addCard({ number, name, expMonth, expYear }) {
    const id = crypto?.randomUUID ? crypto.randomUUID() : String(Date.now())
    const last4 = (number || '').replace(/\s+/g, '').slice(-4) || '0000'
    const brand = brandFromNumber(number)
    const newCard = {
      id, brand, last4, expMonth, expYear, name,
      isDefault: cards.length === 0, // first card becomes default
    }
    const nextCards = [...cards, newCard]
    setCards(nextCards)
    writeToUser({ walletCards: nextCards })
  }

  function setDefaultCard(id) {
    const next = cards.map(c => ({ ...c, isDefault: c.id === id }))
    setCards(next)
    writeToUser({ walletCards: next })
  }

  // ---- funds / transactions ----
  function addFunds(amount) {
    const amt = Number(amount)
    if (!amt || amt <= 0) return
    const newBal = Number(balance) + amt
    setBalance(newBal)

    const entry = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      label: 'Funds added',
      amount: +amt, // positive
      date: Date.now(),
    }
    const nextTxns = [entry, ...txns]
    setTxns(nextTxns)

    writeToUser({ wallet: newBal, walletTxns: nextTxns })
  }

  // If you ever deduct for a booking, call this:
  function charge(amount, label = 'Move charge') {
    const cost = Math.abs(Number(amount || 0))
    if (!cost) return
    const newBal = Math.max(0, Number(balance) - cost)
    setBalance(newBal)

    const entry = {
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      label,
      amount: -cost, // negative
      date: Date.now(),
    }
    const nextTxns = [entry, ...txns]
    setTxns(nextTxns)

    writeToUser({ wallet: newBal, walletTxns: nextTxns })
  }

  // ---- month stats (for your UI box) ----
  const monthStats = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    const thisMonth = txns.filter(t => {
      const d = new Date(t.date)
      return d.getFullYear() === y && d.getMonth() === m
    })
    const spent = thisMonth
      .filter(t => t.amount < 0)
      .reduce((s, t) => s + Math.abs(t.amount), 0)
    const moves = thisMonth.filter(t => t.amount < 0).length
    const avg = moves ? spent / moves : 0
    return { totalSpent: spent, moves, avg }
  }, [txns])

  const value = {
    // data
    balance, cards, txns, monthStats,
    // actions
    addFunds, charge, addCard, setDefaultCard,
    // util
    refreshFromAuthChange,
  }

  return <WalletCtx.Provider value={value}>{children}</WalletCtx.Provider>
}

export function useWallet() {
  const ctx = useContext(WalletCtx)
  if (!ctx) throw new Error('useWallet must be used inside <WalletProvider>')
  return ctx
}

