export default function DarkInputField({ label, value, onChange, type = 'text', placeholder, className }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-gray-400 mb-2 block">{label}</label>
      <input
        type={type}
        className="w-full px-7 py-3 border border-gray-700 rounded-3xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 bg-gray-800/50 text-white placeholder-gray-500"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  )
}


