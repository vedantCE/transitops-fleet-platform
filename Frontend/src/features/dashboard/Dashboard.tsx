import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet'
import L from 'leaflet'
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

const getTruckIcon = (regNumber: string, tripId: string) => L.divIcon({
  className: 'bg-transparent',
  html: `
    <div class="flex items-center gap-2 -translate-y-1/2 -translate-x-[16px]">
      <div class="bg-[#1f2937] w-8 h-8 rounded-full shadow-md flex items-center justify-center border-2 border-white shrink-0 pointer-events-none">
        <span class="material-symbols-outlined text-white text-[16px]">local_shipping</span>
      </div>
      <div class="w-4 h-[1.5px] bg-gray-400/50 shrink-0"></div>
      <div class="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100 font-bold text-xs text-gray-800 tracking-tight whitespace-nowrap cursor-pointer hover:bg-gray-50 pointer-events-auto" onclick="window.location.href='/trips/${tripId}'">
        ${regNumber}
      </div>
    </div>
  `,
  iconSize: [0, 0]
})

const pinIcon = L.divIcon({
  className: 'bg-transparent',
  html: `
    <div class="flex flex-col items-center -translate-y-[40px] -translate-x-[16px]">
      <div class="absolute bottom-[-6px] w-6 h-6 bg-yellow-400/40 rounded-full animate-ping"></div>
      <div class="absolute bottom-[2px] w-2 h-2 bg-yellow-400 rounded-full border border-white z-10 shadow-sm"></div>
      <div class="w-8 h-8 bg-yellow-400 rounded-t-full rounded-bl-full rounded-br-none rotate-45 shadow-md flex items-center justify-center relative z-20 mb-1">
        <div class="w-3 h-3 bg-white rounded-full -rotate-45"></div>
      </div>
    </div>
  `,
  iconSize: [0, 0]
})

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
            
            {/* Interactive Live Map */}
            <div className="flex-1 rounded-2xl bg-[#F8F9FA] relative overflow-hidden border border-black/5 flex flex-col z-0">
              
              <MapContainer center={[19.0760, 72.8777]} zoom={12} className="w-full h-full" zoomControl={false} dragging={false} scrollWheelZoom={false}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                />
                
                {/* Simulated Route 1 */}
                <Polyline positions={[[19.0500, 72.8300], [19.0600, 72.8300], [19.0600, 72.8500], [19.0750, 72.8500]]} pathOptions={{ color: '#FACC15', weight: 4 }} />
                <Marker position={[19.0500, 72.8300]} icon={pinIcon} />
                
                {trips.filter(t => t.status === 'DISPATCHED')[0] && (
                  <Marker position={[19.0750, 72.8500]} icon={getTruckIcon(trips.filter(t => t.status === 'DISPATCHED')[0].vehicle.registrationNumber, trips.filter(t => t.status === 'DISPATCHED')[0].id)} />
                )}

                {/* Simulated Route 2 (if any) */}
                {trips.filter(t => t.status === 'DISPATCHED')[1] && (
                  <>
                    <Polyline positions={[[19.0800, 72.9000], [19.0800, 72.9200], [19.1000, 72.9200]]} pathOptions={{ color: '#FACC15', weight: 4 }} />
                    <Marker position={[19.0800, 72.9000]} icon={pinIcon} />
                    <Marker position={[19.1000, 72.9200]} icon={getTruckIcon(trips.filter(t => t.status === 'DISPATCHED')[1].vehicle.registrationNumber, trips.filter(t => t.status === 'DISPATCHED')[1].id)} />
                  </>
                )}
              </MapContainer>

              {/* Overlay matching the UI */}
              <div className="absolute top-5 left-6 pointer-events-none z-[400]">
                <div className="bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-sm border border-white">
                  <h3 className="text-xl font-extrabold text-gray-900 tracking-tight font-headline-sm">Live Tracking</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1 font-body-sm">Real-time tracking of your delivery</p>
                </div>
              </div>
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
