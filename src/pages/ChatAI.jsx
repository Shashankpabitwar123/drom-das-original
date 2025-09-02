import React from 'react'

export default function ChatAI() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="card p-6">
        <div className="font-semibold text-xl">Chat with AI</div>
        <div className="mt-3 rounded-xl bg-gray-50 p-4">
          <p className="text-gray-700">
            Hi! I'm your DormDash AI assistant. I can help you with:
          </p>
          <ul className="list-disc pl-6 mt-2 text-gray-700">
            <li>Planning your move and estimating costs</li>
            <li>Choosing the right vehicle size</li>
            <li>Creating packing checklists</li>
            <li>Understanding pricing and policies</li>
            <li>Scheduling and rescheduling moves</li>
          </ul>
          <p className="text-gray-700 mt-3">What would you like help with today?</p>
        </div>
        <div className="mt-4 grid gap-2">
          <button className="h-11 rounded-xl border px-3 text-left">Estimate cost for a dorm room move</button>
          <button className="h-11 rounded-xl border px-3 text-left">What size truck do I need?</button>
          <button className="h-11 rounded-xl border px-3 text-left">Create a packing checklist</button>
        </div>

        <div className="mt-4 flex gap-2">
          <input className="flex-1 h-12 rounded-xl border px-3" placeholder="Ask me anything about moving, pricing, or logistics..."/>
          <button className="h-12 px-5 rounded-xl bg-brand-500 text-white font-semibold">Send</button>
        </div>
        <p className="text-xs text-gray-500 mt-2">AI can make mistakes. Double‑check pricing and policies for your specific move.</p>
      </div>
    </main>
  )
}
