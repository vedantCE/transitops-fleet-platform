import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTrip, dispatchTrip, cancelTrip, completeTrip } from '../../services/trips'
import { getVehicle } from '../../services/vehicles'
import { createFuelLog } from '../../services/fuelExpenses'
import { getApiErrorMessage } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { canManageTrips } from '../../lib/permissions'
import type { Trip, TripStatus, Vehicle } from '../../types'

const STATUS_COLORS: Record<TripStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-500 border-gray-200',
  DISPATCHED: 'bg-industrial-blue/10 text-industrial-blue border-industrial-blue/20',
  COMPLETED: 'bg-success-green/10 text-success-green border-success-green/20',
  CANCELLED: 'bg-error-red/10 text-error-red border-error-red/20',
}

const STEPS: Array<{ label: string; icon: string; status: TripStatus }> = [
  { label: 'Draft', icon: 'edit_note', status: 'DRAFT' },
  { label: 'Dispatched', icon: 'local_shipping', status: 'DISPATCHED' },
  { label: 'Completed', icon: 'flag', status: 'COMPLETED' },
]

export default function TripDetailsScreen() {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canWrite = canManageTrips(user?.role)

  const [trip, setTrip] = useState<Trip | null>(null)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [isActing, setIsActing] = useState(false)

  const [isCompleting, setIsCompleting] = useState(false)
  const [finalOdometer, setFinalOdometer] = useState('')
  const [fuelConsumed, setFuelConsumed] = useState('')
  const [fuelCost, setFuelCost] = useState('')
  const [completeError, setCompleteError] = useState('')

  const fetchAll = async () => {
    if (!tripId) return
    setIsLoading(true)
    setLoadError('')
    try {
      const t = await getTrip(tripId)
      setTrip(t)
      const v = await getVehicle(t.vehicleId).catch(() => null)
      setVehicle(v)
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load trip'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId])

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center text-on-surface-variant bg-dashboard-canvas">Loading trip...</div>
  }

  if (!trip) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4 text-on-surface-variant bg-dashboard-canvas">
        <span className="material-symbols-outlined text-[64px] opacity-30">route</span>
        <p className="font-bold text-lg">{loadError || `Trip "${tripId}" not found`}</p>
        <button onClick={() => navigate('/trips')} className="px-6 py-2.5 bg-industrial-blue text-white rounded-xl font-bold text-sm cursor-pointer">
          Back to Trips
        </button>
      </div>
    )
  }

  const currentStepIndex = trip.status === 'DRAFT' ? 0 : trip.status === 'DISPATCHED' ? 1 : 2
  const cargoPercent = vehicle ? Math.round((trip.cargoWeight / vehicle.maxLoadCapacity) * 100) : 0

  const validationChecks = [
    { label: 'Cargo within vehicle capacity', ok: vehicle ? trip.cargoWeight <= vehicle.maxLoadCapacity : true },
    { label: 'Driver not suspended', ok: trip.driver.status !== 'SUSPENDED' },
    { label: 'Vehicle available for dispatch', ok: trip.status !== 'DRAFT' || trip.vehicle.status === 'AVAILABLE' },
  ]

  const timelineEvents: Array<{ icon: string; label: string; desc: string; time: Date; active: boolean }> = [
    { icon: 'add', label: 'Trip Created', desc: `Draft created for ${trip.source} → ${trip.destination}`, time: new Date(trip.createdAt), active: false },
  ]
  if (trip.dispatchedAt) {
    timelineEvents.push({ icon: 'near_me', label: 'Trip Dispatched', desc: `Vehicle ${trip.vehicle.registrationNumber} and driver ${trip.driver.name} assigned.`, time: new Date(trip.dispatchedAt), active: true })
  }
  if (trip.completedAt) {
    timelineEvents.push({ icon: 'task_alt', label: 'Trip Completed', desc: `Distance: ${trip.actualDistance ?? '—'} km. Fuel used: ${trip.fuelConsumed ?? '—'} L.`, time: new Date(trip.completedAt), active: true })
  }
  if (trip.cancelledAt) {
    timelineEvents.push({ icon: 'cancel', label: 'Trip Cancelled', desc: '', time: new Date(trip.cancelledAt), active: true })
  }
  timelineEvents.sort((a, b) => a.time.getTime() - b.time.getTime())

  const handleDispatch = async () => {
    setActionError('')
    setIsActing(true)
    try {
      const updated = await dispatchTrip(trip.id)
      setTrip(updated)
      const v = await getVehicle(updated.vehicleId).catch(() => null)
      setVehicle(v)
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to dispatch trip'))
    } finally {
      setIsActing(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Cancel this trip?')) return
    setActionError('')
    setIsActing(true)
    try {
      const updated = await cancelTrip(trip.id)
      setTrip(updated)
      const v = await getVehicle(updated.vehicleId).catch(() => null)
      setVehicle(v)
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to cancel trip'))
    } finally {
      setIsActing(false)
    }
  }

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCompleteError('')
    if (!finalOdometer || !fuelConsumed) {
      setCompleteError('Please enter the final odometer and fuel consumed.')
      return
    }
    if (vehicle && Number(finalOdometer) <= vehicle.odometer) {
      setCompleteError(`Final odometer must be greater than the vehicle's current odometer (${vehicle.odometer} km).`)
      return
    }
    setIsActing(true)
    try {
      const updated = await completeTrip(trip.id, { finalOdometer: Number(finalOdometer), fuelConsumed: Number(fuelConsumed) })
      await createFuelLog({
        vehicleId: trip.vehicleId,
        tripId: trip.id,
        liters: Number(fuelConsumed),
        cost: fuelCost ? Number(fuelCost) : 0,
      }).catch(() => {
        // Trip completion already succeeded; a failed fuel log shouldn't block the flow.
      })
      setTrip(updated)
      const v = await getVehicle(updated.vehicleId).catch(() => null)
      setVehicle(v)
      setIsCompleting(false)
    } catch (err) {
      setCompleteError(getApiErrorMessage(err, 'Failed to complete trip'))
    } finally {
      setIsActing(false)
    }
  }

  return (
    <>
      {/* Header */}
      <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/5 bg-white/60 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/trips')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-industrial-blue transition-colors group cursor-pointer text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            Back to Trips
          </button>
          <div className="hidden sm:block h-6 w-px bg-outline-variant mx-2"></div>
          <div className="hidden sm:flex items-center gap-3">
            <h2 className="text-base font-bold text-on-surface">Trip #{trip.id.slice(0, 8).toUpperCase()}</h2>
            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${STATUS_COLORS[trip.status]}`}>
              {trip.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {canWrite && trip.status === 'DISPATCHED' && (
            <>
              <button onClick={() => setIsCompleting(true)} disabled={isActing} className="px-4 py-1.5 bg-background text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm disabled:opacity-60">Complete Trip</button>
              <button onClick={handleCancel} disabled={isActing} className="px-4 py-1.5 bg-white border border-error-red/30 text-error-red text-xs font-bold rounded-xl hover:bg-error-red/5 transition-all cursor-pointer disabled:opacity-60">Cancel Trip</button>
            </>
          )}
          {canWrite && trip.status === 'DRAFT' && (
            <>
              <button onClick={handleDispatch} disabled={isActing} className="px-4 py-1.5 bg-industrial-blue text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm disabled:opacity-60">
                {isActing ? 'Dispatching...' : 'Dispatch Trip'}
              </button>
              <button onClick={handleCancel} disabled={isActing} className="px-4 py-1.5 bg-white border border-error-red/30 text-error-red text-xs font-bold rounded-xl hover:bg-error-red/5 transition-all cursor-pointer disabled:opacity-60">Cancel Trip</button>
            </>
          )}
          {trip.status === 'COMPLETED' && (
            <span className="px-4 py-1.5 bg-success-green/10 text-success-green text-xs font-bold rounded-xl border border-success-green/20">Completed</span>
          )}
          {trip.status === 'CANCELLED' && (
            <span className="px-4 py-1.5 bg-error-red/10 text-error-red text-xs font-bold rounded-xl border border-error-red/20">Cancelled</span>
          )}
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">

        {actionError && (
          <div className="bg-error-red/10 border border-error-red/20 text-error-red text-sm rounded-xl px-4 py-3">{actionError}</div>
        )}

        {/* Complete Trip inline form */}
        {isCompleting && (
          <div className="bg-white p-6 border border-industrial-blue/30 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-on-surface font-headline-sm">Complete Trip</h3>
              <button onClick={() => setIsCompleting(false)} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            {completeError && (
              <div className="bg-error-red/10 border border-error-red/20 text-error-red text-xs rounded-xl px-4 py-3">{completeError}</div>
            )}
            <form onSubmit={handleCompleteSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Final Odometer (km)</label>
                <input value={finalOdometer} onChange={(e) => setFinalOdometer(e.target.value)} type="number" min={vehicle ? vehicle.odometer + 1 : undefined} className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 rounded-xl outline-none font-mono" placeholder={vehicle ? `> ${vehicle.odometer}` : ''} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Fuel Consumed (L)</label>
                <input value={fuelConsumed} onChange={(e) => setFuelConsumed(e.target.value)} type="number" className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 rounded-xl outline-none font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Fuel Cost ₹ (optional)</label>
                <input value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} type="number" className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 rounded-xl outline-none font-mono" />
              </div>
              <div className="md:col-span-3">
                <button type="submit" disabled={isActing} className="w-full py-3 bg-background text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer disabled:opacity-60">
                  {isActing ? 'Finalizing...' : 'Finalize Trip'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Trip Lifecycle Stepper (hidden for cancelled trips) */}
        {trip.status !== 'CANCELLED' && (
          <div className="bg-white p-6 md:p-8 border border-outline-variant rounded-2xl shadow-sm">
            <div className="flex justify-between relative">
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-outline-variant z-0"></div>
              <div className="absolute top-5 left-0 h-0.5 bg-industrial-blue z-0 transition-all" style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}></div>
              {STEPS.map((step, i) => {
                const isCompleted = i < currentStepIndex
                const isCurrent = i === currentStepIndex
                const time = step.status === 'DRAFT' ? trip.createdAt : step.status === 'DISPATCHED' ? trip.dispatchedAt : trip.completedAt
                return (
                  <div key={step.label} className="relative z-10 flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                      isCompleted || isCurrent ? 'bg-industrial-blue text-white' : 'bg-surface-container-high text-on-surface-variant'
                    } ${isCurrent && trip.status === 'DISPATCHED' ? 'animate-pulse shadow-md' : ''}`}>
                      <span className="material-symbols-outlined text-[18px]">{isCompleted ? 'check' : step.icon}</span>
                    </div>
                    <span className={`mt-2 text-xs font-bold ${isCurrent ? 'text-industrial-blue' : 'text-on-surface-variant'} font-label-md`}>{step.label}</span>
                    <span className="text-[10px] text-on-surface-variant opacity-70 mt-0.5 font-mono">{time ? new Date(time).toLocaleString() : 'Pending'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Main 12-col grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* LEFT COLUMN (8) */}
          <div className="col-span-12 lg:col-span-8 space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Trip Route */}
              <div className="bg-white p-6 border border-outline-variant rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Trip Route</h3>
                  <span className="material-symbols-outlined text-industrial-blue text-[20px]">map</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col space-y-6 relative flex-1">
                    <div className="absolute left-[7px] top-4 bottom-4 w-[2px] border-l-2 border-dashed border-outline-variant"></div>
                    <div className="flex items-center relative z-10">
                      <div className="w-4 h-4 rounded-full bg-success-green border-2 border-white ring-2 ring-success-green/20 shadow-sm shrink-0"></div>
                      <div className="ml-4">
                        <p className="text-[10px] text-on-surface-variant font-label-sm">Source</p>
                        <p className="text-base font-bold text-on-surface">{trip.source}</p>
                      </div>
                    </div>
                    <div className="flex items-center relative z-10">
                      <div className="w-4 h-4 rounded-full bg-error-red border-2 border-white ring-2 ring-error-red/20 shadow-sm shrink-0"></div>
                      <div className="ml-4">
                        <p className="text-[10px] text-on-surface-variant font-label-sm">Destination</p>
                        <p className="text-base font-bold text-on-surface">{trip.destination}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-on-surface-variant font-label-sm">Planned Distance</p>
                    <p className="text-base font-bold font-mono text-on-surface">{trip.plannedDistance} km</p>
                    {trip.actualDistance !== null && (
                      <>
                        <p className="text-[10px] text-on-surface-variant font-label-sm mt-2">Actual Distance</p>
                        <p className="text-base font-bold font-mono text-success-green">{trip.actualDistance} km</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Cargo Capacity */}
              <div className="bg-white p-6 border border-outline-variant rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Cargo Capacity</h3>
                    <span className="material-symbols-outlined text-safety-orange text-[20px]">inventory_2</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-on-surface">{cargoPercent}%</span>
                    <span className="text-sm text-on-surface-variant">Utilization</span>
                  </div>
                  <div className="w-full h-3 bg-surface-container-high rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-safety-orange transition-all duration-700 rounded-full" style={{ width: `${cargoPercent}%` }}></div>
                  </div>
                </div>
                <div className="flex justify-between mt-4 text-center">
                  <div className="flex-1 border-r border-outline-variant">
                    <p className="text-[10px] text-on-surface-variant font-label-sm">Used</p>
                    <p className="text-sm font-bold font-mono text-on-surface">{trip.cargoWeight}kg</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-on-surface-variant font-label-sm">Vehicle Max</p>
                    <p className="text-sm font-bold font-mono text-on-surface">{vehicle ? `${vehicle.maxLoadCapacity}kg` : '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation + Trip Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dispatch Validation */}
              <div className="bg-white p-6 border border-outline-variant rounded-2xl shadow-sm">
                <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-6 font-label-sm">Dispatch Validation</h3>
                <div className="space-y-3">
                  {validationChecks.map((check, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${check.ok ? 'bg-success-green/5 border-success-green/20' : 'bg-error-red/5 border-error-red/20'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-[18px] ${check.ok ? 'text-success-green' : 'text-error-red'}`}>{check.ok ? 'check_circle' : 'cancel'}</span>
                        <span className="text-sm text-on-surface">{check.label}</span>
                      </div>
                      <span className={`text-[10px] font-bold font-label-sm ${check.ok ? 'text-success-green' : 'text-error-red'}`}>{check.ok ? 'PASSED' : 'FAILED'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trip Metrics */}
              <div className="bg-background p-6 border border-background rounded-2xl text-white shadow-lg">
                <h3 className="text-[10px] font-bold opacity-60 uppercase tracking-wider mb-6 font-label-sm">Trip Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-sm opacity-80">Cargo Weight</span>
                    <span className="text-lg font-bold font-mono">{trip.cargoWeight} kg</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-sm opacity-80">Fuel Consumed</span>
                    <span className="text-lg font-bold font-mono">{trip.fuelConsumed !== null ? `${trip.fuelConsumed} L` : 'Not logged yet'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-bold">Fuel Efficiency</span>
                    <div className="text-right">
                      <span className="text-xl font-bold font-mono text-success-green">
                        {trip.actualDistance && trip.fuelConsumed ? `${(trip.actualDistance / trip.fuelConsumed).toFixed(2)} km/L` : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white p-6 md:p-8 border border-outline-variant rounded-2xl shadow-sm">
              <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-8 font-label-sm">Trip Activity Timeline</h3>
              <div className="space-y-8">
                {timelineEvents.map((item, i) => (
                  <div key={i} className="flex">
                    <div className="flex flex-col items-center mr-6 shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${item.active ? 'bg-industrial-blue text-white' : 'bg-surface-container-high text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                      </div>
                      {i < timelineEvents.length - 1 && <div className="w-0.5 flex-1 bg-outline-variant mt-2 opacity-30 min-h-[24px]"></div>}
                    </div>
                    <div className="pb-6">
                      <p className={`text-sm font-bold ${item.active ? 'text-industrial-blue' : 'text-on-surface'}`}>{item.label}</p>
                      {item.desc && <p className="text-xs text-on-surface-variant mt-1 leading-relaxed max-w-md">{item.desc}</p>}
                      <p className="text-[10px] text-on-surface-variant opacity-60 mt-2 font-mono">{item.time.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (4) */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {/* Assigned Resources */}
            <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Assigned Resources</h3>
                <span className="material-symbols-outlined text-industrial-blue text-[20px]">link</span>
              </div>

              {/* Vehicle */}
              <div className="p-6 border-b border-outline-variant">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mr-4 border border-outline-variant/30 shrink-0">
                    <span className="material-symbols-outlined text-on-surface-variant text-[24px]">local_shipping</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-label-sm">Vehicle</p>
                    <p className="text-base font-bold text-on-surface">{trip.vehicle.registrationNumber}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Model</span>
                    <span className="font-medium text-on-surface">{vehicle?.name ?? '—'}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Status</span>
                    <span className="font-mono font-bold bg-surface-container-high px-2 py-0.5 rounded border border-outline-variant/20 text-on-surface">{trip.vehicle.status}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Odometer</span>
                    <span className="text-on-surface">{vehicle ? `${vehicle.odometer.toLocaleString()} km` : '—'}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/fleet/${trip.vehicleId}`)}
                  className="w-full mt-4 py-2 border border-outline-variant text-xs font-bold text-on-surface-variant hover:bg-industrial-blue hover:text-white hover:border-industrial-blue rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  View Vehicle
                </button>
              </div>

              {/* Driver */}
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="relative mr-4 shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-industrial-blue/10 flex items-center justify-center border border-outline-variant/30">
                      <span className="material-symbols-outlined text-industrial-blue">person</span>
                    </div>
                    {trip.status === 'DISPATCHED' && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-green border-2 border-white rounded-full shadow-sm"></div>}
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-label-sm">Driver</p>
                    <p className="text-base font-bold text-on-surface">{trip.driver.name}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>License</span>
                    <span className="font-medium text-on-surface">{trip.driver.licenseNumber}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant items-center">
                    <span>Status</span>
                    <span className="font-bold text-on-surface">{trip.driver.status}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/drivers/${trip.driverId}`)}
                  className="w-full mt-4 py-2 border-2 border-outline-variant text-xs font-bold text-on-surface-variant hover:bg-industrial-blue hover:text-white hover:border-industrial-blue rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">badge</span>
                  View Driver Profile
                </button>
              </div>
            </div>

            {trip.status === 'COMPLETED' && (
              <div className="bg-success-green/5 border border-success-green/20 rounded-2xl p-6 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-success-green/10 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-success-green text-[28px]">task_alt</span>
                </div>
                <p className="text-sm font-bold text-on-surface">Trip Completed</p>
                <p className="text-xs text-on-surface-variant">Vehicle and driver have been restored to Available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
