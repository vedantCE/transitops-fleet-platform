import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { listVehicles } from '../../services/vehicles'
import { getVehicleStats, getDashboardKpis, downloadFleetReportCsv } from '../../services/reports'
import { getApiErrorMessage } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { canExportReports } from '../../lib/permissions'
import type { DashboardKpis, VehicleStats } from '../../types'

type SortMetric = 'roi' | 'fuelEfficiency' | 'totalOperationalCost'

const SORT_LABELS: Record<SortMetric, string> = {
  roi: 'Operational ROI',
  fuelEfficiency: 'Fuel Efficiency',
  totalOperationalCost: 'Operational Cost',
}

export default function AnalyticsScreen() {
  const { setIsMobileMenuOpen } = useOutletContext<{ setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>> }>()
  const { user } = useAuth()
  const canExport = canExportReports(user?.role)

  const [assetTypeFilter, setAssetTypeFilter] = useState('All Types')
  const [sortMetric, setSortMetric] = useState<SortMetric>('roi')

  const [availableTypes, setAvailableTypes] = useState<string[]>([])
  const [telemetry, setTelemetry] = useState<VehicleStats[]>([])
  const [fleetKpis, setFleetKpis] = useState<DashboardKpis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const fetchAnalytics = async () => {
    setIsLoading(true)
    setLoadError('')
    try {
      const { vehicles } = await listVehicles({
        limit: 100,
        type: assetTypeFilter !== 'All Types' ? assetTypeFilter : undefined,
      })
      setAvailableTypes((prev) => (prev.length ? prev : Array.from(new Set(vehicles.map((v) => v.type))).sort()))

      const stats = await Promise.all(vehicles.slice(0, 20).map((v) => getVehicleStats(v.id).catch(() => null)))
      const validStats = stats.filter((s): s is VehicleStats => s !== null)
      validStats.sort((a, b) => b[sortMetric] - a[sortMetric])
      setTelemetry(validStats)

      const kpis = await getDashboardKpis()
      setFleetKpis(kpis)
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load analytics'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAnalyze = () => {
    fetchAnalytics()
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const blob = await downloadFleetReportCsv()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'fleet_report.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to export report'))
    } finally {
      setIsExporting(false)
    }
  }

  const totals = useMemo(() => {
    const withDistance = telemetry.filter((t) => t.totalDistance > 0)
    const avgEfficiency = withDistance.length
      ? withDistance.reduce((s, t) => s + t.fuelEfficiency, 0) / withDistance.length
      : 0
    const totalCost = telemetry.reduce((s, t) => s + t.totalOperationalCost, 0)
    const totalRevenue = telemetry.reduce((s, t) => s + t.revenue, 0)
    const totalAcquisitionCost = telemetry.reduce((s, t) => s + t.acquisitionCost, 0)
    const fleetROI = totalAcquisitionCost > 0 ? (totalRevenue - totalCost) / totalAcquisitionCost : 0
    return { avgEfficiency, totalCost, fleetROI }
  }, [telemetry])

  // Vehicles with no completed trips have no real distance/cost data — their ROI/efficiency
  // is reported as 0 rather than "no data", which would otherwise crowd out active vehicles
  // at the top of the ranking (0% ROI outranks any vehicle whose costs exceed its modeled revenue).
  const activeTelemetry = telemetry.filter((t) => t.totalDistance > 0)
  const top4 = activeTelemetry.slice(0, 4)
  const maxSortValue = Math.max(...top4.map((t) => t[sortMetric]), 1)
  const top3ByEfficiency = [...activeTelemetry].sort((a, b) => b.fuelEfficiency - a.fuelEfficiency).slice(0, 3)

  return (
    <>
      {/* TOP NAV BAR */}
      <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/5 bg-white/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button className="md:hidden text-on-surface p-1 hover:bg-black/5 rounded" onClick={() => setIsMobileMenuOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      {/* CONTENT CANVAS */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface font-headline-lg">Reports &amp; Analytics</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body-md">Fleet-wide operational metrics, all-time. ROI/Revenue use an estimated ₹ rate per km (no real pricing is tracked yet).</p>
          </div>
          {canExport && (
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-on-background text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            {isExporting ? 'Exporting...' : 'Export Dataset (CSV)'}
          </button>
          )}
        </div>

        {loadError && (
          <div className="bg-error-red/10 border border-error-red/20 text-error-red text-sm rounded-xl px-4 py-3">{loadError}</div>
        )}

        {/* Analytics Filter Board */}
        <div className="bg-white p-5 rounded-2xl flex flex-wrap gap-4 items-end shadow-sm border border-black/[0.01] font-body-sm text-sm">
          <div className="flex-1 min-w-[180px] space-y-1">
            <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider font-label-sm">Asset Type</label>
            <select
              value={assetTypeFilter}
              onChange={(e) => setAssetTypeFilter(e.target.value)}
              className="w-full bg-dashboard-canvas/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-success-green outline-none cursor-pointer"
            >
              <option>All Types</option>
              {availableTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[180px] space-y-1">
            <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider font-label-sm">Sort By</label>
            <select
              value={sortMetric}
              onChange={(e) => setSortMetric(e.target.value as SortMetric)}
              className="w-full bg-dashboard-canvas/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-success-green outline-none cursor-pointer"
            >
              {(Object.keys(SORT_LABELS) as SortMetric[]).map((m) => (
                <option key={m} value={m}>{SORT_LABELS[m]}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAnalyze}
            className="bg-background text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md cursor-pointer uppercase tracking-wider text-xs"
          >
            <span className="material-symbols-outlined text-[18px]">query_stats</span>
            Analyze
          </button>
        </div>

        {/* Telemetry KPIs Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-28 border-l-4 border-l-success-green">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Avg Fuel Efficiency</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-on-surface">{totals.avgEfficiency.toFixed(2)}</span>
              <span className="text-xs text-on-surface-variant font-medium font-sans">km/L</span>
            </div>
          </div>
          <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-28 border-l-4 border-l-industrial-blue">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Fleet Utilization</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-on-surface">{fleetKpis ? fleetKpis.fleetUtilization : '—'}</span>
              <span className="text-xs text-on-surface-variant font-medium font-sans">%</span>
            </div>
          </div>
          <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-28 border-l-4 border-l-error-red">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Operational Cost (₹)</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-on-surface">₹{totals.totalCost.toLocaleString()}</span>
            </div>
          </div>
          <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-28 border-l-4 border-l-success-green">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Est. Fleet ROI</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-on-surface">{(totals.fleetROI * 100).toFixed(2)}</span>
              <span className="text-xs text-on-surface-variant font-medium font-sans">%</span>
            </div>
          </div>
        </div>

        {/* Charts & Table Columns split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Analytics Chart Block (Left 7/12) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-black/5 shadow-sm min-h-[380px] flex flex-col justify-between">
            <div>
              <h4 className="text-base font-bold text-on-surface font-headline-sm">Performance Analysis</h4>
              <p className="text-xs text-on-surface-variant font-body-sm mt-0.5">Top 4 vehicles by {SORT_LABELS[sortMetric]}</p>
            </div>

            <div className="flex-1 bg-dashboard-canvas/50 border border-black/5 rounded-2xl p-6 relative overflow-hidden flex items-end justify-around min-h-[220px] mt-6">
              {isLoading ? (
                <p className="text-xs text-on-surface-variant absolute inset-0 flex items-center justify-center">Loading...</p>
              ) : top4.length === 0 ? (
                <p className="text-xs text-on-surface-variant absolute inset-0 flex items-center justify-center">No data yet.</p>
              ) : (
                top4.map((item) => {
                  const value = item[sortMetric]
                  const heightPx = Math.max(20, (value / maxSortValue) * 180)
                  const label = sortMetric === 'roi' ? `${(value * 100).toFixed(1)}%` : sortMetric === 'fuelEfficiency' ? `${value.toFixed(1)} km/L` : `₹${value.toLocaleString()}`
                  return (
                    <div key={item.vehicleId} className="w-16 flex flex-col items-center gap-2 relative z-10">
                      <span className="text-[10px] font-bold font-mono text-industrial-blue">{label}</span>
                      <div className="w-8 bg-industrial-blue rounded-t-lg transition-all duration-500" style={{ height: `${heightPx}px` }}></div>
                      <span className="text-[10px] font-bold font-mono text-on-surface-variant">{item.registrationNumber}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Efficiency list ranking (Right 5/12) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden flex flex-col min-h-[380px]">
            <div className="px-6 py-4 border-b border-black/5 bg-gray-50/50 flex justify-between items-center">
              <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider font-headline-sm">Efficiency Leaderboard</h4>
            </div>
            <div className="p-4 space-y-4 font-body-sm text-xs flex-1 flex flex-col justify-around">
              {top3ByEfficiency.length === 0 ? (
                <p className="text-center text-on-surface-variant">No data yet.</p>
              ) : (
                top3ByEfficiency.map((item, idx) => (
                  <div key={item.vehicleId} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-none last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-on-surface-variant font-mono w-4">#{idx + 1}</span>
                      <div>
                        <span className="font-bold text-on-surface font-mono">{item.registrationNumber}</span>
                        <p className="text-[10px] text-on-surface-variant mt-0.5 font-sans">Distance logged: {item.totalDistance.toLocaleString()} km</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-success-green font-mono">{item.fuelEfficiency} km/L</span>
                      <p className="text-[9px] text-on-surface-variant font-sans font-medium mt-0.5">Fuel Efficiency</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Telemetry Log */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-black/5 bg-gray-50/50">
            <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider font-headline-sm">Asset Telemetry Matrix</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-body-md border-collapse">
              <thead className="bg-dashboard-canvas text-on-surface-variant text-[11px] uppercase tracking-wider font-label-sm">
                <tr>
                  <th className="px-6 py-3 font-bold border-b border-black/5">Vehicle Unit</th>
                  <th className="px-6 py-3 font-bold border-b border-black/5 text-right">Fuel Logged</th>
                  <th className="px-6 py-3 font-bold border-b border-black/5 text-right">Efficiency</th>
                  <th className="px-6 py-3 font-bold border-b border-black/5 text-right">Distance</th>
                  <th className="px-6 py-3 font-bold border-b border-black/5 text-right">Opex Cost</th>
                  <th className="px-6 py-3 font-bold border-b border-black/5 text-right">Est. Revenue</th>
                  <th className="px-6 py-3 font-bold border-b border-black/5 text-right">Est. ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-mono font-medium text-on-surface">
                {isLoading ? (
                  <tr><td colSpan={7} className="px-6 py-10 text-center font-sans text-on-surface-variant">Loading...</td></tr>
                ) : telemetry.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-10 text-center font-sans text-on-surface-variant">No data yet.</td></tr>
                ) : (
                  telemetry.map((row) => (
                    <tr key={row.vehicleId} className="hover:bg-blue-50/10 transition-colors">
                      <td className="px-6 py-4 font-bold text-industrial-blue">{row.registrationNumber}</td>
                      <td className="px-6 py-4 text-right">{row.totalFuelLiters.toLocaleString()} L</td>
                      <td className="px-6 py-4 text-right text-success-green font-bold">{row.fuelEfficiency} km/L</td>
                      <td className="px-6 py-4 text-right">{row.totalDistance.toLocaleString()} km</td>
                      <td className="px-6 py-4 text-right">₹{row.totalOperationalCost.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">₹{row.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-industrial-blue font-bold">{(row.roi * 100).toFixed(2)}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
