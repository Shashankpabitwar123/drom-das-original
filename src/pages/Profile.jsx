import React from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, updateProfile } from '../lib/auth'

const SAVED_PLACES_KEY = 'dd_saved_places'
const AVATAR_KEY = 'dd_avatar'                 // keep avatar separate (per your current design)
const EM_NAME_KEY = 'dd_em_name'
const EM_PHONE_KEY = 'dd_em_phone'
const STU_VERIFIED_KEY = 'dd_student_verified'
const UNI_NAME_KEY = 'dd_uni_name'
const GRAD_DATE_KEY = 'dd_grad_date'
const UNI_EMAIL_KEY = 'dd_uni_email'

export default function Profile() {
  const nav = useNavigate()

  // identity (now hydrated from the auth store)
  const [fullName, setFullName] = React.useState('')
  const [email, setEmail]       = React.useState('')    // read-only in UI
  const [phone, setPhone]       = React.useState('')
  const [avatar, setAvatar]     = React.useState(localStorage.getItem(AVATAR_KEY) || '')

  // emergency
  const [emergencyName, setEmergencyName]   = React.useState(localStorage.getItem(EM_NAME_KEY) || '')
  const [emergencyPhone, setEmergencyPhone] = React.useState(localStorage.getItem(EM_PHONE_KEY) || '')

  // student verification
  const [verified, setVerified] = React.useState(localStorage.getItem(STU_VERIFIED_KEY) === '1')
  const [verifyOpen, setVerifyOpen] = React.useState(false)
  const [uniName, setUniName]   = React.useState(localStorage.getItem(UNI_NAME_KEY) || '')
  const [gradDate, setGradDate] = React.useState(localStorage.getItem(GRAD_DATE_KEY) || '')
  const [uniEmail, setUniEmail] = React.useState(localStorage.getItem(UNI_EMAIL_KEY) || '')

  // saved places
  const [places, setPlaces] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(SAVED_PLACES_KEY)) || [] } catch { return [] }
  })
  const [newLabel, setNewLabel]     = React.useState('')
  const [newAddress, setNewAddress] = React.useState('')

  const fileRef = React.useRef(null)

  // ---- hydrate from the logged-in user (auth store) ----
  useEffect(() => {
    const u = getProfile()
    if (!u) {
      // not logged in → bounce to /auth
      nav('/auth', { replace: true })
      return
    }
    setFullName(u.fullName || '')
    setPhone(u.phone || '')
    setEmail(u.email || '')
  }, [nav])

  // avatar upload
  function openFilePicker() { fileRef.current?.click() }
  function onFileChange(e) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      setAvatar(dataUrl)
      localStorage.setItem(AVATAR_KEY, dataUrl)
    }
    reader.readAsDataURL(file)
  }

  // persist changes
  function saveChanges() {
    try {
      // keep profile fields in auth store so login/other pages stay in sync
      updateProfile({ fullName: fullName.trim(), phone: phone.trim() })
      // persist the rest locally (per your current design)
      localStorage.setItem(EM_NAME_KEY, emergencyName.trim())
      localStorage.setItem(EM_PHONE_KEY, emergencyPhone.trim())
      localStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(places.slice(0, 4)))
      alert('Changes saved ✅')
    } catch (err) {
      alert(err?.message || 'Failed to save profile')
    }
  }

  // saved places
  function addPlace(e) {
    e?.preventDefault()
    if (!newLabel.trim() || !newAddress.trim()) return
    if (places.length >= 4) { alert('You can save at most 4 addresses.'); return }
    const p = { id: 'p_' + Math.random().toString(36).slice(2), label: newLabel.trim(), address: newAddress.trim() }
    setPlaces([p, ...places])
    setNewLabel(''); setNewAddress('')
  }
  function removePlace(id) { setPlaces(places.filter(p => p.id !== id)) }

  // student verification
  function completeVerification(e) {
    e.preventDefault()
    if (!uniName || !gradDate || !uniEmail) { alert('Please fill university, graduation date, and university email'); return }
    setVerified(true)
    localStorage.setItem(STU_VERIFIED_KEY, '1')
    localStorage.setItem(UNI_NAME_KEY, uniName)
    localStorage.setItem(GRAD_DATE_KEY, gradDate)
    localStorage.setItem(UNI_EMAIL_KEY, uniEmail)
    setVerifyOpen(false)
  }

  const initials = (fullName || email || 'U').trim().charAt(0).toUpperCase()

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold">Profile & Verification</h1>
      <p className="muted mt-2">Manage your account details and verify your student status for exclusive benefits.</p>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* Profile */}
        <div className="card p-6 flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gray-100 grid place-items-center text-3xl font-bold overflow-hidden">
            {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover"/> : initials}
          </div>
          <div className="mt-4 font-semibold">{fullName || 'Your name'}</div>
          <div className="text-gray-500">{email || 'you@gmail.com'}</div>
          <button onClick={openFilePicker} className="mt-3 h-10 px-4 rounded-xl border">Upload photo</button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange}/>
        </div>

        {/* Personal info */}
        <div className="card p-6">
          <div className="font-semibold text-xl">Personal Information</div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <input
              value={fullName}
              onChange={e=>setFullName(e.target.value)}
              placeholder="Full name"
              className="h-11 px-3 rounded-xl border"
            />
            <input
              value={phone}
              onChange={e=>setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="h-11 px-3 rounded-xl border"
            />
          </div>
          {/* Email as read-only from auth */}
          <div className="grid grid-cols-1 gap-3 mt-3">
            <input
              value={email}
              readOnly
              className="h-11 px-3 rounded-xl border bg-gray-50"
              placeholder="Email"
              title="Email comes from your account and cannot be edited here"
            />
          </div>
        </div>

        {/* Student verification */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-xl">Student Verification</div>
            {verified && <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">Verified</span>}
          </div>
          {!verified ? (
            <>
              <div className="text-sm text-gray-600 mt-2">Verify your student status to unlock special offers.</div>
              <button onClick={()=>setVerifyOpen(true)} className="mt-3 h-10 px-4 rounded-xl border">Verify now</button>
            </>
          ) : (
            <div className="mt-3 text-sm text-gray-700 space-y-1">
              <div>University: {uniName}</div>
              <div>Graduation: {gradDate}</div>
              <div>University Email: {uniEmail}</div>
            </div>
          )}
        </div>

        {/* Emergency contact */}
        <div className="card p-6">
          <div className="font-semibold text-xl">Emergency Contact</div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <input value={emergencyName} onChange={e=>setEmergencyName(e.target.value)} placeholder="Contact name" className="h-11 px-3 rounded-xl border"/>
            <input value={emergencyPhone} onChange={e=>setEmergencyPhone(e.target.value)} placeholder="(555) 987-6543" className="h-11 px-3 rounded-xl border"/>
          </div>
        </div>

        {/* Saved Places */}
        <div className="md:col-span-2 card p-6">
          <div className="font-semibold text-xl mb-2">Saved Places</div>
          <form onSubmit={addPlace} className="grid md:grid-cols-3 gap-3">
            <input value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="Label (e.g., Dorm A)" className="h-11 px-3 rounded-xl border"/>
            <input value={newAddress} onChange={e=>setNewAddress(e.target.value)} placeholder="Address (e.g., 123 S Rural Rd, Tempe)" className="md:col-span-2 h-11 px-3 rounded-xl border"/>
            <button className="h-11 px-4 rounded-xl bg-brand-500 text-white font-semibold md:col-start-3">Add</button>
          </form>

          <div className="mt-4 grid gap-3">
            {places.length === 0 && <div className="text-sm text-gray-600">No saved places yet (max 4).</div>}
            {places.map(p => (
              <div key={p.id} className="flex items-center justify-between border rounded-xl px-4 py-3">
                <div>
                  <div className="font-semibold">{p.label}</div>
                  <div className="text-sm text-gray-600">{p.address}</div>
                </div>
                <button onClick={()=>removePlace(p.id)} className="h-9 px-3 rounded-xl border">Remove</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={saveChanges} className="h-12 px-5 rounded-xl bg-brand-500 text-white font-semibold">
          Save Changes
        </button>
      </div>

      {verifyOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setVerifyOpen(false)} />
          <div className="absolute inset-0 grid place-items-center p-4">
            <form onSubmit={completeVerification} className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
              <div className="text-xl font-semibold">Verify Student Status</div>
              <div className="grid gap-3 mt-4">
                <input value={uniName} onChange={e=>setUniName(e.target.value)} placeholder="University name" className="h-11 px-3 rounded-xl border"/>
                <input type="month" value={gradDate} onChange={e=>setGradDate(e.target.value)} className="h-11 px-3 rounded-xl border"/>
                <input type="email" value={uniEmail} onChange={e=>setUniEmail(e.target.value)} placeholder="yourname@university.edu" className="h-11 px-3 rounded-xl border"/>
              </div>
              <div className="mt-5 flex gap-3 justify-end">
                <button type="button" onClick={()=>setVerifyOpen(false)} className="h-10 px-4 rounded-xl border">Cancel</button>
                <button type="submit" className="h-10 px-4 rounded-xl bg-brand-500 text-white font-semibold">Verify</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

