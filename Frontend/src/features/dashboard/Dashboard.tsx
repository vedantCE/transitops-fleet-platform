import { useEffect, useMemo, useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { listTrips } from '../../services/trips'
import { listVehicles } from '../../services/vehicles'
import { getDashboardKpis } from '../../services/reports'
import { getApiErrorMessage } from '../../lib/api'
import type { DashboardKpis, Trip, TripStatus, Vehicle } from '../../types'

const STATUS_BY_LABEL: Record<string, TripStatus> = {
  Dispatched: 'DISPATCHED',
  Completed: 'COMPLETED',
  Draft: 'DRAFT',
  Cancelled: 'CANCELLED',
}

export default function Dashboard() {
  const { setIsMobileMenuOpen } = useOutletContext<{ setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>> }>()
  const navigate = useNavigate()

  // Filters state
  const [vehicleType, setVehicleType] = useState('All Types')
  const [status, setStatus] = useState('All Statuses')
  const [region, setRegion] = useState('All Regions')

  const [trips, setTrips] = useState<Trip[]>([])
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([])
  const [kpis, setKpis] = useState<DashboardKpis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const vehicleTypes = useMemo(() => Array.from(new Set(allVehicles.map((v) => v.type))).sort(), [allVehicles])
  const regions = useMemo(
    () => Array.from(new Set(allVehicles.map((v) => v.region).filter((r): r is string => !!r))).sort(),
    [allVehicles]
  )

  const fetchDashboardTrips = async () => {
    setIsLoading(true)
    setLoadError('')
    try {
      const [{ trips: tripData }, { vehicles: vehicleData }, kpiData] = await Promise.all([
        listTrips({
          limit: 100,
          status: status !== 'All Statuses' ? STATUS_BY_LABEL[status] : undefined,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }),
        listVehicles({ limit: 100 }),
        getDashboardKpis(),
      ])
      setAllVehicles(vehicleData)
      setKpis(kpiData)

      let filtered = tripData
      if (vehicleType !== 'All Types' || region !== 'All Regions') {
        const matchingVehicleIds = new Set(
          vehicleData
            .filter((v) => (vehicleType === 'All Types' || v.type === vehicleType) && (region === 'All Regions' || v.region === region))
            .map((v) => v.id)
        )
        filtered = tripData.filter((t) => matchingVehicleIds.has(t.vehicleId))
      }
      setTrips(filtered)
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load dashboard trips'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardTrips()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilterApply = () => {
    fetchDashboardTrips()
  }

  return (
    <>
      {/* Top Nav inside Main Content */}
      <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/[0.03] bg-white/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button className="md:hidden text-on-surface p-1 hover:bg-black/5 rounded" onClick={() => setIsMobileMenuOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-on-surface font-headline-sm">Dashboard</h2>
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
                {vehicleTypes.map((t) => <option key={t}>{t}</option>)}
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
                <option>Cancelled</option>
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
                {regions.map((r) => <option key={r}>{r}</option>)}
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
            <p className="text-2xl font-bold font-mono">{kpis ? kpis.activeVehicles : '—'}</p>
          </div>
          {/* Card 2 */}
          <div className="bg-white p-5 rounded-2xl flex flex-col gap-1 shadow-sm border border-transparent hover:border-success-green/30 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-success-green">check_circle</span>
            </div>
            <p className="text-[10px] text-on-surface-variant uppercase mt-3 font-bold tracking-wider font-label-sm">Available</p>
            <p className="text-2xl font-bold font-mono">{kpis ? kpis.availableVehicles : '—'}</p>
          </div>
          {/* Card 3 */}
          <div className="bg-white p-5 rounded-2xl flex flex-col gap-1 shadow-sm border border-transparent hover:border-success-green/30 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-safety-orange">build</span>
              <div className="w-2.5 h-2.5 rounded-full bg-safety-orange"></div>
            </div>
            <p className="text-[10px] text-on-surface-variant uppercase mt-3 font-bold tracking-wider font-label-sm">In Maintenance</p>
            <p className="text-2xl font-bold font-mono">{kpis ? kpis.vehiclesInMaintenance : '—'}</p>
          </div>
          {/* Card 4 */}
          <div className="bg-white p-5 rounded-2xl flex flex-col gap-1 shadow-sm border border-transparent hover:border-success-green/30 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-industrial-blue">trending_up</span>
            </div>
            <p className="text-[10px] text-on-surface-variant uppercase mt-3 font-bold tracking-wider font-label-sm">Active Trips</p>
            <p className="text-2xl font-bold font-mono">{kpis ? kpis.activeTrips : '—'}</p>
          </div>
          {/* Card 5 */}
          <div className="bg-white p-5 rounded-2xl flex flex-col gap-1 shadow-sm border border-transparent hover:border-success-green/30 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-alert-yellow">schedule</span>
            </div>
            <p className="text-[10px] text-on-surface-variant uppercase mt-3 font-bold tracking-wider font-label-sm">Pending Trips</p>
            <p className="text-2xl font-bold font-mono">{kpis ? kpis.pendingTrips : '—'}</p>
          </div>
          {/* Card 6 */}
          <div className="bg-white p-5 rounded-2xl flex flex-col gap-1 shadow-sm border border-transparent hover:border-success-green/30 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-on-surface">badge</span>
            </div>
            <p className="text-[10px] text-on-surface-variant uppercase mt-3 font-bold tracking-wider font-label-sm">Drivers On Duty</p>
            <p className="text-2xl font-bold font-mono">{kpis ? kpis.driversOnDuty : '—'}</p>
          </div>
          {/* Card 7 */}
          <div className="bg-white p-5 rounded-2xl flex flex-col gap-1 shadow-sm border border-transparent hover:border-success-green/30 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-on-background">pie_chart</span>
            </div>
            <p className="text-[10px] text-on-surface-variant uppercase mt-3 font-bold tracking-wider font-label-sm">Fleet Utilization</p>
            <p className="text-2xl font-bold font-mono">{kpis ? `${kpis.fleetUtilization}%` : '—'}</p>
          </div>
        </section>

        {/* Real-time Dispatch Map and Active List */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Dispatch map (Left 2/3) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 flex flex-col justify-between min-h-[380px] shadow-sm border border-black/[0.01]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-base font-bold text-on-surface font-headline-sm">Dispatch Overview</h4>
                <p className="text-xs text-on-surface-variant font-body-sm">Vehicles currently on trip</p>
              </div>
            </div>
            
            {/* Map Placeholder Graphic */}
            <div className="flex-1 bg-dashboard-canvas rounded-2xl border border-black/5 relative overflow-hidden flex items-center justify-center p-4">
              {/* Map grid lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-60"></div>
              {/* Routing lines */}
              <svg className="absolute inset-0 w-full h-full text-gray-200">
                <path d="M 50 150 Q 200 80 400 220 T 700 120" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M 120 50 Q 300 250 500 100 T 650 300" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
              
              {/* Route Markers — real vehicles currently On Trip, no live GPS coordinates are tracked */}
              {trips.filter((t) => t.status === 'DISPATCHED').slice(0, 2).map((t, i) => (
                <div
                  key={t.id}
                  className={`absolute flex items-center gap-2 bg-white/95 backdrop-blur px-2.5 py-1 rounded-xl shadow-md border border-black/5 ${i === 0 ? 'top-[80px] left-[200px] animate-bounce' : 'bottom-[100px] right-[180px]'}`}
                >
                  <span className={`material-symbols-outlined text-[16px] ${i === 0 ? 'text-on-background' : 'text-success-green'}`}>local_shipping</span>
                  <span className="text-[10px] font-bold font-mono">{t.vehicle.registrationNumber}</span>
                </div>
              ))}

              <p className="text-[10px] text-on-surface-variant/40 relative font-bold uppercase tracking-widest font-label-sm">Map Visualization Area (illustrative — no live GPS feed)</p>
            </div>
          </div>

          {/* Active assignments side block (Right 1/3) */}
          <div className="bg-white rounded-3xl p-6 flex flex-col justify-between shadow-sm border border-black/[0.01]">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-base font-bold text-on-surface font-headline-sm">Active Assignments</h4>
                  <p className="text-xs text-on-surface-variant font-body-sm">Dispatched and pending transits</p>
                </div>
                <span className="text-[10px] font-bold text-industrial-blue bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider font-label-sm">{trips.length} Active</span>
              </div>

              {/* Assignment List */}
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  <p className="text-xs text-on-surface-variant text-center py-6">Loading trips...</p>
                ) : loadError ? (
                  <p className="text-xs text-error-red text-center py-6">{loadError}</p>
                ) : trips.length === 0 ? (
                  <p className="text-xs text-on-surface-variant text-center py-6">No trips match these filters.</p>
                ) : (
                  trips.slice(0, 8).map((trip) => (
                    <div
                      key={trip.id}
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className="p-3 bg-dashboard-canvas/45 rounded-xl border border-black/[0.01] flex justify-between items-center hover:bg-dashboard-canvas/80 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          trip.status === 'DISPATCHED' ? 'bg-blue-50 text-industrial-blue' : trip.status === 'COMPLETED' ? 'bg-green-50 text-success-green' : 'bg-gray-100 text-on-surface-variant'
                        }`}>
                          <span className="material-symbols-outlined text-[18px]">
                            {trip.status === 'COMPLETED' ? 'check_circle' : 'route'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-on-surface font-mono">{trip.vehicle.registrationNumber} <span className="font-sans font-normal text-on-surface-variant text-[11px]">({trip.driver.name})</span></p>
                          <p className="text-[10px] text-on-surface-variant">{trip.source} → {trip.destination}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        trip.status === 'DISPATCHED' ? 'bg-blue-100/60 text-industrial-blue' : trip.status === 'COMPLETED' ? 'bg-green-100/60 text-success-green' : 'bg-gray-200 text-on-surface-variant'
                      }`}>
                        {trip.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Alerts Panel */}
        <section className="bg-white border-2 border-dashed border-gray-100 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-on-surface-variant/20 text-[32px] mb-2">inbox</span>
          <h4 className="text-sm font-bold text-on-surface-variant/60">No Alerts</h4>
          <p className="text-[11px] text-on-surface-variant/40 mt-1">All fleet communication channels are currently clear.</p>
        </section>
      </div>
    </>
  )
}
