import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts'

export default function DataChart({ data, title, cityName }) {
  if (!data || !Array.isArray(data) || data.length === 0) return null

  const chartData = data.map((item) => ({ ts: item.ts, pm25: item.pm25, ...item }))

  return (
    <div className="h-[300px] w-full mt-6 bg-gray-900/50 rounded-2xl p-4 border border-gray-700/30" data-city={cityName}>
      <h4 className="text-white mb-4 font-medium">{title}</h4>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="ts" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickFormatter={(v) => `${v} µg/m³`} />
          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '12px', color: '#F9FAFB' }} formatter={(value, name) => [`${value} µg/m³`, name]} />
          <Line type="monotone" dataKey="pm25" stroke="#10B981" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


