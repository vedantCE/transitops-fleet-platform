import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Trip {
  id: string
  source: string
  destination: string
  vehicle: string
  driver: string
  cargo: number
  distance: number
  revenue: number
  status: 'Dispatched' | 'Completed' | 'Draft'
  time: string
}

export default function TripManagement() {
  const navigate = useNavigate()
  
  // Navigation active tab
  const [activeTab, setActiveTab] = useState('Trips')
  
  // Mobile sidebar drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Filters and Lists
  const [tripsFilter, setTripsFilter] = useState('All')
  const [boardSearch, setBoardSearch] = useState('')

  // Mock list of trips matching Stitch mockups
  const initialTrips: Trip[] = [
    {
      id: 'TR001',
      source: 'Ahmedabad',
      destination: 'Surat',
      vehicle: 'VAN-05',
      driver: 'Alex',
      cargo: 450,
      distance: 265,
      revenue: 12000,
      status: 'Dispatched',
      time: '10:42 AM',
    },
    {
      id: 'TR002',
      source: 'Vadodara',
      destination: 'Ahmedabad',
      vehicle: 'Not Assigned',
      driver: 'Not Assigned',
      cargo: 1200,
      distance: 110,
      revenue: 8500,
      status: 'Draft',
      time: '11:05 AM',
    },
    {
      id: 'TR003',
      source: 'Anand',
      destination: 'Rajkot',
      vehicle: 'TRUCK-02',
      driver: 'Priya',
      cargo: 2200,
      distance: 310,
      revenue: 25000,
      status: 'Completed',
      time: '09:30 AM',
    },
  ]

  const [trips, setTrips] = useState<Trip[]>(initialTrips)

  // Create Trip Form States
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [vehicle, setVehicle] = useState('Select Vehicle')
  const [driver, setDriver] = useState('Select Driver')
  const [cargo, setCargo] = useState(0)
  const [distance, setDistance] = useState(0)
  const [revenue, setRevenue] = useState(0)

  // Complete Trip Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [completingTripId, setCompletingTripId] = useState<string | null>(null)
  const [finalOdometer, setFinalOdometer] = useState('')
  const [fuelConsumed, setFuelConsumed] = useState('')
  const [fuelCost, setFuelCost] = useState('')

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

  const handleDispatchTrip = (e: React.FormEvent) => {
    e.preventDefault()

    if (!source || !destination || vehicle === 'Select Vehicle' || driver === 'Select Driver') {
      alert('Please fill out Origin, Destination, Vehicle, and Driver to dispatch.')
      return
    }

    const nextIdNum = trips.length + 1
    const nextId = `TR${String(nextIdNum).padStart(3, '0')}`

    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const newTrip: Trip = {
      id: nextId,
      source,
      destination,
      vehicle,
      driver,
      cargo: Number(cargo),
      distance: Number(distance),
      revenue: Number(revenue),
      status: 'Dispatched',
      time: timeStr,
    }

    setTrips([newTrip, ...trips])

    // Reset Form
    setSource('')
    setDestination('')
    setVehicle('Select Vehicle')
    setDriver('Select Driver')
    setCargo(0)
    setDistance(0)
    setRevenue(0)
  }

  const handleDraftDispatch = (tripId: string) => {
    // Allows quick dispatching of draft cards
    setTrips(
      trips.map(t => {
        if (t.id === tripId) {
          return {
            ...t,
            status: 'Dispatched',
            vehicle: 'VAN-05',
            driver: 'Alex',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        }
        return t
      })
    )
  }

  const handleCancelTrip = (tripId: string) => {
    if (confirm(`Are you sure you want to cancel Trip ${tripId}?`)) {
      setTrips(trips.filter(t => t.id !== tripId))
    }
  }

  const handleOpenCompleteModal = (tripId: string) => {
    setCompletingTripId(tripId)
    setIsModalOpen(true)
  }

  const handleFinalizeTrip = (e: React.FormEvent) => {
    e.preventDefault()

    if (!completingTripId) return

    setTrips(
      trips.map(t => {
        if (t.id === completingTripId) {
          return {
            ...t,
            status: 'Completed',
          }
        }
        return t
      })
    )

    // Reset states
    setIsModalOpen(false)
    setCompletingTripId(null)
    setFinalOdometer('')
    setFuelConsumed('')
    setFuelCost('')
  }

  // Counters
  const activeCount = trips.filter(t => t.status === 'Dispatched').length
  const pendingCount = trips.filter(t => t.status === 'Draft').length

  // Filtered trips list for display
  const filteredTrips = trips
    .filter(t => {
      if (tripsFilter === 'All') return true
      return t.status === tripsFilter
    })
    .filter(t => {
      if (boardSearch.trim() === '') return true
      const q = boardSearch.toLowerCase()
      return (
        t.id.toLowerCase().includes(q) ||
        t.source.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        t.driver.toLowerCase().includes(q) ||
        t.vehicle.toLowerCase().includes(q)
      )
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
        {/* Top Nav inside Main Content */}
        <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/5 bg-white/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-on-surface p-1 hover:bg-black/5 rounded" onClick={() => setIsMobileMenuOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative w-72 group hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-industrial-blue text-[20px]">search</span>
              <input
                value={boardSearch}
                onChange={(e) => setBoardSearch(e.target.value)}
                className="w-full bg-white/60 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-industrial-blue/20 outline-none"
                placeholder="Search trips, drivers, vehicles..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-black/5 transition-all relative">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error-red rounded-full"></span>
            </button>
            <div className="h-6 w-[1px] bg-outline-variant mx-2 hidden sm:block"></div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-on-surface-variant font-body-md">Trip Management</p>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h2 className="text-2xl font-bold text-on-surface font-headline-lg">Trip Management</h2>
              <p className="text-sm text-on-surface-variant mt-1 font-body-md">Create, dispatch, and monitor transport operations</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white px-6 py-3 rounded-xl shadow-sm text-center border border-black/5">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1 font-label-sm">Active Trips</p>
                <p className="text-2xl font-bold text-industrial-blue font-mono">{String(activeCount).padStart(2, '0')}</p>
              </div>
              <div className="bg-white px-6 py-3 rounded-xl shadow-sm text-center border border-black/5">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1 font-label-sm">Pending Trips</p>
                <p className="text-2xl font-bold text-safety-orange font-mono">{String(pendingCount).padStart(2, '0')}</p>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Create Trip Form & Map */}
            <section className="xl:col-span-5 space-y-6">
              <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 font-headline-sm">
                  <span className="material-symbols-outlined text-industrial-blue">add_circle</span>
                  New Dispatch Trip
                </h3>
                <form onSubmit={handleDispatchTrip} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 font-body-sm">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Source</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">my_location</span>
                        <input
                          required
                          value={source}
                          onChange={(e) => setSource(e.target.value)}
                          className="w-full bg-white border border-black/5 rounded-xl pl-10 pr-3 py-2.5 focus:border-industrial-blue focus:ring-1 focus:ring-industrial-blue text-sm outline-none"
                          placeholder="Origin City"
                          type="text"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Destination</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">location_on</span>
                        <input
                          required
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="w-full bg-white border border-black/5 rounded-xl pl-10 pr-3 py-2.5 focus:border-industrial-blue focus:ring-1 focus:ring-industrial-blue text-sm outline-none"
                          placeholder="Target City"
                          type="text"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Vehicle Selection</label>
                    <select
                      value={vehicle}
                      onChange={(e) => setVehicle(e.target.value)}
                      className="w-full bg-white border border-black/5 rounded-xl px-3 py-2.5 focus:border-industrial-blue focus:ring-industrial-blue text-sm outline-none cursor-pointer"
                    >
                      <option>Select Vehicle</option>
                      <option>VAN-05 (Available)</option>
                      <option>PICKUP-12 (Available)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Assign Driver</label>
                    <select
                      value={driver}
                      onChange={(e) => setDriver(e.target.value)}
                      className="w-full bg-white border border-black/5 rounded-xl px-3 py-2.5 focus:border-industrial-blue focus:ring-industrial-blue text-sm outline-none cursor-pointer"
                    >
                      <option>Select Driver</option>
                      <option>Alex (Available)</option>
                      <option>Priya (Available)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm font-sans">Cargo (kg)</label>
                      <input
                        value={cargo}
                        onChange={(e) => setCargo(Number(e.target.value))}
                        className="w-full bg-white border border-black/5 rounded-xl px-3 py-2 focus:border-industrial-blue outline-none text-sm"
                        type="number"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm font-sans">Dist. (km)</label>
                      <input
                        value={distance}
                        onChange={(e) => setDistance(Number(e.target.value))}
                        className="w-full bg-white border border-black/5 rounded-xl px-3 py-2 focus:border-industrial-blue outline-none text-sm"
                        type="number"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm font-sans">Revenue (₹)</label>
                      <input
                        value={revenue}
                        onChange={(e) => setRevenue(Number(e.target.value))}
                        className="w-full bg-white border border-black/5 rounded-xl px-3 py-2 focus:border-industrial-blue outline-none text-sm"
                        type="number"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-black/5 space-y-3 font-body-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-on-surface-variant">Validation Status</span>
                      <span className="text-[10px] text-success-green font-bold uppercase tracking-wider">Ready for Dispatch</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-[11px] text-success-green font-semibold">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> Vehicle Active
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-success-green font-semibold">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> Driver Available
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-success-green font-semibold">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> Within Capacity
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-success-green font-semibold">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> Route Validated
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-on-background text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-md active:scale-[0.98] mt-2 uppercase tracking-widest text-[10px] cursor-pointer"
                  >
                    Dispatch Trip
                  </button>
                </form>
              </div>

              {/* Map Preview */}
              <div className="bg-white border border-black/5 rounded-2xl overflow-hidden relative h-64 group shadow-sm">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBqZXGJ_iNb4SK33iJdb2Qrr3H_urIIOHtUWeK-owy3kqD4VZ9S-I-QMAx1V_8gBIzOEY3J3FaQi7cwmp3JtSWPPT-5LRt-DplH7PzQNZJRJFAGrDf0T2AI2fEwTcKAPDROBigLsUKOUPI5GyrHosxPM_vPj3mlFHOiQmPsrg-u5Oa-n7m-vZlx1gF-c82YhKoHhZttLrzcOkMb9TVi99nJqJdzPaJ39BlcI8YVh74LKztUFj0uhuTGI_RN0aBcJlBiUQZ8Yp4uNBM')`,
                  }}
                ></div>
                <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-black/5 text-[10px] font-bold flex items-center gap-2 shadow-sm text-primary uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-industrial-blue animate-pulse"></span>
                  Live Route View
                </div>
              </div>
            </section>

            {/* Right Column: Trip Board */}
            <section className="xl:col-span-7 space-y-6">
              {/* Trip Board Filter Menu */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 bg-dashboard-canvas/90 backdrop-blur-md pb-4 z-10">
                <div className="relative flex-1 w-full sm:w-auto">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">filter_list</span>
                  <input
                    value={boardSearch}
                    onChange={(e) => setBoardSearch(e.target.value)}
                    className="w-full bg-white border border-black/5 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-industrial-blue outline-none"
                    placeholder="Search board..."
                    type="text"
                  />
                </div>
                <div className="flex items-center bg-white border border-black/5 rounded-xl p-1 shadow-sm w-full sm:w-auto overflow-x-auto">
                  {['All', 'Dispatched', 'Draft', 'Completed'].map(f => (
                    <button
                      key={f}
                      onClick={() => setTripsFilter(f)}
                      className={`px-6 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider cursor-pointer shrink-0 ${
                        tripsFilter === f
                          ? 'bg-industrial-blue text-white shadow-sm'
                          : 'text-on-surface-variant hover:bg-black/5'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trip Board Cards List */}
              <div className="space-y-4">
                {filteredTrips.length > 0 ? (
                  filteredTrips.map(trip => (
                    <div
                      key={trip.id}
                      className={`bg-white border border-black/5 rounded-2xl p-6 transition-all group relative shadow-sm ${
                        trip.status === 'Draft' ? 'border-dashed opacity-90' : ''
                      }`}
                    >
                      {/* Left Indicator Strip */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${
                        trip.status === 'Completed'
                          ? 'bg-success-green'
                          : trip.status === 'Dispatched'
                            ? 'bg-industrial-blue'
                            : 'bg-outline-variant'
                      }`}></div>

                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold bg-dashboard-canvas px-3 py-1.5 rounded-lg text-primary font-mono">{trip.id}</span>
                          <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            trip.status === 'Completed'
                              ? 'bg-green-50 text-success-green border-success-green/10'
                              : trip.status === 'Dispatched'
                                ? 'bg-blue-50 text-industrial-blue border-industrial-blue/10'
                                : 'bg-gray-50 text-on-surface-variant border-black/5'
                          }`}>
                            {trip.status === 'Dispatched' && (
                              <span className="w-1.5 h-1.5 bg-industrial-blue rounded-full animate-pulse"></span>
                            )}
                            {trip.status === 'Completed' && (
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            )}
                            {trip.status}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold font-mono text-on-surface-variant uppercase">{trip.time}</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                        <div className="col-span-2">
                          <p className="text-[10px] text-on-surface-variant mb-1 uppercase tracking-wider font-bold font-label-sm">Route</p>
                          <p className="text-sm font-bold flex items-center gap-3 text-on-surface">
                            {trip.source}{' '}
                            <span className={`material-symbols-outlined text-[18px] ${
                              trip.status === 'Completed'
                                ? 'text-success-green'
                                : trip.status === 'Dispatched'
                                  ? 'text-industrial-blue'
                                  : 'text-on-surface-variant'
                            }`}>
                              {trip.status === 'Completed' ? 'task_alt' : 'trending_flat'}
                            </span>{' '}
                            {trip.destination}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-on-surface-variant mb-1 uppercase tracking-wider font-bold font-label-sm">Vehicle</p>
                          {trip.vehicle === 'Not Assigned' ? (
                            <p className="text-xs italic text-on-surface-variant">Not Assigned</p>
                          ) : (
                            <p className="text-sm font-bold text-on-surface font-mono">{trip.vehicle}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] text-on-surface-variant mb-1 uppercase tracking-wider font-bold font-label-sm">Driver</p>
                          {trip.driver === 'Not Assigned' ? (
                            <p className="text-xs italic text-on-surface-variant">Not Assigned</p>
                          ) : (
                            <p className="text-sm font-bold text-on-surface">{trip.driver}</p>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-black/5 pt-6 gap-4">
                        <div className="flex gap-6 font-mono text-xs text-on-surface-variant">
                          <div className="flex items-center gap-2 font-bold uppercase tracking-wider font-sans">
                            <span className="material-symbols-outlined text-[18px]">weight</span> {trip.cargo} kg
                          </div>
                          <div className="flex items-center gap-2 font-bold uppercase tracking-wider font-sans">
                            <span className="material-symbols-outlined text-[18px]">straighten</span> {trip.distance} km
                          </div>
                        </div>

                        <div className="flex gap-3 w-full sm:w-auto shrink-0 justify-end">
                          {trip.status === 'Dispatched' && (
                            <>
                              <button
                                onClick={() => handleOpenCompleteModal(trip.id)}
                                className="flex-1 sm:flex-none px-6 py-2 bg-dashboard-canvas border border-black/5 text-[10px] font-bold rounded-xl hover:bg-black/5 transition-all uppercase tracking-wider cursor-pointer"
                              >
                                Complete Trip
                              </button>
                              <button
                                onClick={() => handleCancelTrip(trip.id)}
                                className="flex-1 sm:flex-none px-6 py-2 text-error-red text-[10px] font-bold rounded-xl hover:bg-error-red/5 transition-all uppercase tracking-wider cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {trip.status === 'Draft' && (
                            <>
                              <button
                                onClick={() => handleDraftDispatch(trip.id)}
                                className="flex-1 sm:flex-none px-8 py-2 bg-industrial-blue text-white text-[10px] font-bold rounded-xl shadow-md hover:brightness-110 uppercase tracking-widest cursor-pointer"
                              >
                                Dispatch
                              </button>
                              <button
                                onClick={() => handleCancelTrip(trip.id)}
                                className="flex-1 sm:flex-none px-6 py-2 text-error-red text-[10px] font-bold rounded-xl hover:bg-error-red/5 transition-all uppercase tracking-wider cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-black/5 rounded-2xl p-10 text-center text-on-surface-variant/40">
                    <span className="material-symbols-outlined text-[36px] mb-2 text-on-surface-variant/20">directions_run</span>
                    <p className="font-bold text-sm">No trips on the board</p>
                    <p className="text-xs mt-1">Try creating a new trip or modifying your search query.</p>
                  </div>
                )}
              </div>
            </section>
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

      {/* MODAL: COMPLETE TRIP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white border border-black/5 rounded-2xl w-full max-w-lg overflow-hidden relative shadow-2xl animate-in fade-in zoom-in duration-200 mx-4">
            <div className="p-8 border-b border-black/5 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-lg font-bold text-on-surface">Complete Trip {completingTripId}</h3>
                <p className="text-xs text-on-surface-variant mt-1 font-body-md">Enter final trip logistics to close dispatch</p>
              </div>
              <button
                className="text-on-surface-variant hover:text-industrial-blue p-2 rounded-full hover:bg-black/5 transition-all cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleFinalizeTrip}>
              <div className="p-8 space-y-6 bg-white font-sans text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Final Odometer (km)</label>
                    <input
                      required
                      value={finalOdometer}
                      onChange={(e) => setFinalOdometer(e.target.value)}
                      className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 focus:border-industrial-blue focus:ring-1 focus:ring-industrial-blue outline-none text-sm font-mono"
                      placeholder="Km reading"
                      type="number"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Fuel Consumed (L)</label>
                    <input
                      required
                      value={fuelConsumed}
                      onChange={(e) => setFuelConsumed(e.target.value)}
                      className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 focus:border-industrial-blue focus:ring-1 focus:ring-industrial-blue outline-none text-sm font-mono"
                      placeholder="Liters"
                      type="number"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Total Fuel Cost (₹)</label>
                  <input
                    required
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 focus:border-industrial-blue focus:ring-1 focus:ring-industrial-blue outline-none text-sm font-mono"
                    placeholder="Enter amount"
                    type="number"
                  />
                </div>
                
                <div className="bg-dashboard-canvas border border-black/5 p-6 rounded-2xl space-y-4">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-label-sm">Summary Calculation</p>
                  <div className="flex justify-between items-center text-sm font-sans">
                    <span className="text-on-surface-variant">Trip Efficiency</span>
                    <span className="font-bold text-success-green font-mono">14.2 km/L</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-sans">
                    <span className="text-on-surface-variant">Net Profitability</span>
                    <span className="font-bold text-industrial-blue font-mono">₹ 4,820</span>
                  </div>
                </div>
              </div>
              
              <div className="p-8 bg-dashboard-canvas/50 border-t border-black/5 flex gap-4 shrink-0">
                <button
                  type="button"
                  className="flex-1 py-3.5 border border-black/5 bg-white rounded-xl font-bold hover:bg-black/5 transition-all text-[10px] uppercase tracking-widest cursor-pointer"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-on-background text-white rounded-xl font-bold hover:opacity-90 shadow-lg uppercase tracking-widest text-[10px] cursor-pointer"
                >
                  Finalize Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
