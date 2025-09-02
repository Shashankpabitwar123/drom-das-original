import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function ManageAccount() {
  const [open, setOpen] = useState(false) // CLOSED by default
  return (
    <div className="card">
      <button onClick={()=>setOpen(o=>!o)} className="w-full flex items-center justify-between px-5 py-4">
        <div className="font-semibold text-gray-900">Manage Account</div>
        <ChevronDown className={`transition ${open?'rotate-180':''}`} />
      </button>
      {open && (
        <div className="border-t p-5 grid gap-3">
          <button className="h-11 rounded-lg border text-left px-4">Profile</button>
          <button className="h-11 rounded-lg border text-left px-4">Payment Methods</button>
          <button className="h-11 rounded-lg border text-left px-4">Saved Places</button>
          <button className="h-11 rounded-lg border text-left px-4">Help & Support</button>
          <button className="h-11 rounded-lg border text-left px-4 text-red-600">Log out</button>
        </div>
      )}
    </div>
  )
}
