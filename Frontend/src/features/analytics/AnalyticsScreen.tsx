import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

interface AssetTelemetry {
  id: string
  distance: string
  fuel: string
  efficiency: string
  utilization: string
  cost: number
  revenue: number
  roi: string
}

export default function AnalyticsScreen() {
  const { setIsMobileMenuOpen } = useOutletContext<{ setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>> }>()

  // Filters State
  const [dateRange, setDateRange] = useState('Last 6 Months')
  const [assetFilter, setAssetFilter] = useState('All Assets')
  const [categoryFilter, setCategoryFilter] = useState('Operational ROI')

  // State-backed assets telemetry matching Stitch mockup
  const initialTelemetry: AssetTelemetry[] = [
    { id: 'TRUCK-02', distance: '12,450 km', fuel: '1,620 L', efficiency: '7.6 km/L', utilization: '92%', cost: 48200, revenue: 210000, roi: '18.4%' },
    { id: 'ACE-05', distance: '8,200 km', fuel: '940 L', efficiency: '8.7 km/L', utilization: '84%', cost: 32150, revenue: 145000, roi: '15.2%' },
    { id: 'VAN-05', distance: '4,150 km', fuel: '415 L', efficiency: '10.0 km/L', utilization: '76%', cost: 18400, revenue: 88000, roi: '12.8%' },
    { id: 'TRK-09', distance: '14,800 km', fuel: '2,100 L', efficiency: '7.0 km/L', utilization: '95%', cost: 54300, revenue: 234000, roi: '9.4%' },
  ]
  const [telemetry, setTelemetry] = useState<AssetTelemetry[]>(initialTelemetry)

  // KPI stats matching Stitch mockup
  const [kpis, setKpis] = useState({
    efficiency: { val: '8.4', unit: 'km/L', trend: '+4.2%' },
    utilization: { val: '87', unit: '%', trend: '+12%' },
    cost: { val: '47,150', trend: '-2.8%' },
    roi: { val: '14.2', unit: '%', trend: '+0.5%' }
  })

  const handleAnalyze = () => {
    // Dynamic filter logic: adjust kpis and rows slightly to show action response
    if (assetFilter === 'Van Fleet') {
      setTelemetry(initialTelemetry.filter(t => t.id.includes('VAN')))
      setKpis({
        efficiency: { val: '10.0', unit: 'km/L', trend: '+1.5%' },
        utilization: { val: '76', unit: '%', trend: '-2.0%' },
        cost: { val: '18,400', trend: '-4.1%' },
        roi: { val: '12.8', unit: '%', trend: '+0.8%' }
      })
    } else if (assetFilter === 'Truck Group A') {
      setTelemetry(initialTelemetry.filter(t => t.id.includes('TRK') || t.id.includes('TRUCK')))
      setKpis({
        efficiency: { val: '7.3', unit: 'km/L', trend: '+2.8%' },
        utilization: { val: '93.5', unit: '%', trend: '+5.4%' },
        cost: { val: '102,500', trend: '+8.2%' },
        roi: { val: '13.9', unit: '%', trend: '-0.3%' }
      })
    } else {
      setTelemetry(initialTelemetry)
      setKpis({
        efficiency: { val: '8.4', unit: 'km/L', trend: '+4.2%' },
        utilization: { val: '87', unit: '%', trend: '+12%' },
        cost: { val: '47,150', trend: '-2.8%' },
        roi: { val: '14.2', unit: '%', trend: '+0.5%' }
      })
    }
  }

  return (
    <>
      {/* TOP NAV BAR */}
      <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/5 bg-white/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button className="md:hidden text-on-surface p-1 hover:bg-black/5 rounded" onClick={() => setIsMobileMenuOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-on-surface font-headline-sm">Reports &amp; Analytics</h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-black/5 transition-all relative">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error-red rounded-full"></span>
          </button>
          <div className="h-6 w-[1px] bg-outline-variant mx-2 hidden sm:block"></div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-on-surface-variant font-body-md">Operational Intelligence</p>
          </div>
        </div>
      </header>

      {/* CONTENT CANVAS */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
        {/* Header Description */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface font-headline-lg">Reports &amp; Analytics</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body-md">High-precision fleet metrics and operational intelligence.</p>
          </div>
          <button
            onClick={() => alert('Dataset exported successfully.')}
            className="bg-on-background text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Dataset
          </button>
        </div>

        {/* Analytics Filter Board */}
        <div className="bg-white p-5 rounded-2xl flex flex-wrap gap-4 items-end shadow-sm border border-black/[0.01] font-body-sm text-sm">
          <div className="flex-1 min-w-[150px] space-y-1">
            <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider font-label-sm">Timeframe</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-dashboard-canvas/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-success-green outline-none cursor-pointer"
            >
              <option>Last 30 Days</option>
              <option>Last 6 Months</option>
              <option>Year to Date</option>
            </select>
          </div>
          <div className="flex-1 min-w-[180px] space-y-1">
            <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider font-label-sm">Asset Group</label>
            <select
              value={assetFilter}
              onChange={(e) => setAssetFilter(e.target.value)}
              className="w-full bg-dashboard-canvas/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-success-green outline-none cursor-pointer"
            >
              <option>All Assets</option>
              <option>Van Fleet</option>
              <option>Truck Group A</option>
            </select>
          </div>
          <div className="flex-1 min-w-[180px] space-y-1">
            <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider font-label-sm">Metric Focus</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-dashboard-canvas/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-success-green outline-none cursor-pointer"
            >
              <option>Operational ROI</option>
              <option>Fuel Consumption</option>
              <option>Driver Safety Profiles</option>
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
          {/* KPI Card 1 */}
          <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-28 border-l-4 border-l-success-green">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Fuel Efficiency</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-on-surface">{kpis.efficiency.val}</span>
              <span className="text-xs text-on-surface-variant font-medium font-sans">{kpis.efficiency.unit}</span>
              <span className="text-success-green text-[10px] font-bold font-mono ml-auto">{kpis.efficiency.trend}</span>
            </div>
          </div>
          {/* KPI Card 2 */}
          <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-28 border-l-4 border-l-industrial-blue">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Asset Utilization</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-on-surface">{kpis.utilization.val}</span>
              <span className="text-xs text-on-surface-variant font-medium font-sans">{kpis.utilization.unit}</span>
              <span className="text-success-green text-[10px] font-bold font-mono ml-auto">{kpis.utilization.trend}</span>
            </div>
          </div>
          {/* KPI Card 3 */}
          <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-28 border-l-4 border-l-error-red">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Operational Cost (INR)</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-on-surface">₹ {kpis.cost.val}</span>
              <span className="text-success-green text-[10px] font-bold font-mono ml-auto">{kpis.cost.trend}</span>
            </div>
          </div>
          {/* KPI Card 4 */}
          <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-28 border-l-4 border-l-success-green">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Net Margin / ROI</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold font-mono text-on-surface">{kpis.roi.val}</span>
              <span className="text-xs text-on-surface-variant font-medium font-sans">{kpis.roi.unit}</span>
              <span className="text-success-green text-[10px] font-bold font-mono ml-auto">{kpis.roi.trend}</span>
            </div>
          </div>
        </div>

        {/* Charts & Table Columns split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Analytics Chart Block (Left 7/12) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-black/5 shadow-sm min-h-[380px] flex flex-col justify-between">
            <div>
              <h4 className="text-base font-bold text-on-surface font-headline-sm">Performance Analysis</h4>
              <p className="text-xs text-on-surface-variant font-body-sm mt-0.5">Asset ROI comparison over selected timeframe</p>
            </div>
            
            {/* Visual chart mock */}
            <div className="flex-1 bg-dashboard-canvas/50 border border-black/5 rounded-2xl p-6 relative overflow-hidden flex items-end justify-between min-h-[220px] mt-6">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none opacity-40">
                <div className="border-b border-black/[0.05] w-full h-0"></div>
                <div className="border-b border-black/[0.05] w-full h-0"></div>
                <div className="border-b border-black/[0.05] w-full h-0"></div>
                <div className="border-b border-black/[0.05] w-full h-0"></div>
              </div>
              
              {/* Bars */}
              <div className="w-16 flex flex-col items-center gap-2 relative z-10">
                <span className="text-[10px] font-bold font-mono text-industrial-blue">18.4%</span>
                <div className="w-8 bg-industrial-blue rounded-t-lg transition-all duration-500 animate-grow-bar" style={{ height: '140px' }}></div>
                <span className="text-[10px] font-bold font-mono text-on-surface-variant">TR-02</span>
              </div>
              <div className="w-16 flex flex-col items-center gap-2 relative z-10">
                <span className="text-[10px] font-bold font-mono text-industrial-blue">15.2%</span>
                <div className="w-8 bg-industrial-blue rounded-t-lg transition-all duration-500 animate-grow-bar" style={{ height: '110px' }}></div>
                <span className="text-[10px] font-bold font-mono text-on-surface-variant">AC-05</span>
              </div>
              <div className="w-16 flex flex-col items-center gap-2 relative z-10">
                <span className="text-[10px] font-bold font-mono text-industrial-blue">12.8%</span>
                <div className="w-8 bg-industrial-blue rounded-t-lg transition-all duration-500 animate-grow-bar" style={{ height: '90px' }}></div>
                <span className="text-[10px] font-bold font-mono text-on-surface-variant">VN-05</span>
              </div>
              <div className="w-16 flex flex-col items-center gap-2 relative z-10">
                <span className="text-[10px] font-bold font-mono text-industrial-blue">9.4%</span>
                <div className="w-8 bg-industrial-blue/50 rounded-t-lg transition-all duration-500 animate-grow-bar" style={{ height: '70px' }}></div>
                <span className="text-[10px] font-bold font-mono text-on-surface-variant">TR-09</span>
              </div>
            </div>
          </div>

          {/* Efficiency list ranking (Right 5/12) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden flex flex-col min-h-[380px]">
            <div className="px-6 py-4 border-b border-black/5 bg-gray-50/50 flex justify-between items-center">
              <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider font-headline-sm">Efficiency Leaderboard</h4>
            </div>
            <div className="p-4 space-y-4 font-body-sm text-xs flex-1 flex flex-col justify-around">
              {telemetry.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-none last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-on-surface-variant font-mono w-4">#{idx+1}</span>
                    <div>
                      <span className="font-bold text-on-surface font-mono">{item.id}</span>
                      <p className="text-[10px] text-on-surface-variant mt-0.5 font-sans">Distance logged: {item.distance}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-success-green font-mono">{item.efficiency}</span>
                    <p className="text-[9px] text-on-surface-variant font-sans font-medium mt-0.5">Average Consumption</p>
                  </div>
                </div>
              ))}
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
                  <th className="px-6 py-3 font-bold border-b border-black/5 text-right">Avg efficiency</th>
                  <th className="px-6 py-3 font-bold border-b border-black/5 text-right">Utilization</th>
                  <th className="px-6 py-3 font-bold border-b border-black/5 text-right">Opex Cost</th>
                  <th className="px-6 py-3 font-bold border-b border-black/5 text-right">Revenue</th>
                  <th className="px-6 py-3 font-bold border-b border-black/5 text-right">Margin ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-mono font-medium text-on-surface">
                {telemetry.map(row => (
                  <tr key={row.id} className="hover:bg-blue-50/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-industrial-blue">{row.id}</td>
                    <td className="px-6 py-4 text-right">{row.fuel}</td>
                    <td className="px-6 py-4 text-right text-success-green font-bold">{row.efficiency}</td>
                    <td className="px-6 py-4 text-right">{row.utilization}</td>
                    <td className="px-6 py-4 text-right">₹ {row.cost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">₹ {row.revenue.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-industrial-blue font-bold">{row.roi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
