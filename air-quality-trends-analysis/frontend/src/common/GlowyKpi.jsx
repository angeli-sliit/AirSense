import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'

export default function GlowyKpi({ label, value, sub, trend }) {
  const kpiRef = useRef(null)

  useEffect(() => {
    if (kpiRef.current) {
      gsap.fromTo(kpiRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' })
    }
  }, [value])

  return (
    <motion.div
      ref={kpiRef}
      className="p-5 rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 transition-all duration-300 group backdrop-blur-sm"
      whileHover={{ scale: 1.02 }}
    >
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
      {trend && (
        <div className={`text-xs font-medium mt-2 ${trend > 0 ? 'text-red-400' : 'text-green-400'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </motion.div>
  )
}


