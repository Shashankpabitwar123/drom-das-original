import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser, loginUser, getActiveUser } from '../lib/auth';

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [role, setRole] = useState('customer') // NEW
  const nav = useNavigate()

  // create-account fields
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  // shared fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      if (mode === 'create') {
        await registerUser({
          name: fullName,
          email,
          password,
          phone,
          role, // NEW: persist chosen role on account
        });
      } else {
        await loginUser({ email, password });
      }

      // where to land?
      const u = getActiveUser()
      if (u?.role === 'driver') nav('/driver')
      else nav('/home')
      // let listeners know (Bookings, Wallet, etc.)
      window.dispatchEvent(new CustomEvent('dd:auth:changed'))
    } catch (err) {
      alert(err?.message || 'Something went wrong')
    }
  }

  return (
    <main className="page max-w-lg">
      <h1 className="page-title">{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>

      <div className="mb-4 flex gap-2">
        <button className={`chip ${mode==='login'?'chip--active':''}`} onClick={()=>setMode('login')}>Login</button>
        <button className={`chip ${mode==='create'?'chip--active':''}`} onClick={()=>setMode('create')}>Create</button>
      </div>

      {mode === 'create' && (
        <div className="mb-4">
          <div className="text-sm font-semibold mb-2">I am signing up as</div>
          <div className="flex gap-2">
            <button type="button" onClick={()=>setRole('customer')} className={`chip ${role==='customer'?'chip--active':''}`}>Customer</button>
            <button type="button" onClick={()=>setRole('driver')} className={`chip ${role==='driver'?'chip--active':''}`}>Driver</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card grid gap-3">
        {mode === 'create' && (
          <>
            <input className="input" placeholder="Full name" value={fullName} onChange={e=>setFullName(e.target.value)} />
            <input className="input" placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} />
          </>
        )}
        <input className="input" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />

        <button className="btn-primary">{mode === 'login' ? 'Login' : 'Create account'}</button>
      </form>
    </main>
  )
}

