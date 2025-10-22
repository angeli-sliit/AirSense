import { useState } from 'react'
import GlassPanel from '../common/GlassPanel'
import DarkInputField from '../common/DarkInputField'
import AuroraButton from '../common/AuroraButton'
import GlowyKpi from '../common/GlowyKpi'
import { ForecastCombinedChart, ForecastIndividualCharts } from '../charts/ForecastChart'
import { fmtPM } from '../../utils/formatters'
import { collectChartsForReport } from '../../utils/chartCapture'
import { buildForecastReportPayload } from '../../utils/payloadBuilders'

export default function ForecastTab({
                                      fcInput, setFcInput,
                                      horizon, setHorizon,
                                      trainDays, setTrainDays,
                                      doForecast, fcLoading, fcRes,
                                      forecastChartData, forecastCities,
                                      showCI, setShowCI,
                                      fcCombined, setFcCombined
                                    }) {
  const [reportLoading, setReportLoading] = useState(false)

  return (
      <GlassPanel
          title="AI-Powered Forecasting"
          index={2}
          right={
            <div className="flex items-center gap-2 text-sm">
              <label className="flex items-center gap-2 text-gray-400 bg-gray-800/50 px-3 py-2 rounded-lg">
                <input
                    type="checkbox"
                    checked={showCI}
                    onChange={(e) => setShowCI(e.target.checked)}
                    className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500 bg-gray-700 border-gray-600"
                />
                Show Confidence Intervals
              </label>
              <label className="flex items-center gap-2 text-gray-400 bg-gray-800/50 px-3 py-2 rounded-lg">
                <input
                    type="checkbox"
                    checked={fcCombined}
                    onChange={(e) => setFcCombined(e.target.checked)}
                    className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500 bg-gray-700 border-gray-600"
                />
                Show Combined Chart
              </label>
            </div>
          }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-4">
            <DarkInputField
                label="Cities to Forecast"
                value={fcInput}
                onChange={(e) => setFcInput(e.target.value)}
                className="flex-1 min-w-[300px]"
                placeholder="Colombo,Kandy,Galle"
            />
            <DarkInputField
                label="Forecast Horizon (days)"
                type="number"
                value={horizon}
                onChange={(e) => setHorizon(+e.target.value)}
                className="w-40"
            />
            <DarkInputField
                label="Training Window (days)"
                type="number"
                value={trainDays}
                onChange={(e) => setTrainDays(+e.target.value)}
                className="w-44"
            />
            <AuroraButton
                onClick={doForecast}
                disabled={fcLoading}
                loading={fcLoading}
                variant="success"
            >
              Generate Forecast
            </AuroraButton>
          </div>

          {fcRes?.summary && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                {Object.entries(fcRes.summary).map(([c, s]) => (
                    <GlowyKpi
                        key={c}
                        label={c}
                        value={s.mean_yhat != null ? fmtPM(s.mean_yhat) : '-'}
                        sub={`Forecast points: ${s.n_points}`}
                    />
                ))}
              </div>
          )}

          {/* Add this debug code right before rendering the charts */}
          {fcRes?.summary && (
            <>
              {(() => {
                console.log('🔍 === FORECAST CHART DATA DEBUG ===')
                console.log('1. forecastChartData:', forecastChartData)
                console.log('2. forecastCities:', forecastCities)
                console.log('3. fcRes.byCity:', fcRes?.byCity)
                console.log('4. Individual city data check:')
                if (fcRes?.byCity) {
                  Object.keys(fcRes.byCity).forEach(city => {
                    console.log(`   ${city}:`, fcRes.byCity[city])
                  })
                }
                return null
              })()}
            </>
          )}

          {fcCombined && (
            <div id="forecast-combined-chart">
              <ForecastCombinedChart forecastChartData={forecastChartData} forecastCities={forecastCities} showCI={showCI} />
            </div>
          )}
          <div id="forecast-individual-charts">
            <ForecastIndividualCharts byCity={fcRes?.byCity} showCI={showCI} />
          </div>

          {fcRes?.best && (
              <div className="flex gap-6 text-sm font-medium mt-4">
                <span className="text-emerald-400">📈 Best Forecast: <strong>{fcRes.best}</strong></span>
                <span className="text-amber-400">📉 Challenging: <strong>{fcRes.worst}</strong></span>
              </div>
          )}

          {fcRes?.summary && (
              <div className="flex justify-end mt-4">
                <AuroraButton
                    onClick={async () => {
                      try {
                        console.log('🚀 Forecast PDF Download Started - Version 2.0 (Fixed Selectors)')
                        setReportLoading(true)
                        await new Promise((resolve) => setTimeout(resolve, 150))

                        const cities = String(fcInput || '')
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean)

                        if (!cities.length) {
                          alert('No cities to include in the report. Please run a forecast first.')
                          return
                        }

                        // Add debug where you process the forecast response
                        console.log('🔄 Processing forecast response for PDF:')
                        console.log('   fcRes structure:', fcRes)
                        console.log('   fcRes.byCity structure:', fcRes?.byCity)
                        console.log('   City names from fcRes:', Object.keys(fcRes?.byCity || {}))
                        
                        // Ensure each city gets its own forecast data
                        if (fcRes?.byCity) {
                          Object.keys(fcRes.byCity).forEach(city => {
                            const cityData = fcRes.byCity[city]
                            console.log(`   ${city} forecast points:`, cityData?.forecast_data?.length)
                            console.log(`   ${city} first few values:`, cityData?.forecast_data?.slice(0, 3))
                            console.log(`   ${city} data type:`, typeof cityData)
                            console.log(`   ${city} is array:`, Array.isArray(cityData))
                          })
                        }

                        const cityRefs = {}
                        if (fcRes?.byCity) {
                          const cityNames = Object.keys(fcRes.byCity)
                          if (!cityNames.length) {
                            alert('No charts available to capture. Please run a forecast first.')
                            return
                          }
                          cityNames.forEach((cityName) => {
                            // CHANGE FROM: `#forecast-individual-charts [data-city="${cityName}"]`
                            // CHANGE TO: Simple data-city selector
                            const selector = `[data-city="${cityName}"]`
                            cityRefs[cityName] = selector
                            console.log(`🎯 Forecast chart selector for ${cityName}:`, selector)
                          })
                        }

                        // Add this debug before collectChartsForReport call
                        console.log('🔍 === FORECAST DOM VERIFICATION ===')
                        console.log('1. Combined container:', document.querySelector('#forecast-combined-chart'))
                        console.log('2. Individual container:', document.querySelector('#forecast-individual-charts'))
                        console.log('3. All data-city elements:', document.querySelectorAll('[data-city]'))

                        // Test each city selector
                        Object.keys(cityRefs).forEach(cityName => {
                          const element = document.querySelector(`[data-city="${cityName}"]`)
                          console.log(`📍 ${cityName} element:`, !!element)
                          if (element) {
                            const svg = element.querySelector('svg')
                            console.log(`   ${cityName} SVG:`, !!svg, svg?.clientWidth, 'x', svg?.clientHeight)
                          }
                        })
                        
                        // Add longer wait time for chart rendering
                        console.log('⏳ Waiting for charts to render...')
                        await new Promise((resolve) => setTimeout(resolve, 1000)) // Increased from 150ms
                        
                        // Optional: Wait for specific chart elements
                        const waitForCharts = () => new Promise(resolve => {
                          const check = () => {
                            const charts = document.querySelectorAll('#forecast-individual-charts svg')
                            console.log(`📊 Found ${charts.length} SVG charts, expecting ${Object.keys(cityRefs).length}`)
                            if (charts.length >= Object.keys(cityRefs).length) {
                              console.log('✅ All charts rendered, proceeding with capture')
                              resolve()
                            } else {
                              setTimeout(check, 100)
                            }
                          }
                          check()
                        })
                        await waitForCharts()
                        
                        // Add this test to verify data is different
                        console.log('🧪 DATA UNIQUENESS TEST:')
                        if (fcRes?.byCity) {
                          const cities = Object.keys(fcRes.byCity)
                          cities.forEach(city => {
                            const values = fcRes.byCity[city]?.forecast_data?.map(d => d.value) || []
                            const uniqueValues = [...new Set(values)]
                            console.log(`   ${city}: ${values.length} points, ${uniqueValues.length} unique values`)
                          })
                        }

                        const chartBase64 = await collectChartsForReport({
                          mode: 'forecast',
                          cityRefs,
                          combinedRef: '#forecast-combined-chart',
                          showConfidence: !!showCI,
                        })

                        const anyCharts = chartBase64?.combined || Object.keys(chartBase64 || {}).some((k) => k !== 'combined')
                        if (!anyCharts) {
                          alert('No charts were captured. Please ensure the charts are visible.')
                          return
                        }

                        const payload = buildForecastReportPayload({
                          cities,
                          horizonDays: horizon,
                          windowDays: trainDays,
                          stats: fcRes?.summary,
                          chartBase64,
                          showConfidence: !!showCI,
                          showCombined: !!fcCombined,
                          byCity: fcRes?.byCity,
                        })

                        const res = await fetch('http://localhost:8000/report/generate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload),
                        })
                        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
                        const blob = await res.blob()
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        const date = new Date().toISOString().slice(0, 10)
                        a.download = `Forecast_Report_${date}.pdf`
                        a.click()
                        window.URL.revokeObjectURL(url)
                      } catch (e) {
                        console.error('PDF download failed', e)
                        alert('PDF download failed: ' + e.message)
                      } finally {
                        setReportLoading(false)
                      }
                    }}
                    disabled={reportLoading}
                    loading={reportLoading}
                    variant="success"
                >
                  📄 Download PDF Report
                </AuroraButton>
              </div>
          )}
          {fcRes?.error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
                <div className="text-sm text-red-400">{fcRes.error}</div>
              </div>
          )}
        </div>
      </GlassPanel>
  )
}