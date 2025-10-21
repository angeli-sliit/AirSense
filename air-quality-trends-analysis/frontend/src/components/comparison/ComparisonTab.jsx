import { useState } from 'react'
import GlassPanel from '../common/GlassPanel'
import DarkInputField from '../common/DarkInputField'
import AuroraButton from '../common/AuroraButton'
import GlowyKpi from '../common/GlowyKpi'
import { ComparisonIndividualCharts, ComparisonCombinedChart } from '../charts/ComparisonChart'
import { fmtPM } from '../../utils/formatters'
import { collectChartsForReport } from '../../utils/chartCapture'
import { buildComparisonReportPayload } from '../../utils/payloadBuilders'

export default function ComparisonTab({ cmpInput, setCmpInput, cmpDays, setCmpDays, doCompare, cmpLoading, cmpRes, cmpChartData, cmpCombined, setCmpCombined, cmpCombinedData, cmpCities, agentOut }) {
  const [reportLoading, setReportLoading] = useState(false)
  return (
    <GlassPanel
      title="City Comparison Analysis"
      index={1}
      right={
        <label className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800/50 px-3 py-2 rounded-lg">
          <input type="checkbox" checked={cmpCombined} onChange={(e) => setCmpCombined(e.target.checked)} className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500 bg-gray-700 border-gray-600" />
          Show Combined Chart
        </label>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <DarkInputField label="Cities (comma separated)" value={cmpInput} onChange={(e) => setCmpInput(e.target.value)} className="flex-1 min-w-[300px]" placeholder="Colombo,Kandy,Galle" />
          <DarkInputField label="Analysis Period (days)" type="number" value={cmpDays} onChange={(e) => setCmpDays(+e.target.value)} className="w-36" />
          <AuroraButton onClick={doCompare} disabled={cmpLoading} loading={cmpLoading} variant="secondary">
            Compare Cities
          </AuroraButton>
        </div>

        {cmpRes?.byCity && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              {Object.entries(cmpRes.byCity).map(([c, v]) => (
                <GlowyKpi key={c} label={c} value={v.mean_pm25 != null ? fmtPM(v.mean_pm25) : '-'} sub={`Samples: ${v.n_points} | Range: ${v.min_pm25 != null ? fmtPM(v.min_pm25) : '-'} - ${v.max_pm25 != null ? fmtPM(v.max_pm25) : '-'}`} />
              ))}
            </div>
            <div className="flex gap-6 text-sm font-medium mt-2">
              <span className="text-emerald-400">🏆 Best Air Quality: <strong>{cmpRes.best}</strong></span>
              <span className="text-amber-400">⚠️ Needs Improvement: <strong>{cmpRes.worst}</strong></span>
            </div>

            <div className="flex justify-end mt-4">
              <AuroraButton
                onClick={async () => {
                  try {
                    console.log('🚀 PDF Download Started - Version 2.0 (Fixed Selectors)')
                    setReportLoading(true)
                    await new Promise((resolve) => setTimeout(resolve, 150))

                    const cities = String(cmpInput || '')
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)

                    if (!cities.length) {
                      alert('No cities to include in the report. Please run a comparison first.')
                      return
                    }

                    const cityRefs = {}
                    if (cmpChartData) {
                      const cityNames = Object.keys(cmpChartData)
                      console.log('🏙️ Available cities for chart capture:', cityNames)
                      if (!cityNames.length) {
                        alert('No charts available to capture. Please run a comparison first.')
                        return
                      }
                      cityNames.forEach((cityName) => {
                        // Use a simpler, more reliable selector - VERSION 2.0
                        const selector = `[data-city="${cityName}"]`
                        cityRefs[cityName] = selector
                        console.log(`🎯 V2.0 Generated selector for ${cityName}:`, selector)
                        console.log(`🔍 V2.0 Testing selector immediately:`, document.querySelector(selector))
                        
                        // Force immediate verification
                        const element = document.querySelector(selector)
                        if (element) {
                          const svg = element.querySelector('svg')
                          console.log(`✅ V2.0 Found element for ${cityName}, has SVG:`, !!svg)
                        } else {
                          console.log(`❌ V2.0 Element not found for ${cityName}`)
                        }
                      })
                    }
                    console.log('📋 Final cityRefs object:', cityRefs)

                    // Add a longer delay to ensure charts are fully rendered
                    await new Promise((resolve) => setTimeout(resolve, 1000))
                    
                    // Debug: Check if DOM elements exist
                    console.log('🔍 Checking if DOM elements exist...')
                    const comparisonContainer = document.querySelector('#comparison-individual-charts')
                    console.log('📦 Comparison container found:', !!comparisonContainer)
                    if (comparisonContainer) {
                      const cityElements = comparisonContainer.querySelectorAll('[data-city]')
                      console.log('🏙️ City elements found:', cityElements.length)
                      cityElements.forEach((el, idx) => {
                        const cityName = el.getAttribute('data-city')
                        const rechartsWrapper = el.querySelector('.recharts-wrapper')
                        const svg = el.querySelector('svg')
                        console.log(`  ${idx + 1}. City: ${cityName}, has recharts-wrapper: ${!!rechartsWrapper}, has svg: ${!!svg}`)
                        if (svg) {
                          console.log(`    SVG dimensions: ${svg.clientWidth}x${svg.clientHeight}`)
                        }
                      })
                    }
                    
                    // Also check combined chart
                    const combinedContainer = document.querySelector('#comparison-combined-chart')
                    console.log('📊 Combined chart container found:', !!combinedContainer)
                    if (combinedContainer) {
                      const svg = combinedContainer.querySelector('svg')
                      console.log('📊 Combined chart SVG found:', !!svg)
                      if (svg) {
                        console.log(`📊 Combined SVG dimensions: ${svg.clientWidth}x${svg.clientHeight}`)
                      }
                    }
                    
                    // Comprehensive DOM debugging
                    console.log('🔍 === COMPREHENSIVE DOM DEBUGGING ===')
                    console.log('📋 All elements with data-city attribute:')
                    const allCityElements = document.querySelectorAll('[data-city]')
                    allCityElements.forEach((el, idx) => {
                      const cityName = el.getAttribute('data-city')
                      const svg = el.querySelector('svg')
                      const rechartsWrapper = el.querySelector('.recharts-wrapper')
                      console.log(`  ${idx + 1}. City: ${cityName}`)
                      console.log(`     - Element:`, el)
                      console.log(`     - Has SVG: ${!!svg}`)
                      console.log(`     - Has recharts-wrapper: ${!!rechartsWrapper}`)
                      console.log(`     - SVG dimensions: ${svg ? `${svg.clientWidth}x${svg.clientHeight}` : 'N/A'}`)
                    })
                    
                    console.log('📊 Combined chart elements:')
                    const combinedElements = document.querySelectorAll('#comparison-combined-chart')
                    combinedElements.forEach((el, idx) => {
                      const svg = el.querySelector('svg')
                      console.log(`  ${idx + 1}. Container:`, el)
                      console.log(`     - Has SVG: ${!!svg}`)
                      console.log(`     - SVG dimensions: ${svg ? `${svg.clientWidth}x${svg.clientHeight}` : 'N/A'}`)
                    })

                    // DIRECT CAPTURE APPROACH - BYPASS chartCapture.js
                    console.log('🎯 Using DIRECT CAPTURE approach - VERSION 2.0')
                    const chartBase64 = {}
                    
                    // Helper function to get proper SVG dimensions for Recharts
                    const getProperSVGDimensions = (svg, isCombined = false) => {
                      // Try multiple methods to get dimensions
                      const bbox = svg.getBBox?.()
                      const rect = svg.getBoundingClientRect()
                      const computedStyle = window.getComputedStyle(svg)
                      
                      let width = bbox?.width || rect.width || svg.clientWidth || svg.getAttribute('width')
                      let height = bbox?.height || rect.height || svg.clientHeight || svg.getAttribute('height')
                      
                      // Parse CSS dimensions if available
                      if (!width && computedStyle.width !== 'auto') {
                        width = parseFloat(computedStyle.width)
                      }
                      if (!height && computedStyle.height !== 'auto') {
                        height = parseFloat(computedStyle.height)
                      }
                      
                      // Fallback to reasonable defaults based on chart type
                      const defaultWidth = isCombined ? 600 : 400
                      const defaultHeight = isCombined ? 400 : 300
                      
                      width = width || defaultWidth
                      height = height || defaultHeight
                      
                      // Ensure minimum quality dimensions
                      width = Math.max(width, defaultWidth)
                      height = Math.max(height, defaultHeight)
                      
                      return { width, height }
                    }
                    
                    // Capture individual charts directly
                    for (const cityName of Object.keys(cityRefs)) {
                      console.log(`📈 Direct capture for ${cityName}...`)
                      const cityElement = document.querySelector(`[data-city="${cityName}"]`)
                      if (cityElement) {
                        const svg = cityElement.querySelector('svg')
                        if (svg) {
                          console.log(`✅ Found SVG for ${cityName}, dimensions: ${svg.clientWidth}x${svg.clientHeight}`)
                          try {
                            // Get proper dimensions using helper function
                            const { width, height } = getProperSVGDimensions(svg)
                            console.log(`📐 ${cityName} SVG dimensions: ${width}x${height}`)
                            
                            // Clone and prepare SVG with proper dimensions
                            const svgClone = svg.cloneNode(true)
                            svgClone.setAttribute('width', width)
                            svgClone.setAttribute('height', height)
                            svgClone.setAttribute('viewBox', `0 0 ${width} ${height}`)
                            
                            // Direct SVG to PNG conversion with high quality
                            const xml = new XMLSerializer().serializeToString(svgClone)
                            const svg64 = window.btoa(unescape(encodeURIComponent(xml)))
                            const imageSrc = `data:image/svg+xml;base64,${svg64}`
                            
                            const canvas = document.createElement('canvas')
                            const pixelRatio = 2 // High DPI for better quality
                            canvas.width = width * pixelRatio
                            canvas.height = height * pixelRatio
                            const ctx = canvas.getContext('2d')
                            ctx.scale(pixelRatio, pixelRatio)
                            
                            const img = new Image()
                            
                            const result = await new Promise((resolve) => {
                              img.onload = () => {
                                ctx.drawImage(img, 0, 0, width, height)
                                const dataUrl = canvas.toDataURL('image/png', 1.0) // Maximum quality
                                resolve(dataUrl.replace(/^data:image\/png;base64,/, ''))
                              }
                              img.onerror = () => resolve(null)
                              img.src = imageSrc
                            })
                            
                            if (result) {
                              chartBase64[cityName] = result
                              console.log(`✅ Successfully captured ${cityName}`)
                            } else {
                              console.log(`❌ Failed to capture ${cityName}`)
                            }
                          } catch (error) {
                            console.log(`❌ Error capturing ${cityName}:`, error)
                          }
                        } else {
                          console.log(`❌ No SVG found for ${cityName}`)
                        }
                      } else {
                        console.log(`❌ No element found for ${cityName}`)
                      }
                    }
                    
                    // Capture combined chart if visible
                    if (cmpCombined) {
                      console.log('📊 Direct capture for combined chart...')
                      const combinedElement = document.querySelector('#comparison-combined-chart')
                      if (combinedElement) {
                        const svg = combinedElement.querySelector('svg')
                        if (svg) {
                          console.log(`✅ Found combined SVG, dimensions: ${svg.clientWidth}x${svg.clientHeight}`)
                          try {
                            // Get proper dimensions using helper function
                            const { width, height } = getProperSVGDimensions(svg, true)
                            console.log(`📐 Combined SVG dimensions: ${width}x${height}`)
                            
                            // Clone and prepare SVG with proper dimensions
                            const svgClone = svg.cloneNode(true)
                            svgClone.setAttribute('width', width)
                            svgClone.setAttribute('height', height)
                            svgClone.setAttribute('viewBox', `0 0 ${width} ${height}`)
                            
                            // Direct SVG to PNG conversion with high quality
                            const xml = new XMLSerializer().serializeToString(svgClone)
                            const svg64 = window.btoa(unescape(encodeURIComponent(xml)))
                            const imageSrc = `data:image/svg+xml;base64,${svg64}`
                            
                            const canvas = document.createElement('canvas')
                            const pixelRatio = 2 // High DPI for better quality
                            canvas.width = width * pixelRatio
                            canvas.height = height * pixelRatio
                            const ctx = canvas.getContext('2d')
                            ctx.scale(pixelRatio, pixelRatio)
                            
                            const img = new Image()
                            
                            const result = await new Promise((resolve) => {
                              img.onload = () => {
                                ctx.drawImage(img, 0, 0, width, height)
                                const dataUrl = canvas.toDataURL('image/png', 1.0) // Maximum quality
                                resolve(dataUrl.replace(/^data:image\/png;base64,/, ''))
                              }
                              img.onerror = () => resolve(null)
                              img.src = imageSrc
                            })
                            
                            if (result) {
                              chartBase64.combined = result
                              console.log(`✅ Successfully captured combined chart`)
                            } else {
                              console.log(`❌ Failed to capture combined chart`)
                            }
                          } catch (error) {
                            console.log(`❌ Error capturing combined chart:`, error)
                          }
                        } else {
                          console.log(`❌ No SVG found in combined chart`)
                        }
                      } else {
                        console.log(`❌ No combined chart element found`)
                      }
                    }
                    
                    console.log('🎯 Direct capture results:', Object.keys(chartBase64))
                    
                    // DOM Verification Debug
                    console.log('🔍 DOM Verification:');
                    console.log('Combined chart container:', document.querySelector('#comparison-combined-chart'));
                    console.log('Individual charts container:', document.querySelector('#comparison-individual-charts'));
                    console.log('City elements:', document.querySelectorAll('[data-city]'));


                    const anyCharts = chartBase64?.combined || Object.keys(chartBase64 || {}).some((k) => k !== 'combined')
                    if (!anyCharts) {
                      alert('No charts were captured. Please ensure the charts are visible.')
                      return
                    }

                    const payload = buildComparisonReportPayload({
                      cities,
                      periodDays: cmpDays,
                      stats: cmpRes?.byCity,
                      chartBase64,
                      showCombined: !!cmpCombined,
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
                    a.download = `Comparison_Report_${date}.pdf`
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
                variant="secondary"
              >
                📄 Download PDF Report
              </AuroraButton>
            </div>

            {cmpCombined && (
              <div id="comparison-combined-chart">
                <ComparisonCombinedChart cmpCombinedData={cmpCombinedData} cmpCities={cmpCities} />
              </div>
            )}
            <div id="comparison-individual-charts">
            <ComparisonIndividualCharts cmpChartData={cmpChartData} />
            </div>
          </>
        )}
        {cmpRes?.error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
            <div className="text-sm text-red-400">{cmpRes.error}</div>
          </div>
        )}
      </div>
    </GlassPanel>
  )
}


