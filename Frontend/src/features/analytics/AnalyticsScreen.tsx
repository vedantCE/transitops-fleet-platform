import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate()
  
  // Navigation active tab
  const [activeTab, setActiveTab] = useState('Analytics')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  const handleNavClick = (tabName: string) => {
    if (tabName === 'Dashboard') navigate('/dashboard')
    else if (tabName === 'Fleet') navigate('/fleet')
    else if (tabName === 'Drivers') navigate('/dashboard') // Placeholder if needed
    else if (tabName === 'Trips') navigate('/trips')
    else if (tabName === 'Maintenance') navigate('/maintenance')
    else if (tabName === 'Fuel & Expenses') navigate('/expenses')
    else if (tabName === 'Analytics') navigate('/analytics')
    else if (tabName === 'Settings') navigate('/settings')
    else setActiveTab(tabName)
  }

  const handleLogout = () => {
    navigate('/login')
  }

  const navItemsOperations = [
    { name: 'Dashboard', icon: 'dashboard' },
    { name: 'Fleet', icon: 'directions_bus' },
    { name: 'Drivers', icon: 'person' },
    { name: 'Trips', icon: 'route' },
  ]

  const navItemsManagement = [
    { name: 'Analytics', icon: 'leaderboard' },
    { name: 'Maintenance', icon: 'build' },
    { name: 'Fuel & Expenses', icon: 'local_gas_station' },
    { name: 'Settings', icon: 'settings' },
  ]

  return (
    <div className="bg-background text-on-surface h-screen w-full flex overflow-hidden font-sans p-2 md:p-4 gap-4">
      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="w-64 flex flex-col py-6 z-40 hidden md:flex shrink-0">
        <div className="px-6 mb-2">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">TRANSITOPS</p>
        </div>
        <div className="px-6 mb-8 flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-white">rocket_launch</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">TransitOps</h1>
            <p className="text-white/60 text-[10px] uppercase tracking-widest mt-1">Global Command</p>
          </div>
        </div>

        <div className="px-4 mb-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[20px]">search</span>
            <input
              className="w-full bg-white/10 border-none rounded-full px-10 py-2 text-sm text-white placeholder-white/40 focus:ring-1 focus:ring-white/20 outline-none"
              placeholder="Search..."
              type="text"
            />
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {/* OPERATIONS SECTION */}
          <div className="px-4 py-2">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">OPERATIONS</p>
            <div className="space-y-1">
              {navItemsOperations.map(item => (
                <button
                  key={item.name}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm text-left ${
                    activeTab === item.name
                      ? 'text-white bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => handleNavClick(item.name)}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* MANAGEMENT SECTION */}
          <div className="px-4 py-4">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">MANAGEMENT</p>
            <div className="space-y-1">
              {navItemsManagement.map(item => (
                <button
                  key={item.name}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm text-left ${
                    activeTab === item.name
                      ? 'text-white bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => handleNavClick(item.name)}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* USER PROFILE SECTION */}
          <div className="px-4 py-2">
            <div className="h-[1px] bg-white/10 w-full mb-6"></div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">USER PROFILE</p>
            <div className="space-y-1">
              <button
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm text-left ${
                  activeTab === 'Role' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => handleNavClick('Role')}
              >
                <span className="material-symbols-outlined text-[20px]">account_circle</span>
                Fleet Manager
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium text-sm text-left"
                onClick={handleLogout}
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Logout
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 md:hidden flex" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="w-64 bg-background h-full flex flex-col py-6 animate-slide-in-right" onClick={e => e.stopPropagation()}>
            <div className="px-6 mb-4 flex justify-between items-center">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">TRANSITOPS</p>
              <button className="text-white" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="px-6 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                <span className="material-symbols-outlined text-white">rocket_launch</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-none">TransitOps</h1>
                <p className="text-white/60 text-[10px] uppercase tracking-widest mt-1">Global Command</p>
              </div>
            </div>

            <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
              <div className="px-4 py-2">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">OPERATIONS</p>
                <div className="space-y-1">
                  {navItemsOperations.map(item => (
                    <button
                      key={item.name}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm text-left ${
                        activeTab === item.name
                          ? 'text-white bg-white/10'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                      onClick={() => {
                        handleNavClick(item.name)
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 py-4">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">MANAGEMENT</p>
                <div className="space-y-1">
                  {navItemsManagement.map(item => (
                    <button
                      key={item.name}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm text-left ${
                        activeTab === item.name
                          ? 'text-white bg-white/10'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                      onClick={() => {
                        handleNavClick(item.name)
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 py-2">
                <div className="h-[1px] bg-white/10 w-full mb-6"></div>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all font-medium text-sm text-left"
                  onClick={handleLogout}
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Logout
                </button>
              </div>
            </nav>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT CANVAS */}
      <main className="flex-1 bg-dashboard-canvas rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
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

          {/* Filter Row */}
          <div className="bg-white p-5 rounded-2xl flex flex-wrap gap-4 items-end shadow-sm border border-black/[0.01]">
            <div className="flex-1 min-w-[180px] space-y-1">
              <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider font-label-sm">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full bg-dashboard-canvas/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-industrial-blue/30 outline-none cursor-pointer"
              >
                <option>Last 6 Months</option>
                <option>Last 30 Days</option>
                <option>Year to Date</option>
              </select>
            </div>
            <div className="flex-1 min-w-[180px] space-y-1">
              <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider font-label-sm">Vehicle Fleet</label>
              <select
                value={assetFilter}
                onChange={(e) => setAssetFilter(e.target.value)}
                className="w-full bg-dashboard-canvas/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-industrial-blue/30 outline-none cursor-pointer"
              >
                <option>All Assets</option>
                <option>Truck Group A</option>
                <option>Van Fleet</option>
              </select>
            </div>
            <div className="flex-1 min-w-[180px] space-y-1">
              <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider font-label-sm">Metric Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-dashboard-canvas/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-industrial-blue/30 outline-none cursor-pointer"
              >
                <option>Operational ROI</option>
                <option>Fuel Efficiency</option>
                <option>Maintenance Burden</option>
              </select>
            </div>
            <button
              onClick={handleAnalyze}
              className="bg-industrial-blue text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-industrial-blue/20 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">query_stats</span>
              Analyze
            </button>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* KPI 1 */}
            <div className="bg-white p-6 rounded-2xl border border-black/5 relative overflow-hidden group hover:border-industrial-blue/40 transition-all shadow-sm">
              <div className="absolute top-4 right-4 text-industrial-blue/10 group-hover:text-industrial-blue/20 transition-colors">
                <span className="material-symbols-outlined text-4xl">local_gas_station</span>
              </div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-2 font-label-sm">Fuel Efficiency</p>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold text-on-surface font-headline-lg">{kpis.efficiency.val} <span className="text-xs font-normal text-on-surface-variant font-body-sm">{kpis.efficiency.unit}</span></h3>
                <span className="text-success-green flex items-center text-xs font-bold font-mono mb-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span> {kpis.efficiency.trend}
                </span>
              </div>
              <div className="mt-4 h-1 w-full bg-dashboard-canvas rounded-full overflow-hidden">
                <div className="h-full bg-industrial-blue" style={{ width: '72%' }}></div>
              </div>
            </div>
            {/* KPI 2 */}
            <div className="bg-white p-6 rounded-2xl border border-black/5 relative overflow-hidden group hover:border-industrial-blue/40 transition-all shadow-sm">
              <div className="absolute top-4 right-4 text-industrial-blue/10 group-hover:text-industrial-blue/20 transition-colors">
                <span className="material-symbols-outlined text-4xl">electric_car</span>
              </div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-2 font-label-sm">Fleet Utilization</p>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold text-on-surface font-headline-lg">{kpis.utilization.val} <span className="text-xs font-normal text-on-surface-variant font-body-sm">{kpis.utilization.unit}</span></h3>
                <span className="text-success-green flex items-center text-xs font-bold font-mono mb-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span> {kpis.utilization.trend}
                </span>
              </div>
              <div className="mt-4 h-1 w-full bg-dashboard-canvas rounded-full overflow-hidden">
                <div className="h-full bg-industrial-blue" style={{ width: `${kpis.utilization.val}%` }}></div>
              </div>
            </div>
            {/* KPI 3 */}
            <div className="bg-white p-6 rounded-2xl border border-black/5 relative overflow-hidden group hover:border-industrial-blue/40 transition-all shadow-sm">
              <div className="absolute top-4 right-4 text-industrial-blue/10 group-hover:text-industrial-blue/20 transition-colors">
                <span className="material-symbols-outlined text-4xl">payments</span>
              </div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-2 font-label-sm">Operational Cost</p>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold text-on-surface font-headline-lg">₹{kpis.cost.val}</h3>
                <span className="text-error-red flex items-center text-xs font-bold font-mono mb-1">
                  <span className="material-symbols-outlined text-sm">trending_down</span> {kpis.cost.trend}
                </span>
              </div>
              <div className="mt-4 h-1 w-full bg-dashboard-canvas rounded-full overflow-hidden">
                <div className="h-full bg-industrial-blue" style={{ width: '55%' }}></div>
              </div>
            </div>
            {/* KPI 4 */}
            <div className="bg-white p-6 rounded-2xl border border-black/5 relative overflow-hidden group hover:border-industrial-blue/40 transition-all shadow-sm">
              <div className="absolute top-4 right-4 text-industrial-blue/10 group-hover:text-industrial-blue/20 transition-colors">
                <span className="material-symbols-outlined text-4xl">account_balance</span>
              </div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-2 font-label-sm">Vehicle ROI</p>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold text-on-surface font-headline-lg">{kpis.roi.val} <span className="text-xs font-normal text-on-surface-variant font-body-sm">{kpis.roi.unit}</span></h3>
                <span className="text-success-green flex items-center text-xs font-bold font-mono mb-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span> {kpis.roi.trend}
                </span>
              </div>
              <div className="mt-4 h-1 w-full bg-dashboard-canvas rounded-full overflow-hidden">
                <div className="h-full bg-industrial-blue" style={{ width: '44%' }}></div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Bar Chart: Monthly Revenue */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-base font-bold text-on-surface font-headline-sm">Monthly Revenue Trend</h4>
                  <p className="text-xs text-on-surface-variant font-body-sm">Performance analysis across H1 2026</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant font-label-sm uppercase">
                  <span className="w-2.5 h-2.5 bg-industrial-blue rounded-sm"></span> Revenue (INR)
                </div>
              </div>
              {/* CSS/SVG Bar Chart */}
              <div className="h-64 flex items-end justify-between gap-6 px-4 pt-4">
                {[
                  { name: 'Jan', val: '45%' },
                  { name: 'Feb', val: '58%' },
                  { name: 'Mar', val: '62%' },
                  { name: 'Apr', val: '80%' },
                  { name: 'May', val: '92%' },
                  { name: 'Jun', val: '100%' }
                ].map(bar => (
                  <div key={bar.name} className="flex-1 flex flex-col items-center group">
                    <div
                      className="w-full bg-dashboard-canvas rounded-t-lg hover:bg-industrial-blue/40 transition-all duration-500 ease-out"
                      style={{ height: bar.val }}
                    ></div>
                    <span className="mt-3 text-[10px] font-bold text-on-surface-variant font-label-sm uppercase">{bar.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Outliers Progress bars */}
            <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-6">
              <div>
                <h4 className="text-base font-bold text-on-surface font-headline-sm">Cost Outliers</h4>
                <p className="text-xs text-on-surface-variant font-body-sm">Highest maintenance impact this month</p>
              </div>
              <div className="space-y-6">
                {[
                  { id: 'TRUCK-02', amt: '₹12,400', pct: '95%', color: 'bg-error-red' },
                  { id: 'ACE-05', amt: '₹9,800', pct: '78%', color: 'bg-safety-orange' },
                  { id: 'VAN-05', amt: '₹8,150', pct: '65%', color: 'bg-alert-yellow' },
                  { id: 'TRK-09', amt: '₹7,900', pct: '62%', color: 'bg-industrial-blue' }
                ].map(item => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold font-mono">
                      <span className="text-on-surface">{item.id}</span>
                      <span className="text-on-surface-variant">{item.amt}</span>
                    </div>
                    <div className="h-2 bg-dashboard-canvas rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: item.pct }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Telemetry Data Table */}
          <div className="bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm">
            <div className="px-6 py-5 border-b border-black/5 flex justify-between items-center">
              <div>
                <h4 className="text-base font-bold text-on-surface font-headline-sm">Detailed Asset Performance</h4>
                <p className="text-xs text-on-surface-variant font-body-sm">Live operational telemetry feed</p>
              </div>
              <span className="text-[10px] font-bold text-industrial-blue bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider font-label-sm">4 Assets Tracked</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-body-md">
                <thead className="bg-dashboard-canvas text-on-surface-variant text-[11px] uppercase tracking-wider font-label-sm">
                  <tr>
                    <th className="px-6 py-4 font-bold">Asset ID</th>
                    <th className="px-6 py-4 text-right font-bold">Distance</th>
                    <th className="px-6 py-4 text-right font-bold">Fuel (L)</th>
                    <th className="px-6 py-4 text-right font-bold">Efficiency</th>
                    <th className="px-6 py-4 text-right font-bold">Utilization</th>
                    <th className="px-6 py-4 text-right font-bold">Op. Cost</th>
                    <th className="px-6 py-4 text-right font-bold">Revenue</th>
                    <th className="px-6 py-4 text-right font-bold">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-mono text-on-surface">
                  {telemetry.map(t => (
                    <tr key={t.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-industrial-blue">{t.id}</td>
                      <td className="px-6 py-4 text-right">{t.distance}</td>
                      <td className="px-6 py-4 text-right">{t.fuel}</td>
                      <td className="px-6 py-4 text-right">{t.efficiency}</td>
                      <td className="px-6 py-4 text-right">{t.utilization}</td>
                      <td className="px-6 py-4 text-right font-bold text-error-red">₹{t.cost.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">₹{t.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-bold text-success-green">{t.roi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost Breakdown & deployment grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cost Breakdown Circular bar */}
            <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-6">
              <h4 className="text-base font-bold text-on-surface font-headline-sm">Operational Cost Breakdown</h4>
              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Simple SVG pie outline */}
                <div className="w-40 h-40 relative flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-dashboard-canvas" cx="80" cy="80" fill="transparent" r="60" stroke="currentColor" strokeWidth="16"></circle>
                    <circle className="text-industrial-blue" cx="80" cy="80" fill="transparent" r="60" stroke="currentColor" strokeDasharray="376" strokeDashoffset="105" strokeLinecap="round" strokeWidth="16"></circle>
                    <circle className="text-on-background" cx="80" cy="80" fill="transparent" r="60" stroke="currentColor" strokeDasharray="376" strokeDashoffset="300" strokeLinecap="round" strokeWidth="16"></circle>
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-on-surface">72%</span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Fuel</span>
                  </div>
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold font-body-sm">
                      <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-industrial-blue rounded-full"></span> Fuel Expenses</span>
                      <span className="text-on-surface">₹34,000</span>
                    </div>
                    <div className="h-1 bg-dashboard-canvas rounded-full"><div className="h-full bg-industrial-blue rounded-full" style={{ width: '72%' }}></div></div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold font-body-sm">
                      <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-on-background rounded-full"></span> Maintenance</span>
                      <span className="text-on-surface">₹8,400</span>
                    </div>
                    <div className="h-1 bg-dashboard-canvas rounded-full"><div className="h-full bg-on-background rounded-full" style={{ width: '18%' }}></div></div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold font-body-sm">
                      <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-gray-400 rounded-full"></span> Logistics</span>
                      <span className="text-on-surface">₹4,700</span>
                    </div>
                    <div className="h-1 bg-dashboard-canvas rounded-full"><div className="h-full bg-gray-400 rounded-full" style={{ width: '10%' }}></div></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Deployment Status Grid */}
            <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-6">
              <h4 className="text-base font-bold text-on-surface font-headline-sm">Fleet Deployment Status</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-dashboard-canvas/40 border border-black/5 rounded-xl flex items-center gap-4 hover:border-success-green/30 transition-all cursor-pointer">
                  <div className="w-10 h-10 bg-success-green/10 text-success-green rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold font-mono text-on-surface">112</p>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Available</p>
                  </div>
                </div>
                <div className="p-4 bg-dashboard-canvas/40 border border-black/5 rounded-xl flex items-center gap-4 hover:border-industrial-blue/30 transition-all cursor-pointer">
                  <div className="w-10 h-10 bg-industrial-blue/10 text-industrial-blue rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined">local_shipping</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold font-mono text-on-surface">34</p>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">On Route</p>
                  </div>
                </div>
                <div className="p-4 bg-dashboard-canvas/40 border border-black/5 rounded-xl flex items-center gap-4 hover:border-alert-yellow/30 transition-all cursor-pointer">
                  <div className="w-10 h-10 bg-alert-yellow/10 text-alert-yellow rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined">settings_suggest</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold font-mono text-on-surface">8</p>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Maintenance</p>
                  </div>
                </div>
                <div className="p-4 bg-dashboard-canvas/40 border border-black/5 rounded-xl flex items-center gap-4 hover:border-error-red/30 transition-all cursor-pointer">
                  <div className="w-10 h-10 bg-error-red/10 text-error-red rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined">cancel</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold font-mono text-on-surface">2</p>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Retired</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Advisory Footer */}
          <footer className="bg-background p-6 rounded-2xl text-white border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <span className="material-symbols-outlined text-[100px]">query_stats</span>
            </div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <span className="material-symbols-outlined text-industrial-blue">insights</span>
              <h5 className="font-bold uppercase tracking-[0.2em] text-xs text-industrial-blue font-label-sm">Operational Intelligence Summary</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 text-xs">
              <div className="border-l-4 border-success-green pl-4">
                <p className="text-[10px] font-bold text-success-green mb-1 uppercase tracking-wider font-label-sm">Top Performance</p>
                <p className="text-white/70 leading-relaxed font-body-sm">Vehicle <span className="font-bold text-white">TRUCK-02</span> achieved peak ROI of 18.4% this period with 92% utilization.</p>
              </div>
              <div className="border-l-4 border-error-red pl-4">
                <p className="text-[10px] font-bold text-error-red mb-1 uppercase tracking-wider font-label-sm">Critical Cost Alert</p>
                <p className="text-white/70 leading-relaxed font-body-sm">Maintenance costs for <span className="font-bold text-white">ACE-05</span> have surged by 15% following engine refurbishment.</p>
              </div>
              <div className="border-l-4 border-industrial-blue pl-4">
                <p className="text-[10px] font-bold text-industrial-blue mb-1 uppercase tracking-wider font-label-sm">Fleet Advisory</p>
                <p className="text-white/70 leading-relaxed font-body-sm">Current efficiency metrics suggest decommissioning <span className="font-bold text-white">VAN-08</span> within next 90 days.</p>
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-white shadow-2xl rounded-2xl flex items-center justify-around z-40 border border-black/[0.02]">
        <button
          onClick={() => handleNavClick('Dashboard')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'Dashboard' ? 'text-on-background' : 'text-on-surface-variant/50'
          }`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold uppercase">Home</span>
        </button>
        <button
          onClick={() => handleNavClick('Fleet')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'Fleet' ? 'text-on-background' : 'text-on-surface-variant/50'
          }`}
        >
          <span className="material-symbols-outlined">directions_bus</span>
          <span className="text-[10px] font-bold uppercase">Fleet</span>
        </button>
        <button
          onClick={() => handleNavClick('Trips')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'Trips' ? 'text-on-background' : 'text-on-surface-variant/50'
          }`}
        >
          <span className="material-symbols-outlined">route</span>
          <span className="text-[10px] font-bold uppercase">Trips</span>
        </button>
        <button
          onClick={() => handleNavClick('Role')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'Role' ? 'text-on-background' : 'text-on-surface-variant/50'
          }`}
        >
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[10px] font-bold uppercase">Profile</span>
        </button>
      </nav>
    </div>
  )
}
