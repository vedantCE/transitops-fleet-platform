import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Vehicle {
  registrationNumber: string
  vehicleId: string
  model: string
  type: string
  capacity: string
  odometer: string
  cost: string
  status: 'Available' | 'On Trip' | 'In Shop' | 'Retired'
}

export default function FleetRegistry() {
  const navigate = useNavigate()
  
  // Navigation active tab
  const [activeTab, setActiveTab] = useState('Fleet')
  
  // Mobile sidebar drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Fleet drawer open/close
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All Types')
  const [statusFilter, setStatusFilter] = useState('All Status')

  // Mock list of vehicles matching Stitch mockup
  const initialVehicles: Vehicle[] = [
    {
      registrationNumber: 'GJ05AB1234',
      vehicleId: 'VAN-05',
      model: 'Tata Winger',
      type: 'Van',
      capacity: '500 kg',
      odometer: '74,000 km',
      cost: '₹4,00,000',
      status: 'Available',
    },
    {
      registrationNumber: 'GJ05CD5678',
      vehicleId: 'TRUCK-02',
      model: 'Tata Prima',
      type: 'Truck',
      capacity: '5,000 kg',
      odometer: '112,000 km',
      cost: '₹20,00,000',
      status: 'On Trip',
    },
    {
      registrationNumber: 'GJ05EF9012',
      vehicleId: 'ACE-05',
      model: 'Tata Ace',
      type: 'Mini Truck',
      capacity: '750 kg',
      odometer: '48,000 km',
      cost: '₹6,00,000',
      status: 'In Shop',
    },
    {
      registrationNumber: 'GJ05GH3456',
      vehicleId: 'TRK-09',
      model: 'BharatBenz 3528C',
      type: 'Truck',
      capacity: '10,000 kg',
      odometer: '98,000 km',
      cost: '₹45,00,000',
      status: 'Retired',
    },
  ]

  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles)

  // Add Vehicle Form States
  const [newRegNumber, setNewRegNumber] = useState('')
  const [newVehicleId, setNewVehicleId] = useState('')
  const [newType, setNewType] = useState('Van')
  const [newModel, setNewModel] = useState('')
  const [newCapacity, setNewCapacity] = useState('')
  const [newOdometer, setNewOdometer] = useState('')
  const [newCost, setNewCost] = useState('')

  const handleFilterApply = () => {
    let filtered = [...initialVehicles]

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        v =>
          v.registrationNumber.toLowerCase().includes(q) ||
          v.vehicleId.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q)
      )
    }

    if (vehicleTypeFilter !== 'All Types') {
      filtered = filtered.filter(
        v => v.type.toLowerCase() === vehicleTypeFilter.toLowerCase()
      )
    }

    if (statusFilter !== 'All Status') {
      filtered = filtered.filter(
        v => v.status.toLowerCase() === statusFilter.toLowerCase()
      )
    }

    setVehicles(filtered)
  }

  const handleRegisterVehicle = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newRegNumber || !newVehicleId || !newModel) {
      alert('Please fill out all required fields.')
      return
    }

    const newVehicle: Vehicle = {
      registrationNumber: newRegNumber.toUpperCase(),
      vehicleId: newVehicleId.toUpperCase(),
      model: newModel,
      type: newType,
      capacity: newCapacity ? `${newCapacity} kg` : '0 kg',
      odometer: newOdometer ? `${Number(newOdometer).toLocaleString()} km` : '0 km',
      cost: newCost ? `₹${Number(newCost).toLocaleString()}` : '₹0',
      status: 'Available',
    }

    setVehicles([newVehicle, ...vehicles])
    setIsDrawerOpen(false)

    // Reset fields
    setNewRegNumber('')
    setNewVehicleId('')
    setNewType('Van')
    setNewModel('')
    setNewCapacity('')
    setNewOdometer('')
    setNewCost('')
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
        {/* Top Nav inside Main Content */}
        <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/5 bg-white/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-on-surface p-1 hover:bg-black/5 rounded" onClick={() => setIsMobileMenuOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-on-surface font-headline-sm">Fleet Registry</h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-black/5 transition-all relative">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error-red border-2 border-dashboard-canvas rounded-full"></span>
            </button>
            <div className="h-6 w-[1px] bg-outline-variant mx-2 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-on-surface">Riya Kapoor</p>
                <p className="text-[9px] text-industrial-blue uppercase font-bold tracking-wider">Fleet Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-industrial-blue flex items-center justify-center text-white font-bold text-sm shadow-md">
                RK
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-on-surface-variant text-sm font-body-md">
                Manage your assets and track real-time availability across zones.
              </p>
            </div>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="bg-industrial-blue text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all font-semibold text-sm shadow-lg shadow-industrial-blue/20 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add Vehicle
            </button>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-5 rounded-2xl flex flex-wrap gap-4 items-end shadow-sm border border-black/[0.01]">
            <div className="flex-1 min-w-[240px] space-y-1">
              <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider font-label-sm">Search</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[18px]">search</span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-dashboard-canvas/50 border-none rounded-xl focus:ring-2 focus:ring-industrial-blue/30 text-sm outline-none"
                  placeholder="Search by Reg. Number, ID, Model..."
                  type="text"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider font-label-sm">Vehicle Type</label>
              <select
                value={vehicleTypeFilter}
                onChange={(e) => setVehicleTypeFilter(e.target.value)}
                className="bg-dashboard-canvas/50 border-none rounded-xl px-4 py-2 text-sm min-w-[140px] focus:ring-2 focus:ring-industrial-blue/30 outline-none cursor-pointer"
              >
                <option>All Types</option>
                <option>Van</option>
                <option>Truck</option>
                <option>Mini Truck</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider font-label-sm">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-dashboard-canvas/50 border-none rounded-xl px-4 py-2 text-sm min-w-[140px] focus:ring-2 focus:ring-industrial-blue/30 outline-none cursor-pointer"
              >
                <option>All Status</option>
                <option>Available</option>
                <option>On Trip</option>
                <option>In Shop</option>
                <option>Retired</option>
              </select>
            </div>
            <button
              onClick={handleFilterApply}
              className="bg-on-background text-white px-5 py-2 rounded-xl font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Apply
            </button>
          </div>

          {/* Fleet Table */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/[0.02]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-body-md">
                <thead className="bg-white border-b border-gray-100">
                  <tr className="text-on-surface-variant text-[11px] uppercase tracking-wider font-label-sm">
                    <th className="px-6 py-5 font-bold">Reg. Number</th>
                    <th className="px-6 py-5 font-bold">Vehicle ID</th>
                    <th className="px-6 py-5 font-bold">Model</th>
                    <th className="px-6 py-5 font-bold">Type</th>
                    <th className="px-6 py-5 font-bold">Capacity</th>
                    <th className="px-6 py-5 font-bold">Odometer</th>
                    <th className="px-6 py-5 font-bold text-right">Cost</th>
                    <th className="px-6 py-5 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {vehicles.length > 0 ? (
                    vehicles.map(v => (
                      <tr key={v.registrationNumber} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-5 font-bold text-on-surface font-mono">{v.registrationNumber}</td>
                        <td className="px-6 py-5 text-on-surface-variant">{v.vehicleId}</td>
                        <td className="px-6 py-5 text-on-surface-variant">{v.model}</td>
                        <td className="px-6 py-5 text-on-surface-variant">{v.type}</td>
                        <td className="px-6 py-5 font-mono text-on-surface-variant">{v.capacity}</td>
                        <td className="px-6 py-5 font-mono text-on-surface-variant">{v.odometer}</td>
                        <td className="px-6 py-5 font-mono font-bold text-on-surface text-right">{v.cost}</td>
                        <td className="px-6 py-5 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                            v.status === 'Available'
                              ? 'bg-green-50 text-success-green border-success-green/10'
                              : v.status === 'On Trip'
                                ? 'bg-blue-50 text-industrial-blue border-industrial-blue/10'
                                : v.status === 'In Shop'
                                  ? 'bg-amber-50 text-alert-yellow border-alert-yellow/10'
                                  : 'bg-gray-100 text-on-surface-variant border-black/5'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-on-surface-variant/50">
                        No vehicles found matching the filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-5 bg-white border-t border-gray-50 flex items-center justify-between text-xs font-body-sm">
              <div className="text-on-surface-variant font-medium">
                Showing <span className="text-on-surface font-bold">1 to {vehicles.length}</span> of <span className="text-on-surface font-bold">{vehicles.length}</span> vehicles
              </div>
              <div className="flex items-center gap-1.5">
                <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-dashboard-canvas transition-colors disabled:opacity-30" disabled>
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center bg-industrial-blue text-white rounded-lg font-bold shadow-md shadow-industrial-blue/20">
                  1
                </button>
                <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-dashboard-canvas transition-colors disabled:opacity-30" disabled>
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
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

      {/* Drawer Overlay Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsDrawerOpen(false)}
        ></div>
      )}

      {/* Right Side Drawer: Add Vehicle */}
      <aside
        className={`fixed top-0 right-0 h-screen w-full sm:w-[500px] bg-white z-[70] transition-transform duration-300 shadow-2xl flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-dashboard-canvas/30">
          <div>
            <h3 className="text-lg font-bold text-on-surface">Add New Vehicle</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Register a new asset to the industrial fleet registry.</p>
          </div>
          <button className="p-2 hover:bg-gray-200 rounded-lg transition-all cursor-pointer" onClick={() => setIsDrawerOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleRegisterVehicle} className="flex-1 flex flex-col min-h-0 bg-white">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">
                  Registration Number
                </label>
                <input
                  required
                  value={newRegNumber}
                  onChange={(e) => setNewRegNumber(e.target.value)}
                  className="w-full bg-dashboard-canvas/50 border-none rounded-xl p-2.5 focus:ring-2 focus:ring-industrial-blue/30 text-sm font-mono outline-none"
                  placeholder="e.g. GJ01AB1234"
                  type="text"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">
                  Vehicle Name/ID
                </label>
                <input
                  required
                  value={newVehicleId}
                  onChange={(e) => setNewVehicleId(e.target.value)}
                  className="w-full bg-dashboard-canvas/50 border-none rounded-xl p-2.5 focus:ring-2 focus:ring-industrial-blue/30 text-sm outline-none"
                  placeholder="e.g. VAN-06"
                  type="text"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">
                  Vehicle Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-dashboard-canvas/50 border-none rounded-xl p-2.5 focus:ring-2 focus:ring-industrial-blue/30 text-sm outline-none cursor-pointer"
                >
                  <option>Van</option>
                  <option>Truck</option>
                  <option>Mini Truck</option>
                </select>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">
                  Model Name
                </label>
                <input
                  required
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full bg-dashboard-canvas/50 border-none rounded-xl p-2.5 focus:ring-2 focus:ring-industrial-blue/30 text-sm outline-none"
                  placeholder="e.g. Tata Prima 5530.S"
                  type="text"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">
                  Max Capacity (kg)
                </label>
                <input
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  className="w-full bg-dashboard-canvas/50 border-none rounded-xl p-2.5 focus:ring-2 focus:ring-industrial-blue/30 text-sm font-mono outline-none"
                  placeholder="5000"
                  type="number"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">
                  Odometer (km)
                </label>
                <input
                  value={newOdometer}
                  onChange={(e) => setNewOdometer(e.target.value)}
                  className="w-full bg-dashboard-canvas/50 border-none rounded-xl p-2.5 focus:ring-2 focus:ring-industrial-blue/30 text-sm font-mono outline-none"
                  placeholder="0"
                  type="number"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">
                  Acquisition Cost (₹)
                </label>
                <input
                  value={newCost}
                  onChange={(e) => setNewCost(e.target.value)}
                  className="w-full bg-dashboard-canvas/50 border-none rounded-xl p-2.5 focus:ring-2 focus:ring-industrial-blue/30 text-sm font-mono outline-none"
                  placeholder="e.g. 1200000"
                  type="number"
                />
              </div>
              <div className="col-span-2 mt-2">
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-on-surface-variant/60 bg-dashboard-canvas/20 hover:border-industrial-blue/30 hover:bg-dashboard-canvas/40 transition-all cursor-pointer group">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 border border-gray-100 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-industrial-blue">cloud_upload</span>
                  </div>
                  <p className="text-sm font-bold text-on-surface">Upload Vehicle Photos</p>
                  <p className="text-[10px] mt-0.5 font-sans">PNG, JPG, HEIC up to 10MB</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 flex gap-3 bg-white shrink-0">
            <button
              type="button"
              className="flex-1 px-6 py-3 border border-gray-200 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-dashboard-canvas transition-colors cursor-pointer"
              onClick={() => setIsDrawerOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-industrial-blue text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-industrial-blue/20 cursor-pointer"
            >
              Register Vehicle
            </button>
          </div>
        </form>
      </aside>
    </div>
  )
}
