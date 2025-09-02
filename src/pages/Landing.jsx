import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Users, Clock } from 'lucide-react'

export default function Landing() {
  const nav = useNavigate()
  const howRef = useRef(null)

  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="bg-gradient-to-b from-blue-50 to-blue-100/40 border-b">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            <span className="text-gray-900">Dorm</span>
            <span className="text-accent-600">Dash</span>
          </h1>
          <p className="mt-4 text-2xl md:text-3xl font-semibold text-gray-800">Simple moving for students.</p>
          <p className="mt-2 text-gray-500 text-lg">Trucks, helpers, done.</p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button onClick={() => nav('/auth')} className="h-14 px-6 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600">
              Book a Move
            </button>
            <button onClick={() => howRef.current?.scrollIntoView({behavior: 'smooth'})}
              className="h-14 px-6 rounded-xl border border-gray-300 bg-white font-semibold">
              Learn How It Works
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section ref={howRef} className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-extrabold">How It Works</h2>
        <p className="mt-2 text-gray-600 text-lg">Three simple steps to a stress-free move.</p>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {[
            {n:1, title:'Book Your Move', desc:'Tell us where, when, and what you\'re moving. Get an instant price estimate.'},
            {n:2, title:'We Handle the Rest', desc:'A verified driver and helpers (if you need them) arrive on time with the right vehicle.'},
            {n:3, title:'Track & Relax', desc:'Follow your move in real-time on the map and get back to your life.'},
          ].map((s)=>(
            <div key={s.n} className="px-6">
              <div className="w-16 h-16 rounded-full bg-brand-500 text-white grid place-items-center text-2xl font-extrabold mx-auto">{s.n}</div>
              <div className="mt-5 font-semibold text-xl">{s.title}</div>
              <p className="text-gray-600 mt-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="bg-blue-50/60 border-y">
        <div className="max-w-6xl mx-auto px-4 py-14 text-center">
          <h2 className="text-4xl font-extrabold">Why Students Choose DormDash</h2>
          <p className="mt-2 text-gray-600">Built specifically for student life, with the flexibility and affordability you need.</p>

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
              {icon: <Truck/>, title: 'Right-Sized Vehicles', desc: 'From pickup trucks to small semis, choose exactly what you need for your move.', color:'text-blue-600 bg-blue-100'},
              {icon: <Users/>, title: 'Verified Helpers', desc: 'Add up to 3 background-checked helpers to make your move effortless.', color:'text-orange-600 bg-orange-100'},
              {icon: <Clock/>, title: 'Book in Minutes', desc: 'Quick booking with instant pricing and real-time tracking.', color:'text-green-600 bg-green-100'},
            ].map((c)=>(
              <div key={c.title} className="card p-8 text-left">
                <div className={`w-14 h-14 rounded-full grid place-items-center ${c.color}`}>{c.icon}</div>
                <div className="mt-4 font-semibold text-xl">{c.title}</div>
                <p className="text-gray-600 mt-2">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MADE FOR STUDENT LIFE */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-extrabold">Made for Student Life</h2>
        <p className="text-gray-600 mt-2">Built specifically for student life, with the flexibility and affordability you need.</p>

        <div className="grid md:grid-cols-2 gap-6 mt-10 items-center">
          <div className="space-y-6">
            {[
              {title: 'Student Verification', desc:'Verify with your ASU email for exclusive student rates and campus-specific features.', icon:'🛡️'},
              {title: 'Campus Move-In Bundles', desc:'Pre-built packages for dorm move-in, apartment transitions, and semester breaks.', icon:'⭐'},
              {title: 'Split with Roommates', desc:'Easily split costs and coordinate moves with your roommates through shared bookings.', icon:'👥'},
            ].map((x)=>(
              <div key={x.title} className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 grid place-items-center text-xl">{x.icon}</div>
                <div>
                  <div className="font-semibold text-lg">{x.title}</div>
                  <p className="text-gray-600">{x.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl p-8 text-white"
            style={{background:'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 50%, #F97316 100%)'}}>
            <div className="text-2xl font-extrabold">Ready to Move?</div>
            <p className="mt-2 text-white/90">Join thousands of ASU students who&apos;ve made moving simple with DormDash.</p>
            <button onClick={()=>nav('/auth')} className="mt-6 h-12 px-5 rounded-xl bg-white text-gray-900 font-semibold">
              Get Started Now
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
