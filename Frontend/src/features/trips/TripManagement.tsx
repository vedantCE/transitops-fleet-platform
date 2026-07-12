import { useEffect, useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { listTrips, createTrip, dispatchTrip, completeTrip, cancelTrip } from '../../services/trips'
import { listVehicles } from '../../services/vehicles'
import { listDrivers } from '../../services/drivers'
import { getVehicle } from '../../services/vehicles'
import { createFuelLog } from '../../services/fuelExpenses'
import { getApiErrorMessage } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { canManageTrips } from '../../lib/permissions'
import type { Trip, TripStatus, Vehicle, Driver } from '../../types'

const STATUS_TABS: Array<TripStatus | 'All'> = ['All', 'DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED']

const STATUS_STYLE: Record<TripStatus, string> = {
  DRAFT: 'bg-gray-100 text-on-surface-variant border-gray-200',
  DISPATCHED: 'bg-blue-50 text-industrial-blue border-industrial-blue/10',
  COMPLETED: 'bg-green-50 text-success-green border-success-green/10',
  CANCELLED: 'bg-red-50 text-error-red border-error-red/10',
}

export default function TripManagement() {
  const { setIsMobileMenuOpen } = useOutletContext<{ setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>> }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canWrite = canManageTrips(user?.role)

  const [tripsFilter, setTripsFilter] = useState<TripStatus | 'All'>('All')
  const [boardSearch, setBoardSearch] = useState('')

  const [trips, setTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busyTripId, setBusyTripId] = useState<string | null>(null)

  const [dispatchableVehicles, setDispatchableVehicles] = useState<Vehicle[]>([])
  const [dispatchableDrivers, setDispatchableDrivers] = useState<Driver[]>([])

  // Create Trip Form States
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [driverId, setDriverId] = useState('')
  const [cargo, setCargo] = useState('')
  const [distance, setDistance] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Complete Trip Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [completingTrip, setCompletingTrip] = useState<Trip | null>(null)
  const [completingVehicleOdometer, setCompletingVehicleOdometer] = useState(0)
  const [finalOdometer, setFinalOdometer] = useState('')
  const [fuelConsumed, setFuelConsumed] = useState('')
  const [fuelCost, setFuelCost] = useState('')
  const [modalError, setModalError] = useState('')
  const [isFinalizing, setIsFinalizing] = useState(false)

  const fetchTrips = async () => {
    setIsLoading(true)
    setLoadError('')
    try {
      const { trips: data } = await listTrips({ limit: 100, sortBy: 'createdAt', sortOrder: 'desc' })
      setTrips(data)
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load trips'))
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAssignableOptions = async () => {
    try {
      const [v, d] = await Promise.all([
        listVehicles({ dispatchable: true, limit: 100 }),
        listDrivers({ dispatchable: true, limit: 100 }),
      ])
      setDispatchableVehicles(v.vehicles)
      setDispatchableDrivers(d.drivers)
    } catch {
      // Non-fatal — the create-trip form will just show empty dropdowns.
    }
  }

  useEffect(() => {
    fetchTrips()
    fetchAssignableOptions()
  }, [])

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!source || !destination || !vehicleId || !driverId || !cargo || !distance) {
      setFormError('Please fill out all fields to create the trip.')
      return
    }

    setIsSubmitting(true)
    try {
      await createTrip({
        source,
        destination,
        vehicleId,
        driverId,
        cargoWeight: Number(cargo),
        plannedDistance: Number(distance),
      })

      setSource('')
      setDestination('')
      setVehicleId('')
      setDriverId('')
      setCargo('')
      setDistance('')
      fetchTrips()
      fetchAssignableOptions()
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to create trip'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDispatch = async (trip: Trip) => {
    setActionError('')
    setBusyTripId(trip.id)
    try {
      await dispatchTrip(trip.id)
      fetchTrips()
      fetchAssignableOptions()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to dispatch trip'))
    } finally {
      setBusyTripId(null)
    }
  }

  const handleCancel = async (trip: Trip) => {
    if (!window.confirm(`Cancel trip ${trip.source} → ${trip.destination}?`)) return
    setActionError('')
    setBusyTripId(trip.id)
    try {
      await cancelTrip(trip.id)
      fetchTrips()
      fetchAssignableOptions()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to cancel trip'))
    } finally {
      setBusyTripId(null)
    }
  }

  const handleCompleteTripTrigger = async (trip: Trip) => {
    setModalError('')
    setCompletingTrip(trip)
    setFinalOdometer('')
    setFuelConsumed('')
    setFuelCost('')
    setIsModalOpen(true)
    try {
      const vehicle = await getVehicle(trip.vehicleId)
      setCompletingVehicleOdometer(vehicle.odometer)
    } catch {
      setCompletingVehicleOdometer(0)
    }
  }

  const handleFinalizeTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError('')

    if (!completingTrip || !finalOdometer || !fuelConsumed) {
      setModalError('Please enter the final odometer and fuel consumed.')
      return
    }
    if (Number(finalOdometer) <= completingVehicleOdometer) {
      setModalError(`Final odometer must be greater than the vehicle's current odometer (${completingVehicleOdometer.toLocaleString()} km).`)
      return
    }

    setIsFinalizing(true)
    try {
      await completeTrip(completingTrip.id, {
        finalOdometer: Number(finalOdometer),
        fuelConsumed: Number(fuelConsumed),
      })

      await createFuelLog({
        vehicleId: completingTrip.vehicleId,
        tripId: completingTrip.id,
        liters: Number(fuelConsumed),
        cost: fuelCost ? Number(fuelCost) : 0,
      }).catch(() => {
        // Trip completion already succeeded; a failed fuel log shouldn't block the flow.
      })

      setIsModalOpen(false)
      setCompletingTrip(null)
      fetchTrips()
    } catch (err) {
      setModalError(getApiErrorMessage(err, 'Failed to complete trip'))
    } finally {
      setIsFinalizing(false)
    }
  }

  const previewDistance = Number(finalOdometer) > completingVehicleOdometer ? Number(finalOdometer) - completingVehicleOdometer : 0
  const previewEfficiency = Number(fuelConsumed) > 0 ? (previewDistance / Number(fuelConsumed)).toFixed(2) : '—'

  const filteredTrips = trips.filter((t) => {
    if (tripsFilter !== 'All' && t.status !== tripsFilter) return false
    if (boardSearch.trim() !== '') {
      const q = boardSearch.toLowerCase()
      return (
        t.source.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        t.vehicle.registrationNumber.toLowerCase().includes(q) ||
        t.driver.name.toLowerCase().includes(q)
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
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
        <div>
          <h2 className="text-2xl font-bold text-on-surface font-headline-lg">Trip Management</h2>
          <p className="text-sm text-on-surface-variant mt-1 font-body-md">Create trips, dispatch vehicles, and log final trip odometer/fuel data.</p>
        </div>

        {actionError && (
          <div className="bg-error-red/10 border border-error-red/20 text-error-red text-sm rounded-xl px-4 py-3">{actionError}</div>
        )}

        {/* Content Split: Form & Board */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Create Trip Form (Left 5/12) */}
          {canWrite && (
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-industrial-blue">
                <span className="material-symbols-outlined">route</span>
              </div>
              <h3 className="text-base font-bold text-on-surface font-headline-sm">Create Trip</h3>
            </div>

            <form onSubmit={handleCreateTrip} className="space-y-4 font-body-sm text-sm">
              {formError && (
                <div className="bg-error-red/10 border border-error-red/20 text-error-red text-xs rounded-xl px-4 py-3">{formError}</div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Origin</label>
                  <input
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
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none cursor-pointer"
                  >
                    <option value="">Select Vehicle</option>
                    {dispatchableVehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.registrationNumber} — {v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Driver</label>
                  <select
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none cursor-pointer"
                  >
                    <option value="">Select Driver</option>
                    {dispatchableDrivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Cargo (kg)</label>
                  <input
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none text-right font-mono"
                    type="number"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Planned Distance (km)</label>
                  <input
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none text-right font-mono"
                    type="number"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-background text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-background/25 cursor-pointer uppercase tracking-widest text-[10px] disabled:opacity-60"
              >
                {isSubmitting ? 'Creating...' : 'Create Trip (Draft)'}
              </button>
            </form>
          </div>
          )}

          {/* Trips Board (Right 7/12, or full width if read-only) */}
          <div className={`${canWrite ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4 w-full`}>
            {/* Board Filters */}
            <div className="bg-white p-4 border border-black/5 rounded-2xl flex justify-between items-center shadow-sm overflow-x-auto">
              <div className="flex gap-2 text-xs font-bold font-label-sm uppercase">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTripsFilter(tab)}
                    className={`px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      tripsFilter === tab ? 'bg-dashboard-canvas text-on-surface' : 'text-on-surface-variant hover:bg-dashboard-canvas/30'
                    }`}
                  >
                    {tab === 'All' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Board Items */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="bg-white p-10 rounded-2xl border border-black/5 text-center text-on-surface-variant">Loading trips...</div>
              ) : loadError ? (
                <div className="bg-error-red/10 border border-error-red/20 text-error-red text-sm rounded-xl px-4 py-3">{loadError}</div>
              ) : filteredTrips.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl border border-black/5 text-center text-on-surface-variant">No trips match these filters.</div>
              ) : (
                filteredTrips.map((trip) => (
                  <div key={trip.id} className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:border-industrial-blue/30 hover:shadow-md transition-all">
                    {/* Route details */}
                    <div className="space-y-4 flex-1 cursor-pointer" onClick={() => navigate(`/trips/${trip.id}`)}>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-industrial-blue bg-blue-50 px-2.5 py-0.5 rounded font-mono uppercase tracking-wider">#{trip.id.slice(0, 8).toUpperCase()}</span>
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${STATUS_STYLE[trip.status]}`}>{trip.status}</span>
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

                      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-50 text-xs font-mono font-medium text-on-surface-variant">
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider font-sans font-label-sm">Vehicle</span>
                          <span className="text-on-surface font-bold">{trip.vehicle.registrationNumber}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider font-sans font-label-sm">Driver</span>
                          <span className="text-on-surface font-bold">{trip.driver.name}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider font-sans font-label-sm">Cargo</span>
                          <span className="text-on-surface font-bold">{trip.cargoWeight.toLocaleString()} kg</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col justify-between items-end border-l border-gray-50 pl-6 shrink-0 text-right min-w-[140px]">
                      <div>
                        <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Planned Distance</p>
                        <p className="text-lg font-bold text-on-surface font-sans">{trip.plannedDistance.toLocaleString()} km</p>
                      </div>

                      <div className="flex flex-col gap-2 mt-4 items-end">
                        {canWrite && trip.status === 'DRAFT' && (
                          <>
                            <button
                              onClick={() => handleDispatch(trip)}
                              disabled={busyTripId === trip.id}
                              className="bg-background text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all uppercase tracking-wider shadow-md cursor-pointer disabled:opacity-60"
                            >
                              {busyTripId === trip.id ? 'Dispatching...' : 'Dispatch'}
                            </button>
                            <button onClick={() => handleCancel(trip)} className="text-error-red text-[10px] font-bold uppercase hover:underline cursor-pointer">Cancel</button>
                          </>
                        )}
                        {canWrite && trip.status === 'DISPATCHED' && (
                          <>
                            <button
                              onClick={() => handleCompleteTripTrigger(trip)}
                              className="bg-background text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all uppercase tracking-wider shadow-md cursor-pointer"
                            >
                              Complete Trip
                            </button>
                            <button onClick={() => handleCancel(trip)} className="text-error-red text-[10px] font-bold uppercase hover:underline cursor-pointer">Cancel</button>
                          </>
                        )}
                        {(trip.status === 'COMPLETED' || trip.status === 'CANCELLED') && (
                          <div className="text-xs text-on-surface-variant font-medium font-body-sm">
                            {trip.status === 'COMPLETED' && trip.completedAt ? `Completed ${new Date(trip.completedAt).toLocaleDateString()}` : ''}
                            {trip.status === 'CANCELLED' && trip.cancelledAt ? `Cancelled ${new Date(trip.cancelledAt).toLocaleDateString()}` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TRIP COMPLETION MODAL */}
      {isModalOpen && completingTrip && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border border-black/5 animate-scale-up">
            <div className="p-6 border-b border-black/5 bg-gray-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-on-surface font-headline-sm">Complete Trip Logistics</h3>
                <p className="text-xs text-on-surface-variant font-body-sm mt-0.5">
                  {completingTrip.source} → {completingTrip.destination} • Current odometer: {completingVehicleOdometer.toLocaleString()} km
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleFinalizeTripSubmit}>
              <div className="p-6 space-y-6 font-body-sm text-sm">
                {modalError && (
                  <div className="bg-error-red/10 border border-error-red/20 text-error-red text-xs rounded-xl px-4 py-3">{modalError}</div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Final Odometer (km)</label>
                    <input
                      value={finalOdometer}
                      onChange={(e) => setFinalOdometer(e.target.value)}
                      className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 focus:border-industrial-blue focus:ring-1 focus:ring-industrial-blue outline-none text-sm font-mono"
                      placeholder={`must be > ${completingVehicleOdometer}`}
                      min={completingVehicleOdometer + 1}
                      type="number"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm font-sans">Fuel Consumed (L)</label>
                    <input
                      value={fuelConsumed}
                      onChange={(e) => setFuelConsumed(e.target.value)}
                      className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 focus:border-industrial-blue focus:ring-1 focus:ring-industrial-blue outline-none text-sm font-mono"
                      placeholder="Liters"
                      type="number"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Fuel Cost (₹, optional — logs a fuel entry)</label>
                  <input
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="w-full bg-white border border-black/5 rounded-xl px-4 py-3 focus:border-industrial-blue focus:ring-1 focus:ring-industrial-blue outline-none text-sm font-mono"
                    placeholder="Enter amount"
                    type="number"
                  />
                </div>

                <div className="bg-dashboard-canvas border border-black/5 p-6 rounded-2xl space-y-4">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-label-sm">Live Summary</p>
                  <div className="flex justify-between items-center text-sm font-sans">
                    <span className="text-on-surface-variant">Distance Travelled</span>
                    <span className="font-bold text-on-surface font-mono">{previewDistance.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-sans">
                    <span className="text-on-surface-variant">Fuel Efficiency</span>
                    <span className="font-bold text-success-green font-mono">{previewEfficiency} km/L</span>
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
                  disabled={isFinalizing}
                  className="flex-1 py-3.5 bg-on-background text-white rounded-xl font-bold hover:opacity-90 shadow-lg uppercase tracking-widest text-[10px] cursor-pointer disabled:opacity-60"
                >
                  {isFinalizing ? 'Finalizing...' : 'Finalize Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
