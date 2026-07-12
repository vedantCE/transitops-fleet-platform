import { useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'

interface DriverRecord {
  id: string
  name: string
  initials: string
  phone: string
  licenseNo: string
  category: string
  expiryDate: string
  expiryBadge: string
  expiryBadgeColor: string
  safetyScore: number
  status: 'Available' | 'On Trip' | 'Suspended' | 'Off Duty'
}

interface ComplianceAlert {
  id: string
  initials: string
  name: string
  statusText: string
  colorClass: string
  actionText: string
}

export default function DriversScreen() {
  const { setIsMobileMenuOpen } = useOutletContext<{ setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>> }>()
  const navigate = useNavigate()

  // Drawer open state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [validityFilter, setValidityFilter] = useState('All Validity')

  // Form states for adding new driver
  const [newDriverName, setNewDriverName] = useState('')
  const [newLicenseNo, setNewLicenseNo] = useState('')
  const [newCategory, setNewCategory] = useState('Heavy Vehicle (HCV)')
  const [newExpiryDate, setNewExpiryDate] = useState('')
  const [newContactNo, setNewContactNo] = useState('')
  const [newSafetyScore, setNewSafetyScore] = useState(85)

  // State-backed driver records matching Stitch mockups
  const initialDrivers: DriverRecord[] = [
    {
      id: 'DRV001',
      name: 'Alex Murphy',
      initials: 'AM',
      phone: '+1 234-567-8901',
      licenseNo: 'DL-8923041-A',
      category: 'Heavy Vehicle (HCV)',
      expiryDate: '24 Oct 2026',
      expiryBadge: 'Valid',
      expiryBadgeColor: 'bg-green-50 text-success-green border-success-green/20',
      safetyScore: 92,
      status: 'On Trip',
    },
    {
      id: 'DRV002',
      name: 'John Smith',
      initials: 'JS',
      phone: '+1 234-567-8902',
      licenseNo: 'DL-4423121-B',
      category: 'PSV (Public Transport)',
      expiryDate: 'Violation ID: #8821',
      expiryBadge: 'Suspended',
      expiryBadgeColor: 'bg-error-red/10 text-error-red border border-error-red/20',
      safetyScore: 45,
      status: 'Suspended',
    },
    {
      id: 'DRV003',
      name: 'Ravi Sharma',
      initials: 'RS',
      phone: '+1 234-567-8903',
      licenseNo: 'DL-0012239-C',
      category: 'Light Vehicle (LCV)',
      expiryDate: 'Due: 15 Oct 2023',
      expiryBadge: 'Expires in 8 days',
      expiryBadgeColor: 'bg-safety-orange/10 text-safety-orange border border-safety-orange/20',
      safetyScore: 78,
      status: 'Available',
    },
  ]

  const [drivers, setDrivers] = useState<DriverRecord[]>(initialDrivers)

  // Compliance Alerts
  const [complianceAlerts] = useState<ComplianceAlert[]>([
    { id: '1', initials: 'JS', name: 'John Smith', statusText: 'Status: Suspended', colorClass: 'text-error-red', actionText: 'Review Incident' },
    { id: '2', initials: 'RS', name: 'Ravi Sharma', statusText: 'License Expired', colorClass: 'text-safety-orange', actionText: 'Upload Renewal' },
  ])

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newDriverName || !newLicenseNo) {
      alert('Please enter Name and License Number.')
      return
    }

    const initials = newDriverName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)

    const formattedDate = newExpiryDate
      ? new Date(newExpiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : '24 Oct 2026'

    const nextIdNum = drivers.length + 1
    const nextId = `DRV${String(nextIdNum).padStart(3, '0')}`

    const newDriver: DriverRecord = {
      id: nextId,
      name: newDriverName,
      initials: initials || 'XX',
      phone: newContactNo ? `+1 ${newContactNo}` : '+1 234-567-8900',
      licenseNo: newLicenseNo,
      category: newCategory,
      expiryDate: `Until ${formattedDate}`,
      expiryBadge: 'Valid',
      expiryBadgeColor: 'bg-green-50 text-success-green border-success-green/20',
      safetyScore: newSafetyScore,
      status: 'Available',
    }

    setDrivers([newDriver, ...drivers])
    setIsDrawerOpen(false)

    // Reset Form
    setNewDriverName('')
    setNewLicenseNo('')
    setNewCategory('Heavy Vehicle (HCV)')
    setNewExpiryDate('')
    setNewContactNo('')
    setNewSafetyScore(85)
  }

  // Filter Drivers
  const filteredDrivers = drivers.filter(d => {
    // Search filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      if (!d.name.toLowerCase().includes(q) && !d.licenseNo.toLowerCase().includes(q)) return false
    }
    // Status filter
    if (statusFilter !== 'All Statuses') {
      if (d.status !== statusFilter) return false
    }
    // Category filter
    if (categoryFilter !== 'All Categories') {
      if (categoryFilter === 'Heavy Vehicle (HCV)' && !d.category.includes('Heavy')) return false
      if (categoryFilter === 'Light Vehicle (LCV)' && !d.category.includes('Light')) return false
      if (categoryFilter === 'Public Transport (PSV)' && !d.category.includes('PSV')) return false
    }
    // Validity filter
    if (validityFilter !== 'All Validity') {
      if (validityFilter === 'Valid' && d.expiryBadge !== 'Valid') return false
      if (validityFilter === 'Expired' && !d.expiryBadge.includes('Expired')) return false
      if (validityFilter === 'Expiring (30 days)' && !d.expiryBadge.includes('Expires')) return false
    }
    return true
  })

  // KPI Computations
  const totalDriversCount = drivers.length + 29 // Base count + mocked metrics
  const availableDriversCount = drivers.filter(d => d.status === 'Available').length + 17
  const activeAssignmentsCount = drivers.filter(d => d.status === 'On Trip').length + 8
  const complianceAlertCount = drivers.filter(d => d.status === 'Suspended').length + 3

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
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-black/5 transition-all relative">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error-red rounded-full"></span>
          </button>
          <div className="h-6 w-[1px] bg-outline-variant mx-2 hidden sm:block"></div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-on-surface-variant font-body-md">Ops Admin</p>
          </div>
        </div>
      </header>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
        {/* Header summary & Action */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface font-headline-lg">Drivers &amp; Safety Profiles</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body-md">Manage driver records, license compliance, and operational availability</p>
          </div>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-background text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-lg cursor-pointer uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add Driver
          </button>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 border border-black/5 rounded-2xl shadow-sm flex flex-col justify-between h-28 border-l-4 border-l-industrial-blue">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="text-[10px] font-bold uppercase tracking-wider font-label-sm">Total Drivers</span>
              <span className="material-symbols-outlined text-industrial-blue">groups</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold font-mono text-on-surface">{totalDriversCount}</span>
              <div className="h-6 w-16 bg-dashboard-canvas rounded overflow-hidden">
                <div className="w-full h-full bg-industrial-blue/10 flex items-end">
                  <div className="w-1/4 h-1/2 bg-industrial-blue/40 border-t border-industrial-blue"></div>
                  <div className="w-1/4 h-2/3 bg-industrial-blue/40 border-t border-industrial-blue"></div>
                  <div className="w-1/4 h-3/4 bg-industrial-blue/40 border-t border-industrial-blue"></div>
                  <div className="w-1/4 h-full bg-industrial-blue/40 border-t border-industrial-blue"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 border border-black/5 rounded-2xl shadow-sm flex flex-col justify-between h-28 border-l-4 border-l-success-green">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="text-[10px] font-bold uppercase tracking-wider font-label-sm">Available Drivers</span>
              <span className="w-2 h-2 rounded-full bg-success-green animate-pulse"></span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold font-mono text-on-surface">{availableDriversCount}</span>
              <span className="text-success-green text-[10px] font-bold">+2 Today</span>
            </div>
          </div>
          <div className="bg-white p-6 border border-black/5 rounded-2xl shadow-sm flex flex-col justify-between h-28 border-l-4 border-l-industrial-blue">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="text-[10px] font-bold uppercase tracking-wider font-label-sm">Drivers On Trip</span>
              <span className="material-symbols-outlined text-industrial-blue">route</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold font-mono text-on-surface">{String(activeAssignmentsCount).padStart(2, '0')}</span>
              <span className="text-on-surface-variant text-[10px]">Active Assignments</span>
            </div>
          </div>
          <div className="bg-white p-6 border border-red-100 bg-red-50/10 rounded-2xl shadow-sm flex flex-col justify-between h-28 border-l-4 border-l-error-red">
            <div className="flex justify-between items-center text-error-red">
              <span className="text-[10px] font-bold uppercase tracking-wider font-label-sm">Compliance Attention</span>
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold font-mono text-error-red">{String(complianceAlertCount).padStart(2, '0')}</span>
              <span className="text-error-red text-[10px] font-bold">Action Required</span>
            </div>
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
                  <option>Heavy Vehicle (HCV)</option>
                  <option>Light Vehicle (LCV)</option>
                  <option>Public Transport (PSV)</option>
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
                      <th className="px-6 py-4 border-b border-black/5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs font-mono font-medium text-on-surface">
                    {filteredDrivers.map(d => (
                      <tr key={d.id} className="hover:bg-blue-50/10 transition-colors cursor-pointer" onClick={() => navigate(`/drivers/${d.id}`)}>
                        <td className="px-6 py-4 font-sans">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-industrial-blue/10 text-industrial-blue flex items-center justify-center font-bold text-xs">
                              {d.initials}
                            </div>
                            <div>
                              <p className="font-bold text-on-surface">{d.name}</p>
                              <p className="text-[10px] text-on-surface-variant mt-0.5">{d.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-on-surface">{d.licenseNo}</p>
                          <p className="text-[10px] text-on-surface-variant font-sans">{d.category}</p>
                        </td>
                        <td className="px-4 py-4 font-sans">
                          <div className="flex flex-col gap-0.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border w-fit ${
                              d.status === 'Suspended'
                                ? 'bg-red-50 text-error-red border-error-red/10'
                                : d.expiryBadge.includes('Expires')
                                  ? 'bg-amber-50 text-safety-orange border-safety-orange/10'
                                  : 'bg-green-50 text-success-green border-success-green/10'
                            }`}>
                              {d.expiryBadge}
                            </span>
                            <p className="text-[9px] text-on-surface-variant mt-0.5">{d.expiryDate}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-sans">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-1.5 bg-dashboard-canvas rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  d.safetyScore >= 80 ? 'bg-success-green' : d.safetyScore >= 60 ? 'bg-safety-orange' : 'bg-error-red'
                                }`}
                                style={{ width: `${d.safetyScore}%` }}
                              ></div>
                            </div>
                            <span className={`font-bold font-mono ${
                              d.safetyScore >= 80 ? 'text-success-green' : d.safetyScore >= 60 ? 'text-safety-orange' : 'text-error-red'
                            }`}>{d.safetyScore}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center font-sans">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                            d.status === 'Available'
                              ? 'bg-green-50 text-success-green border-success-green/10'
                              : d.status === 'On Trip'
                                ? 'bg-blue-50 text-industrial-blue border-industrial-blue/10'
                                : d.status === 'Suspended'
                                  ? 'bg-red-50 text-error-red border-error-red/10'
                                  : 'bg-gray-100 text-on-surface-variant border-gray-200'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-1 hover:bg-dashboard-canvas rounded transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-on-surface-variant text-sm">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Table Footer */}
              <div className="bg-white p-4 flex justify-between items-center text-[10px] font-bold text-on-surface-variant border-t border-black/5 font-label-sm">
                <p className="uppercase">Showing 1-{filteredDrivers.length} of {totalDriversCount} drivers</p>
                <div className="flex gap-2 font-sans font-normal">
                  <button className="px-3 py-1 border border-gray-200 rounded hover:bg-dashboard-canvas transition-colors disabled:opacity-50" disabled>Previous</button>
                  <button className="px-3 py-1 border border-transparent rounded bg-background text-white font-bold">1</button>
                  <button className="px-3 py-1 border border-gray-200 rounded hover:bg-dashboard-canvas transition-colors">2</button>
                  <button className="px-3 py-1 border border-gray-200 rounded hover:bg-dashboard-canvas transition-colors">Next</button>
                </div>
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
                <span className="bg-error-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">{complianceAlertCount}</span>
              </div>
              <div className="p-4 space-y-4 font-body-sm text-xs">
                {complianceAlerts.map(alertItem => (
                  <div key={alertItem.id} className="flex gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0 items-start">
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center font-bold text-xs text-on-surface shrink-0">
                      {alertItem.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-on-surface truncate">{alertItem.name}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${alertItem.colorClass}`}>{alertItem.statusText}</p>
                      <button
                        onClick={() => alert(`Reviewing action: ${alertItem.actionText}`)}
                        className="mt-2 text-[10px] font-bold text-industrial-blue underline decoration-industrial-blue/30 underline-offset-2 hover:opacity-80 block cursor-pointer"
                      >
                        {alertItem.actionText}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => alert('Loading alert dashboard...')}
                className="w-full py-3 text-[10px] font-bold bg-white text-on-surface-variant hover:text-industrial-blue border-t border-black/5 transition-colors uppercase tracking-wider text-center cursor-pointer font-label-sm"
              >
                VIEW ALL CRITICAL ALERTS
              </button>
            </div>

            {/* Visual Insight box */}
            <div className="bg-background p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-industrial-blue/10 rounded-full blur-2xl"></div>
              <p className="text-[10px] font-bold text-industrial-blue uppercase mb-4 tracking-widest font-label-sm">Fleet Safety Insight</p>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <span className="text-3xl font-bold font-mono">88.4</span>
                <div className="text-[9px] leading-tight">
                  <p className="font-bold text-success-green">+1.2%</p>
                  <p className="text-white/60">AVG SAFETY SCORE</p>
                </div>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden relative z-10">
                <div className="h-full bg-success-green" style={{ width: '88%' }}></div>
              </div>
              <p className="text-[10px] text-white/50 mt-4 leading-relaxed italic relative z-10 font-body-sm">
                "Fleet safety performance has improved significantly following the new compliance training module."
              </p>
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
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 border border-black/5 bg-dashboard-canvas/40 focus:ring-1 focus:ring-industrial-blue rounded-xl outline-none cursor-pointer"
                  >
                    <option>Heavy Vehicle (HCV)</option>
                    <option>Light Vehicle (LCV)</option>
                    <option>Public Transport (PSV)</option>
                  </select>
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
                <div className="flex">
                  <span className="px-4 py-2.5 bg-gray-100 border border-black/5 border-r-0 rounded-l-xl text-xs flex items-center">+1</span>
                  <input
                    value={newContactNo}
                    onChange={(e) => setNewContactNo(e.target.value)}
                    className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 focus:ring-1 focus:ring-industrial-blue rounded-r-xl outline-none"
                    placeholder="000-000-0000"
                    type="tel"
                  />
                </div>
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
                  className="flex-1 px-4 py-3 bg-background text-white rounded-xl font-bold hover:opacity-90 transition-all uppercase tracking-wider text-xs cursor-pointer shadow-md"
                >
                  Save Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
