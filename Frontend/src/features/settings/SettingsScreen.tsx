import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SettingsScreen() {
  const navigate = useNavigate()
  
  // Navigation active tab
  const [activeTab, setActiveTab] = useState('Settings')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Settings states
  const [companyName, setCompanyName] = useState('TransitOps Logistics')
  const [currency, setCurrency] = useState('INR (₹)')
  const [distanceUnit, setDistanceUnit] = useState('Kilometers (km)')
  const [weightUnit, setWeightUnit] = useState('Kilograms (kg)')

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Configuration saved successfully!')
  }

  const handleNavClick = (tabName: string) => {
    if (tabName === 'Dashboard') navigate('/dashboard')
    else if (tabName === 'Fleet') navigate('/fleet')
    else if (tabName === 'Trips') navigate('/trips')
    else if (tabName === 'Maintenance') navigate('/maintenance')
    else if (tabName === 'Fuel & Expenses') navigate('/expenses')
    else if (tabName === 'Analytics') navigate('/analytics')
    else if (tabName === 'Settings') navigate('/settings')
    else setActiveTab(tabName)
  }

  const handleLogout = () => {
    navigate('/login')
  }

  const navItemsOperations = [
    { name: 'Dashboard', icon: 'dashboard' },
    { name: 'Fleet', icon: 'directions_bus' },
    { name: 'Drivers', icon: 'person' },
    { name: 'Trips', icon: 'route' },
  ]

  const navItemsManagement = [
    { name: 'Analytics', icon: 'leaderboard' },
    { name: 'Maintenance', icon: 'build' },
    { name: 'Fuel & Expenses', icon: 'local_gas_station' },
    { name: 'Settings', icon: 'settings' },
  ]

  return (
    <div className="bg-background text-on-surface h-screen w-full flex overflow-hidden font-sans p-2 md:p-4 gap-4">
      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="w-64 flex flex-col py-6 z-40 hidden md:flex shrink-0">
        <div className="px-6 mb-2">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">TRANSITOPS</p>
        </div>
        <div className="px-6 mb-8 flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-white">rocket_launch</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">TransitOps</h1>
            <p className="text-white/60 text-[10px] uppercase tracking-widest mt-1">Global Command</p>
          </div>
        </div>

        <div className="px-4 mb-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[20px]">search</span>
            <input
              className="w-full bg-white/10 border-none rounded-full px-10 py-2 text-sm text-white placeholder-white/40 focus:ring-1 focus:ring-white/20 outline-none"
              placeholder="Search..."
              type="text"
            />
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {/* OPERATIONS SECTION */}
          <div className="px-4 py-2">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">OPERATIONS</p>
            <div className="space-y-1">
              {navItemsOperations.map(item => (
                <button
                  key={item.name}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm text-left ${
                    activeTab === item.name
                      ? 'text-white bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => handleNavClick(item.name)}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* MANAGEMENT SECTION */}
          <div className="px-4 py-4">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">MANAGEMENT</p>
            <div className="space-y-1">
              {navItemsManagement.map(item => (
                <button
                  key={item.name}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm text-left ${
                    activeTab === item.name
                      ? 'text-white bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => handleNavClick(item.name)}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* USER PROFILE SECTION */}
          <div className="px-4 py-2">
            <div className="h-[1px] bg-white/10 w-full mb-6"></div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">USER PROFILE</p>
            <div className="space-y-1">
              <button
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm text-left ${
                  activeTab === 'Role' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => handleNavClick('Role')}
              >
                <span className="material-symbols-outlined text-[20px]">account_circle</span>
                Fleet Manager
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium text-sm text-left"
                onClick={handleLogout}
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Logout
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 md:hidden flex" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="w-64 bg-background h-full flex flex-col py-6 animate-slide-in-right" onClick={e => e.stopPropagation()}>
            <div className="px-6 mb-4 flex justify-between items-center">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">TRANSITOPS</p>
              <button className="text-white" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="px-6 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                <span className="material-symbols-outlined text-white">rocket_launch</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-none">TransitOps</h1>
                <p className="text-white/60 text-[10px] uppercase tracking-widest mt-1">Global Command</p>
              </div>
            </div>

            <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
              <div className="px-4 py-2">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">OPERATIONS</p>
                <div className="space-y-1">
                  {navItemsOperations.map(item => (
                    <button
                      key={item.name}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm text-left ${
                        activeTab === item.name
                          ? 'text-white bg-white/10'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                      onClick={() => {
                        handleNavClick(item.name)
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 py-4">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">MANAGEMENT</p>
                <div className="space-y-1">
                  {navItemsManagement.map(item => (
                    <button
                      key={item.name}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm text-left ${
                        activeTab === item.name
                          ? 'text-white bg-white/10'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                      onClick={() => {
                        handleNavClick(item.name)
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 py-2">
                <div className="h-[1px] bg-white/10 w-full mb-6"></div>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all font-medium text-sm text-left"
                  onClick={handleLogout}
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Logout
                </button>
              </div>
            </nav>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT CANVAS */}
      <main className="flex-1 bg-dashboard-canvas rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* TOP NAV BAR */}
        <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/5 bg-white/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-on-surface p-1 hover:bg-black/5 rounded" onClick={() => setIsMobileMenuOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-on-surface font-headline-sm">Settings &amp; RBAC</h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-black/5 transition-all relative">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error-red rounded-full"></span>
            </button>
            <div className="h-6 w-[1px] bg-outline-variant mx-2 hidden sm:block"></div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-on-surface-variant font-body-md">System Preferences</p>
            </div>
          </div>
        </header>

        {/* SCROLLABLE AREA */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
          {/* Header Section */}
          <div>
            <h2 className="text-2xl font-bold text-on-surface font-headline-lg">Settings</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body-md">Manage organization preferences and system access controls</p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-12 gap-8 items-stretch">
            
            {/* General Settings */}
            <div className="col-span-12 lg:col-span-5 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-industrial-blue">
                  <span className="material-symbols-outlined">business</span>
                </div>
                <h3 className="text-base font-bold text-on-surface font-headline-sm">Organization Details</h3>
              </div>
              <form onSubmit={handleSaveConfig} className="space-y-4 font-body-sm text-sm">
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Company Name</label>
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none"
                    type="text"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none cursor-pointer"
                    >
                      <option>INR (₹)</option>
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Distance Unit</label>
                    <select
                      value={distanceUnit}
                      onChange={(e) => setDistanceUnit(e.target.value)}
                      className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none cursor-pointer"
                    >
                      <option>Kilometers (km)</option>
                      <option>Miles (mi)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Weight Unit</label>
                  <select
                    value={weightUnit}
                    onChange={(e) => setWeightUnit(e.target.value)}
                    className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none cursor-pointer"
                  >
                    <option>Kilograms (kg)</option>
                    <option>Pounds (lbs)</option>
                    <option>Metric Tonnes (t)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-on-background text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition-all flex items-center gap-2 uppercase tracking-wider shadow-md mt-4 cursor-pointer"
                >
                  Save Configuration
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                </button>
              </form>
            </div>

            {/* Session Access Card */}
            <div className="col-span-12 lg:col-span-7 bg-background text-white p-8 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-industrial-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="inline-block px-2.5 py-1 bg-industrial-blue/20 text-industrial-blue text-[9px] font-bold uppercase tracking-widest rounded mb-3 font-label-sm">Identity &amp; Access</span>
                    <h3 className="text-xl font-bold font-headline-md">Session Identity: Riya Kapoor</h3>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-industrial-blue">
                    <span className="material-symbols-outlined text-[32px]">verified</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8 mt-6">
                  <div>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold font-label-sm mb-1">Assigned Role</p>
                    <p className="text-lg font-bold font-headline-sm">Fleet Manager</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold font-label-sm mb-1">Auth Status</p>
                    <p className="text-lg font-bold text-success-green font-headline-sm">Global Admin</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 relative z-10 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold font-label-sm">
                  <span className="text-white/50 uppercase tracking-widest">Profile Security Compliance</span>
                  <span className="text-success-green">98.4%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-[98.4%] h-full bg-industrial-blue"></div>
                </div>
              </div>
            </div>
          </div>

          {/* RBAC Access Matrix Table */}
          <div className="bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm">
            <div className="px-6 py-5 border-b border-black/5 flex justify-between items-center bg-gray-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-industrial-blue">
                  <span className="material-symbols-outlined">security</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface font-headline-sm">Role-Based Access Control (RBAC)</h3>
                  <p className="text-xs text-on-surface-variant font-medium mt-0.5">System-wide permission matrix for organizational hierarchy</p>
                </div>
              </div>
              <button
                onClick={() => alert('Matrix exported.')}
                className="text-industrial-blue font-bold text-xs hover:bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 flex items-center gap-2 transition-all cursor-pointer uppercase tracking-wider"
              >
                <span className="material-symbols-outlined text-[18px]">description</span>
                Export Matrix
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-body-md border-collapse">
                <thead className="bg-dashboard-canvas text-on-surface-variant text-[11px] uppercase tracking-wider font-label-sm">
                  <tr>
                    <th className="px-6 py-4 sticky left-0 bg-dashboard-canvas z-10 font-bold">Role</th>
                    <th className="px-6 py-4 font-bold text-center">Dashboard</th>
                    <th className="px-6 py-4 font-bold text-center">Fleet</th>
                    <th className="px-6 py-4 font-bold text-center">Drivers</th>
                    <th className="px-6 py-4 font-bold text-center">Trips</th>
                    <th className="px-6 py-4 font-bold text-center">Maintenance</th>
                    <th className="px-6 py-4 font-bold text-center">Expenses</th>
                    <th className="px-6 py-4 font-bold text-center">Analytics</th>
                    <th className="px-6 py-4 font-bold text-center">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs font-mono font-medium text-on-surface">
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-on-surface bg-white sticky left-0 shadow-[2px_0_5px_rgba(0,0,0,0.01)]">Fleet Manager</td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-green-50 text-success-green font-bold text-[9px] uppercase tracking-wider">Manage</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-green-50 text-success-green font-bold text-[9px] uppercase tracking-wider">Manage</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-green-50 text-success-green font-bold text-[9px] uppercase tracking-wider">Manage</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-green-50 text-success-green font-bold text-[9px] uppercase tracking-wider">Manage</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-green-50 text-success-green font-bold text-[9px] uppercase tracking-wider">Manage</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-green-50 text-success-green font-bold text-[9px] uppercase tracking-wider">Manage</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-green-50 text-success-green font-bold text-[9px] uppercase tracking-wider">Manage</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-green-50 text-success-green font-bold text-[9px] uppercase tracking-wider">Manage</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-on-surface bg-white sticky left-0 shadow-[2px_0_5px_rgba(0,0,0,0.01)]">Dispatcher</td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-blue-50 text-industrial-blue font-bold text-[9px] uppercase tracking-wider">View Only</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-green-50 text-success-green font-bold text-[9px] uppercase tracking-wider">Manage</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-blue-50 text-industrial-blue font-bold text-[9px] uppercase tracking-wider">View Only</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-green-50 text-success-green font-bold text-[9px] uppercase tracking-wider">Manage</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-blue-50 text-industrial-blue font-bold text-[9px] uppercase tracking-wider">View Only</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-red-50 text-error-red font-bold text-[9px] uppercase tracking-wider">No Access</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-blue-50 text-industrial-blue font-bold text-[9px] uppercase tracking-wider">View Only</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-red-50 text-error-red font-bold text-[9px] uppercase tracking-wider">No Access</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-on-surface bg-white sticky left-0 shadow-[2px_0_5px_rgba(0,0,0,0.01)]">Safety Officer</td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-blue-50 text-industrial-blue font-bold text-[9px] uppercase tracking-wider">View Only</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-blue-50 text-industrial-blue font-bold text-[9px] uppercase tracking-wider">View Only</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-green-50 text-success-green font-bold text-[9px] uppercase tracking-wider">Manage</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-blue-50 text-industrial-blue font-bold text-[9px] uppercase tracking-wider">View Only</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-green-50 text-success-green font-bold text-[9px] uppercase tracking-wider">Manage</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-red-50 text-error-red font-bold text-[9px] uppercase tracking-wider">No Access</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-blue-50 text-industrial-blue font-bold text-[9px] uppercase tracking-wider">View Only</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-red-50 text-error-red font-bold text-[9px] uppercase tracking-wider">No Access</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-on-surface bg-white sticky left-0 shadow-[2px_0_5px_rgba(0,0,0,0.01)]">Financial Analyst</td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-blue-50 text-industrial-blue font-bold text-[9px] uppercase tracking-wider">View Only</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-blue-50 text-industrial-blue font-bold text-[9px] uppercase tracking-wider">View Only</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-red-50 text-error-red font-bold text-[9px] uppercase tracking-wider">No Access</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-blue-50 text-industrial-blue font-bold text-[9px] uppercase tracking-wider">View Only</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-red-50 text-error-red font-bold text-[9px] uppercase tracking-wider">No Access</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-green-50 text-success-green font-bold text-[9px] uppercase tracking-wider">Manage</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-green-50 text-success-green font-bold text-[9px] uppercase tracking-wider">Manage</span></td>
                    <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded bg-blue-50 text-industrial-blue font-bold text-[9px] uppercase tracking-wider">View Only</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Panels Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Access Behavior Rules */}
            <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4">
              <h4 className="text-base font-bold text-on-surface flex items-center gap-2 font-headline-sm">
                <span className="material-symbols-outlined text-industrial-blue">gavel</span>
                Access Behavior Rules
              </h4>
              <ul className="space-y-4 text-xs">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 bg-industrial-blue rounded-full mt-1.5 shrink-0"></div>
                  <div>
                    <p className="font-bold text-on-surface font-sans">Session Auto-lock</p>
                    <p className="text-on-surface-variant font-body-sm mt-0.5">Inactive sessions for lower privilege roles lock after 15 minutes of inactivity.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 bg-industrial-blue rounded-full mt-1.5 shrink-0"></div>
                  <div>
                    <p className="font-bold text-on-surface font-sans">2FA Mandatory Enforcement</p>
                    <p className="text-on-surface-variant font-body-sm mt-0.5">Mandatory for Fleet Managers and Financial Analysts on every login attempt.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 bg-industrial-blue rounded-full mt-1.5 shrink-0"></div>
                  <div>
                    <p className="font-bold text-on-surface font-sans">IP Restricted Zones</p>
                    <p className="text-on-surface-variant font-body-sm mt-0.5">Access to Maintenance and Settings restricted to authorized office VPN ranges.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Security Policy Enforcement */}
            <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4">
              <h4 className="text-base font-bold text-on-surface flex items-center gap-2 font-headline-sm">
                <span className="material-symbols-outlined text-industrial-blue">verified_user</span>
                Security Policy Enforcement
              </h4>
              <div className="space-y-3 font-body-sm">
                <div className="p-3 bg-dashboard-canvas/40 rounded-xl border border-black/5 flex items-center justify-between">
                  <span className="font-medium text-on-surface">Real-time Admin Override</span>
                  <span className="px-2 py-0.5 bg-safety-orange/10 text-safety-orange font-bold text-[9px] uppercase tracking-wider font-label-sm">Level: Critical</span>
                </div>
                <div className="p-3 bg-dashboard-canvas/40 rounded-xl border border-black/5 flex items-center justify-between">
                  <span className="font-medium text-on-surface">Immutable Audit Trail Logging</span>
                  <span className="px-2 py-0.5 bg-success-green/10 text-success-green font-bold text-[9px] uppercase tracking-wider font-label-sm">Active</span>
                </div>
                <div className="p-3 bg-dashboard-canvas/40 rounded-xl border border-black/5 flex items-center justify-between">
                  <span className="font-medium text-on-surface">At-Rest Data Encryption</span>
                  <span className="px-2 py-0.5 bg-industrial-blue/10 text-industrial-blue font-bold text-[9px] uppercase tracking-wider font-label-sm">AES-256-GCM</span>
                </div>
                <div className="p-3 bg-dashboard-canvas/40 rounded-xl border border-black/5 flex items-center justify-between">
                  <span className="font-medium text-on-surface">API Scoped Key Management</span>
                  <span className="px-2 py-0.5 bg-blue-50 text-industrial-blue font-bold text-[9px] uppercase tracking-wider font-label-sm">Hardware Bound</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-white shadow-2xl rounded-2xl flex items-center justify-around z-40 border border-black/[0.02]">
        <button
          onClick={() => handleNavClick('Dashboard')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'Dashboard' ? 'text-on-background' : 'text-on-surface-variant/50'
          }`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold uppercase">Home</span>
        </button>
        <button
          onClick={() => handleNavClick('Fleet')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'Fleet' ? 'text-on-background' : 'text-on-surface-variant/50'
          }`}
        >
          <span className="material-symbols-outlined">directions_bus</span>
          <span className="text-[10px] font-bold uppercase">Fleet</span>
        </button>
        <button
          onClick={() => handleNavClick('Trips')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'Trips' ? 'text-on-background' : 'text-on-surface-variant/50'
          }`}
        >
          <span className="material-symbols-outlined">route</span>
          <span className="text-[10px] font-bold uppercase">Trips</span>
        </button>
        <button
          onClick={() => handleNavClick('Role')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'Role' ? 'text-on-background' : 'text-on-surface-variant/50'
          }`}
        >
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[10px] font-bold uppercase">Profile</span>
        </button>
      </nav>
    </div>
  )
}
