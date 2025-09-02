import React, { createContext, useContext, useMemo, useState } from 'react'

const BookingContext = createContext(null)

export function BookingProvider({ children }) {
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')

  // UI currently stores vehicle label with price in it, e.g. "Pickup Truck ($89)"
  const [vehicle, setVehicle] = useState('Pickup Truck ($89)')

  // UI stores a label, but the bot may want to set a number: we normalize below
  const [helpers, setHelpers] = useState('No helpers')

  const [quickItems, setQuickItems] = useState({})   // e.g., { Boxes: 2, Desk: 1 }
  const [suppliesCart, setSuppliesCart] = useState({}) // e.g., { 'Small Box': 2 }

  const [pickupCoords, setPickupCoords] = useState(null)   // { lat, lng }
  const [dropoffCoords, setDropoffCoords] = useState(null) // { lat, lng }

  /* ----------------------- Supplies helpers (NEW) ----------------------- */
  const addSupply = React.useCallback((name, qty = 1) => {
    setSuppliesCart(prev => {
      const n = Math.max(0, (prev[name] || 0) + qty)
      const next = { ...prev, [name]: n }
      if (next[name] === 0) delete next[name]
      return next
    })
  }, [])

  const removeSupply = React.useCallback((name, qty = 1) => {
    return addSupply(name, -qty)
  }, [addSupply])

  const clearSupplies = React.useCallback(() => {
    setSuppliesCart({})
  }, [])

  /* ----------------------- Helpers normalization ----------------------- */
  // Numeric count derived from the label or a number if set directly
  const helpersCount = useMemo(() => {
    if (typeof helpers === 'number') return helpers
    const m = String(helpers || '').match(/\d+/)
    return m ? parseInt(m[0], 10) : 0
  }, [helpers])

  // For chatbot: accept a number and convert to the UI label
  const setHelpersCount = React.useCallback((n) => {
    const num = Math.max(0, Math.min(10, parseInt(n || 0, 10)))
    const label = num <= 0 ? 'No helpers' : (num === 1 ? '1 helper' : `${num} helpers`)
    setHelpers(label)
  }, [])

  /* ----------------------- Pricing pieces ----------------------- */
  const vehicleBase = useMemo(() => {
    if (vehicle && vehicle.includes('$')) {
      const m = vehicle.match(/\$(\d+(?:\.\d+)?)/)
      return m ? parseFloat(m[1]) : 0
    }
    return 0
  }, [vehicle])

  const helpersPrice = useMemo(() => {
    // $40 per helper (1 → $40, 2 → $80, 3 → $120, etc.)
    return helpersCount * 40
  }, [helpersCount])

  const suppliesPrice = useMemo(() => {
    const priceMap = {
      'Small Box': 2.5,
      'Medium Box': 3.5,
      'Large Box': 4.5,
      'Packing Tape': 3.0,
    }
    return Object.entries(suppliesCart).reduce((sum, [k, q]) => sum + (priceMap[k] || 0) * q, 0)
  }, [suppliesCart])

  const estimate = useMemo(() => {
    // Quick items currently don’t affect price — can be extended later
    return vehicleBase + helpersPrice + suppliesPrice
  }, [vehicleBase, helpersPrice, suppliesPrice])

  /* ----------------------- Distance calc (unchanged) ----------------------- */
  const distanceKm = useMemo(() => {
    if (!pickupCoords || !dropoffCoords) return null
    const R = 6371 // km
    const toRad = d => (d * Math.PI) / 180
    const dLat = toRad(dropoffCoords.lat - pickupCoords.lat)
    const dLon = toRad(dropoffCoords.lng - pickupCoords.lng)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(pickupCoords.lat)) *
        Math.cos(toRad(dropoffCoords.lat)) *
        Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }, [pickupCoords, dropoffCoords])

  const value = {
    // Locations
    pickup, setPickup,
    dropoff, setDropoff,
    pickupCoords, setPickupCoords,
    dropoffCoords, setDropoffCoords,
    distanceKm,

    // Vehicle
    vehicle, setVehicle,
    vehicleBase,

    // Helpers (label for UI + numeric for logic/bot)
    helpers, setHelpers,          // keep existing API
    helpersCount, setHelpersCount, // numeric API for chatbot or advanced UI
    helpersPrice,

    // Supplies
    suppliesCart, setSuppliesCart,
    addSupply, removeSupply, clearSupplies, // NEW exports
    suppliesPrice,

    // Quick add items (unchanged)
    quickItems, setQuickItems,

    // Totals
    estimate,
  }

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export function useBooking() {
  return useContext(BookingContext)
}

