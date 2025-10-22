import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'

export default function GlassPanel({ title, children, right, index = 0 }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { y: 60, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, delay: index * 0.15, ease: 'back.out(1.2)' },
      )
    }
  }, [index])

  return (
    <motion.section
      ref={panelRef}
      className="w-full bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-700/30 shadow-2xl hover:border-gray-600/50 transition-all duration-300"
      whileHover={{ y: -2 }}
    >
      <div className="px-6 py-5 border-b border-gray-700/30 flex items-center justify-between">
        <h2 className="font-semibold text-white flex items-center gap-3">
          <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"></div>
          {title}
        </h2>
        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
      <div className="p-6">{children}</div>
    </motion.section>
  )
}


