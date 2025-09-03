import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getActiveUserId } from '../lib/auth'

export default function RequireAuth({ children }) {
  const location = useLocation()
  const authed = Boolean(getActiveUserId())

  if (!authed) {
    return <Navigate to="/auth" replace state={{ from: location }} />
  }
  return children
}
