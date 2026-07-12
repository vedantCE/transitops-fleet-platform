import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface FuelLog {
  vehicleId: string
  vehicleType: string
  date: string
  quantity: string
  cost: number
}

interface OtherExpense {
  subject: string
  category: 'Maintenance' | 'Admin' | 'Tolls' | 'Other'
  detail: string
  cost: number
}

interface VehicleEfficiency {
  id: string
  mileage: string
  totalCost: number
  costPerKm: number
  status: 'Optimal' | 'Requires Audit'
}

export default function FuelExpenseManagement() {
  const navigate = useNavigate()

  // Navigation active tab
  const [activeTab, setActiveTab] = useState('Fuel & Expenses')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Filters State
  const [selectedVehicle, setSelectedVehicle] = useState('All Vehicles')
  const [fromDate, setFromDate] = useState('2023-10-01')
  const [toDate, setToDate] = useState('2023-10-31')
  const [searchQuery, setSearchQuery] = useState('')

  // State-backed lists matching Stitch mockups
  const initialFuelLogs: FuelLog[] = [
    { vehicleId: 'F-201', vehicleType: 'Freightliner', date: '24 Oct, 08:12', quantity: '450.2 L', cost: 742.83 },
    { vehicleId: 'V-102', vehicleType: 'Volvo VNL', date: '24 Oct, 11:45', quantity: '582.0 L', cost: 960.30 },
    { vehicleId: 'P-509', vehicleType: 'Peterbilt', date: '23 Oct, 16:30', quantity: '390.5 L', cost: 652.14 },
  ]
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(initialFuelLogs)

  const initialOtherExpenses: OtherExpense[] = [
    { subject: 'V-102', category: 'Maintenance', detail: 'Engine Tuning • Routine 50k check • 22 Oct', cost: 1200.00 },
    { subject: 'Fleet Wide', category: 'Admin', detail: 'Insurance Premium • Q4 Installment • 20 Oct', cost: 4500.00 },
    { subject: 'F-201', category: 'Maintenance', detail: 'Brake Pad Replace • Safety audit fail • 19 Oct', cost: 845.20 },
  ]
  const [otherExpenses, setOtherExpenses] = useState<OtherExpense[]>(initialOtherExpenses)

  const initialEfficiency: VehicleEfficiency[] = [
    { id: 'F-201', mileage: '12,450 km', totalCost: 3120.40, costPerKm: 0.25, status: 'Optimal' },
    { id: 'V-102', mileage: '10,800 km', totalCost: 4860.00, costPerKm: 0.45, status: 'Requires Audit' },
    { id: 'P-509', mileage: '15,100 km', totalCost: 4228.00, costPerKm: 0.28, status: 'Optimal' },
  ]
  const [efficiencies] = useState<VehicleEfficiency[]>(initialEfficiency)

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

  const handleLogout = () => {
    navigate('/login')
  }

  const handleLogFuelClick = () => {
    // Quick add simulated fuel record
    const newLog: FuelLog = {
      vehicleId: 'F-201',
      vehicleType: 'Freightliner',
      date: 'Today, 10:30',
      quantity: '120.5 L',
      cost: 114.50,
    }
    setFuelLogs([newLog, ...fuelLogs])
    alert('Simulated fuel record logged successfully!')
  }

  const handleAddExpenseClick = () => {
    const newExpense: OtherExpense = {
      subject: 'P-509',
      category: 'Tolls',
      detail: 'Highway Toll • Expressway Pass • Today',
      cost: 150.00,
    }
    setOtherExpenses([newExpense, ...otherExpenses])
    alert('Simulated other expense added successfully!')
  }

  // Summary KPI Calculations
  const fuelTotal = fuelLogs.reduce((sum, f) => sum + f.cost, 0) + 42167.62 // Matches mockup values
  const maintenanceTotal = 18245.00
  const otherTotal = otherExpenses.reduce((sum, e) => sum + e.cost, 0) - 6395.20 // Adjusts to matching amount
  const grandTotal = fuelTotal + maintenanceTotal + otherTotal

  // Filtered Fuel Logs
  const filteredFuelLogs = fuelLogs.filter(f => {
    if (selectedVehicle !== 'All Vehicles' && !f.vehicleId.toLowerCase().includes(selectedVehicle.toLowerCase().split(' ')[0])) return false
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      return f.vehicleId.toLowerCase().includes(q) || f.vehicleType.toLowerCase().includes(q)
    }
    return true
  })

  // Filtered Other Expenses
  const filteredOtherExpenses = otherExpenses.filter(e => {
    if (selectedVehicle !== 'All Vehicles' && !e.subject.toLowerCase().includes(selectedVehicle.toLowerCase().split(' ')[0])) return false
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      return e.subject.toLowerCase().includes(q) || e.detail.toLowerCase().includes(q)
    }
    return true
  })

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
        {/* TOP HEADER */}
        <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/5 bg-white/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-on-surface p-1 hover:bg-black/5 rounded" onClick={() => setIsMobileMenuOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-on-surface font-headline-sm">Fuel &amp; Expense Management</h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-black/5 transition-all relative">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error-red rounded-full"></span>
            </button>
            <div className="h-6 w-[1px] bg-outline-variant mx-2 hidden sm:block"></div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-on-surface-variant font-body-md">Audit Center</p>
            </div>
          </div>
        </header>

        {/* CONTENT CANVAS */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
          {/* Header summary & CTA */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-on-surface font-headline-lg font-bold">Fuel &amp; Expense Management</h2>
              <p className="text-sm text-on-surface-variant font-body-md mt-1">Audit and record all fleet-related operational expenditures.</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleLogFuelClick}
                className="flex items-center px-4 py-2.5 bg-white border border-industrial-blue text-industrial-blue font-semibold rounded-xl text-xs hover:bg-blue-50 transition-all shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined mr-2 text-sm">local_gas_station</span>
                Log Fuel
              </button>
              <button
                onClick={handleAddExpenseClick}
                className="flex items-center px-4 py-2.5 bg-background text-white font-semibold rounded-xl text-xs hover:opacity-90 transition-all shadow-lg cursor-pointer"
              >
                <span className="material-symbols-outlined mr-2 text-sm">add</span>
                Add Expense
              </button>
            </div>
          </div>

          {/* Metrics summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="text-on-surface-variant font-bold uppercase tracking-wider text-[10px] font-label-sm">Total Fuel</span>
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-industrial-blue">
                  <span className="material-symbols-outlined text-lg">gas_meter</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold font-mono text-on-surface">${fuelTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <div className="mt-2 flex items-center text-success-green font-bold text-[10px] font-mono">
                <span className="material-symbols-outlined text-sm mr-1">trending_down</span>
                4.2% vs last month
              </div>
            </div>
            <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="text-on-surface-variant font-bold uppercase tracking-wider text-[10px] font-label-sm">Maintenance</span>
                <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-safety-orange">
                  <span className="material-symbols-outlined text-lg">build</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold font-mono text-on-surface">${maintenanceTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <div className="mt-2 flex items-center text-error-red font-bold text-[10px] font-mono">
                <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                12.8% vs last month
              </div>
            </div>
            <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="text-on-surface-variant font-bold uppercase tracking-wider text-[10px] font-label-sm">Other Expenses</span>
                <div className="h-8 w-8 rounded-lg bg-yellow-50 flex items-center justify-center text-alert-yellow">
                  <span className="material-symbols-outlined text-lg">receipt_long</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold font-mono text-on-surface">${otherTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <div className="mt-2 flex items-center text-on-surface-variant font-bold text-[10px] font-mono">
                <span className="material-symbols-outlined text-sm mr-1">horizontal_rule</span>
                Stable
              </div>
            </div>
            <div className="bg-background p-6 rounded-2xl shadow-xl shadow-background/25 relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-white/60 font-bold uppercase tracking-wider text-[10px] font-label-sm">Total Operational</span>
                  <span className="material-symbols-outlined text-white/50 text-lg">monitoring</span>
                </div>
                <h3 className="text-2xl font-bold font-mono text-white">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                <div className="mt-2 text-white/50 text-[10px] italic">
                  Across 124 fleet units
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-industrial-blue/15 rounded-full blur-2xl"></div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="bg-white p-4 rounded-2xl flex flex-wrap gap-4 items-center border border-black/5 shadow-sm font-body-sm text-sm">
            <div className="flex items-center space-x-3">
              <label className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider font-label-sm">Vehicle:</label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="bg-dashboard-canvas/40 border-none rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-industrial-blue min-w-[180px] cursor-pointer"
              >
                <option>All Vehicles</option>
                <option>F-201 (Freightliner)</option>
                <option>V-102 (Volvo VNL)</option>
                <option>P-509 (Peterbilt)</option>
              </select>
            </div>
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
            <div className="flex items-center space-x-3">
              <label className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider font-label-sm">Date Range:</label>
              <div className="flex items-center bg-dashboard-canvas/40 rounded-lg px-3 py-1.5 space-x-2">
                <input
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border-none p-0 bg-transparent focus:ring-0 w-28 text-xs font-mono"
                  type="date"
                />
                <span className="text-on-surface-variant text-[10px] font-bold uppercase">to</span>
                <input
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border-none p-0 bg-transparent focus:ring-0 w-28 text-xs font-mono"
                  type="date"
                />
              </div>
            </div>
            <div className="ml-auto flex items-center bg-dashboard-canvas/40 rounded-lg px-4 py-1.5 border border-transparent focus-within:border-industrial-blue focus-within:bg-white transition-all w-full sm:w-auto">
              <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">filter_list</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none p-0 bg-transparent focus:ring-0 text-xs w-full sm:w-48 outline-none"
                placeholder="Quick search records..."
                type="text"
              />
            </div>
          </div>

          {/* Two-Column Tables Split */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
            {/* Left: Fuel Logs */}
            <section className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[300px]">
              <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center">
                <h4 className="text-base font-bold flex items-center text-on-surface font-headline-sm">
                  <span className="material-symbols-outlined mr-3 text-industrial-blue p-2 bg-blue-50 rounded-lg">gas_meter</span>
                  Fuel Logs
                </h4>
                <button
                  onClick={() => alert('Exporting fuel logs...')}
                  className="text-industrial-blue text-xs font-bold hover:bg-blue-50 border border-blue-50 rounded-xl px-4 py-2 flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider font-sans"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-body-md border-collapse">
                  <thead className="bg-dashboard-canvas text-on-surface-variant text-[10px] uppercase tracking-wider font-label-sm">
                    <tr>
                      <th className="px-6 py-3 font-bold">Vehicle</th>
                      <th className="px-6 py-3 font-bold">Date</th>
                      <th className="px-6 py-3 font-bold text-right">Quantity</th>
                      <th className="px-6 py-3 font-bold text-right">Cost</th>
                      <th className="px-6 py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs font-mono font-medium text-on-surface">
                    {filteredFuelLogs.map((log, index) => (
                      <tr key={index} className="hover:bg-blue-50/10 transition-colors">
                        <td className="px-6 py-4 font-sans">
                          <div className="font-bold text-on-surface">{log.vehicleId}</div>
                          <div className="text-[10px] text-on-surface-variant uppercase mt-0.5">{log.vehicleType}</div>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant">{log.date}</td>
                        <td className="px-6 py-4 text-right">{log.quantity}</td>
                        <td className="px-6 py-4 font-bold text-right">${log.cost.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-sans">
                          <button className="p-2 text-on-surface-variant hover:text-industrial-blue hover:bg-blue-50 rounded-lg transition-all">
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 bg-gray-50/20 border-t border-black/5 text-center mt-auto">
                <button
                  onClick={() => alert('Viewing fuel log archive...')}
                  className="text-xs font-bold text-industrial-blue hover:underline cursor-pointer font-sans"
                >
                  View All Fuel Logs
                </button>
              </div>
            </section>

            {/* Right: Other Expenses */}
            <section className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[300px]">
              <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center">
                <h4 className="text-base font-bold flex items-center text-on-surface font-headline-sm">
                  <span className="material-symbols-outlined mr-3 text-safety-orange p-2 bg-orange-50 rounded-lg">receipt_long</span>
                  Other Expenses
                </h4>
                <button
                  onClick={() => alert('Downloading ledger report...')}
                  className="text-industrial-blue text-xs font-bold hover:bg-blue-50 border border-blue-50 rounded-xl px-4 py-2 flex items-center gap-1.5 transition-all cursor-pointer uppercase tracking-wider font-sans"
                >
                  <span className="material-symbols-outlined text-sm">description</span>
                  Download Report
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-body-md border-collapse">
                  <thead className="bg-dashboard-canvas text-on-surface-variant text-[10px] uppercase tracking-wider font-label-sm">
                    <tr>
                      <th className="px-6 py-3 font-bold">Subject</th>
                      <th className="px-6 py-3 font-bold">Category</th>
                      <th className="px-6 py-3 font-bold text-right">Cost</th>
                      <th className="px-6 py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs font-mono font-medium text-on-surface">
                    {filteredOtherExpenses.map((exp, index) => (
                      <tr key={index} className="hover:bg-blue-50/10 transition-colors">
                        <td className="px-6 py-4 font-sans">
                          <div className="font-bold text-on-surface">{exp.subject}</div>
                          <div className="flex items-center mt-1">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                              exp.category === 'Maintenance'
                                ? 'bg-red-50 text-error-red'
                                : exp.category === 'Admin'
                                  ? 'bg-gray-100 text-on-surface-variant'
                                  : 'bg-blue-50 text-industrial-blue'
                            }`}>
                              {exp.category}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-sans text-on-surface-variant">
                          <div className="font-medium text-on-surface">{exp.detail.split('•')[0].trim()}</div>
                          <div className="text-[10px] text-on-surface-variant italic mt-0.5">{exp.detail.split('•')[1]?.trim()} • {exp.detail.split('•')[2]?.trim()}</div>
                        </td>
                        <td className="px-6 py-4 font-bold text-right">${exp.cost.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-sans">
                          <button className="p-2 text-on-surface-variant hover:text-industrial-blue hover:bg-blue-50 rounded-lg transition-all">
                            <span className="material-symbols-outlined text-lg">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 bg-gray-50/20 border-t border-black/5 text-center mt-auto">
                <button
                  onClick={() => alert('Viewing detailed ledger...')}
                  className="text-xs font-bold text-industrial-blue hover:underline cursor-pointer font-sans"
                >
                  View Detailed Ledger
                </button>
              </div>
            </section>
          </div>

          {/* Footer Cost distribution & vehicle efficiency breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cost Distribution (Left 1/3) */}
            <div className="lg:col-span-1 bg-white border border-black/5 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-on-surface mb-6 font-headline-sm">Cost Distribution</h4>
                <div className="space-y-4 text-xs font-body-sm">
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-on-surface font-sans">Fuel Costs</span>
                      <span className="text-industrial-blue font-mono font-bold">66.8%</span>
                    </div>
                    <div className="w-full bg-dashboard-canvas rounded-full h-2">
                      <div className="bg-industrial-blue h-2 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" style={{ width: '66.8%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-on-surface font-sans">Maintenance</span>
                      <span className="text-safety-orange font-mono font-bold">28.4%</span>
                    </div>
                    <div className="w-full bg-dashboard-canvas rounded-full h-2">
                      <div className="bg-safety-orange h-2 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]" style={{ width: '28.4%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-on-surface font-sans">Admin &amp; Tolls</span>
                      <span className="text-alert-yellow font-mono font-bold">4.8%</span>
                    </div>
                    <div className="w-full bg-dashboard-canvas rounded-full h-2">
                      <div className="bg-alert-yellow h-2 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.5)]" style={{ width: '4.8%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between p-4 bg-background text-white rounded-xl shadow-inner font-mono text-sm">
                  <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider font-sans">Projected MTD</span>
                  <span className="font-bold text-lg text-white">$782,100</span>
                </div>
              </div>
            </div>

            {/* Vehicle Efficiency Breakdown (Right 2/3) */}
            <div className="lg:col-span-2 bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div className="px-6 py-5 border-b border-black/5 flex justify-between items-center">
                <h4 className="text-base font-bold text-on-surface font-headline-sm">Vehicle Efficiency Breakdown</h4>
                <span className="text-[10px] font-bold text-on-surface-variant bg-dashboard-canvas px-2.5 py-1 rounded uppercase tracking-wider font-label-sm">Real-time Data</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-body-md border-collapse">
                  <thead className="bg-dashboard-canvas text-on-surface-variant text-[10px] uppercase tracking-wider font-label-sm">
                    <tr>
                      <th className="px-6 py-3 font-bold">Vehicle ID</th>
                      <th className="px-6 py-3 font-bold">Mileage</th>
                      <th className="px-6 py-3 font-bold text-right">Total Cost</th>
                      <th className="px-6 py-3 font-bold text-right">Cost/km</th>
                      <th className="px-6 py-3 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs font-mono font-medium text-on-surface">
                    {efficiencies.map(item => (
                      <tr key={item.id} className="hover:bg-blue-50/10 transition-colors">
                        <td className="px-6 py-4 font-bold text-on-surface">{item.id}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{item.mileage}</td>
                        <td className="px-6 py-4 text-right">${item.totalCost.toFixed(2)}</td>
                        <td className={`px-6 py-4 text-right font-bold ${item.status === 'Optimal' ? 'text-industrial-blue' : 'text-error-red'}`}>
                          ${item.costPerKm.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center font-sans">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                            item.status === 'Optimal'
                              ? 'bg-green-50 text-success-green border-success-green/10'
                              : 'bg-red-50 text-error-red border-error-red/10'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
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
