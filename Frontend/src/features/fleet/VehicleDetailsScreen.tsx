import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getVehicle, updateVehicle } from '../../services/vehicles'
import { getVehicleStats } from '../../services/reports'
import { listMaintenanceLogs } from '../../services/maintenance'
import { listTrips } from '../../services/trips'
import { getApiErrorMessage } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { canManageVehicles } from '../../lib/permissions'
import type { MaintenanceLog, Trip, Vehicle, VehicleStats } from '../../types'

const STATUS_LABELS: Record<Vehicle['status'], string> = {
  AVAILABLE: 'Available',
  ON_TRIP: 'On Trip',
  IN_SHOP: 'In Shop',
  RETIRED: 'Retired',
}

const statusColors: Record<Vehicle['status'], string> = {
  AVAILABLE: 'bg-success-green/10 text-success-green border-success-green/20',
  ON_TRIP: 'bg-industrial-blue/10 text-industrial-blue border-industrial-blue/20',
  IN_SHOP: 'bg-safety-orange/10 text-safety-orange border-safety-orange/20',
  RETIRED: 'bg-gray-100 text-gray-500 border-gray-200',
}

const TRIP_STATUS_STYLE: Record<Trip['status'], string> = {
  DRAFT: 'text-on-surface-variant',
  DISPATCHED: 'text-industrial-blue',
  COMPLETED: 'text-success-green',
  CANCELLED: 'text-error-red',
}

interface TimelineEntry {
  icon: string
  color: string
  label: string
  time: Date
  desc: string
}

export default function VehicleDetailsScreen() {
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canWrite = canManageVehicles(user?.role)

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [stats, setStats] = useState<VehicleStats | null>(null)
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState('')
  const [editCapacity, setEditCapacity] = useState('')
  const [editCost, setEditCost] = useState('')
  const [editRegion, setEditRegion] = useState('')
  const [editError, setEditError] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isRetiring, setIsRetiring] = useState(false)
  const [actionError, setActionError] = useState('')

  const fetchAll = async () => {
    if (!vehicleId) return
    setIsLoading(true)
    setLoadError('')
    try {
      const [v, s, m, t] = await Promise.all([
        getVehicle(vehicleId),
        getVehicleStats(vehicleId).catch(() => null),
        listMaintenanceLogs({ vehicleId, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        listTrips({ vehicleId, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
      ])
      setVehicle(v)
      setStats(s)
      setMaintenanceLogs(m.maintenanceLogs)
      setTrips(t.trips)
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load vehicle'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-on-surface-variant bg-dashboard-canvas">
        Loading vehicle...
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4 text-on-surface-variant bg-dashboard-canvas">
        <span className="material-symbols-outlined text-[64px] opacity-30">directions_bus_filled</span>
        <p className="font-bold text-lg">{loadError || `Vehicle "${vehicleId}" not found`}</p>
        <button
          onClick={() => navigate('/fleet')}
          className="px-6 py-2.5 bg-industrial-blue text-white rounded-xl font-bold text-sm cursor-pointer"
        >
          Back to Fleet
        </button>
      </div>
    )
  }

  const activeTrip = trips.find((t) => t.status === 'DISPATCHED')
  const activeMaintenance = maintenanceLogs.find((m) => m.status === 'ACTIVE')

  const timeline: TimelineEntry[] = []
  trips.forEach((t) => {
    if (t.dispatchedAt) {
      timeline.push({
        icon: 'local_shipping',
        color: 'bg-industrial-blue',
        label: `Trip Dispatched — ${t.source} → ${t.destination}`,
        time: new Date(t.dispatchedAt),
        desc: `Driver: ${t.driver.name}. Cargo: ${t.cargoWeight}kg.`,
      })
    }
    if (t.completedAt) {
      timeline.push({
        icon: 'task_alt',
        color: 'bg-success-green',
        label: `Trip Completed — ${t.source} → ${t.destination}`,
        time: new Date(t.completedAt),
        desc: `Distance: ${t.actualDistance ?? '—'} km. Fuel used: ${t.fuelConsumed ?? '—'} L.`,
      })
    }
    if (t.cancelledAt) {
      timeline.push({
        icon: 'cancel',
        color: 'bg-error-red',
        label: `Trip Cancelled — ${t.source} → ${t.destination}`,
        time: new Date(t.cancelledAt),
        desc: 'Trip was cancelled before completion.',
      })
    }
  })
  maintenanceLogs.forEach((m) => {
    timeline.push({
      icon: 'build',
      color: 'bg-safety-orange',
      label: `Maintenance Started — ${m.description}`,
      time: new Date(m.startDate),
      desc: `Cost: ₹${m.cost.toLocaleString()}`,
    })
    if (m.endDate) {
      timeline.push({
        icon: 'build_circle',
        color: 'bg-success-green',
        label: `Maintenance Closed — ${m.description}`,
        time: new Date(m.endDate),
        desc: `Vehicle restored to service.`,
      })
    }
  })
  timeline.sort((a, b) => b.time.getTime() - a.time.getTime())
  const recentTimeline = timeline.slice(0, 5)

  const openEditDrawer = () => {
    setEditName(vehicle.name)
    setEditType(vehicle.type)
    setEditCapacity(String(vehicle.maxLoadCapacity))
    setEditCost(String(vehicle.acquisitionCost))
    setEditRegion(vehicle.region ?? '')
    setEditError('')
    setIsEditOpen(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditError('')
    setIsSavingEdit(true)
    try {
      const updated = await updateVehicle(vehicle.id, {
        name: editName,
        type: editType,
        maxLoadCapacity: Number(editCapacity) || 0,
        acquisitionCost: Number(editCost) || 0,
        region: editRegion.trim() || undefined,
      })
      setVehicle(updated)
      setIsEditOpen(false)
    } catch (err) {
      setEditError(getApiErrorMessage(err, 'Failed to update vehicle'))
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleRetire = async () => {
    if (!window.confirm(`Retire ${vehicle.registrationNumber}? It will no longer be eligible for dispatch.`)) {
      return
    }
    setActionError('')
    setIsRetiring(true)
    try {
      const updated = await updateVehicle(vehicle.id, { status: 'RETIRED' })
      setVehicle(updated)
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to retire vehicle'))
    } finally {
      setIsRetiring(false)
    }
  }

  return (
    <>
      {/* Top Header */}
      <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/5 bg-white/60 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/fleet')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-industrial-blue transition-colors group cursor-pointer text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            Back to Fleet
          </button>
        </div>
        <div className="flex items-center gap-3">
          {canWrite && (
          <button
            onClick={openEditDrawer}
            className="px-4 py-1.5 border border-industrial-blue text-industrial-blue text-xs font-bold rounded-xl hover:bg-industrial-blue/5 transition-all cursor-pointer"
          >
            Edit Vehicle
          </button>
          )}
          {canWrite && (
          <button
            onClick={handleRetire}
            disabled={vehicle.status === 'RETIRED' || vehicle.status === 'ON_TRIP' || isRetiring}
            className="px-4 py-1.5 bg-error-red text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {vehicle.status === 'RETIRED' ? 'Retired' : isRetiring ? 'Retiring...' : 'Retire Vehicle'}
          </button>
          )}
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">

        {actionError && (
          <div className="bg-error-red/10 border border-error-red/20 text-error-red text-sm rounded-xl px-4 py-3">
            {actionError}
          </div>
        )}

        {/* Vehicle Identity Header */}
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl md:text-3xl font-bold text-on-surface font-headline-lg">{vehicle.registrationNumber}</h2>
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${statusColors[vehicle.status]}`}>
                {STATUS_LABELS[vehicle.status]}
              </span>
            </div>
            <p className="text-sm text-on-surface-variant font-body-md">
              {vehicle.name} &bull; {vehicle.type}{vehicle.region ? ` • ${vehicle.region}` : ''}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 font-label-sm">ROI (all-time)</p>
            <p className="text-2xl font-bold text-industrial-blue font-mono">
              {stats ? `${(stats.roi * 100).toFixed(2)}%` : '—'}
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: 'speed', label: 'Odometer', value: `${vehicle.odometer.toLocaleString()} km` },
            { icon: 'weight', label: 'Max Capacity', value: `${vehicle.maxLoadCapacity.toLocaleString()} kg` },
            { icon: 'payments', label: 'Operational Cost (Fuel+Maint.)', value: stats ? `₹${stats.totalOperationalCost.toLocaleString()}` : '—' },
            { icon: 'local_gas_station', label: 'Fuel Efficiency', value: stats ? `${stats.fuelEfficiency} km/L` : '—' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white border border-outline-variant rounded-2xl p-5 flex flex-col justify-between hover:border-industrial-blue transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-industrial-blue text-[24px]">{kpi.icon}</span>
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 font-label-sm">{kpi.label}</p>
                <p className="text-xl font-bold text-on-surface font-mono">{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Vehicle Info & Operational Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Vehicle Information */}
          <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-industrial-blue">info</span>
              <h3 className="text-base font-bold text-on-surface font-headline-sm">Vehicle Information</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-y-6 text-sm">
              {[
                { label: 'Registration', value: vehicle.registrationNumber, mono: true },
                { label: 'Model', value: vehicle.name },
                { label: 'Type', value: vehicle.type },
                { label: 'Max Load Capacity', value: `${vehicle.maxLoadCapacity.toLocaleString()} kg` },
                { label: 'Acquisition Cost', value: `₹${vehicle.acquisitionCost.toLocaleString()}` },
                { label: 'Region', value: vehicle.region || 'Not set' },
              ].map((field, i) => (
                <div key={i}>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 font-label-sm">{field.label}</p>
                  <p className={`font-medium text-on-surface ${field.mono ? 'font-mono' : ''}`}>{field.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Status */}
          <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-industrial-blue">monitoring</span>
              <h3 className="text-base font-bold text-on-surface font-headline-sm">Operational Status</h3>
            </div>
            <div className="p-6 space-y-5">
              <div className={`p-4 rounded-xl flex items-center justify-between border ${
                vehicle.status === 'AVAILABLE'
                  ? 'bg-success-green/5 border-success-green/20'
                  : 'bg-safety-orange/5 border-safety-orange/20'
              }`}>
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${vehicle.status === 'AVAILABLE' ? 'text-success-green' : 'text-safety-orange'}`}>
                    {vehicle.status === 'AVAILABLE' ? 'check_circle' : 'error'}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Dispatch Eligibility</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      {vehicle.status === 'AVAILABLE' ? 'Eligible for dispatch.' : `Not eligible — vehicle is ${STATUS_LABELS[vehicle.status]}.`}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-white text-[9px] font-bold rounded-lg uppercase tracking-wider ${
                  vehicle.status === 'AVAILABLE' ? 'bg-success-green' : 'bg-safety-orange'
                }`}>
                  {vehicle.status === 'AVAILABLE' ? 'Passed' : 'Blocked'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-outline-variant rounded-xl bg-surface-container-low">
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-2 font-label-sm">Active Driver</p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-industrial-blue text-[10px] text-white flex items-center justify-center font-bold shrink-0">
                      {activeTrip ? activeTrip.driver.name.slice(0, 2).toUpperCase() : '--'}
                    </div>
                    <p className="text-xs font-semibold text-on-surface truncate">{activeTrip ? activeTrip.driver.name : 'Unassigned'}</p>
                  </div>
                </div>
                <div className="p-4 border border-outline-variant rounded-xl bg-surface-container-low">
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-2 font-label-sm">Maintenance Status</p>
                  <p className="text-xs font-bold font-mono text-safety-orange">
                    {activeMaintenance ? activeMaintenance.description : 'No active maintenance'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cost & Fuel Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cost Summary */}
          <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-outline-variant">
              <h3 className="text-base font-bold text-on-surface font-headline-sm">Cost Summary (all-time)</h3>
            </div>
            <div className="p-6 flex-1 space-y-4 text-sm">
              {[
                { label: 'Fuel Expenses', value: stats ? `₹${stats.totalFuelCost.toLocaleString()}` : '—' },
                { label: 'Maintenance', value: stats ? `₹${stats.totalMaintenanceCost.toLocaleString()}` : '—' },
                { label: 'Other Expenses', value: stats ? `₹${stats.totalExpensesCost.toLocaleString()}` : '—' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center text-on-surface-variant">
                  <span>{item.label}</span>
                  <span className="font-mono font-medium text-on-surface">{item.value}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-outline-variant flex justify-between items-center font-bold">
                <span className="text-on-surface">Operational Cost</span>
                <span className="text-industrial-blue font-mono text-lg">
                  {stats ? `₹${stats.totalOperationalCost.toLocaleString()}` : '—'}
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant">Operational Cost = Fuel + Maintenance (excludes Other Expenses).</p>
            </div>
          </div>

          {/* Fuel Performance Index */}
          <div className="bg-background text-white rounded-2xl p-6 lg:col-span-2 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-industrial-blue">local_gas_station</span>
                Fuel Performance Index (all-time)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-on-primary-container text-[10px] uppercase font-bold mb-1 tracking-widest">Distance Covered</p>
                  <p className="text-2xl font-mono font-bold">{stats ? stats.totalDistance.toLocaleString() : '—'} <span className="text-sm font-normal text-on-primary-container">km</span></p>
                </div>
                <div>
                  <p className="text-on-primary-container text-[10px] uppercase font-bold mb-1 tracking-widest">Fuel Consumed</p>
                  <p className="text-2xl font-mono font-bold">{stats ? stats.totalFuelLiters.toLocaleString() : '—'} <span className="text-sm font-normal text-on-primary-container">L</span></p>
                </div>
                <div className="bg-industrial-blue/10 p-4 rounded-xl border border-industrial-blue/30">
                  <p className="text-industrial-blue text-[10px] uppercase font-bold mb-1 tracking-widest">Efficiency</p>
                  <p className="text-3xl font-mono font-bold">{stats ? stats.fuelEfficiency : '—'} <span className="text-sm font-normal">km/L</span></p>
                </div>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-[0.07] pointer-events-none group-hover:opacity-[0.12] transition-opacity">
              <span className="material-symbols-outlined text-[160px]">analytics</span>
            </div>
          </div>
        </div>

        {/* Maintenance & Recent Trips */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Maintenance History */}
          <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <h3 className="text-base font-bold text-on-surface font-headline-sm">Maintenance History</h3>
              <button onClick={() => navigate('/maintenance')} className="text-industrial-blue text-xs font-bold hover:underline cursor-pointer">Full Log</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant uppercase tracking-widest text-[10px] font-label-sm">
                  <tr>
                    <th className="px-6 py-3">Service</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Cost</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 text-on-surface font-mono">
                  {maintenanceLogs.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-6 text-center font-sans text-on-surface-variant">No maintenance records yet.</td></tr>
                  ) : (
                    maintenanceLogs.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => navigate(`/maintenance/${row.id}`)}
                        className="hover:bg-industrial-blue/[0.03] transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 font-sans font-medium">{row.description}</td>
                        <td className="px-6 py-4 font-sans text-on-surface-variant">{new Date(row.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="px-6 py-4">₹{row.cost.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border font-sans ${
                            row.status === 'ACTIVE'
                              ? 'bg-industrial-blue/10 text-industrial-blue border-industrial-blue/20'
                              : 'bg-success-green/10 text-success-green border-success-green/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'ACTIVE' ? 'bg-industrial-blue' : 'bg-success-green'}`}></span>
                            {row.status === 'ACTIVE' ? 'Active' : 'Completed'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Trips */}
          <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <h3 className="text-base font-bold text-on-surface font-headline-sm">Recent Trips</h3>
              <button onClick={() => navigate('/trips')} className="text-industrial-blue text-xs font-bold hover:underline cursor-pointer">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant uppercase tracking-widest text-[10px] font-label-sm">
                  <tr>
                    <th className="px-6 py-3">Route</th>
                    <th className="px-6 py-3">Dist.</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 font-mono text-on-surface">
                  {trips.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-6 text-center font-sans text-on-surface-variant">No trips yet.</td></tr>
                  ) : (
                    trips.map((trip) => (
                      <tr
                        key={trip.id}
                        onClick={() => navigate(`/trips/${trip.id}`)}
                        className="hover:bg-industrial-blue/[0.03] transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 font-sans text-on-surface-variant">{trip.source} → {trip.destination}</td>
                        <td className="px-6 py-4 font-sans">{trip.actualDistance ?? trip.plannedDistance} km</td>
                        <td className={`px-6 py-4 font-sans font-medium ${TRIP_STATUS_STYLE[trip.status]}`}>{trip.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-industrial-blue">history</span>
            <h3 className="text-base font-bold text-on-surface font-headline-sm">Vehicle Activity Timeline</h3>
          </div>
          <div className="p-6">
            {recentTimeline.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No activity recorded yet.</p>
            ) : (
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-industrial-blue before:via-outline-variant/40 before:to-transparent">
                {recentTimeline.map((item, i) => (
                  <div key={i} className="relative flex items-start group">
                    <div className={`absolute left-0 w-10 h-10 flex items-center justify-center ${item.color} text-white rounded-full z-10 shadow-sm shrink-0`}>
                      <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                    </div>
                    <div className="ml-14 bg-surface-container-low p-4 border border-outline-variant rounded-xl group-hover:border-industrial-blue/50 transition-all w-full md:w-2/3 text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-on-surface">{item.label}</h4>
                        <span className="text-[10px] text-on-surface-variant font-mono ml-4 shrink-0">{item.time.toLocaleString()}</span>
                      </div>
                      <p className="text-on-surface-variant text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT VEHICLE DRAWER */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex justify-end animate-fade-in" onClick={() => setIsEditOpen(false)}>
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-black/5 animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-base font-bold text-on-surface font-headline-sm">Edit Vehicle</h3>
              <button onClick={() => setIsEditOpen(false)} className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
              {editError && (
                <div className="bg-error-red/10 border border-error-red/20 text-error-red text-xs rounded-xl px-4 py-3">{editError}</div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Model</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 rounded-xl outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Type</label>
                <input value={editType} onChange={(e) => setEditType(e.target.value)} className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 rounded-xl outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Max Capacity (kg)</label>
                  <input type="number" value={editCapacity} onChange={(e) => setEditCapacity(e.target.value)} className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 rounded-xl outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Acquisition Cost</label>
                  <input type="number" value={editCost} onChange={(e) => setEditCost(e.target.value)} className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 rounded-xl outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Region</label>
                <input value={editRegion} onChange={(e) => setEditRegion(e.target.value)} className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 rounded-xl outline-none" />
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
