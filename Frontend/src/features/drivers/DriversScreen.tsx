import { useEffect, useMemo, useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { listDrivers, createDriver } from '../../services/drivers'
import { getApiErrorMessage } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { canManageDrivers } from '../../lib/permissions'
import type { Driver, DriverStatus } from '../../types'

const STATUS_LABELS: Record<DriverStatus, string> = {
  AVAILABLE: 'Available',
  ON_TRIP: 'On Trip',
  SUSPENDED: 'Suspended',
  OFF_DUTY: 'Off Duty',
}

const STATUS_BY_LABEL: Record<string, DriverStatus> = {
  Available: 'AVAILABLE',
  'On Trip': 'ON_TRIP',
  Suspended: 'SUSPENDED',
  'Off Duty': 'OFF_DUTY',
}

type ExpiryState = { label: string; colorClass: string; isConcern: boolean }

function getExpiryState(driver: Driver): ExpiryState {
  const now = new Date()
  const expiry = new Date(driver.licenseExpiryDate)
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (driver.status === 'SUSPENDED') {
    return { label: 'Suspended', colorClass: 'bg-red-50 text-error-red border-error-red/10', isConcern: true }
  }
  if (daysLeft < 0) {
    return { label: 'Expired', colorClass: 'bg-red-50 text-error-red border-error-red/10', isConcern: true }
  }
  if (daysLeft <= 30) {
    return { label: `Expires in ${daysLeft} days`, colorClass: 'bg-amber-50 text-safety-orange border-safety-orange/10', isConcern: true }
  }
  return { label: 'Valid', colorClass: 'bg-green-50 text-success-green border-success-green/10', isConcern: false }
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2) || 'XX'
}

export default function DriversScreen() {
  const { setIsMobileMenuOpen } = useOutletContext<{ setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>> }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canWrite = canManageDrivers(user?.role)

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [validityFilter, setValidityFilter] = useState('All Validity')

  const [newDriverName, setNewDriverName] = useState('')
  const [newLicenseNo, setNewLicenseNo] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newExpiryDate, setNewExpiryDate] = useState('')
  const [newContactNo, setNewContactNo] = useState('')
  const [newSafetyScore, setNewSafetyScore] = useState(85)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [drivers, setDrivers] = useState<Driver[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const fetchDrivers = async () => {
    setIsLoading(true)
    setLoadError('')
    try {
      const { drivers: data, pagination } = await listDrivers({ limit: 100 })
      setDrivers(data)
      setTotal(pagination.total)
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load drivers'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDrivers()
  }, [])

  const availableCategories = useMemo(
    () => Array.from(new Set(drivers.map((d) => d.licenseCategory))).sort(),
    [drivers]
  )

  const filteredDrivers = drivers.filter((d) => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      if (!d.name.toLowerCase().includes(q) && !d.licenseNumber.toLowerCase().includes(q)) return false
    }
    if (statusFilter !== 'All Statuses' && d.status !== STATUS_BY_LABEL[statusFilter]) return false
    if (categoryFilter !== 'All Categories' && d.licenseCategory !== categoryFilter) return false
    if (validityFilter !== 'All Validity') {
      const expiry = getExpiryState(d)
      if (validityFilter === 'Valid' && expiry.label !== 'Valid') return false
      if (validityFilter === 'Expired' && expiry.label !== 'Expired') return false
      if (validityFilter === 'Expiring (30 days)' && !expiry.label.startsWith('Expires in')) return false
    }
    return true
  })

  const availableCount = drivers.filter((d) => d.status === 'AVAILABLE').length
  const onTripCount = drivers.filter((d) => d.status === 'ON_TRIP').length
  const complianceAlerts = drivers.filter((d) => getExpiryState(d).isConcern)
  const avgSafetyScore = drivers.length
    ? (drivers.reduce((sum, d) => sum + d.safetyScore, 0) / drivers.length).toFixed(1)
    : '0.0'

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!newDriverName || !newLicenseNo || !newCategory || !newExpiryDate || !newContactNo) {
      setFormError('Please fill out all required fields.')
      return
    }

    setIsSubmitting(true)
    try {
      await createDriver({
        name: newDriverName,
        licenseNumber: newLicenseNo,
        licenseCategory: newCategory,
        licenseExpiryDate: newExpiryDate,
        contactNumber: newContactNo,
        safetyScore: newSafetyScore,
      })

      setIsDrawerOpen(false)
      setNewDriverName('')
      setNewLicenseNo('')
      setNewCategory('')
      setNewExpiryDate('')
      setNewContactNo('')
      setNewSafetyScore(85)
      fetchDrivers()
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to add driver'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* TOP HEADER */}
      <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/5 bg-white/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button className="md:hidden text-on-surface p-1 hover:bg-black/5 rounded" onClick={() => setIsMobileMenuOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-on-surface font-headline-sm">Drivers &amp; Safety Profiles</h2>
          </div>
        </div>
      </header>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface font-headline-lg">Drivers &amp; Safety Profiles</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body-md">Manage driver records, license compliance, and operational availability</p>
          </div>
          {canWrite && (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="bg-background text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-lg cursor-pointer uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Add Driver
            </button>
          )}
        </div>

        {loadError && (
          <div className="bg-error-red/10 border border-error-red/20 text-error-red text-sm rounded-xl px-4 py-3">{loadError}</div>
        )}

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 border border-black/5 rounded-2xl shadow-sm flex flex-col justify-between h-28 border-l-4 border-l-industrial-blue">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="text-[10px] font-bold uppercase tracking-wider font-label-sm">Total Drivers</span>
              <span className="material-symbols-outlined text-industrial-blue">groups</span>
            </div>
            <span className="text-2xl font-bold font-mono text-on-surface">{total}</span>
          </div>
          <div className="bg-white p-6 border border-black/5 rounded-2xl shadow-sm flex flex-col justify-between h-28 border-l-4 border-l-success-green">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="text-[10px] font-bold uppercase tracking-wider font-label-sm">Available Drivers</span>
              <span className="w-2 h-2 rounded-full bg-success-green animate-pulse"></span>
            </div>
            <span className="text-2xl font-bold font-mono text-on-surface">{availableCount}</span>
          </div>
          <div className="bg-white p-6 border border-black/5 rounded-2xl shadow-sm flex flex-col justify-between h-28 border-l-4 border-l-industrial-blue">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="text-[10px] font-bold uppercase tracking-wider font-label-sm">Drivers On Trip</span>
              <span className="material-symbols-outlined text-industrial-blue">route</span>
            </div>
            <span className="text-2xl font-bold font-mono text-on-surface">{String(onTripCount).padStart(2, '0')}</span>
          </div>
          <div className="bg-white p-6 border border-red-100 bg-red-50/10 rounded-2xl shadow-sm flex flex-col justify-between h-28 border-l-4 border-l-error-red">
            <div className="flex justify-between items-center text-error-red">
              <span className="text-[10px] font-bold uppercase tracking-wider font-label-sm">Compliance Attention</span>
              <span className="material-symbols-outlined">warning</span>
            </div>
            <span className="text-2xl font-bold font-mono text-error-red">{String(complianceAlerts.length).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Main Layout Split */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Drivers Registry Table (Left Column) */}
          <div className="flex-1 min-w-0 w-full space-y-4">

            {/* Controls Bar */}
            <div className="bg-white p-4 border border-black/5 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-sm">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Search</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-black/5 bg-dashboard-canvas/40 focus:ring-1 focus:ring-industrial-blue rounded-xl outline-none"
                    placeholder="Search driver or license..."
                    type="text"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-black/5 bg-dashboard-canvas/40 focus:ring-1 focus:ring-industrial-blue rounded-xl outline-none cursor-pointer"
                >
                  <option>All Statuses</option>
                  <option>Available</option>
                  <option>On Trip</option>
                  <option>Off Duty</option>
                  <option>Suspended</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">License Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-black/5 bg-dashboard-canvas/40 focus:ring-1 focus:ring-industrial-blue rounded-xl outline-none cursor-pointer"
                >
                  <option>All Categories</option>
                  {availableCategories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Validity</label>
                <select
                  value={validityFilter}
                  onChange={(e) => setValidityFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-black/5 bg-dashboard-canvas/40 focus:ring-1 focus:ring-industrial-blue rounded-xl outline-none cursor-pointer"
                >
                  <option>All Validity</option>
                  <option>Valid</option>
                  <option>Expiring (30 days)</option>
                  <option>Expired</option>
                </select>
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden flex flex-col min-h-[300px]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-body-md border-collapse">
                  <thead className="bg-dashboard-canvas text-on-surface-variant text-[11px] uppercase tracking-wider font-label-sm">
                    <tr>
                      <th className="px-6 py-4 font-bold border-b border-black/5">Driver</th>
                      <th className="px-4 py-4 font-bold border-b border-black/5">License Details</th>
                      <th className="px-4 py-4 font-bold border-b border-black/5">Expiry Status</th>
                      <th className="px-4 py-4 font-bold border-b border-black/5">Safety Score</th>
                      <th className="px-4 py-4 font-bold border-b border-black/5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs font-mono font-medium text-on-surface">
                    {isLoading ? (
                      <tr><td colSpan={5} className="px-6 py-10 text-center font-sans text-on-surface-variant">Loading drivers...</td></tr>
                    ) : filteredDrivers.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-10 text-center font-sans text-on-surface-variant">No drivers match these filters.</td></tr>
                    ) : (
                      filteredDrivers.map((d) => {
                        const expiry = getExpiryState(d)
                        return (
                          <tr key={d.id} className="hover:bg-blue-50/10 transition-colors cursor-pointer" onClick={() => navigate(`/drivers/${d.id}`)}>
                            <td className="px-6 py-4 font-sans">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-industrial-blue/10 text-industrial-blue flex items-center justify-center font-bold text-xs">
                                  {getInitials(d.name)}
                                </div>
                                <div>
                                  <p className="font-bold text-on-surface">{d.name}</p>
                                  <p className="text-[10px] text-on-surface-variant mt-0.5">{d.contactNumber}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <p className="font-bold text-on-surface">{d.licenseNumber}</p>
                              <p className="text-[10px] text-on-surface-variant font-sans">{d.licenseCategory}</p>
                            </td>
                            <td className="px-4 py-4 font-sans">
                              <div className="flex flex-col gap-0.5">
                                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border w-fit ${expiry.colorClass}`}>
                                  {expiry.label}
                                </span>
                                <p className="text-[9px] text-on-surface-variant mt-0.5">
                                  {new Date(d.licenseExpiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-4 font-sans">
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-1.5 bg-dashboard-canvas rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${d.safetyScore >= 80 ? 'bg-success-green' : d.safetyScore >= 60 ? 'bg-safety-orange' : 'bg-error-red'}`}
                                    style={{ width: `${d.safetyScore}%` }}
                                  ></div>
                                </div>
                                <span className={`font-bold font-mono ${d.safetyScore >= 80 ? 'text-success-green' : d.safetyScore >= 60 ? 'text-safety-orange' : 'text-error-red'}`}>
                                  {d.safetyScore}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center font-sans">
                              <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                                d.status === 'AVAILABLE'
                                  ? 'bg-green-50 text-success-green border-success-green/10'
                                  : d.status === 'ON_TRIP'
                                    ? 'bg-blue-50 text-industrial-blue border-industrial-blue/10'
                                    : d.status === 'SUSPENDED'
                                      ? 'bg-red-50 text-error-red border-error-red/10'
                                      : 'bg-gray-100 text-on-surface-variant border-gray-200'
                              }`}>
                                {STATUS_LABELS[d.status]}
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {/* Table Footer */}
              <div className="bg-white p-4 flex justify-between items-center text-[10px] font-bold text-on-surface-variant border-t border-black/5 font-label-sm">
                <p className="uppercase">Showing {filteredDrivers.length} of {total} drivers</p>
              </div>
            </div>
          </div>

          {/* Side Column: Compliance & Insights (Right Column) */}
          <aside className="w-full lg:w-80 space-y-6 shrink-0">
            {/* Compliance review box */}
            <div className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-black/5 bg-gray-50/50 flex items-center justify-between">
                <h3 className="font-bold text-on-surface flex items-center gap-2 font-headline-sm text-sm">
                  <span className="material-symbols-outlined text-error-red text-sm">notification_important</span>
                  Compliance Review
                </h3>
                <span className="bg-error-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">{complianceAlerts.length}</span>
              </div>
              <div className="p-4 space-y-4 font-body-sm text-xs">
                {complianceAlerts.length === 0 ? (
                  <p className="text-on-surface-variant">No compliance issues right now.</p>
                ) : (
                  complianceAlerts.slice(0, 5).map((d) => {
                    const expiry = getExpiryState(d)
                    return (
                      <div key={d.id} className="flex gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0 items-start">
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center font-bold text-xs text-on-surface shrink-0">
                          {getInitials(d.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-on-surface truncate">{d.name}</p>
                          <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5 text-error-red">{expiry.label}</p>
                          <button
                            onClick={() => navigate(`/drivers/${d.id}`)}
                            className="mt-2 text-[10px] font-bold text-industrial-blue underline decoration-industrial-blue/30 underline-offset-2 hover:opacity-80 block cursor-pointer"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Visual Insight box */}
            <div className="bg-background p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-industrial-blue/10 rounded-full blur-2xl"></div>
              <p className="text-[10px] font-bold text-industrial-blue uppercase mb-4 tracking-widest font-label-sm">Fleet Safety Insight</p>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <span className="text-3xl font-bold font-mono">{avgSafetyScore}</span>
                <div className="text-[9px] leading-tight">
                  <p className="text-white/60">AVG SAFETY SCORE</p>
                </div>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden relative z-10">
                <div className="h-full bg-success-green" style={{ width: `${avgSafetyScore}%` }}></div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* DRAWER FOR ADDING DRIVER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex justify-end animate-fade-in" onClick={() => setIsDrawerOpen(false)}>
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-black/5 animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-base font-bold text-on-surface font-headline-sm">Add New Driver</h3>
                <p className="text-xs text-on-surface-variant font-body-sm mt-0.5">Register a new operator to the fleet</p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Drawer Body Form */}
            <form onSubmit={handleAddDriver} className="flex-1 overflow-y-auto p-6 space-y-6 font-body-sm text-sm">
              {formError && (
                <div className="bg-error-red/10 border border-error-red/20 text-error-red text-xs rounded-xl px-4 py-3">{formError}</div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Full Name</label>
                <input
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 focus:ring-1 focus:ring-industrial-blue rounded-xl outline-none"
                  placeholder="e.g. Robert Johnson"
                  type="text"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">License No</label>
                  <input
                    value={newLicenseNo}
                    onChange={(e) => setNewLicenseNo(e.target.value)}
                    className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 focus:ring-1 focus:ring-industrial-blue rounded-xl outline-none"
                    placeholder="DL-XXXXX"
                    type="text"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Category</label>
                  <input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 focus:ring-1 focus:ring-industrial-blue rounded-xl outline-none"
                    placeholder="e.g. LMV, HMV"
                    type="text"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Expiry Date</label>
                <input
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 focus:ring-1 focus:ring-industrial-blue rounded-xl outline-none cursor-pointer"
                  type="date"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Contact No</label>
                <input
                  value={newContactNo}
                  onChange={(e) => setNewContactNo(e.target.value)}
                  className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 focus:ring-1 focus:ring-industrial-blue rounded-xl outline-none"
                  placeholder="e.g. 9998887771"
                  type="tel"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex justify-between font-label-sm">
                  Initial Safety Score
                  <span className="text-industrial-blue font-mono font-bold">{newSafetyScore}%</span>
                </label>
                <input
                  value={newSafetyScore}
                  onChange={(e) => setNewSafetyScore(Number(e.target.value))}
                  className="w-full h-2 bg-dashboard-canvas rounded-lg appearance-none cursor-pointer accent-industrial-blue"
                  max="100"
                  min="0"
                  type="range"
                />
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-6 border-t border-black/5 flex gap-4 bg-white mt-8">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 px-4 py-3 border border-black/5 rounded-xl font-bold text-on-surface hover:bg-dashboard-canvas transition-all uppercase tracking-wider text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-background text-white rounded-xl font-bold hover:opacity-90 transition-all uppercase tracking-wider text-xs cursor-pointer shadow-md disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : 'Save Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
