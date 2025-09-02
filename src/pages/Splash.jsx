import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function Splash() {
  const nav = useNavigate()
  useEffect(() => {
    const t = setTimeout(() => {
      nav('/landing')
    }, 2800)
    return () => clearTimeout(t)
  }, [nav])

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-500 to-brand-700 text-white grid place-items-center">
      <div className="w-full max-w-4xl mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold">DormDash</h1>
          <p className="text-white/80 mt-2 text-lg">Simple moving for students</p>
        </div>
        <div className="relative h-40 overflow-hidden">
          <div className="absolute inset-x-0 bottom-6 h-1 bg-white/30"></div>
          <motion.div
            className="absolute left-[-200px] bottom-0"
            initial={{ x: -200 }}
            animate={{ x: 1200 }}
            transition={{ duration: 2.2, ease: 'easeInOut' }}
          >
            <div className="flex items-end gap-2">
              <div className="w-28 h-16 bg-white rounded-xl shadow-lg relative">
                <div className="absolute left-2 top-2 w-8 h-6 bg-brand-200 rounded-sm" />
                <div className="absolute right-2 bottom-2 text-brand-700 text-xs font-bold">DD</div>
              </div>
              <div className="w-44 h-20 bg-white rounded-xl shadow-lg" />
            </div>
            <div className="flex gap-10 pl-3 -mt-3">
              <motion.div className="w-8 h-8 rounded-full bg-gray-900 border-4 border-gray-200"
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}/>
              <motion.div className="w-8 h-8 rounded-full bg-gray-900 border-4 border-gray-200"
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}/>
              <motion.div className="w-8 h-8 rounded-full bg-gray-900 border-4 border-gray-200"
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}/>
            </div>
          </motion.div>
        </div>
        <p className="text-center mt-10 text-white/70">Loading your campus move…</p>
      </div>
    </div>
  )
}
