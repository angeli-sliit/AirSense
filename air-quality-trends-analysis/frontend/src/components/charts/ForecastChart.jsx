import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts'

export function ForecastCombinedChart({ forecastChartData, forecastCities, showCI }) {
  if (!Array.isArray(forecastChartData) || forecastChartData.length === 0) return null
  
  // Add debug to ForecastCombinedChart component or before rendering it
  console.log('🔍 ForecastCombinedChart data:')
  console.log('   forecastChartData:', forecastChartData)
  console.log('   forecastCities:', forecastCities)
  console.log('   Data series check:')
  if (forecastChartData && Array.isArray(forecastChartData)) {
    forecastChartData.forEach((series, index) => {
      console.log(`   Series ${index}:`, series?.name, series?.data?.length)
    })
  }
  
  const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444']
  return (
    <div className="h-[400px] w-full mt-6 bg-gray-900/50 rounded-2xl p-4 border border-gray-700/30">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={forecastChartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="ts" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickFormatter={(v) => `${v} µg/m³`} domain={[0, 'auto']} />
          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '12px', color: '#F9FAFB' }} formatter={(value, name) => [`${value} µg/m³`, name]} />
          <Legend />
          {forecastCities.map((name, index) => (
            <Line key={name} type="monotone" dataKey={name} stroke={colors[index % colors.length]} strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
          ))}
          {showCI &&
            forecastCities.map((name, index) => (
              <Line key={`${name}-hi`} type="monotone" dataKey={`${name}_hi`} stroke={colors[index % colors.length]} strokeDasharray="4 3" opacity={0.7} dot={false} />
            ))}
          {showCI &&
            forecastCities.map((name, index) => (
              <Line key={`${name}-lo`} type="monotone" dataKey={`${name}_lo`} stroke={colors[index % colors.length]} strokeDasharray="4 3" opacity={0.4} dot={false} />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ForecastIndividualCharts({ byCity, showCI }) {
  if (!byCity) return null
  
  // Add debug to ForecastIndividualCharts component
  console.log('🎯 ForecastIndividualCharts received props:')
  console.log('   byCity:', byCity)
  console.log('   Individual chart data structure check:')
  if (byCity) {
    Object.keys(byCity).forEach(city => {
      console.log(`   ${city} data:`, byCity[city])
      console.log(`   ${city} has forecast data:`, byCity[city]?.forecast_data)
      console.log(`   ${city} has series:`, byCity[city]?.series)
    })
  }
  
  const colorPalette = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444']
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {Object.entries(byCity).map(([cityName, series], idx) => {
        // Debug each chart's data
        console.log(`📊 Rendering chart for ${cityName}:`)
        console.log(`   Raw series data:`, series)
        console.log(`   Series type:`, typeof series)
        console.log(`   Series is array:`, Array.isArray(series))
        console.log(`   Series length:`, Array.isArray(series) ? series.length : 'N/A')
        
        const chartData = Array.isArray(series)
          ? series.map((p) => ({ ...p, yhat_lower: Math.max(0, p.yhat_lower ?? 0), yhat_upper: Math.max(Math.max(0, p.yhat_lower ?? 0), p.yhat_upper ?? 0) }))
          : []
        
        console.log(`   Processed chart data:`, chartData)
        console.log(`   Chart data length:`, chartData.length)
        
        return (
          <div key={cityName} data-city={cityName} className="h:[350px] w-full bg-gray-900/50 rounded-2xl p-4 border border-gray-700/30">
            <h4 className="text-white mb-4 font-medium">{cityName} Forecast</h4>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="ts" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickFormatter={(v) => `${v} µg/m³`} domain={[0, 'auto']} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '12px', color: '#F9FAFB' }} formatter={(value, name) => [`${value} µg/m³`, name]} />
              {showCI && <Line type="monotone" dataKey="yhat_upper" stroke="#10B981" strokeDasharray="4 3" opacity={0.7} dot={false} />}
              {showCI && <Line type="monotone" dataKey="yhat_lower" stroke="#10B981" strokeDasharray="4 3" opacity={0.4} dot={false} />}
              <Line type="monotone" dataKey="yhat" stroke={colorPalette[idx % colorPalette.length]} strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        )
      })}
    </div>
  )
}


