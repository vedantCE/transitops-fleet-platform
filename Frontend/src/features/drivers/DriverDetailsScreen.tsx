import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDriver, updateDriver } from '../../services/drivers'
import { listTrips } from '../../services/trips'
import { getApiErrorMessage } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { canManageDrivers } from '../../lib/permissions'
import type { Driver, DriverStatus, Trip } from '../../types'

const STATUS_LABELS: Record<DriverStatus, string> = {
  AVAILABLE: 'Available',
  ON_TRIP: 'On Trip',
  OFF_DUTY: 'Off Duty',
  SUSPENDED: 'Suspended',
}

const statusColors: Record<DriverStatus, string> = {
  AVAILABLE: 'bg-success-green/10 text-success-green border-success-green/20',
  ON_TRIP: 'bg-industrial-blue/10 text-industrial-blue border-industrial-blue/20',
  OFF_DUTY: 'bg-gray-100 text-gray-500 border-gray-200',
  SUSPENDED: 'bg-error-red/10 text-error-red border-error-red/20',
}

const tripStatusColors: Record<Trip['status'], string> = {
  DRAFT: 'bg-gray-100 text-gray-500 border-gray-200',
  DISPATCHED: 'bg-industrial-blue/10 text-industrial-blue border-industrial-blue/20',
  COMPLETED: 'bg-success-green/10 text-success-green border-success-green/20',
  CANCELLED: 'bg-error-red/10 text-error-red border-error-red/20',
}

function getLicenseState(driver: Driver) {
  const daysLeft = Math.ceil((new Date(driver.licenseExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return { label: 'Expired', ok: false }
  if (daysLeft <= 30) return { label: `Expires in ${daysLeft}d`, ok: false }
  return { label: 'Valid', ok: true }
}

export default function DriverDetailsScreen() {
  const { driverId } = useParams<{ driverId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canWrite = canManageDrivers(user?.role)

  const [driver, setDriver] = useState<Driver | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [totalTrips, setTotalTrips] = useState(0)
  const [completedTrips, setCompletedTrips] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editContact, setEditContact] = useState('')
  const [editSafetyScore, setEditSafetyScore] = useState(0)
  const [editError, setEditError] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const fetchAll = async () => {
    if (!driverId) return
    setIsLoading(true)
    setLoadError('')
    try {
      const [d, recentTrips, allTrips, done] = await Promise.all([
        getDriver(driverId),
        listTrips({ driverId, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        listTrips({ driverId, limit: 1 }),
        listTrips({ driverId, status: 'COMPLETED', limit: 1 }),
      ])
      setDriver(d)
      setTrips(recentTrips.trips)
      setTotalTrips(allTrips.pagination.total)
      setCompletedTrips(done.pagination.total)
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load driver'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverId])

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center text-on-surface-variant bg-dashboard-canvas">Loading driver...</div>
  }

  if (!driver) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4 text-on-surface-variant bg-dashboard-canvas">
        <span className="material-symbols-outlined text-[64px] opacity-30">badge</span>
        <p className="font-bold text-lg">{loadError || `Driver "${driverId}" not found`}</p>
        <button onClick={() => navigate('/drivers')} className="px-6 py-2.5 bg-industrial-blue text-white rounded-xl font-bold text-sm cursor-pointer">
          Back to Drivers
        </button>
      </div>
    )
  }

  const license = getLicenseState(driver)
  const activeTrip = trips.find((t) => t.status === 'DISPATCHED')

  const timeline: Array<{ label: string; desc: string; time: Date; color: string }> = []
  trips.forEach((t) => {
    if (t.dispatchedAt) timeline.push({ label: `Trip Dispatched — ${t.source} → ${t.destination}`, desc: `Vehicle: ${t.vehicle.registrationNumber}`, time: new Date(t.dispatchedAt), color: 'bg-industrial-blue' })
    if (t.completedAt) timeline.push({ label: `Trip Completed — ${t.source} → ${t.destination}`, desc: `Distance: ${t.actualDistance ?? '—'} km`, time: new Date(t.completedAt), color: 'bg-success-green' })
    if (t.cancelledAt) timeline.push({ label: `Trip Cancelled — ${t.source} → ${t.destination}`, desc: '', time: new Date(t.cancelledAt), color: 'bg-error-red' })
  })
  timeline.sort((a, b) => b.time.getTime() - a.time.getTime())

  const openEditDrawer = () => {
    setEditName(driver.name)
    setEditCategory(driver.licenseCategory)
    setEditContact(driver.contactNumber)
    setEditSafetyScore(driver.safetyScore)
    setEditError('')
    setIsEditOpen(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditError('')
    setIsSavingEdit(true)
    try {
      const updated = await updateDriver(driver.id, {
        name: editName,
        licenseCategory: editCategory,
        contactNumber: editContact,
        safetyScore: editSafetyScore,
      })
      setDriver(updated)
      setIsEditOpen(false)
    } catch (err) {
      setEditError(getApiErrorMessage(err, 'Failed to update driver'))
    } finally {
      setIsSavingEdit(false)
    }
  }

  const changeStatus = async (status: 'AVAILABLE' | 'OFF_DUTY' | 'SUSPENDED') => {
    setActionError('')
    setIsUpdatingStatus(true)
    try {
      const updated = await updateDriver(driver.id, { status })
      setDriver(updated)
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to update driver status'))
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <>
      {/* Header */}
      <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/5 bg-white/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/drivers')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-industrial-blue transition-colors group cursor-pointer text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            Drivers
          </button>
        </div>
        {canWrite && (
        <div className="flex items-center gap-3">
          <button
            onClick={openEditDrawer}
            className="px-4 py-1.5 bg-surface-container-high text-on-surface text-xs font-bold rounded-xl hover:bg-outline-variant transition-all cursor-pointer flex items-center gap-1.5 border border-outline-variant"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
            Edit Driver
          </button>
          {driver.status === 'OFF_DUTY' || driver.status === 'SUSPENDED' ? (
            <button
              onClick={() => changeStatus('AVAILABLE')}
              disabled={isUpdatingStatus}
              className="px-4 py-1.5 bg-success-green/10 text-success-green text-xs font-bold rounded-xl hover:bg-success-green hover:text-white transition-all cursor-pointer flex items-center gap-1.5 border border-success-green/20 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Reinstate
            </button>
          ) : (
            <button
              onClick={() => changeStatus('OFF_DUTY')}
              disabled={driver.status === 'ON_TRIP' || isUpdatingStatus}
              className="px-4 py-1.5 bg-surface-container-high text-on-surface text-xs font-bold rounded-xl hover:bg-outline-variant transition-all cursor-pointer flex items-center gap-1.5 border border-outline-variant disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[14px]">timer_off</span>
              Set Off Duty
            </button>
          )}
          {driver.status !== 'SUSPENDED' && (
            <button
              onClick={() => changeStatus('SUSPENDED')}
              disabled={driver.status === 'ON_TRIP' || isUpdatingStatus}
              className="px-4 py-1.5 bg-error-red/10 text-error-red text-xs font-bold rounded-xl hover:bg-error-red hover:text-white transition-all cursor-pointer flex items-center gap-1.5 border border-error-red/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[14px]">block</span>
              Suspend Driver
            </button>
          )}
        </div>
        )}
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">

        {actionError && (
          <div className="bg-error-red/10 border border-error-red/20 text-error-red text-sm rounded-xl px-4 py-3">{actionError}</div>
        )}

        {/* Driver Identity Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-industrial-blue/10 flex items-center justify-center border-2 border-industrial-blue/30">
                <span className="material-symbols-outlined text-industrial-blue text-[36px]">person</span>
              </div>
              {driver.status === 'AVAILABLE' && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-green border-2 border-white rounded-full"></div>}
              {driver.status === 'ON_TRIP' && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-industrial-blue border-2 border-white rounded-full animate-pulse"></div>}
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-3 mb-1">
                <h2 className="text-2xl font-bold text-on-surface font-headline-lg">{driver.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${statusColors[driver.status]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${driver.status === 'AVAILABLE' ? 'bg-success-green animate-pulse' : driver.status === 'ON_TRIP' ? 'bg-industrial-blue animate-pulse' : 'bg-gray-400'}`}></span>
                  {STATUS_LABELS[driver.status]}
                </span>
                <span className="text-on-surface-variant text-sm font-mono font-semibold">{driver.licenseNumber}</span>
              </div>
              <p className="text-xs text-on-surface-variant">{driver.licenseCategory} &bull; {driver.contactNumber}</p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm hover:border-industrial-blue transition-all">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-label-sm">Safety Score</p>
              <span className="material-symbols-outlined text-[18px] text-success-green">verified_user</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface">{driver.safetyScore}%</h3>
            <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-3 overflow-hidden">
              <div className={`h-full rounded-full ${driver.safetyScore >= 80 ? 'bg-success-green' : driver.safetyScore >= 60 ? 'bg-safety-orange' : 'bg-error-red'}`} style={{ width: `${driver.safetyScore}%` }}></div>
            </div>
          </div>
          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm hover:border-industrial-blue transition-all">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-label-sm">License Status</p>
              <span className={`material-symbols-outlined text-[18px] ${license.ok ? 'text-industrial-blue' : 'text-error-red'}`}>badge</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface">{license.label}</h3>
            <p className="text-[11px] text-on-surface-variant mt-2">
              {driver.licenseCategory} • Exp: {new Date(driver.licenseExpiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm hover:border-industrial-blue transition-all">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-label-sm">Completed Trips</p>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">local_shipping</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface">{completedTrips}</h3>
            <p className="text-[11px] text-on-surface-variant mt-2">of {totalTrips} total assigned</p>
          </div>
          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm hover:border-industrial-blue transition-all">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-label-sm">Dispatch Status</p>
              <span className={`material-symbols-outlined text-[18px] ${driver.status === 'AVAILABLE' ? 'text-success-green' : 'text-error-red'}`}>
                {driver.status === 'AVAILABLE' ? 'check_circle' : 'block'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-on-surface">{driver.status === 'AVAILABLE' ? 'Eligible' : 'Blocked'}</h3>
            <p className="text-[11px] text-on-surface-variant mt-2">
              {driver.status === 'AVAILABLE' ? 'All checks passed' : `Currently ${STATUS_LABELS[driver.status]}`}
            </p>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT 8 cols */}
          <div className="col-span-12 lg:col-span-8 space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Operational Summary */}
              <section className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-base font-bold text-on-surface font-headline-sm">Operational Summary</h4>
                  <span className="material-symbols-outlined text-on-surface-variant">info</span>
                </div>
                <div className="space-y-3 text-sm divide-y divide-surface-container-low">
                  {[
                    { label: 'Total Trips Assigned', value: totalTrips },
                    { label: 'Completed Successfully', value: completedTrips },
                    { label: 'Safety Score', value: `${driver.safetyScore}%` },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center py-2">
                      <span className="text-on-surface-variant">{row.label}</span>
                      <span className="font-bold text-on-surface">{row.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Compliance Status */}
              <section className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-base font-bold text-on-surface font-headline-sm">Compliance Status</h4>
                  <span className={`material-symbols-outlined ${license.ok && driver.status !== 'SUSPENDED' ? 'text-success-green' : 'text-error-red'}`}>verified</span>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: license.ok ? 'check_circle' : 'warning', label: 'License Validity', sub: `${driver.licenseNumber} — ${license.label}`, ok: license.ok },
                    { icon: driver.status === 'SUSPENDED' ? 'block' : 'check_circle', label: 'Suspension Status', sub: driver.status === 'SUSPENDED' ? 'Currently suspended' : 'Not suspended', ok: driver.status !== 'SUSPENDED' },
                    { icon: driver.safetyScore >= 60 ? 'check_circle' : 'warning', label: 'Safety Score Threshold', sub: driver.safetyScore >= 60 ? 'Above minimum threshold' : 'Below recommended threshold', ok: driver.safetyScore >= 60 },
                  ].map((item, i) => (
                    <div key={i} className={`p-3 rounded-xl border flex items-start gap-3 ${item.ok ? 'bg-surface-container-low border-success-green/10' : 'bg-error-red/5 border-error-red/20'}`}>
                      <span className={`material-symbols-outlined ${item.ok ? 'text-success-green' : 'text-error-red'} text-[20px] shrink-0`}>{item.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-on-surface">{item.label}</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Recent Trip History Table */}
            <section className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center">
                <h4 className="text-base font-bold text-on-surface font-headline-sm">Recent Trip History</h4>
                <button onClick={() => navigate('/trips')} className="text-industrial-blue text-xs font-bold hover:underline cursor-pointer">View All Records</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant uppercase tracking-widest text-[10px] font-label-sm">
                    <tr>
                      <th className="px-6 py-3 font-bold">Route</th>
                      <th className="px-6 py-3 font-bold">Status</th>
                      <th className="px-6 py-3 font-bold">Vehicle</th>
                      <th className="px-6 py-3 font-bold">Cargo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 font-sans text-on-surface">
                    {trips.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-6 text-center text-on-surface-variant">No trips assigned yet.</td></tr>
                    ) : (
                      trips.map((trip) => (
                        <tr key={trip.id} onClick={() => navigate(`/trips/${trip.id}`)} className="hover:bg-surface-container-lowest transition-colors cursor-pointer">
                          <td className="px-6 py-4 text-on-surface-variant">{trip.source} → {trip.destination}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${tripStatusColors[trip.status]}`}>{trip.status}</span>
                          </td>
                          <td className="px-6 py-4 font-mono font-medium">{trip.vehicle.registrationNumber}</td>
                          <td className="px-6 py-4">{trip.cargoWeight} kg</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* RIGHT 4 cols */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Current Assignment */}
            <section className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
              <h4 className="text-base font-bold text-on-surface mb-4 font-headline-sm">Current Assignment</h4>
              <div className="bg-industrial-blue/5 p-4 rounded-xl border border-industrial-blue/20">
                <div className="flex items-center gap-2 text-industrial-blue mb-1">
                  <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
                  <span className="text-xs font-bold">Active Trip</span>
                </div>
                {activeTrip ? (
                  <div className="text-sm text-on-surface-variant">
                    Dispatched on <span className="font-bold text-on-surface">{activeTrip.vehicle.registrationNumber}</span>: {activeTrip.source} → {activeTrip.destination}
                    <button
                      onClick={() => navigate(`/fleet/${activeTrip.vehicleId}`)}
                      className="w-full mt-3 bg-industrial-blue text-white py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      View Vehicle
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant">No active trip assigned to this driver.</p>
                )}
              </div>
            </section>

            {/* Activity Timeline */}
            <section className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-base font-bold text-on-surface font-headline-sm">Driver Activity</h4>
              </div>
              {timeline.length === 0 ? (
                <p className="text-xs text-on-surface-variant">No activity recorded yet.</p>
              ) : (
                <div className="relative space-y-5 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-outline-variant">
                  {timeline.map((item, i) => (
                    <div key={i} className="relative pl-9">
                      <div className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full ${item.color} border-2 border-white shadow-sm`}></div>
                      <p className="text-xs font-bold text-on-surface">{item.label}</p>
                      {item.desc && <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">{item.desc}</p>}
                      <p className="text-[10px] text-on-surface-variant mt-1 font-mono">{item.time.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* EDIT DRIVER DRAWER */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex justify-end animate-fade-in" onClick={() => setIsEditOpen(false)}>
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-black/5 animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-base font-bold text-on-surface font-headline-sm">Edit Driver</h3>
              <button onClick={() => setIsEditOpen(false)} className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
              {editError && <div className="bg-error-red/10 border border-error-red/20 text-error-red text-xs rounded-xl px-4 py-3">{editError}</div>}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Full Name</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 rounded-xl outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">License Category</label>
                <input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 rounded-xl outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Contact Number</label>
                <input value={editContact} onChange={(e) => setEditContact(e.target.value)} className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 rounded-xl outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex justify-between">
                  Safety Score <span className="text-industrial-blue font-mono font-bold">{editSafetyScore}%</span>
                </label>
                <input type="range" min="0" max="100" value={editSafetyScore} onChange={(e) => setEditSafetyScore(Number(e.target.value))} className="w-full h-2 bg-dashboard-canvas rounded-lg appearance-none cursor-pointer accent-industrial-blue" />
              </div>
              <div className="pt-6 border-t border-black/5 flex gap-4">
                <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 px-4 py-3 border border-black/5 rounded-xl font-bold text-on-surface hover:bg-dashboard-canvas transition-all uppercase tracking-wider text-xs cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSavingEdit} className="flex-1 px-4 py-3 bg-background text-white rounded-xl font-bold hover:opacity-90 transition-all uppercase tracking-wider text-xs cursor-pointer shadow-md disabled:opacity-60">
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
