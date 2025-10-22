import { useEffect, useRef } from 'react'
import { useMotionTemplate, useMotionValue, motion, animate } from 'framer-motion'
import { COLORS_TOP } from '../../utils/formatters'

export default function AuroraButton({ children, onClick, disabled, variant = 'primary', loading }) {
  const buttonRef = useRef(null)
  const color = useMotionValue(COLORS_TOP[0])

  useEffect(() => {
    animate(color, COLORS_TOP, { ease: 'easeInOut', duration: 12, repeat: Infinity, repeatType: 'mirror' })
  }, [color])

  const boxShadow = useMotionTemplate`0px 4px 200px 20px ${color}`
  const border = useMotionTemplate`0px solid ${color}`

  const variants = {
    primary: 'from-cyan-500 to-purple-600',
    secondary: 'from-gray-600 to-gray-700',
    success: 'from-emerald-500 to-green-600',
    warning: 'from-amber-500 to-orange-600',
  }

  return (
    <motion.button
      ref={buttonRef}
      style={{ boxShadow, border }}
      className={`px-6 py-3 rounded-3xl text-white font-medium bg-gradient-to-r ${variants[variant]} transition-all duration-200 relative overflow-hidden disabled:opacity-50`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </motion.button>
  )
}


