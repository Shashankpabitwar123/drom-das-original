import React from 'react'

const KEY = 'dd_saved_places'

export default function SavedPlacesModal({ open, onClose }) {
  const [places, setPlaces] = React.useState([])

  React.useEffect(() => {
    const load = () => {
      try { setPlaces(JSON.parse(localStorage.getItem(KEY)) || []) }
      catch { setPlaces([]) }
    }
    load()
    window.addEventListener('storage', load)
    return () => window.removeEventListener('storage', load)
  }, [])

  function useAddress(which, addr) {
    // Tell Home to apply; it will set the corresponding field.
    window.dispatchEvent(new CustomEvent('dd:applyAddress', { detail: { which, address: addr }}))
    onClose?.()
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl">
          <div className="text-xl font-semibold">Saved Places</div>
          <div className="mt-4 space-y-3">
            {places.length === 0 && <div className="text-sm text-gray-600">No saved places yet. Add some in Profile & Verification.</div>}
            {places.map(p => (
              <div key={p.id} className="border rounded-xl p-4">
                <div className="font-semibold">{p.label}</div>
                <div className="text-sm text-gray-600">{p.address}</div>
                <div className="mt-3 flex gap-2">
                  <button onClick={()=>useAddress('pickup', p.address)} className="h-10 px-4 rounded-xl border">Use for Pickup</button>
                  <button onClick={()=>useAddress('dropoff', p.address)} className="h-10 px-4 rounded-xl border">Use for Dropoff</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-end">
            <button onClick={onClose} className="h-10 px-4 rounded-xl border">Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
