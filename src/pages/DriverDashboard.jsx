import React from 'react'
import { Link } from 'react-router-dom'
import { ToggleRight } from 'lucide-react'
import { getDriverProfile } from '../lib/auth'

export default function DriverDashboard() {
  const dp = getDriverProfile()
  return (
    <main className="page">
      <header className="flex items-center justify-between mb-6">
        <h1 className="page-title">Welcome back, driver!</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700">Pending Verification</span>
          <span>Online</span>
          <button className="h-6 w-12 rounded-full bg-gray-200 relative"><span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white"/></button>
        </div>
      </header>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <CardStat label="Today's Earnings" value="$0.00" />
        <CardStat label="Completed Jobs" value="0" />
        <CardStat label="Rating" value="New" />
        <CardStat label="Active Jobs" value="5" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="card h-[260px]">
          <h2 className="section-title">Available Jobs</h2>
          <div className="flex h-full items-center justify-center text-gray-500">
            No jobs available right now
          </div>
        </section>

        <section className="card">
          <h2 className="section-title">Your Vehicle</h2>
          <div className="text-sm text-gray-700">
            <div className="font-semibold">{dp.vehicleType || 'Not set'}</div>
            <div className="mt-2 grid md:grid-cols-2 gap-2">
              <Badge label="License Pending" />
              <Badge label={`Background ${dp.backgroundStatus || 'pending'}`} />
              <Badge label="Insurance Pending" />
              <Badge label={`${dp.helpers||0} Helpers`} />
            </div>
          </div>
          <Link to="/profile" className="btn mt-4">Manage Profile</Link>
        </section>
      </div>

      <section className="card mt-6">
        <h2 className="section-title">Active Jobs</h2>
        <div className="text-gray-500">No active jobs.</div>
      </section>
    </main>
  )
}

function CardStat({label, value}) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="muted">{label}</div>
      <div className="text-3xl font-extrabold mt-1">{value}</div>
    </div>
  )
}
function Badge({label}) {
  return <span className="inline-block text-xs px-3 py-1 rounded-full bg-red-100 text-red-700">{label}</span>
}
