import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser, loginUser } from '../lib/auth';


export default function Auth() {
  const [mode, setMode] = useState('login')
  const nav = useNavigate()

  // create-account fields
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  // shared fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const title = mode === 'login' ? 'Log in to DormDash' : 'Create your account'

function handleSubmit(e) {
  e.preventDefault();
  try {
    if (mode === 'create') {
      registerUser({ username, fullName, phone, email, password });
    } else {
      loginUser({ email, password });
    }
    nav('/home');
  } catch (err) {
    alert(err?.message || 'Authentication error');
  }
}


  return (
    <div className="min-h-screen bg-gray-50 grid place-items-center px-4">
      <div className="w-full max-w-xl card p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">{title}</h1>
          <p className="muted mt-2 text-lg">Use the same clean font & colors as home.</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`${mode==='login' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700'} flex-1 h-12 rounded-xl font-semibold`}
          >
            Log in
          </button>
          <button
            onClick={() => setMode('create')}
            className={`${mode==='create' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700'} flex-1 h-12 rounded-xl font-semibold`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'create' && (
            <>
              <input
                required
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-gray-200"
              />
              <input
                required
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-gray-200"
              />
              <input
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-gray-200"
              />
            </>
          )}

          <input
            required
            type="email"
            placeholder="Gmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-gray-200"
          />

          <input
            required
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-gray-200"
          />

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPassword(Math.random().toString(36).slice(-10))}
              className="text-brand-600 font-medium"
            >
              Suggest strong password
            </button>
          </div>

          <button type="submit" className="brand-btn text-lg">Continue</button>
        </form>
      </div>
    </div>
  )
}
