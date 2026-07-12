import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMaintenanceLog, closeMaintenanceLog, listMaintenanceLogs } from '../../services/maintenance'
import { getApiErrorMessage } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { canManageMaintenance } from '../../lib/permissions'
import type { MaintenanceLog } from '../../types'

export default function MaintenanceDetailsScreen() {
  const { maintenanceId } = useParams<{ maintenanceId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canWrite = canManageMaintenance(user?.role)

  const [record, setRecord] = useState<MaintenanceLog | null>(null)
  const [history, setHistory] = useState<MaintenanceLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [isClosing, setIsClosing] = useState(false)

  const fetchAll = async () => {
    if (!maintenanceId) return
    setIsLoading(true)
    setLoadError('')
    try {
      const r = await getMaintenanceLog(maintenanceId)
      setRecord(r)
      const h = await listMaintenanceLogs({ vehicleId: r.vehicleId, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' })
      setHistory(h.maintenanceLogs.filter((log) => log.id !== r.id))
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load maintenance record'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maintenanceId])

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center text-on-surface-variant bg-dashboard-canvas">Loading record...</div>
  }

  if (!record) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4 text-on-surface-variant bg-dashboard-canvas">
        <span className="material-symbols-outlined text-[64px] opacity-30">build</span>
        <p className="font-bold text-lg">{loadError || `Maintenance record "${maintenanceId}" not found`}</p>
        <button onClick={() => navigate('/maintenance')} className="px-6 py-2.5 bg-industrial-blue text-white rounded-xl font-bold text-sm cursor-pointer">
          Back to Maintenance
        </button>
      </div>
    )
  }

  const steps = [
    { icon: 'edit_note', label: 'Logged' },
    { icon: 'engineering', label: 'In Shop' },
    { icon: 'flag', label: 'Completed' },
  ]
  const currentStep = record.status === 'ACTIVE' ? 1 : 2

  const handleClose = async () => {
    setActionError('')
    setIsClosing(true)
    try {
      const updated = await closeMaintenanceLog(record.id)
      setRecord(updated)
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to close maintenance record'))
    } finally {
      setIsClosing(false)
    }
  }

  return (
    <>
      {/* Header */}
      <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/5 bg-white/60 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/maintenance')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-industrial-blue transition-colors group cursor-pointer text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            Maintenance
          </button>
          <span className="text-on-surface-variant opacity-30">/</span>
          <span className="text-on-surface text-sm font-semibold">#{record.id.slice(0, 8).toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-3">
          {canWrite && record.status === 'ACTIVE' && (
            <button
              onClick={handleClose}
              disabled={isClosing}
              className="px-4 py-1.5 bg-background text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              {isClosing ? 'Closing...' : 'Close Maintenance'}
            </button>
          )}
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">

        {actionError && (
          <div className="bg-error-red/10 border border-error-red/20 text-error-red text-sm rounded-xl px-4 py-3">{actionError}</div>
        )}

        {/* Page Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center flex-wrap gap-3 mb-1">
              <h2 className="text-2xl font-bold text-on-surface font-headline-lg">Maintenance Record</h2>
              <span className="px-3 py-0.5 bg-industrial-blue/10 text-industrial-blue text-[10px] font-bold rounded-lg border border-industrial-blue/20 uppercase tracking-wider">
                {record.description}
              </span>
              <div className={`flex items-center gap-2 px-3 py-0.5 text-[10px] font-bold rounded-lg border uppercase tracking-wider ${
                record.status === 'ACTIVE' ? 'bg-safety-orange/10 text-safety-orange border-safety-orange/20' : 'bg-success-green/10 text-success-green border-success-green/20'
              }`}>
                <span className={`w-2 h-2 rounded-full ${record.status === 'ACTIVE' ? 'bg-safety-orange animate-pulse' : 'bg-success-green'}`}></span>
                {record.status === 'ACTIVE' ? 'Active' : 'Completed'}
              </div>
            </div>
            <p className="text-sm text-on-surface-variant font-body-md">
              Maintenance for <span className="font-bold text-on-surface">{record.vehicle.registrationNumber}</span> ({record.vehicle.name}) started {new Date(record.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}.
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Vehicle', value: record.vehicle.registrationNumber, sub: record.vehicle.name, icon: 'local_shipping' },
            { label: 'Service', value: record.description, sub: 'Maintenance log entry', icon: 'oil_barrel' },
            { label: 'Cost', value: `₹${record.cost.toLocaleString()}`, sub: 'Total logged cost', icon: 'payments' },
            { label: 'Current State', value: record.status === 'ACTIVE' ? 'In Shop' : 'Completed', sub: record.endDate ? `Closed ${new Date(record.endDate).toLocaleDateString()}` : 'Ongoing', icon: 'engineering', green: record.status === 'CLOSED' },
          ].map((card, i) => (
            <div key={i} className={`bg-white border ${card.green ? 'border-l-4 border-l-success-green border-outline-variant' : 'border-outline-variant'} rounded-2xl p-5 shadow-sm hover:border-industrial-blue transition-all group`}>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-label-sm mb-1">{card.label}</p>
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-on-surface font-mono truncate">{card.value}</p>
                <span className={`material-symbols-outlined text-[22px] ${card.green ? 'text-success-green' : 'text-industrial-blue'}`}>{card.icon}</span>
              </div>
              <p className="text-[11px] mt-2 text-on-surface-variant">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Main 2-col layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column (2/3) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Lifecycle Stepper */}
            <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-on-surface mb-6 flex items-center gap-2 font-headline-sm">
                <span className="material-symbols-outlined text-on-surface-variant">reorder</span>
                Maintenance Lifecycle
              </h3>
              <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-outline-variant z-0"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-industrial-blue z-0 transition-all" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>
                {steps.map((step, i) => {
                  const done = i < currentStep
                  const current = i === currentStep
                  return (
                    <div key={i} className="relative z-10 flex flex-col items-center bg-white px-2">
                      <div className={`flex items-center justify-center mb-2 ${
                        current
                          ? 'w-10 h-10 rounded-full border-2 border-industrial-blue text-industrial-blue ring-4 ring-industrial-blue/10'
                          : done
                            ? 'w-8 h-8 rounded-full bg-industrial-blue text-white'
                            : 'w-8 h-8 rounded-full bg-outline-variant text-white'
                      }`}>
                        <span className="material-symbols-outlined text-[16px]">{done ? 'check' : step.icon}</span>
                      </div>
                      <span className={`text-[10px] font-bold font-label-sm ${current ? 'text-industrial-blue' : 'text-on-surface'}`}>{step.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Maintenance Info */}
            <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant">
                <h3 className="text-base font-bold text-on-surface font-headline-sm">Maintenance Information</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest mb-1 font-label-sm">Started</label>
                  <p className="text-on-surface font-medium">{new Date(record.startDate).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest mb-1 font-label-sm">Closed</label>
                  <p className="text-on-surface font-medium">{record.endDate ? new Date(record.endDate).toLocaleString() : 'Still open'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest mb-2 font-label-sm">Description</label>
                  <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant text-on-surface-variant text-sm leading-relaxed">
                    {record.description}
                  </div>
                </div>
              </div>
            </div>

            {/* History Table */}
            <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant">
                <h3 className="text-base font-bold text-on-surface font-headline-sm">Other Maintenance for {record.vehicle.registrationNumber}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant uppercase tracking-widest text-[10px] font-label-sm">
                    <tr>
                      <th className="px-6 py-3 font-bold">Date</th>
                      <th className="px-6 py-3 font-bold">Description</th>
                      <th className="px-6 py-3 font-bold text-right">Cost</th>
                      <th className="px-6 py-3 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 text-on-surface font-sans">
                    {history.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-6 text-center text-on-surface-variant">No other maintenance records for this vehicle.</td></tr>
                    ) : (
                      history.map((row) => (
                        <tr key={row.id} onClick={() => navigate(`/maintenance/${row.id}`)} className="hover:bg-surface-container-lowest transition-colors cursor-pointer">
                          <td className="px-6 py-4 text-on-surface-variant">{new Date(row.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td className="px-6 py-4 font-medium">{row.description}</td>
                          <td className="px-6 py-4 text-right font-mono">₹{row.cost.toLocaleString()}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2.5 py-0.5 bg-surface-container-high text-on-surface-variant rounded text-[9px] font-bold uppercase">
                              {row.status === 'ACTIVE' ? 'Active' : 'Completed'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 bg-surface border-t border-outline-variant flex justify-center">
                <button onClick={() => navigate(`/fleet/${record.vehicleId}`)} className="text-industrial-blue text-xs font-bold hover:underline cursor-pointer">
                  View Full Vehicle Profile
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar Column (1/3) */}
          <div className="space-y-6">
            {/* Vehicle Impact */}
            <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <h3 className="text-base font-bold text-on-surface mb-4 font-headline-sm relative z-10">Vehicle Impact</h3>
              <div className="space-y-4 relative z-10">
                <div className={`flex items-center gap-4 p-3 rounded-xl border ${
                  record.vehicle.status === 'IN_SHOP' ? 'bg-error-red/5 border-error-red/20' : 'bg-success-green/5 border-success-green/20'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${record.vehicle.status === 'IN_SHOP' ? 'bg-error-red' : 'bg-success-green'}`}>
                    <span className="material-symbols-outlined">{record.vehicle.status === 'IN_SHOP' ? 'block' : 'check_circle'}</span>
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${record.vehicle.status === 'IN_SHOP' ? 'text-error-red' : 'text-success-green'}`}>{record.vehicle.status}</p>
                    <p className="text-[11px] text-on-surface-variant">{record.vehicle.status === 'IN_SHOP' ? 'Excluded from dispatch selection' : 'Eligible for dispatch'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost */}
            <div className="bg-background text-white rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-base font-bold">Cost</h3>
                <span className="material-symbols-outlined text-industrial-blue">monitoring</span>
              </div>
              <div className="flex justify-between text-xs font-bold pt-2 border-t border-white/20">
                <span>TOTAL COST</span>
                <span className="font-mono">₹{record.cost.toLocaleString()}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl text-[11px] leading-relaxed border border-white/10 mt-4">
                <p className="flex items-center gap-2 mb-1 text-industrial-blue font-bold">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  SYSTEM AUTOMATION
                </p>
                This cost is included in {record.vehicle.registrationNumber}'s Operational Cost (Fuel + Maintenance) in the reports dashboard.
              </div>
            </div>

            {/* Activity Log */}
            <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-on-surface mb-6 font-headline-sm">Activity Log</h3>
              <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-outline-variant">
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white flex items-center justify-center z-10 border-2 border-industrial-blue">
                    <div className="w-2 h-2 rounded-full bg-industrial-blue"></div>
                  </div>
                  <p className="text-xs font-bold text-on-surface">Record Created</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5 font-mono">{new Date(record.startDate).toLocaleString()}</p>
                </div>
                {record.endDate && (
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white flex items-center justify-center z-10 border-2 border-success-green">
                      <div className="w-2 h-2 rounded-full bg-success-green"></div>
                    </div>
                    <p className="text-xs font-bold text-on-surface">Maintenance Closed</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5 font-mono">{new Date(record.endDate).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
