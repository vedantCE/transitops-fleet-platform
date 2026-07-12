import { useEffect, useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { listMaintenanceLogs, createMaintenanceLog, closeMaintenanceLog } from '../../services/maintenance'
import { listVehicles } from '../../services/vehicles'
import { getApiErrorMessage } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { canManageMaintenance } from '../../lib/permissions'
import type { MaintenanceLog, MaintenanceStatus, Vehicle } from '../../types'

const STATUS_LABELS: Record<MaintenanceStatus, string> = { ACTIVE: 'Active', CLOSED: 'Completed' }

export default function MaintenanceManagement() {
  const { setIsMobileMenuOpen } = useOutletContext<{ setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>> }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canWrite = canManageMaintenance(user?.role)

  const [statusFilter, setStatusFilter] = useState<'All' | MaintenanceStatus>('All')

  const [records, setRecords] = useState<MaintenanceLog[]>([])
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([])
  const [vehiclesInShopCount, setVehiclesInShopCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  // Log Service Record Form states
  const [vehicleId, setVehicleId] = useState('')
  const [serviceType, setServiceType] = useState('Routine Checkup')
  const [serviceCost, setServiceCost] = useState('')
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchAll = async () => {
    setIsLoading(true)
    setLoadError('')
    try {
      const [logs, vehicles, inShop] = await Promise.all([
        listMaintenanceLogs({ limit: 100, sortBy: 'createdAt', sortOrder: 'desc' }),
        listVehicles({ status: 'AVAILABLE', limit: 100 }),
        listVehicles({ status: 'IN_SHOP', limit: 1 }),
      ])
      setRecords(logs.maintenanceLogs)
      setAvailableVehicles(vehicles.vehicles)
      setVehiclesInShopCount(inShop.pagination.total)
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load maintenance records'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const handleLogServiceRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!vehicleId) {
      setFormError('Please select a vehicle.')
      return
    }

    setIsSubmitting(true)
    try {
      await createMaintenanceLog({
        vehicleId,
        description: notes.trim() ? `${serviceType}: ${notes.trim()}` : serviceType,
        cost: serviceCost ? Number(serviceCost) : 0,
      })

      setVehicleId('')
      setServiceType('Routine Checkup')
      setServiceCost('')
      setNotes('')
      fetchAll()
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to log maintenance record'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseMaintenance = async (recordId: string) => {
    setBusyId(recordId)
    try {
      await closeMaintenanceLog(recordId)
      fetchAll()
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to close maintenance record'))
    } finally {
      setBusyId(null)
    }
  }

  const activeCount = records.filter((r) => r.status === 'ACTIVE').length
  const completedCount = records.filter((r) => r.status === 'CLOSED').length
  const totalCostVal = records.reduce((sum, r) => sum + r.cost, 0)

  const filteredRecords = records.filter((r) => statusFilter === 'All' || r.status === statusFilter)

  return (
    <>
      {/* TOP HEADER */}
      <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/5 bg-white/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button className="md:hidden text-on-surface p-1 hover:bg-black/5 rounded" onClick={() => setIsMobileMenuOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      {/* CONTENT CANVAS */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface font-headline-lg">Maintenance Management</h2>
            <div className="flex space-x-4 mt-2">
              <span className="flex items-center text-xs text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-safety-orange mr-2"></span>
                Vehicles In Shop: <strong className="ml-1 text-on-surface font-mono">{vehiclesInShopCount}</strong>
              </span>
              <span className="flex items-center text-xs text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-industrial-blue mr-2"></span>
                Active Maintenance: <strong className="ml-1 text-on-surface font-mono">{activeCount}</strong>
              </span>
            </div>
          </div>
        </div>

        {loadError && (
          <div className="bg-error-red/10 border border-error-red/20 text-error-red text-sm rounded-xl px-4 py-3">{loadError}</div>
        )}

        {/* Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Log Service Record */}
          {canWrite && (
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
            <h3 className="text-base font-bold text-on-surface mb-6 font-headline-sm">Log Service Record</h3>
            <form onSubmit={handleLogServiceRecord} className="space-y-4 font-body-sm text-sm">
              {formError && (
                <div className="bg-error-red/10 border border-error-red/20 text-error-red text-xs rounded-xl px-4 py-3">{formError}</div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Vehicle</label>
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none cursor-pointer"
                >
                  <option value="">Select vehicle...</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.registrationNumber} — {v.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-on-surface-variant">Only vehicles currently Available can enter maintenance.</p>
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
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm font-sans">Service Cost (₹)</label>
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
                    <p className="text-on-surface-variant text-xs mt-0.5 leading-relaxed font-body-sm">Adding this record will mark the vehicle as "In Shop" and remove it from dispatch selection.</p>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-background text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-background/25 cursor-pointer uppercase tracking-widest text-[10px] disabled:opacity-60"
              >
                {isSubmitting ? 'Registering...' : 'Register Record'}
              </button>
            </form>
          </div>
          )}

          {/* Right Column: Service Summary & Logs */}
          <div className={canWrite ? 'lg:col-span-7 space-y-6' : 'lg:col-span-12 space-y-6'}>
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
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm font-sans">Total Cost</p>
                <p className="text-2xl font-bold text-on-surface mt-1 font-mono">₹{totalCostVal.toLocaleString()}</p>
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
                    onChange={(e) => setStatusFilter(e.target.value as 'All' | MaintenanceStatus)}
                    className="text-xs bg-dashboard-canvas/40 border border-black/5 rounded-lg pl-8 pr-4 py-1.5 focus:ring-1 focus:ring-industrial-blue outline-none cursor-pointer font-bold font-label-sm"
                  >
                    <option value="All">Status: All</option>
                    <option value="ACTIVE">Active</option>
                    <option value="CLOSED">Completed</option>
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
                    {isLoading ? (
                      <tr><td colSpan={6} className="px-6 py-10 text-center font-sans text-on-surface-variant">Loading records...</td></tr>
                    ) : filteredRecords.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-10 text-center font-sans text-on-surface-variant">No maintenance records match this filter.</td></tr>
                    ) : (
                      filteredRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-blue-50/10 transition-colors cursor-pointer" onClick={() => navigate(`/maintenance/${record.id}`)}>
                          <td className="px-6 py-4 font-sans">
                            <div className="flex flex-col">
                              <span className="font-bold text-on-surface">{record.vehicle.registrationNumber}</span>
                              <span className="text-[10px] text-on-surface-variant mt-0.5">{record.vehicle.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant font-sans">{record.description}</td>
                          <td className="px-6 py-4 font-bold text-on-surface">₹{record.cost.toLocaleString()}</td>
                          <td className="px-6 py-4 text-on-surface-variant">{new Date(record.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                              record.status === 'CLOSED'
                                ? 'bg-green-50 text-success-green border-success-green/10'
                                : 'bg-amber-50 text-safety-orange border-safety-orange/10'
                            }`}>
                              {STATUS_LABELS[record.status]}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-sans" onClick={(e) => e.stopPropagation()}>
                            {record.status === 'ACTIVE' && canWrite ? (
                              <button
                                onClick={() => handleCloseMaintenance(record.id)}
                                disabled={busyId === record.id}
                                className="text-industrial-blue font-bold text-[10px] uppercase tracking-wider hover:underline cursor-pointer disabled:opacity-50"
                              >
                                {busyId === record.id ? 'Closing...' : 'Close Maintenance'}
                              </button>
                            ) : (
                              <button onClick={() => navigate(`/maintenance/${record.id}`)} className="text-on-surface-variant hover:text-industrial-blue cursor-pointer">
                                <span className="material-symbols-outlined text-sm">visibility</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Table Footer */}
              <div className="px-6 py-4 border-t border-black/5 flex justify-between items-center text-xs bg-gray-50/20 font-body-sm">
                <p className="text-on-surface-variant">Showing {filteredRecords.length} of {records.length} records</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
