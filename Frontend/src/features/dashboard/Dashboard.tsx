import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Trip {
  id: string
  vehicle: string
  driver: string
  status: 'Dispatched' | 'Completed' | 'Draft'
  eta: string
}

export default function Dashboard() {
  const navigate = useNavigate()
  
  // Navigation active tab
  const [activeTab, setActiveTab] = useState('Dashboard')
  
  // Mobile sidebar drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Filters state
  const [vehicleType, setVehicleType] = useState('All Types')
  const [status, setStatus] = useState('All Statuses')
  const [region, setRegion] = useState('All Regions')

  // Sample data for trips matching Stitch screen content
  const initialTrips: Trip[] = [
    { id: 'TR001', vehicle: 'VAN-05', driver: 'Alex', status: 'Dispatched', eta: '45 min' },
    { id: 'TR002', vehicle: 'TRUCK-02', driver: 'John', status: 'Completed', eta: '—' },
    { id: 'TR003', vehicle: 'ACE-07', driver: 'Priya', status: 'Dispatched', eta: '1h 20m' },
    { id: 'TR004', vehicle: '—', driver: '—', status: 'Draft', eta: 'Awaiting vehicle' },
  ]
  
  const [trips, setTrips] = useState<Trip[]>(initialTrips)

  const handleFilterApply = () => {
    // Basic filter simulation
    let filtered = [...initialTrips]
    if (vehicleType !== 'All Types') {
      filtered = filtered.filter(t => t.vehicle.toLowerCase().includes(vehicleType.toLowerCase().slice(0, -1)))
    }
    if (status !== 'All Statuses') {
      filtered = filtered.filter(t => t.status === status)
    }
    setTrips(filtered)
  }

  const handleLogout = () => {
    navigate('/login')
  }

  const handleNavClick = (tabName: string) => {
    if (tabName === 'Dashboard') navigate('/dashboard')
    else if (tabName === 'Fleet') navigate('/fleet')
    else if (tabName === 'Trips') navigate('/trips')
    else if (tabName === 'Maintenance') navigate('/maintenance')
    else if (tabName === 'Fuel & Expenses') navigate('/expenses')
    else if (tabName === 'Analytics') navigate('/analytics')
    else if (tabName === 'Settings') navigate('/settings')
    else setActiveTab(tabName)
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
                onClick={() => setActiveTab('Role')}
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
                        setActiveTab(item.name)
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

      {/* MAIN CONTENT CANVAS (Inset) */}
      <main className="flex-1 bg-dashboard-canvas rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Nav inside Main Content */}
        <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/[0.03]">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-on-surface p-1 hover:bg-black/5 rounded" onClick={() => setIsMobileMenuOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-on-surface font-headline-sm">{activeTab}</h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-black/5 transition-all relative">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-error-red rounded-full border border-dashboard-canvas"></div>
            </button>
            <button className="p-2 rounded-full hover:bg-black/5 transition-all">
              <span className="material-symbols-outlined text-on-surface-variant">help_outline</span>
            </button>
            <div className="h-6 w-[1px] bg-outline-variant mx-2 hidden sm:block"></div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-on-surface-variant font-body-md uppercase tracking-wider">Fleet Management System</p>
            </div>
          </div>
        </header>

        {/* Main Scrollable Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
          
          {/* Filters Bar */}
          <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <p className="text-on-surface-variant text-sm font-body-md">Operational overview of your transport fleet</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="bg-white border-none rounded-xl px-3 py-2 text-sm min-w-[140px] focus:ring-2 focus:ring-success-green outline-none shadow-sm cursor-pointer"
                >
                  <option>All Types</option>
                  <option>Vans</option>
                  <option>Trucks</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="bg-white border-none rounded-xl px-3 py-2 text-sm min-w-[140px] focus:ring-2 focus:ring-success-green outline-none shadow-sm cursor-pointer"
                >
                  <option>All Statuses</option>
                  <option>Dispatched</option>
                  <option>Completed</option>
                  <option>Draft</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider">Region</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="bg-white border-none rounded-xl px-3 py-2 text-sm min-w-[140px] focus:ring-2 focus:ring-success-green outline-none shadow-sm cursor-pointer"
                >
                  <option>All Regions</option>
                  <option>North</option>
                  <option>South</option>
                </select>
              </div>
              <button
                onClick={handleFilterApply}
                className="bg-on-background text-white px-6 py-2 rounded-xl text-sm font-semibold mt-auto self-end flex items-center gap-2 hover:opacity-90 transition-all shadow-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Apply
              </button>
            </div>
          </section>

          {/* KPI Cards */}
          <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {/* Card 1 */}
            <div className="bg-white p-5 rounded-2xl flex flex-col gap-1 shadow-sm border border-transparent hover:border-success-green/30 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-on-background">local_shipping</span>
                <div className="w-2.5 h-2.5 rounded-full bg-success-green"></div>
              </div>
              <p className="text-[10px] text-on-surface-variant uppercase mt-3 font-bold tracking-wider font-label-sm">Active Vehicles</p>
              <p className="text-2xl font-bold font-mono">53</p>
            </div>
            {/* Card 2 */}
            <div className="bg-white p-5 rounded-2xl flex flex-col gap-1 shadow-sm border border-transparent hover:border-success-green/30 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-success-green">check_circle</span>
              </div>
              <p className="text-[10px] text-on-surface-variant uppercase mt-3 font-bold tracking-wider font-label-sm">Available</p>
              <p className="text-2xl font-bold font-mono">42</p>
            </div>
            {/* Card 3 */}
            <div className="bg-white p-5 rounded-2xl flex flex-col gap-1 shadow-sm border border-transparent hover:border-success-green/30 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-safety-orange">build</span>
                <div className="w-2.5 h-2.5 rounded-full bg-safety-orange"></div>
              </div>
              <p className="text-[10px] text-on-surface-variant uppercase mt-3 font-bold tracking-wider font-label-sm">In Maintenance</p>
              <p className="text-2xl font-bold font-mono">5</p>
            </div>
            {/* Card 4 */}
            <div className="bg-white p-5 rounded-2xl flex flex-col gap-1 shadow-sm border border-transparent hover:border-success-green/30 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-industrial-blue">trending_up</span>
              </div>
              <p className="text-[10px] text-on-surface-variant uppercase mt-3 font-bold tracking-wider font-label-sm">Active Trips</p>
              <p className="text-2xl font-bold font-mono">19</p>
            </div>
            {/* Card 5 */}
            <div className="bg-white p-5 rounded-2xl flex flex-col gap-1 shadow-sm border border-transparent hover:border-success-green/30 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-alert-yellow">schedule</span>
              </div>
              <p className="text-[10px] text-on-surface-variant uppercase mt-3 font-bold tracking-wider font-label-sm">Pending Trips</p>
              <p className="text-2xl font-bold font-mono">4</p>
            </div>
            {/* Card 6 */}
            <div className="bg-white p-5 rounded-2xl flex flex-col gap-1 shadow-sm border border-transparent hover:border-success-green/30 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-on-surface">badge</span>
              </div>
              <p className="text-[10px] text-on-surface-variant uppercase mt-3 font-bold tracking-wider font-label-sm">Drivers On Duty</p>
              <p className="text-2xl font-bold font-mono">26</p>
            </div>
            {/* Card 7 */}
            <div className="bg-white p-5 rounded-2xl flex flex-col gap-1 shadow-sm border border-transparent hover:border-success-green/30 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-on-background">pie_chart</span>
              </div>
              <p className="text-[10px] text-on-surface-variant uppercase mt-3 font-bold tracking-wider font-label-sm">Fleet Utilization</p>
              <p className="text-2xl font-bold font-mono">87%</p>
            </div>
          </section>

          {/* Operations Layout Grid */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left/Middle Column: Recent Trips Table */}
            <div className="xl:col-span-2 space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-bold text-on-surface font-headline-sm">Recent Trips</h3>
                <a className="text-on-surface-variant text-xs font-semibold hover:text-on-background flex items-center gap-1 transition-colors font-label-md" href="#">
                  View All Trips
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
              
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/[0.02]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-body-md">
                    <thead className="bg-white border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-5 font-bold text-on-surface-variant text-[11px] uppercase tracking-wider font-label-sm">Trip ID</th>
                        <th className="px-6 py-5 font-bold text-on-surface-variant text-[11px] uppercase tracking-wider font-label-sm">Vehicle</th>
                        <th className="px-6 py-5 font-bold text-on-surface-variant text-[11px] uppercase tracking-wider font-label-sm">Driver</th>
                        <th className="px-6 py-5 font-bold text-on-surface-variant text-[11px] uppercase tracking-wider font-label-sm">Status</th>
                        <th className="px-6 py-5 font-bold text-on-surface-variant text-[11px] uppercase tracking-wider font-label-sm">ETA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {trips.length > 0 ? (
                        trips.map(trip => (
                          <tr key={trip.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-5 font-mono font-medium">{trip.id}</td>
                            <td className="px-6 py-5">{trip.vehicle}</td>
                            <td className="px-6 py-5">{trip.driver}</td>
                            <td className="px-6 py-5">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                trip.status === 'Completed'
                                  ? 'bg-green-50 text-success-green'
                                  : trip.status === 'Dispatched'
                                    ? 'bg-blue-50 text-industrial-blue'
                                    : 'bg-gray-100 text-on-surface-variant'
                              }`}>
                                {trip.status}
                              </span>
                            </td>
                            <td className={`px-6 py-5 font-mono text-on-surface-variant ${trip.status === 'Draft' ? 'text-xs text-alert-yellow' : ''}`}>
                              {trip.eta}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant/50">
                            No trips matching filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Vehicle Status and Alerts */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-on-surface px-2 font-headline-sm">Vehicle Status</h3>
                <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
                  {/* Progress Bar 1 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-body-md">
                      <span className="font-semibold">Available</span>
                      <span className="font-bold font-mono">42 <span className="text-on-surface-variant text-[11px] font-normal">/ 68</span></span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-success-green h-full rounded-full transition-all duration-500" style={{ width: '61%' }}></div>
                    </div>
                  </div>
                  
                  {/* Progress Bar 2 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-body-md">
                      <span className="font-semibold">On Trip</span>
                      <span className="font-bold font-mono">19 <span className="text-on-surface-variant text-[11px] font-normal">/ 68</span></span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-industrial-blue h-full rounded-full transition-all duration-500" style={{ width: '28%' }}></div>
                    </div>
                  </div>

                  {/* Progress Bar 3 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-body-md">
                      <span className="font-semibold">In Shop</span>
                      <span className="font-bold font-mono">5 <span className="text-on-surface-variant text-[11px] font-normal">/ 68</span></span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-safety-orange h-full rounded-full transition-all duration-500" style={{ width: '8%' }}></div>
                    </div>
                  </div>

                  {/* Summary Block */}
                  <div className="rounded-xl bg-gray-50 p-4 flex items-center gap-4 border border-black/[0.01]">
                    <span className="material-symbols-outlined text-on-surface-variant/40 text-[24px]">analytics</span>
                    <p className="text-[11px] text-on-surface-variant leading-tight font-body-sm">Data updated in real-time. Next refresh in 45 seconds.</p>
                  </div>
                </div>
              </div>

              {/* Alerts Panel */}
              <div className="bg-white border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-on-surface-variant/20 text-[32px] mb-2">inbox</span>
                <h4 className="text-sm font-bold text-on-surface-variant/60">No Alerts</h4>
                <p className="text-[11px] text-on-surface-variant/40 mt-1">All fleet communication channels are currently clear.</p>
              </div>
            </div>
          </section>
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
          onClick={() => setActiveTab('Role')}
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
