import React from 'react'
import { Calendar, Package, School, MapPin, MessageSquare } from 'lucide-react'

export default function QuickActions({
  onScheduleLaterClick = () => {},
  onSuppliesClick = () => {},
  onStudentOffersClick = () => {},
  onSavedPlacesClick = () => {},
  onChatClick = () => {}, // ⬅️ NEW
}) {
  return (
    <div className="card p-6">
      <div className="text-2xl font-extrabold mb-4">Quick Actions</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={onScheduleLaterClick} className="qa-tile bg-indigo-50 border-indigo-100 text-left">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold"><Calendar size={18}/> Schedule Later</div>
          <div className="muted text-sm mt-1">Plan your move for later</div>
        </button>

        <button onClick={onSuppliesClick} className="qa-tile bg-emerald-50 border-emerald-100 text-left">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold"><Package size={18}/> Packing Supplies</div>
          <div className="muted text-sm mt-1">Order boxes &amp; tape</div>
        </button>

        <button onClick={onStudentOffersClick} className="qa-tile bg-purple-50 border-purple-100 text-left">
          <div className="flex items-center gap-2 text-purple-700 font-semibold"><School size={18}/> Student Offers</div>
          <div className="muted text-sm mt-1">View campus deals</div>
        </button>

        <button onClick={onSavedPlacesClick} className="qa-tile bg-amber-50 border-amber-100 text-left">
          <div className="flex items-center gap-2 text-amber-700 font-semibold"><MapPin size={18}/> Saved Places</div>
          <div className="muted text-sm mt-1">Quick pickup/dropoff</div>
        </button>
      </div>

      {/* Talk with AI — always visible */}
      <div className="mt-6">
        <button
          onClick={onChatClick}
          className="h-11 px-4 rounded-xl border flex items-center gap-2"
        >
          <MessageSquare size={18} className="text-brand-600" />
          <span>Talk with AI</span>
        </button>
      </div>
    </div>
  )
}
