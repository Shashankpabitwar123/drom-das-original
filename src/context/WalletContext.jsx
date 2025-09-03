// src/context/WalletContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  getActiveUser,
  getActiveUserId,
  updateActiveUser,
} from '../lib/auth'

const WalletCtx = createContext(null)

export function WalletProvider({ children }) {
  const [activeUserId, setActiveUserId] = useState(getActiveUserId())
  const [balance, setBalance] = useState(0)
  const [cards, setCards] = useState([])   // [{id, brand, last4, expMonth, expYear, isDefault, name}]
  const [txns, setTxns] = useState([])     // [{id, label, amount, date, cardId?}]

  // ---------- helpers to read/write wallet fields on the active user record ----------
  function loadFromUser(u) {
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

  // ---------- initial load + respond to account switches (e.g., login/logout) ----------
  useEffect(() => {
    const u = getActiveUser()
    setActiveUserId(getActiveUserId())

    // Ensure new users start at 0 and have arrays defined
    if (u && (u.wallet == null || u.walletCards == null || u.walletTxns == null)) {
      writeToUser({
        wallet: Number(u.wallet ?? 0),
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

  // ---------- card helpers ----------
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

  function getDefaultCardId() {
    return cards.find(c => c.isDefault)?.id || null
  }

  // ---------- funds / transactions ----------
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

  // If you ever deduct for a booking outside of the payment flow, use this.
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

  /**
   * pay({ funds, amountDue, cardId, label })
   * - funds: number of wallet dollars to use
   * - amountDue: total charge for the order (optional—if provided we’ll compute the card remainder)
   * - cardId: which card to charge (optional; if omitted and remainder > 0, uses default card if available)
   * - label: label for the card transaction (default 'Card charge')
   *
   * Records:
   *   - "Wallet used" negative txn (if funds > 0)
   *   - "Card charge" negative txn for remainder (if any and a card is available)
   *
   * Returns { ok: true, walletUsed, cardCharged, remainder }
   */
  function pay({ funds = 0, amountDue = null, cardId = null, label = 'Card charge' } = {}) {
    const currentBal = Number(balance) || 0
    const requestedWallet = Math.max(0, Number(funds) || 0)
    const walletUsed = Math.min(requestedWallet, currentBal)

    let newBal = currentBal
    let nextTxns = txns

    if (walletUsed > 0) {
      newBal = currentBal - walletUsed
      const walletTxn = {
        id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
        label: 'Wallet used',
        amount: -walletUsed,
        date: Date.now(),
      }
      nextTxns = [walletTxn, ...nextTxns]
      setBalance(newBal)
      setTxns(nextTxns)
      writeToUser({ wallet: newBal, walletTxns: nextTxns })
    }

    // Determine card remainder if amountDue provided; otherwise 0
    const remainder = amountDue != null
      ? Math.max(0, Number(amountDue) - walletUsed)
      : 0

    const chosenCardId = cardId || getDefaultCardId()
    let cardCharged = 0

    if (remainder > 0 && chosenCardId) {
      cardCharged = remainder
      const cardTxn = {
        id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + 1),
        label: label || 'Card charge',
        amount: -cardCharged,
        date: Date.now(),
        cardId: chosenCardId,
      }
      const updated = [cardTxn, ...nextTxns]
      setTxns(updated)
      writeToUser({ wallet: newBal, walletTxns: updated })
    }

    return { ok: true, walletUsed, cardCharged, remainder }
  }

  // ---------- month stats (for your UI box) ----------
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
    addFunds, charge, addCard, setDefaultCard, pay,
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
