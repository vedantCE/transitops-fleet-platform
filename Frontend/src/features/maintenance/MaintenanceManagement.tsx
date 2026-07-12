import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface MaintenanceRecord {
  id: string
  vehicleId: string
  vehicleType: string
  service: string
  cost: number
  date: string
  status: 'Active' | 'Completed'
}

export default function MaintenanceManagement() {
  const navigate = useNavigate()
  
  // Navigation active tab
  const [activeTab, setActiveTab] = useState('Maintenance')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Status Filter State
  const [statusFilter, setStatusFilter] = useState('All')

  // Mock list of maintenance records from Stitch mockup
  const initialRecords: MaintenanceRecord[] = [
    {
      id: 'MNT001',
      vehicleId: 'EV-TRAN-901',
      vehicleType: 'Electric Bus',
      service: 'Battery Diagnostics',
      cost: 450.0,
      date: '24 Oct 2023',
      status: 'Active',
    },
    {
      id: 'MNT002',
      vehicleId: 'SH-COMM-223',
      vehicleType: 'Shuttle',
      service: 'Tire Replacement',
      cost: 820.0,
      date: '23 Oct 2023',
      status: 'Completed',
    },
    {
      id: 'MNT003',
      vehicleId: 'EV-TRAN-904',
      vehicleType: 'Electric Bus',
      service: 'Brake System Flush',
      cost: 1200.0,
      date: '22 Oct 2023',
      status: 'Active',
    },
  ]

  const [records, setRecords] = useState<MaintenanceRecord[]>(initialRecords)

  // Log Service Record Form states
  const [vehicleId, setVehicleId] = useState('Select vehicle...')
  const [serviceType, setServiceType] = useState('Routine Checkup')
  const [serviceCost, setServiceCost] = useState('')
  const [serviceDate, setServiceDate] = useState('')
  const [notes, setNotes] = useState('')

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

  const handleLogServiceRecord = (e: React.FormEvent) => {
    e.preventDefault()

    if (vehicleId === 'Select vehicle...') {
      alert('Please select a valid vehicle.')
      return
    }

    const typeMapping: Record<string, string> = {
      'EV-TRAN-901': 'Electric Bus',
      'SH-COMM-223': 'Shuttle',
      'EV-TRAN-904': 'Electric Bus',
      'TR-HAUL-556': 'Maintenance Truck',
    }

    const costNum = serviceCost ? Number(serviceCost) : 0
    const formattedDate = serviceDate
      ? new Date(serviceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Today'

    const nextIdNum = records.length + 1
    const nextId = `MNT${String(nextIdNum).padStart(3, '0')}`

    const newRecord: MaintenanceRecord = {
      id: nextId,
      vehicleId,
      vehicleType: typeMapping[vehicleId] || 'Commercial Vehicle',
      service: serviceType,
      cost: costNum,
      date: formattedDate,
      status: 'Active',
    }

    setRecords([newRecord, ...records])

    // Reset Form
    setVehicleId('Select vehicle...')
    setServiceType('Routine Checkup')
    setServiceCost('')
    setServiceDate('')
    setNotes('')
  }

  const handleCloseMaintenance = (recordId: string) => {
    setRecords(
      records.map(r => {
        if (r.id === recordId) {
          return { ...r, status: 'Completed' }
        }
        return r
      })
    )
  }

  // Stats Counters
  const activeCount = records.filter(r => r.status === 'Active').length
  const completedCount = records.filter(r => r.status === 'Completed').length
  const totalCostVal = records.reduce((sum, r) => sum + r.cost, 0)

  // Filtered records
  const filteredRecords = records.filter(r => {
    if (statusFilter === 'All') return true
    return r.status === statusFilter
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
              <h2 className="text-lg font-bold text-on-surface font-headline-sm">Maintenance Management</h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-black/5 transition-all relative">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error-red rounded-full"></span>
            </button>
            <div className="h-6 w-[1px] bg-outline-variant mx-2 hidden sm:block"></div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-on-surface-variant font-body-md">Command Center</p>
            </div>
          </div>
        </header>

        {/* CONTENT CANVAS */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
          {/* Header Description & Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-on-surface font-headline-lg">Maintenance Management</h2>
              <div className="flex space-x-4 mt-2">
                <span className="flex items-center text-xs text-on-surface-variant">
                  <span className="w-2.5 h-2.5 rounded-full bg-safety-orange mr-2"></span>
                  Vehicles In Shop: <strong className="ml-1 text-on-surface font-mono">5</strong>
                </span>
                <span className="flex items-center text-xs text-on-surface-variant">
                  <span className="w-2.5 h-2.5 rounded-full bg-industrial-blue mr-2"></span>
                  Active Maintenance: <strong className="ml-1 text-on-surface font-mono">5</strong>
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => alert('Report exported.')}
                className="flex items-center px-4 py-2 bg-white border border-black/5 text-on-surface font-medium hover:bg-black/5 transition-colors rounded-xl text-xs cursor-pointer"
              >
                <span className="material-symbols-outlined mr-2 text-sm">download</span> Export Report
              </button>
              <button
                onClick={() => alert('Service scheduled.')}
                className="flex items-center px-4 py-2 bg-background text-white font-medium hover:opacity-90 transition-colors rounded-xl text-xs cursor-pointer"
              >
                <span className="material-symbols-outlined mr-2 text-sm">add</span> Schedule Service
              </button>
            </div>
          </div>

          {/* Columns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Log Service Record */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
              <h3 className="text-base font-bold text-on-surface mb-6 font-headline-sm">Log Service Record</h3>
              <form onSubmit={handleLogServiceRecord} className="space-y-4 font-body-sm text-sm">
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Vehicle ID / Name</label>
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none cursor-pointer"
                  >
                    <option>Select vehicle...</option>
                    <option>EV-TRAN-901</option>
                    <option>SH-COMM-223</option>
                    <option>EV-TRAN-904</option>
                    <option>TR-HAUL-556</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Service Type</label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none cursor-pointer"
                    >
                      <option>Routine Checkup</option>
                      <option>Battery Service</option>
                      <option>Brake Repair</option>
                      <option>Tire Rotation</option>
                      <option>System Diagnostic</option>
                    </select>
                  </div>
                  <div className="space-y-1 font-mono">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm font-sans">Service Cost ($)</label>
                    <input
                      value={serviceCost}
                      onChange={(e) => setServiceCost(e.target.value)}
                      className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none"
                      placeholder="0.00"
                      type="number"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Service Date</label>
                  <input
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none cursor-pointer"
                    type="date"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Maintenance Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none resize-none"
                    placeholder="Describe the service required or performed..."
                    rows={4}
                  />
                </div>
                <div className="bg-blue-50/50 border-l-4 border-industrial-blue p-4 rounded-xl">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-industrial-blue">info</span>
                    <div>
                      <p className="font-bold text-on-surface font-sans">Impact on Operations</p>
                      <p className="text-on-surface-variant text-xs mt-0.5 leading-relaxed font-body-sm">Adding this record will mark the vehicle as "Under Maintenance" and remove it from active routing.</p>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-background text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-background/25 cursor-pointer uppercase tracking-widest text-[10px]"
                >
                  Register Record
                </button>
              </form>
            </div>

            {/* Right Column: Service Summary & Logs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Quick Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-black/5 p-5 rounded-2xl shadow-sm">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Active</p>
                  <p className="text-2xl font-bold text-safety-orange mt-1 font-mono">{String(activeCount).padStart(2, '0')}</p>
                </div>
                <div className="bg-white border border-black/5 p-5 rounded-2xl shadow-sm">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Completed</p>
                  <p className="text-2xl font-bold text-success-green mt-1 font-mono">{String(completedCount).padStart(3, '0')}</p>
                </div>
                <div className="bg-white border border-black/5 p-5 rounded-2xl shadow-sm">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm font-sans">Total Cost (MTD)</p>
                  <p className="text-2xl font-bold text-on-surface mt-1 font-mono">${totalCostVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>

              {/* Service Logs Table Container */}
              <div className="bg-white rounded-2xl border border-black/5 shadow-sm flex flex-col min-h-[420px]">
                <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center">
                  <h4 className="text-base font-bold text-on-surface font-headline-sm">Service Log</h4>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs">filter_list</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="text-xs bg-dashboard-canvas/40 border border-black/5 rounded-lg pl-8 pr-4 py-1.5 focus:ring-1 focus:ring-industrial-blue outline-none cursor-pointer font-bold font-label-sm"
                    >
                      <option value="All">Status: All</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left text-sm font-body-md border-collapse">
                    <thead className="bg-dashboard-canvas text-on-surface-variant text-[11px] uppercase tracking-wider font-label-sm sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 font-bold">Vehicle</th>
                        <th className="px-6 py-4 font-bold">Service</th>
                        <th className="px-6 py-4 font-bold">Cost</th>
                        <th className="px-6 py-4 font-bold">Date</th>
                        <th className="px-6 py-4 font-bold text-center">Status</th>
                        <th className="px-6 py-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs font-mono font-medium text-on-surface">
                      {filteredRecords.map(record => (
                        <tr key={record.id} className="hover:bg-blue-50/10 transition-colors">
                          <td className="px-6 py-4 font-sans">
                            <div className="flex flex-col">
                              <span className="font-bold text-on-surface">{record.vehicleId}</span>
                              <span className="text-[10px] text-on-surface-variant mt-0.5">{record.vehicleType}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant font-sans">{record.service}</td>
                          <td className="px-6 py-4 font-bold text-on-surface">${record.cost.toFixed(2)}</td>
                          <td className="px-6 py-4 text-on-surface-variant">{record.date}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                              record.status === 'Completed'
                                ? 'bg-green-50 text-success-green border-success-green/10'
                                : 'bg-amber-50 text-safety-orange border-safety-orange/10'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-sans">
                            {record.status === 'Active' ? (
                              <button
                                onClick={() => handleCloseMaintenance(record.id)}
                                className="text-industrial-blue font-bold text-[10px] uppercase tracking-wider hover:underline cursor-pointer"
                              >
                                Close Maintenance
                              </button>
                            ) : (
                              <button className="text-on-surface-variant hover:text-industrial-blue cursor-pointer">
                                <span className="material-symbols-outlined text-sm">visibility</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Table Footer */}
                <div className="px-6 py-4 border-t border-black/5 flex justify-between items-center text-xs bg-gray-50/20 font-body-sm">
                  <p className="text-on-surface-variant">Showing {filteredRecords.length} of {records.length} records</p>
                  <div className="flex items-center gap-1.5">
                    <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-dashboard-canvas transition-colors disabled:opacity-30" disabled>
                      <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center bg-background text-white rounded-lg font-bold shadow-md">
                      1
                    </button>
                    <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-dashboard-canvas transition-colors disabled:opacity-30" disabled>
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </div>
                </div>
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
