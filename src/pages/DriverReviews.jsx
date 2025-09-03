import React from 'react'

export default function DriverReviews() {
  return (
    <main className="page">
      <h1 className="page-title">Reviews & Ratings</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <section className="card">
          <h2 className="section-title">Overall Rating</h2>
          <div className="text-6xl font-extrabold">5.0</div>
          <div className="muted mt-2">3 reviews</div>
        </section>
        <section className="card">
          <h2 className="section-title">Customer Reviews</h2>
          <div className="muted">No reviews yet.</div>
        </section>
      </div>
    </main>
  )
}
