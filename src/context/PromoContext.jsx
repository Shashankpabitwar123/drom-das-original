import React, { createContext, useContext, useMemo, useState } from 'react'

const PromoContext = createContext(null)
const STORAGE_KEY = 'dd_promo'

const CATALOG = {
  NEWSTUDENT25: { kind: 'percent', value: 0.25, min: 50 },
  MIDTERM20:    { kind: 'fixed',   value: 20,    min: 100 },
  WEEKEND15:    { kind: 'percent', value: 0.15,  min: 75 },
}

function normalize(code) {
  return String(code || '').trim().toUpperCase()
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function PromoProvider({ children }) {
  const [promo, setPromo] = useState(load)

  function applyPromo(code) {
    const c = normalize(code)
    const item = CATALOG[c]
    if (!item) return { ok: false, message: 'Invalid promo code' }
    const record = { code: c, ...item, appliedAt: Date.now() }
    setPromo(record)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
    return { ok: true, promo: record }
  }

  function clearPromo() {
    setPromo(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  function computeDiscount(amount) {
    if (!promo) return 0
    if (amount < promo.min) return 0
    const d = promo.kind === 'percent' ? amount * promo.value : promo.value
    return Math.min(amount, Math.max(0, Number(d || 0)))
  }

  const value = useMemo(() => ({
    promo, applyPromo, clearPromo, computeDiscount, catalog: CATALOG
  }), [promo])

  return <PromoContext.Provider value={value}>{children}</PromoContext.Provider>
}

export function usePromo() {
  return useContext(PromoContext)
}
