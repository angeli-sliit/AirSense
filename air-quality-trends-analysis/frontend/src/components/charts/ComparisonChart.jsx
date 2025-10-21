import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts'

export function ComparisonIndividualCharts({ cmpChartData }) {
  if (!cmpChartData) return null
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {Object.entries(cmpChartData).map(([cityName, data]) => (
        <div key={cityName} data-city={cityName} className="h-[300px] w-full bg-gray-900/50 rounded-2xl p-4 border border-gray-700/30">
          <h4 className="text-white mb-4 font-medium">{cityName} PM2.5 Levels</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="ts" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickFormatter={(v) => `${v} µg/m³`} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '12px', color: '#F9FAFB' }} formatter={(value, name) => [`${value} µg/m³`, name]} />
              <Line type="monotone" dataKey="pm25" stroke="#10B981" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  )
}

export function ComparisonCombinedChart({ cmpCombinedData, cmpCities }) {
  if (!Array.isArray(cmpCombinedData) || cmpCombinedData.length === 0) return null
  const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#A3E635']
  return (
    <div className="h-[400px] w-full mt-6 bg-gray-900/50 rounded-2xl p-4 border border-gray-700/30">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={cmpCombinedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="ts" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickFormatter={(v) => `${v} µg/m³`} />
          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '12px', color: '#F9FAFB' }} formatter={(value, name) => [`${value} µg/m³`, name]} />
          <Legend />
          {cmpCities.map((name, index) => (
            <Line key={name} type="monotone" dataKey={name} stroke={colors[index % colors.length]} strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


