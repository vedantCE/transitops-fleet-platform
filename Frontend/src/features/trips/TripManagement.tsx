import { useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'

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
  const { setIsMobileMenuOpen } = useOutletContext<{ setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>> }>()
  const navigate = useNavigate()
  
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

  const handleDispatchTrip = (e: React.FormEvent) => {
    e.preventDefault()

    if (!source || !destination || vehicle === 'Select Vehicle' || driver === 'Select Driver') {
      alert('Please fill out Origin, Destination, Vehicle, and Driver to dispatch.')
      return
    }

    const nextIdNum = trips.length + 1
    const nextId = `TR${String(nextIdNum).padStart(3, '0')}`

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
      time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
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

  const handleCompleteTripTrigger = (tripId: string) => {
    setCompletingTripId(tripId)
    setIsModalOpen(true)
  }

  const handleFinalizeTripSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!finalOdometer || !fuelConsumed || !fuelCost) {
      alert('Please enter Odometer, Fuel Quantity, and Fuel Cost.')
      return
    }

    setTrips(
      trips.map(t => {
        if (t.id === completingTripId) {
          return { ...t, status: 'Completed' }
        }
        return t
      })
    )

    setIsModalOpen(false)
    setCompletingTripId(null)
    setFinalOdometer('')
    setFuelConsumed('')
    setFuelCost('')
  }

  // Filter logic
  const filteredTrips = trips.filter(t => {
    if (tripsFilter !== 'All' && t.status !== tripsFilter) return false
    if (boardSearch.trim() !== '') {
      const q = boardSearch.toLowerCase()
      return (
        t.id.toLowerCase().includes(q) ||
        t.source.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        t.vehicle.toLowerCase().includes(q) ||
        t.driver.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <>
      {/* Top Nav inside Main Content */}
      <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/5 bg-white/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button className="md:hidden text-on-surface p-1 hover:bg-black/5 rounded" onClick={() => setIsMobileMenuOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="relative w-72 group hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input
              value={boardSearch}
              onChange={(e) => setBoardSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-1.5 border border-outline-variant bg-surface-container-lowest text-xs rounded-xl focus:ring-1 focus:ring-industrial-blue outline-none"
              placeholder="Search origin, destination, vehicle..."
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
            <p className="text-xs font-semibold text-on-surface-variant font-body-md uppercase tracking-wider">Transit Desk</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold text-on-surface font-headline-lg">Trip Management</h2>
          <p className="text-sm text-on-surface-variant mt-1 font-body-md">Dispatch vehicles, track active route progress and log final trip opex.</p>
        </div>

        {/* Content Split: Form & Board */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Dispatch Form (Left 5/12) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-industrial-blue">
                <span className="material-symbols-outlined">route</span>
              </div>
              <h3 className="text-base font-bold text-on-surface font-headline-sm">Dispatch Vehicle</h3>
            </div>
            
            <form onSubmit={handleDispatchTrip} className="space-y-4 font-body-sm text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Origin</label>
                  <input
                    required
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none"
                    placeholder="City / Hub"
                    type="text"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Destination</label>
                  <input
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none"
                    placeholder="City / Hub"
                    type="text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Vehicle</label>
                  <select
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none cursor-pointer"
                  >
                    <option>Select Vehicle</option>
                    <option>VAN-05</option>
                    <option>TRUCK-02</option>
                    <option>ACE-05</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Driver</label>
                  <select
                    value={driver}
                    onChange={(e) => setDriver(e.target.value)}
                    className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none cursor-pointer"
                  >
                    <option>Select Driver</option>
                    <option>Alex</option>
                    <option>John</option>
                    <option>Priya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Cargo (kg)</label>
                  <input
                    value={cargo}
                    onChange={(e) => setCargo(Number(e.target.value))}
                    className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none text-right font-mono"
                    type="number"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Est Distance (km)</label>
                  <input
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none text-right font-mono"
                    type="number"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Revenue (INR)</label>
                  <input
                    value={revenue}
                    onChange={(e) => setRevenue(Number(e.target.value))}
                    className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none text-right font-mono"
                    type="number"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-background text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-background/25 cursor-pointer uppercase tracking-widest text-[10px]"
              >
                Dispatch Route
              </button>
            </form>
          </div>

          {/* Trips Board (Right 7/12) */}
          <div className="lg:col-span-7 space-y-4 w-full">
            {/* Board Filters */}
            <div className="bg-white p-4 border border-black/5 rounded-2xl flex justify-between items-center shadow-sm">
              <div className="flex gap-2 text-xs font-bold font-label-sm uppercase">
                {['All', 'Dispatched', 'Completed', 'Draft'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setTripsFilter(tab)}
                    className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                      tripsFilter === tab
                        ? 'bg-dashboard-canvas text-on-surface'
                        : 'text-on-surface-variant hover:bg-dashboard-canvas/30'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Board Items */}
            <div className="space-y-4">
              {filteredTrips.map(trip => (
                <div key={trip.id} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:border-industrial-blue/30 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(`/trips/${trip.id}`)}>
                  {/* Route details */}
                  <div className="space-y-4 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-industrial-blue bg-blue-50 px-2.5 py-0.5 rounded font-mono uppercase tracking-wider">{trip.id}</span>
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                        trip.status === 'Dispatched'
                          ? 'bg-blue-50 text-industrial-blue border-industrial-blue/10'
                          : trip.status === 'Completed'
                            ? 'bg-green-50 text-success-green border-success-green/10'
                            : 'bg-gray-100 text-on-surface-variant border-gray-200'
                      }`}>
                        {trip.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Origin</p>
                        <p className="text-base font-bold text-on-surface font-sans">{trip.source}</p>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant/30 text-xl">arrow_forward_ios</span>
                      <div>
                        <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Destination</p>
                        <p className="text-base font-bold text-on-surface font-sans">{trip.destination}</p>
                      </div>
                    </div>

                    {/* Meta statistics */}
                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-50 text-xs font-mono font-medium text-on-surface-variant">
                      <div>
                        <span className="block text-[9px] font-bold uppercase tracking-wider font-sans font-label-sm">Vehicle</span>
                        <span className="text-on-surface font-bold">{trip.vehicle}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold uppercase tracking-wider font-sans font-label-sm">Operator</span>
                        <span className="text-on-surface font-bold">{trip.driver}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold uppercase tracking-wider font-sans font-label-sm">Cargo</span>
                        <span className="text-on-surface font-bold">{trip.cargo.toLocaleString()} kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Financials & Action */}
                  <div className="flex flex-col justify-between items-end border-l border-gray-50 pl-6 shrink-0 text-right min-w-[140px]">
                    <div>
                      <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Est Revenue</p>
                      <p className="text-lg font-bold text-on-surface font-sans">₹ {trip.revenue.toLocaleString()}</p>
                    </div>
                    
                    {trip.status === 'Dispatched' ? (
                      <button
                        onClick={() => handleCompleteTripTrigger(trip.id)}
                        className="bg-background text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all uppercase tracking-wider shadow-md cursor-pointer mt-4"
                      >
                        Complete Trip
                      </button>
                    ) : (
                      <div className="text-xs text-on-surface-variant font-medium font-body-sm mt-4">
                        Logged {trip.time}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TRIP COMPLETION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border border-black/5 animate-scale-up">
            {/* Header */}
            <div className="p-6 border-b border-black/5 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-on-surface font-headline-sm">Complete Trip Logistics</h3>
                <p className="text-xs text-on-surface-variant font-body-sm mt-0.5">Finalize odometer and operational fuel statistics</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFinalizeTripSubmit}>
              <div className="p-6 space-y-6 font-body-sm text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Final Odometer (km)</label>
                    <input
                      required
                      value={finalOdometer}
                      onChange={(e) => setFinalOdometer(e.target.value)}
                      className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 focus:border-industrial-blue focus:ring-1 focus:ring-industrial-blue outline-none text-sm font-mono"
                      placeholder="e.g. 74265"
                      type="number"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm font-sans">Fuel Consumed (L)</label>
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
    </>
  )
}
