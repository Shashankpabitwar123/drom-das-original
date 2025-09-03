import React from 'react'

export default function DriverEarnings() {
  return (
    <main className="page">
      <h1 className="page-title">Earnings Dashboard</h1>
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <CardStat label="Total Earnings" value="$0.00" />
        <CardStat label="This Week" value="$0.00" />
        <CardStat label="This Month" value="$0.00" />
        <CardStat label="Jobs Completed" value="0" />
      </div>
      <section className="card h-[320px] flex items-center justify-center text-gray-500">
        No completed jobs yet
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
