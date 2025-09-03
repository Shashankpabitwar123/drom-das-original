import React from 'react'

export default function DriverJobs() {
  return (
    <main className="page">
      <h1 className="page-title">Job History</h1>
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <CardStat label="Completed" value="0" />
        <CardStat label="In Progress" value="0" />
        <CardStat label="Accepted" value="0" />
        <CardStat label="Cancelled" value="0" />
      </div>
      <section className="card">
        <h2 className="section-title">Your Jobs (0)</h2>
        <div className="muted">No jobs yet.</div>
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
