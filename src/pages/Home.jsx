import React, { useState } from 'react'
import { Calendar, Package, Gift, MapPin, Clock, Truck, MessageSquare } from 'lucide-react'
import SuppliesModal from '../components/SuppliesModal'
import { useBooking } from '../context/BookingContext'
import { useNavigate } from 'react-router-dom'
import AddressAutocomplete from "../components/AddressAutocomplete";
import RecentBookings from '../components/RecentBookings'
import SavedPlacesModal from '../components/SavedPlacesModal'

export default function Home() {
  const nav = useNavigate()
  const {
    pickup, setPickup,
    dropoff, setDropoff,
    vehicle, setVehicle,
    helpers, setHelpers,
    quickItems, setQuickItems,
    suppliesCart, estimate, suppliesPrice,

    // NEW:
    pickupCoords, setPickupCoords,
    dropoffCoords, setDropoffCoords,
    distanceKm
  } = useBooking()

  console.log("VITE_RADAR_KEY loaded?", !!import.meta.env.VITE_RADAR_KEY)

  const vehicles = [
    'Pickup Truck ($89)',
    'Small Box Truck ($120)',
    'Large Box Truck ($180)',
    'Semi-light ($250)',
  ]
  const helperOptions = ['No helpers', '1 helper (+$40)', '2 helpers (+$80)', '3 helpers (+$120)']

  const [showSupplies, setShowSupplies] = useState(false)
  const [savedOpen, setSavedOpen] = React.useState(false)

  function addQuickItem(name) {
    setQuickItems(prev => ({ ...prev, [name]: (prev[name] || 0) + 1 }))
  }
  function removeOneQuickItem(name) {
    setQuickItems(prev => {
      const qty = (prev[name] || 0) - 1
      if (qty > 0) return { ...prev, [name]: qty }
      const { [name]: _, ...rest } = prev
      return rest
    })
  }
  function removeAllOfQuickItem(name) {
    setQuickItems(prev => {
      const { [name]: _, ...rest } = prev
      return rest
    })
  }
  function clearAllQuickItems() {
    setQuickItems({})
  }

  const selectedItemsList = Object.entries(quickItems)
  const cartCount = Object.values(suppliesCart).reduce((a, b) => a + b, 0)

  React.useEffect(() => {
    window.dd_pickupLabel = pickup || (pickupCoords ? `${pickupCoords.lat.toFixed(4)}, ${pickupCoords.lng.toFixed(4)}` : '')
  }, [pickup, pickupCoords])

  React.useEffect(() => {
    window.dd_dropoffLabel = dropoff || (dropoffCoords ? `${dropoffCoords.lat.toFixed(4)}, ${dropoffCoords.lng.toFixed(4)}` : '')
  }, [dropoff, dropoffCoords])

  React.useEffect(() => {
    const handler = (e) => {
      const d = e.detail || {}
      if (d.which === 'pickup' && d.address) setPickup(d.address)
      if (d.which === 'dropoff' && d.address) setDropoff(d.address)
    }
    window.addEventListener('dd:applyAddress', handler)
    return () => window.removeEventListener('dd:applyAddress', handler)
  }, [])

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Welcome back, {localStorage.getItem('dormdash_username') || 'Guest'}!
        </h1>
        {suppliesPrice > 0 && (
          <div className="ml-auto">
            <div className="px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
              Cart: ${suppliesPrice.toFixed(2)}
            </div>
          </div>
        )}
      </div>
      <p className="muted mt-2">Ready for your next move? Let’s get you sorted.</p>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        {/* Left: Book your move */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="section-title">
              <Truck className="text-brand-600" />
              <span>Book Your Move</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              {/* Pickup */}
              <AddressAutocomplete
                label="Pick-up Location"
                value={pickup}
                onChange={setPickup}
                onSelect={(sel) => {
                  setPickup(sel.formattedAddress)
                  if (sel && typeof sel.latitude === "number" && typeof sel.longitude === "number") {
                    setPickupCoords({ lat: sel.latitude, lng: sel.longitude })
                  }
                }}
              />

              {/* Dropoff */}
              <AddressAutocomplete
                label="Drop-off Location"
                value={dropoff}
                onChange={setDropoff}
                onSelect={(sel) => {
                  setDropoff(sel.formattedAddress)
                  if (sel && typeof sel.latitude === "number" && typeof sel.longitude === "number") {
                    setDropoffCoords({ lat: sel.latitude, lng: sel.longitude })
                  }
                }}
              />
            </div>

            {distanceKm != null && (
              <p className="muted mt-2">Distance: {distanceKm.toFixed(2)} km</p>
            )}

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              {/* When */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">When</label>
                <div className="relative">
                  <input type="datetime-local" className="w-full h-12 rounded-xl border border-gray-200 px-4 pr-10" />
                  <Clock className="absolute right-3 top-3.5 text-gray-400" size={20} />
                </div>
              </div>
              {/* Vehicle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
                <select value={vehicle} onChange={e => setVehicle(e.target.value)} className="w-full h-12 rounded-xl border border-gray-200 px-4">
                  {vehicles.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              {/* Helpers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Helpers</label>
                <select value={helpers} onChange={e => setHelpers(e.target.value)} className="w-full h-12 rounded-xl border border-gray-200 px-4">
                  {helperOptions.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>

            {/* Quick add items */}
            <div className="mt-6">
              <div className="text-sm font-medium text-gray-800 mb-2">Quick Add Items</div>
              <div className="flex flex-wrap gap-2">
                {['Boxes', 'Desk', 'Mattress', 'Sofa', 'TV', 'Dresser'].map((x) => (
                  <button key={x} onClick={() => addQuickItem(x)} className="chip">+ {x}</button>
                ))}
              </div>

              {selectedItemsList.length > 0 && (
                <div className="mt-4 card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">Selected Items</div>
                    <button
                      type="button"
                      onClick={clearAllQuickItems}
                      className="text-sm underline text-red-600"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {selectedItemsList.map(([name, q]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between rounded-xl border px-3 py-2 gap-3"
                      >
                        <div className="font-medium">{name}</div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`decrease ${name}`}
                            onClick={() => removeOneQuickItem(name)}
                            className="h-8 w-8 rounded-lg border"
                          >
                            –
                          </button>

                          <div className="w-6 text-center">x{q}</div>

                          <button
                            type="button"
                            aria-label={`increase ${name}`}
                            onClick={() => addQuickItem(name)}
                            className="h-8 w-8 rounded-lg border"
                          >
                            +
                          </button>

                          <button
                            type="button"
                            aria-label={`remove ${name}`}
                            onClick={() => removeAllOfQuickItem(name)}
                            className="ml-2 h-8 px-2 rounded-lg border text-xs text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Estimated price */}
            <div className="mt-6 card bg-gray-50 border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="muted text-sm">Estimated Price</div>
                  <div className="text-3xl font-extrabold mt-1">${estimate.toFixed(2)}</div>
                </div>
                <div className="text-sm text-gray-600">Vehicle + Helpers + Supplies<br /><span className="text-xs">Final price may vary</span></div>
              </div>
            </div>

            <div className="mt-4">
              <button onClick={() => nav('/payment')} className="brand-btn">Continue to Payment</button>
            </div>
          </div>

          <div className="mt-6">
            <RecentBookings />
          </div>

        </div>

        {/* Right: Quick actions + Ask AI */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => alert('Schedule later stub')} className="qa-tile border-brand-100 bg-brand-50 text-left">
                <div className="flex items-center gap-2 text-brand-700 font-semibold"><Calendar size={18} /> Schedule Later</div>
                <div className="muted text-sm mt-1">Plan your move for later</div>
              </button>

              <button onClick={() => setShowSupplies(true)} className="qa-tile border-green-100 bg-green-50 text-left relative">
                <div className="flex items-center gap-2 text-green-700 font-semibold"><Package size={18} /> Packing Supplies</div>
                <div className="muted text-sm mt-1">Order boxes & tape</div>
                {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">{cartCount}</span>}
              </button>

              {/* Student Offers now navigates */}
              <button onClick={() => nav('/offers')} className="qa-tile border-purple-100 bg-purple-50 text-left">
                <div className="flex items-center gap-2 text-purple-700 font-semibold"><Gift size={18} /> Student Offers</div>
                <div className="muted text-sm mt-1">View campus deals</div>
              </button>

              <button
                onClick={() => setSavedOpen(true)}
                className="qa-tile border-amber-100 bg-amber-50 text-left"
              >
                <div className="flex items-center gap-2 text-amber-700 font-semibold">
                  <MapPin size={18} /> Saved Places
                </div>
                <div className="muted text-sm mt-1">Quick pickup/dropoff</div>
              </button>
            </div>
          </div>

          {/* Ask AI card opens the GLOBAL chatbot via event */}
          <div className="card p-6">
            <div className="flex items-start gap-3">
              <MessageSquare className="text-brand-600" />
              <div>
                <div className="font-semibold text-lg">Ask DormDash AI</div>
                <p className="muted mt-1">Get instant help with planning, pricing, or packing for your move.</p>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('dd:chat:open'))}
                  className="h-10 px-4 rounded-xl border"
                >
                  Chat with AI
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSupplies && <SuppliesModal onClose={() => setShowSupplies(false)} />}
      <SavedPlacesModal open={savedOpen} onClose={() => setSavedOpen(false)} />
      {/* ✅ Removed local <Chatbot/> — we now use the global one mounted in App.jsx */}
    </main>
  )
}
