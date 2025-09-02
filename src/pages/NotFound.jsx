import React from 'react'
import { Link, useRouteError } from 'react-router-dom'

export default function NotFound() {
  const err = useRouteError()
  const status = err?.status || 404
  const message = err?.statusText || 'Page Not Found'
  return (
    <main className="min-h-[60vh] grid place-items-center px-4">
      <div className="text-center max-w-xl">
        <div className="text-7xl font-black text-brand-500">{status}</div>
        <h1 className="mt-2 text-2xl font-bold">{message}</h1>
        <p className="mt-2 text-gray-600">The page you’re looking for doesn’t exist.</p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link to="/home" className="h-11 px-5 rounded-xl bg-brand-500 text-white font-semibold grid place-items-center">Go Home</Link>
          <Link to="/landing" className="h-11 px-5 rounded-xl border grid place-items-center">Back to Landing</Link>
        </div>
      </div>
    </main>
  )
}
