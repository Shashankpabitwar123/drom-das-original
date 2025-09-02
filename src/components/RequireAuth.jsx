// src/components/RequireAuth.jsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isAuthed } from '../lib/auth'

export default function RequireAuth({ children }) {
  const location = useLocation()
  if (!isAuthed()) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }
  return children
}
