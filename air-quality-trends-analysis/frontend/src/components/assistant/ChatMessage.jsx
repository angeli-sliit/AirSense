export default function ChatMessage({ role, children }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 rounded-2xl p-4 max-w-[80%]">
          <div className="text-white">{children}</div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex justify-start">
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 max-w-[80%]">
        <div className="text-gray-200 whitespace-pre-wrap">{children}</div>
      </div>
    </div>
  )
}


