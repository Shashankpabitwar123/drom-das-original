import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooking } from '../context/BookingContext'
import { useWallet } from '../context/WalletContext'
import { usePromo } from '../context/PromoContext'

const HIST = 'dd_chat_history'
const SAVED = 'dd_saved_places'

export default function Chatbot({ open, onClose }) {
  const nav = useNavigate()

  const {
    estimate, pickup, dropoff,
    setPickup, setDropoff,
    vehicle, setVehicle,
    helpersCount, setHelpersCount,
    suppliesCart, addSupply, removeSupply, clearSupplies,
    suppliesPrice,
  } = useBooking()

  const wallet = safe(() => useWallet())
  const promo  = safe(() => usePromo())

  const [input, setInput] = React.useState('')
  const [messages, setMessages] = React.useState(() => load(HIST, []))
  const [pendingIdx, setPendingIdx] = React.useState(null)

  React.useEffect(() => save(HIST, messages), [messages])

  React.useEffect(() => {
    if (open && messages.length === 0) {
      say('bot',
        "Hi! I'm your DormDash AI assistant. I can help you with:\n" +
        "• Planning your move and estimating costs\n" +
        "• Choosing the right vehicle size\n" +
        "• Creating packing checklists\n" +
        "• Understanding pricing and policies\n" +
        "• Scheduling and rescheduling moves\n\n" +
        "What would you like help with today?"
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function say(role, text) {
    setMessages(m => [...m, { id: rid(), role, text, at: Date.now() }])
  }

  function handleQuick(template) {
    // NOTE: type="button" on the buttons below prevents accidental form submit
    say('user', template)
    handleIntent(template)
  }

  function send(e) {
    e?.preventDefault?.()
    const q = (typeof e === 'string' ? e : input).trim()
    if (!q) return
    say('user', q)
    setInput('')
    handleIntent(q)
  }

  function handleIntent(q) {
    const text = q.toLowerCase().trim()
    let m

    // === follow-up after "#1"
    if (pendingIdx !== null && /(pickup|dropoff)/.test(text)) {
      const which = /pickup/.test(text) ? 'pickup' : 'dropoff'
      const places = load(SAVED, [])
      const item = places[pendingIdx]
      if (!item) { say('bot','I couldn’t find that saved place anymore.'); setPendingIdx(null); return }
      which==='pickup' ? setPickup(item.address) : setDropoff(item.address)
      say('bot', `Okay, set **${which}** to: ${item.address}`)
      setPendingIdx(null)
      return
    }

    // === promos
    if ((m = text.match(/(apply|use)\s+(promo|code)\s+([a-z0-9\-]+)/i)) && promo) {
      const res = promo.applyPromo(m[3].toUpperCase())
      say('bot', res.ok
        ? `Applied **${res.promo.code}**. Instant discount: $${promo.computeDiscount(estimate).toFixed(2)}.`
        : res.message)
      return
    }
    if ((/promo|discount/.test(text)) && (/what|available|list|show/.test(text))) {
      if (!promo) { say('bot','Promos are unavailable.'); return }
      const lines = Object.entries(promo.catalog).map(([k,v]) =>
        `• ${k}: ${v.kind==='percent' ? `${Math.round(v.value*100)}%` : `$${v.value}`} (min $${v.min})`)
      say('bot', `Active offers:\n${lines.join('\n')}`)
      return
    }

    // === estimate
    if (/estimate|cost|how much|price/.test(text)) {
      const d = promo ? promo.computeDiscount(estimate) : 0
      const due = Math.max(0, estimate - d)
      say('bot', `Estimated total: **$${estimate.toFixed(2)}**${d>0?` − $${d.toFixed(2)} promo = **$${due.toFixed(2)}**`:''}.\n` +
        `Vehicle: ${vehicle}. Helpers: ${helpersCount}. Supplies: $${suppliesPrice.toFixed(2)}.`)
      return
    }

    // === vehicle size guidance
    if (/what size truck|which vehicle|vehicle size/.test(text)) {
      say('bot',
        "Rule of thumb:\n" +
        "• Dorm room / studio → Pickup Truck\n" +
        "• 1-bedroom with furniture → Van or Semi-light\n" +
        "• Larger than that → Semi-light\n" +
        "Tell me: **set vehicle pickup truck**, **set vehicle van**, or **set vehicle semi-light**."
      )
      return
    }

    // === packing checklist
    if (/packing checklist|create a packing checklist|checklist/.test(text)) {
      say('bot',
        "Starter checklist:\n" +
        "• Small/Medium/Large boxes\n" +
        "• Packing tape, bubble wrap\n" +
        "• Mattress bag (if moving a mattress)\n" +
        "• Furniture pads or blankets\n" +
        "• Labels & marker\n" +
        "Say things like **add 3 boxes**, **add 2 tape**, or **clear supplies**."
      )
      return
    }

    // === helpers
    if ((m = text.match(/set\s+helpers?\s+to\s+(\d+)/))) {
      const n = clamp(parseInt(m[1],10), 0, 10)
      setHelpersCount(n); say('bot', `Set helpers to **${n}**.`); return
    }
    if ((m = text.match(/(add|increase)\s+helpers?\s*(by)?\s*(\d+)/))) {
      const n = clamp(helpersCount + parseInt(m[3],10), 0, 10)
      setHelpersCount(n); say('bot', `Increased helpers to **${n}**.`); return
    }
    if ((m = text.match(/(remove|decrease|reduce)\s+helpers?\s*(by)?\s*(\d+)/))) {
      const n = clamp(helpersCount - parseInt(m[3],10), 0, 10)
      setHelpersCount(n); say('bot', `Decreased helpers to **${n}**.`); return
    }

    // === supplies
    if ((m = text.match(/\b(clear|reset)\s+(supplies|cart)\b/))) {
      clearSupplies(); say('bot','Cleared supplies.'); return
    }
    if ((m = text.match(/\b(add|remove)\s+(\d+)?\s*(boxes?|small box|medium box|large box|tape|packing tape|desk|mattress|sofa|tv|dresser)\b/))) {
      const action = m[1]; const qty = parseInt(m[2]||'1',10)
      const item = normalizeItem(m[3])
      if (!item) { say('bot','I didn’t recognize that supply.'); return }
      action === 'add' ? addSupply(item, qty) : removeSupply(item, qty)
      say('bot', `${action==='add'?'Added':'Removed'} **${qty} ${item}**.`)
      return
    }

    // === vehicle set
    if ((m = text.match(/set\s+vehicle\s+(pickup\s*truck|semi(\s*-\s*|[\s])?light|van)/))) {
      const canonical = normalizeVehicle(m[1])
      setVehicle(canonical.includes('(') ? canonical : `${canonical} ($89)`)
      say('bot', `Vehicle set to **${canonical}**.`)
      return
    }

    // === wallet
    if ((m = text.match(/\badd\s+funds?\s+\$?(\d+(\.\d{1,2})?)\b/)) && wallet) {
      const amt = parseFloat(m[1]); wallet.addFunds(amt)
      say('bot', `Added $${amt.toFixed(2)}. New balance: $${wallet.balance.toFixed(2)}.`); return
    }
    if (/wallet|balance/.test(text) && wallet) {
      say('bot', `Wallet balance: $${wallet.balance.toFixed(2)}. Saved cards: ${wallet.cards.length}.`)
      return
    }

    // === saved places
    if (/saved places|addresses/.test(text)) {
      const places = load(SAVED, [])
      if (!places.length) { say('bot','No saved places yet. Add them in Profile → Saved Places.'); return }
      const lines = places.map((p,i)=> `${i+1}. ${p.label} — ${p.address}`)
      say('bot', `Your saved places:\n${lines.join('\n')}\nSay: **use #1 for pickup** or just type **#1**.`)
      return
    }
    if ((m = text.match(/^#?(\d+)$/))) {
      const idx = +m[1]-1; const places = load(SAVED, [])
      if (!places[idx]) { say('bot','That number doesn’t match a saved place.'); return }
      setPendingIdx(idx); say('bot','Use this for **pickup** or **dropoff**?'); return
    }
    if ((m = text.match(/\buse\s*#?(\d+)\s*for\s*(pickup|dropoff)\b/))) {
      const idx = +m[1]-1; const which = m[2]
      const places = load(SAVED, []); const item = places[idx]
      if (!item) { say('bot','Couldn’t find that saved place.'); return }
      which==='pickup' ? setPickup(item.address) : setDropoff(item.address)
      say('bot', `Okay, set **${which}** to: ${item.address}`); return
    }

    // === bookings (list/cancel/complete)
    if (/my bookings|show bookings|history/.test(text)) {
      const list = load('dd_bookings_v1', []).slice(0,5)
      if (!list.length) { say('bot','No bookings yet.'); return }
      const lines = list.map(b => `• #${b.id.slice(0,6)} ${b.status} — ${b.pickupLabel} → ${b.dropoffLabel} ($${b.total.toFixed(0)})`)
      say('bot', `Recent bookings:\n${lines.join('\n')}\nSay: **cancel #id** or **complete #id**.`)
      return
    }
    if ((m = text.match(/\b(cancel|complete)\s*#?([a-z0-9]{4,})\b/i))) {
      const action = m[1].toLowerCase(), idFrag = m[2].toLowerCase()
      const list = load('dd_bookings_v1', []); let hit = null
      const next = list.map(b => {
        if (!hit && b.id.toLowerCase().includes(idFrag)) { hit=b; return {...b, status: action==='cancel'?'cancelled':'completed'} }
        return b
      })
      if (!hit) { say('bot','Could not find that booking id.'); return }
      save('dd_bookings_v1', next, 'dd:bookings:update')
      say('bot', `Booking #${hit.id.slice(0,6)} marked **${action==='cancel'?'cancelled':'completed'}**.`); return
    }

    // === book move (charge + go to confirmation)
    if (/^book(\s+my)?\s*(move|booking)?/.test(text)) {
      const d = promo ? promo.computeDiscount(estimate) : 0
      const total = Math.max(0, estimate - d)

      let fundsReq = 0
      const fm = text.match(/(?:use|with)\s+\$?(\d+(\.\d{1,2})?)\s+(?:from\s+)?(wallet|funds)/)
      if (fm) fundsReq = parseFloat(fm[1] || '0')

      let last4 = null
      const cm = text.match(/card\s*(ending\s*)?(\d{4})/)
      if (cm) last4 = cm[2]

      if (wallet) {
        const card = last4
          ? wallet.cards.find(c => c.last4 === last4)
          : wallet.cards.find(c => c.isDefault) || wallet.cards[0]
        const useFunds = Math.min(total, wallet.balance, fundsReq || 0)
        try {
          wallet.pay(total, {
            funds: useFunds,
            cardId: card?.id,
            label: `Move: ${pickup || 'Pickup'} → ${dropoff || 'Dropoff'}${promo?.promo?.code || promo?.code ? ` (${(promo.promo?.code||promo.code)})` : ''}`
          })
          say('bot', `Booked! Charged $${(total - useFunds).toFixed(2)}${card ? ` to card ••••${card.last4}` : ''}${useFunds>0 ? ` and $${useFunds.toFixed(2)} from wallet` : ''}.`)
          nav('/confirmation')
        } catch (err) {
          say('bot', err?.message || 'Could not complete payment. Check cards/funds.')
          nav('/payment')
        }
      } else {
        say('bot','Taking you to payment to complete the booking.')
        nav('/payment')
      }
      return
    }

    // === FAQs
    if (/hours|open|closing/.test(text)) { say('bot','DormDash operates 7am–9pm daily.'); return }
    if (/reschedul(e|ing)|change.*(move|book)/.test(text)) { say('bot','Reschedule from Bookings → select your move → Reschedule.'); return }
    if (/cancel.*policy/.test(text)) { say('bot','You can cancel from Bookings; fees may apply close to move time.'); return }

    // === fallback
    say('bot',
      "I can help with estimates, vehicle size, supplies, helpers, promos, wallet funds, saved places, and bookings.\n" +
      "Try a quick button above or say: **apply promo NEWSTUDENT25**, **add 3 boxes**, **set helpers to 2**, **set vehicle pickup truck**, **book move**."
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true">
      {/* backdrop closes */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* panel */}
      <div className="absolute inset-0 grid place-items-end md:place-items-center p-4">
        <div
          className="bg-white w-full md:max-w-2xl h-[82vh] rounded-2xl shadow-xl flex flex-col pointer-events-auto"
          onClick={(e)=>e.stopPropagation()}
        >
          {/* header with close (×) */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="font-semibold">DormDash AI</div>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-lg hover:bg-gray-100 text-2xl leading-none"
              aria-label="Close chat"
              title="Close"
            >
              ×
            </button>
          </div>

          {/* Greeting panel with quick suggestions (shows when thread small) */}
          {messages.length <= 2 && (
            <div className="px-4 pt-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <div>Hi! I'm your DormDash AI assistant. I can help you with:</div>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Planning your move and estimating costs</li>
                  <li>Choosing the right vehicle size</li>
                  <li>Creating packing checklists</li>
                  <li>Understanding pricing and policies</li>
                  <li>Scheduling and rescheduling moves</li>
                </ul>
                <div className="mt-3">What would you like help with today?</div>
              </div>

              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  onClick={()=>handleQuick('estimate cost for a dorm room move')}
                  className="h-11 px-4 rounded-xl border text-left hover:bg-gray-100"
                >
                  Estimate cost for a dorm room move
                </button>
                <button
                  type="button"
                  onClick={()=>handleQuick('what size truck do i need?')}
                  className="h-11 px-4 rounded-xl border text-left hover:bg-gray-100"
                >
                  What size truck do I need?
                </button>
                <button
                  type="button"
                  onClick={()=>handleQuick('create a packing checklist')}
                  className="h-11 px-4 rounded-xl border text-left hover:bg-gray-100"
                >
                  Create a packing checklist
                </button>
              </div>
            </div>
          )}

          {/* Thread */}
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {messages.map(m => (
              <div key={m.id} className={m.role==='user' ? 'text-right' : 'text-left'}>
                <div className={`${m.role==='user'?'bg-brand-500 text-white':'bg-gray-100'} inline-block px-3 py-2 rounded-2xl`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Composer */}
          <form onSubmit={send} className="p-3 border-t flex gap-2">
            <input
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault(); send()
                }
              }}
              placeholder="Ask me anything about moving, pricing, or logistics..."
              className="flex-1 h-11 px-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              aria-label="Message"
            />
            <button
              type="submit"
              onClick={send}
              disabled={!input.trim()}
              className="h-11 px-4 rounded-xl bg-brand-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              Send
            </button>
          </form>

          <div className="px-4 pb-3 text-xs text-gray-500">
            AI can make mistakes. Double-check pricing and policies for your specific move.
          </div>
        </div>
      </div>
    </div>
  )
}

/* helpers */
function rid(){ return Math.random().toString(36).slice(2) }
function clamp(n, lo, hi){ return Math.max(lo, Math.min(hi, n)) }
function load(k, f){ try { return JSON.parse(localStorage.getItem(k)) ?? f } catch { return f } }
function save(k, v, ev){ localStorage.setItem(k, JSON.stringify(v)); if (ev) window.dispatchEvent(new CustomEvent(ev)) }
function safe(fn){ try { return fn() } catch { return null } }
function normalizeItem(term){
  const t = term.toLowerCase()
  if (/small box/.test(t)) return 'Small Box'
  if (/medium box/.test(t)) return 'Medium Box'
  if (/large box/.test(t)) return 'Large Box'
  if (/tape/.test(t)) return 'Packing Tape'
  if (/box/.test(t)) return 'Small Box'
  if (/desk/.test(t)) return 'Desk'
  if (/mattress/.test(t)) return 'Mattress'
  if (/sofa|couch/.test(t)) return 'Sofa'
  if (/tv/.test(t)) return 'TV'
  if (/dresser/.test(t)) return 'Dresser'
  return null
}
function normalizeVehicle(s){
  const t = s.toLowerCase().replace(/[\s\-]+/g,'')
  if (t.includes('pickup')) return 'Pickup Truck'
  if (t.includes('semilight') || t.includes('semi')) return 'Semi-light'
  if (t.includes('van')) return 'Van'
  return 'Pickup Truck'
}
