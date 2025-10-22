import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts'

const fmtPM = (v) => (v == null || isNaN(v) ? "-" : `${Number(v).toFixed(2)} µg/m³`)

export default function PrintComparisonReport() {
    const location = useLocation()
    const navigate = useNavigate()

    // Get comparison data from navigation state
    const comparisonData = location.state?.comparisonData
    const chartData = location.state?.chartData
    const cities = location.state?.cities
    const periodDays = location.state?.periodDays
    const showCombined = location.state?.showCombined

    // If no data, redirect back to workspace
    if (!comparisonData) {
        navigate('/workspace')
        return null
    }

    const handlePrint = () => {
        window.print()
    }

    const handleBack = () => {
        navigate('/workspace')
    }

    // Generate current date
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    // Get individual charts data
    const individualCharts = chartData?.individual ? Object.entries(chartData.individual) : []

    // Function to calculate deviation table data
    const getDeviationTableData = (cityData, cityName) => {
        if (!cityData || !comparisonData.byCity[cityName]) return []

        const averagePM25 = comparisonData.byCity[cityName].mean_pm25

        return cityData.map((entry, index) => {
            const deviation = entry.pm25 - averagePM25
            return {
                day: `Day ${index + 1}`,
                pm25: entry.pm25,
                deviation: deviation,
                deviationFormatted: `${deviation >= 0 ? '+' : ''}${deviation.toFixed(2)} µg/m³`
            }
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 print:bg-white w-screen">
            {/* Header - Only visible on screen */}
            <div className="bg-gradient-to-r from-cyan-600 to-purple-600 text-white p-6 print:hidden">
                <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm flex items-center space-x-2"
                        >
                            <span>←</span>
                            <span>Back to Workspace</span>
                        </button>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <h1 className="text-3xl font-bold">AirSense</h1>
                            <p className="text-cyan-100 text-lg">City Comparison Report</p>
                        </div>
                        <button
                            onClick={handlePrint}
                            className="px-6 py-3 bg-white text-cyan-600 hover:bg-gray-100 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                        >
                            <span>📄</span>
                            <span>Download Report</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Report Content */}
            <div className="w-full max-w-7xl mx-auto p-6 print:p-0 print:max-w-none print:bg-white">
                {/* ===== PAGE 1: Cover + Executive Summary + Detailed Statistics ===== */}
                <div className="print:min-h-screen print:flex print:flex-col">
                    {/* Cover Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 print:shadow-none print:rounded-none print:p-6 print:mb-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-6 print:mb-4">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center mr-4 print:w-16 print:h-16">
                                    <svg className="w-10 h-10 text-white print:w-8 print:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent print:text-4xl print:text-black">
                                        AirSense
                                    </h1>
                                    <p className="text-gray-600 mt-1 text-xl print:text-lg">Air Quality Intelligence Platform</p>
                                </div>
                            </div>

                            <div className="border-t border-b border-gray-200 py-6 my-6 print:py-4 print:my-4">
                                <h2 className="text-4xl font-bold text-gray-800 mb-3 print:text-3xl">
                                    City Comparison Analysis Report
                                </h2>
                                <p className="text-gray-600 text-xl print:text-lg">
                                    Comprehensive air quality assessment across multiple cities
                                </p>
                            </div>

                            <div className="flex justify-center items-center space-x-8 text-gray-600 text-lg print:text-base print:space-x-6">
                                <div className="flex items-center space-x-2">
                                    <span>📅</span>
                                    <span>Generated on {currentDate}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span>⏱️</span>
                                    <span>Analysis period: {periodDays} days</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span>🏙️</span>
                                    <span>{cities?.length || 0} cities analyzed</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Executive Summary */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 print:shadow-none print:rounded-none print:p-4 print:mb-4">
                        <h3 className="text-3xl font-bold text-gray-800 mb-6 print:text-2xl">Executive Summary</h3>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 print:mb-4">
                            <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-6 border border-emerald-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-emerald-600 text-xl font-semibold mb-2 print:text-lg">BEST PERFORMANCE</div>
                                        <div className="text-3xl font-bold text-gray-800 print:text-2xl">{comparisonData.best}</div>
                                        <div className="text-emerald-600 text-base print:text-sm mt-2">Excellent air quality standards</div>
                                    </div>
                                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center print:w-14 print:h-14">
                                        <span className="text-white text-2xl print:text-xl">🏆</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-amber-600 text-xl font-semibold mb-2 print:text-lg">NEEDS IMPROVEMENT</div>
                                        <div className="text-3xl font-bold text-gray-800 print:text-2xl">{comparisonData.worst}</div>
                                        <div className="text-amber-600 text-base print:text-sm mt-2">Requires immediate attention</div>
                                    </div>
                                    <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center print:w-14 print:h-14">
                                        <span className="text-white text-2xl print:text-xl">⚠️</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-6 print:p-4">
                            <h4 className="font-semibold text-gray-800 mb-3 text-xl print:text-lg">Analysis Overview</h4>
                            <div className="grid grid-cols-3 gap-6 print:gap-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-cyan-600 print:text-2xl">{cities?.length || 0}</div>
                                    <div className="text-gray-600 text-base print:text-sm">Cities Analyzed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-cyan-600 print:text-2xl">{periodDays}</div>
                                    <div className="text-gray-600 text-base print:text-sm">Days Period</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-cyan-600 print:text-2xl">
                                        {Object.values(comparisonData.byCity || {}).reduce((acc, city) => acc + (city.n_points || 0), 0)}
                                    </div>
                                    <div className="text-gray-600 text-base print:text-sm">Data Points</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Statistics */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 flex-1 print:shadow-none print:rounded-none print:p-4">
                        <h3 className="text-3xl font-bold text-gray-800 mb-6 print:text-2xl">Detailed City Statistics</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
                            {Object.entries(comparisonData.byCity || {}).map(([city, stats]) => (
                                <div
                                    key={city}
                                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-6 print:p-4"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-gray-800 text-xl print:text-lg">{city}</h4>
                                        <div className={`w-4 h-4 rounded-full ${
                                            city === comparisonData.best ? 'bg-emerald-500' :
                                                city === comparisonData.worst ? 'bg-amber-500' :
                                                    'bg-cyan-500'
                                        }`} />
                                    </div>

                                    <div className="space-y-3 print:space-y-2">
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                            <span className="text-gray-600 text-base print:text-sm">Average PM2.5</span>
                                            <span className="font-semibold text-gray-800 text-base print:text-sm">{fmtPM(stats.mean_pm25)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                            <span className="text-gray-600 text-base print:text-sm">Data Samples</span>
                                            <span className="font-semibold text-gray-800 text-base print:text-sm">{stats.n_points}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 text-base print:text-sm">Quality Range</span>
                                            <div className="text-right">
                                                <div className="font-semibold text-gray-800 text-base print:text-sm">
                                                    {fmtPM(stats.min_pm25)} - {fmtPM(stats.max_pm25)}
                                                </div>
                                                <div className="text-gray-500 text-sm print:text-xs">
                                                    Min - Max
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ===== CHART PAGES: One chart + table per page ===== */}
                {individualCharts.map(([cityName, chartData], index) => {
                    const tableData = getDeviationTableData(chartData, cityName)
                    const cityStats = comparisonData.byCity[cityName]

                    return (
                        <div key={cityName} className="print:break-before-page print:min-h-screen print:flex print:flex-col print:justify-start print:py-4">
                            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 print:shadow-none print:rounded-none print:p-6 print:mb-0 print:h-full print:flex print:flex-col">
                                <h3 className="text-3xl font-bold text-gray-800 mb-6 print:text-2xl print:text-center">
                                    Air Quality Analysis: {cityName}
                                </h3>

                                {/* Chart Section - Reduced height */}
                                <div className="mb-6 print:mb-4 flex-shrink-0">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-2xl font-semibold text-gray-700 print:text-xl">
                                            PM2.5 Concentration Trend
                                        </h4>
                                        <div className={`px-4 py-2 rounded-full text-lg font-semibold print:text-base ${
                                            cityName === comparisonData.best ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                                cityName === comparisonData.worst ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                                    'bg-cyan-100 text-cyan-800 border border-cyan-300'
                                        }`}>
                                            {cityName === comparisonData.best ? 'Best Performance' :
                                                cityName === comparisonData.worst ? 'Needs Improvement' : 'Average'}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 print:p-3">
                                        <ResponsiveContainer width="100%" height={300} className="print:h-64">
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#D1D5DB" />
                                                <XAxis
                                                    dataKey="ts"
                                                    tick={{ fontSize: 14, fill: "#374151", fontWeight: 'bold' }}
                                                    axisLine={{ stroke: '#9CA3AF', strokeWidth: 1 }}
                                                    height={40} // Reduced XAxis height
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 14, fill: "#374151", fontWeight: 'bold' }}
                                                    axisLine={{ stroke: '#9CA3AF', strokeWidth: 1 }}
                                                    tickFormatter={(v) => `${v} µg/m³`}
                                                    width={60} // Reduced YAxis width
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#F9FAFB',
                                                        border: '1px solid #D1D5DB',
                                                        borderRadius: '8px',
                                                        color: '#374151',
                                                        fontSize: '16px',
                                                        fontWeight: 'bold'
                                                    }}
                                                    formatter={(value, name) => [`${value} µg/m³`, name]}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="pm25"
                                                    stroke={cityName === comparisonData.best ? '#10B981' :
                                                        cityName === comparisonData.worst ? '#F59E0B' : '#3B82F6'}
                                                    strokeWidth={3}
                                                    dot={false}
                                                    activeDot={{ r: 4, strokeWidth: 1 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Data Table Section - Compact design */}
                                <div className="flex-1 print:mt-2">
                                    <h4 className="text-2xl font-semibold text-gray-700 mb-4 print:text-xl">
                                        Detailed PM2.5 Data with Deviation Analysis
                                    </h4>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 print:p-3">
                                        <div className="mb-4 flex justify-between items-center print:mb-3">
                                            <div className="text-lg font-semibold text-gray-700 print:text-base">
                                                Average PM2.5: <span className="text-cyan-600">{fmtPM(cityStats?.mean_pm25)}</span>
                                            </div>
                                            <div className="text-sm text-gray-600 print:text-xs">
                                                * Deviation calculated from city average
                                            </div>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-base print:text-sm">
                                                <thead>
                                                <tr className="bg-gray-200">
                                                    <th className="px-4 py-3 text-left font-bold text-gray-700 border-b border-gray-300 print:px-3 print:py-2">
                                                        Day
                                                    </th>
                                                    <th className="px-4 py-3 text-left font-bold text-gray-700 border-b border-gray-300 print:px-3 print:py-2">
                                                        PM2.5 Value (µg/m³)
                                                    </th>
                                                    <th className="px-4 py-3 text-left font-bold text-gray-700 border-b border-gray-300 print:px-3 print:py-2">
                                                        Deviation from Average
                                                    </th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {tableData.map((row, rowIndex) => (
                                                    <tr
                                                        key={rowIndex}
                                                        className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-100'}
                                                    >
                                                        <td className="px-4 py-3 border-b border-gray-200 font-semibold print:px-3 print:py-2">
                                                            {row.day}
                                                        </td>
                                                        <td className="px-4 py-3 border-b border-gray-200 print:px-3 print:py-2">
                                                            {row.pm25.toFixed(2)} µg/m³
                                                        </td>
                                                        <td className={`px-4 py-3 border-b border-gray-200 font-semibold print:px-3 print:py-2 ${
                                                            row.deviation > 0 ? 'text-red-600' :
                                                                row.deviation < 0 ? 'text-green-600' : 'text-gray-600'
                                                        }`}>
                                                            {row.deviationFormatted}
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}

                {/* ===== FINAL PAGE: Report Complete ===== */}
                <div className="print:break-before-page print:min-h-screen print:flex print:flex-col print:justify-center print:items-center">
                    <div className="bg-gradient-to-r from-cyan-600 to-purple-600 rounded-2xl p-12 print:rounded-none print:p-8 print:w-full print:h-full print:flex print:flex-col print:justify-center">
                        <div className="text-center text-white">
                            <div className="flex items-center justify-center mb-8 print:mb-6">
                                <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center mr-4 print:w-16 print:h-16">
                                    <svg className="w-10 h-10 text-white print:w-8 print:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="text-4xl font-bold print:text-3xl">Report Complete</h3>
                            </div>
                            <p className="text-cyan-100 text-xl mb-6 print:text-lg">
                                This comprehensive analysis was generated by AirSense Air Quality Intelligence Platform
                            </p>
                            <div className="text-cyan-200 text-base print:text-sm">
                                <p>For detailed insights and real-time monitoring, visit the AirSense platform</p>
                                <p className="mt-3 print:mt-2">Report generated on {currentDate} | Analysis period: {periodDays} days</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Print Styles */}
            <style jsx>{`
                @media print {
                    @page {
                        margin: 0.5cm;
                        size: A4;
                    }

                    body {
                        margin: 0;
                        padding: 0;
                        background: white !important;
                        font-family: 'Inter', 'Segoe UI', sans-serif;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    .print\\:break-before-page {
                        page-break-before: always;
                        break-before: page;
                    }

                    .print\\:min-h-screen {
                        min-height: 100vh;
                    }

                    .print\\:hidden {
                        display: none !important;
                    }

                    .print\\:bg-white {
                        background: white !important;
                    }

                    /* Ensure colors print correctly */
                    .bg-gradient-to-r {
                        background-image: none !important;
                    }

                    .from-cyan-600 {
                        background-color: #0891b2 !important;
                    }

                    .to-purple-600 {
                        background-color: #9333ea !important;
                    }

                    .bg-gradient-to-br {
                        background-image: none !important;
                    }

                    .from-emerald-50 {
                        background-color: #ecfdf5 !important;
                    }

                    .to-cyan-50 {
                        background-color: #ecfeff !important;
                    }

                    .from-amber-50 {
                        background-color: #fffbeb !important;
                    }

                    .to-orange-50 {
                        background-color: #fff7ed !important;
                    }

                    /* Larger typography scaling for print */
                    .print\\:text-4xl {
                        font-size: 2rem !important;
                        line-height: 1.2 !important;
                    }

                    .print\\:text-3xl {
                        font-size: 1.75rem !important;
                        line-height: 1.3 !important;
                    }

                    .print\\:text-2xl {
                        font-size: 1.5rem !important;
                        line-height: 1.3 !important;
                    }

                    .print\\:text-xl {
                        font-size: 1.25rem !important;
                        line-height: 1.4 !important;
                    }

                    .print\\:text-lg {
                        font-size: 1.125rem !important;
                        line-height: 1.4 !important;
                    }

                    .print\\:text-base {
                        font-size: 1rem !important;
                        line-height: 1.5 !important;
                    }

                    .print\\:text-sm {
                        font-size: 0.875rem !important;
                        line-height: 1.5 !important;
                    }

                    .print\\:text-xs {
                        font-size: 0.75rem !important;
                        line-height: 1.5 !important;
                    }

                    /* Layout adjustments */
                    .print\\:p-3 {
                        padding: 0.75rem !important;
                    }

                    .print\\:p-4 {
                        padding: 1rem !important;
                    }

                    .print\\:p-6 {
                        padding: 1.5rem !important;
                    }

                    .print\\:p-8 {
                        padding: 2rem !important;
                    }

                    .print\\:mb-0 {
                        margin-bottom: 0 !important;
                    }

                    .print\\:mb-2 {
                        margin-bottom: 0.5rem !important;
                    }

                    .print\\:mb-3 {
                        margin-bottom: 0.75rem !important;
                    }

                    .print\\:mb-4 {
                        margin-bottom: 1rem !important;
                    }

                    .print\\:mt-2 {
                        margin-top: 0.5rem !important;
                    }

                    /* Chart sizing */
                    .print\\:h-64 {
                        height: 16rem !important;
                    }

                    /* Full width/height for final page */
                    .print\\:w-full {
                        width: 100% !important;
                    }

                    .print\\:h-full {
                        height: 100% !important;
                    }

                    /* Remove shadows for print */
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }

                    .print\\:rounded-none {
                        border-radius: 0 !important;
                    }

                    .print\\:text-center {
                        text-align: center !important;
                    }

                    /* Table cell padding */
                    .print\\:px-3 {
                        padding-left: 0.75rem !important;
                        padding-right: 0.75rem !important;
                    }

                    .print\\:py-2 {
                        padding-top: 0.5rem !important;
                        padding-bottom: 0.5rem !important;
                    }

                    /* Ensure proper spacing */
                    .print\\:py-4 {
                        padding-top: 1rem !important;
                        padding-bottom: 1rem !important;
                    }

                    /* Flex layout for chart pages */
                    .print\\:flex-col {
                        flex-direction: column !important;
                    }

                    .print\\:justify-start {
                        justify-content: flex-start !important;
                    }

                    .print\\:flex-shrink-0 {
                        flex-shrink: 0 !important;
                    }

                    .print\\:flex-1 {
                        flex: 1 1 0% !important;
                    }
                }

                /* Screen-only styles */
                @media screen {
                    .print\\:break-before-page {
                        page-break: auto;
                    }
                }
            `}</style>
        </div>
    )
}