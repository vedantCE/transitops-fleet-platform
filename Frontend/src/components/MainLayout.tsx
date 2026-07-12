import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'
import { canViewFuel, canViewMaintenance } from '../lib/permissions'
import transitopsIcon from '../assets/transitops-icon.png'

export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [layoutSearchQuery, setLayoutSearchQuery] = useState('')

  const currentPath = location.pathname

  const getActiveTab = () => {
    if (currentPath.startsWith('/dashboard')) return 'Dashboard'
    if (currentPath.startsWith('/fleet')) return 'Fleet'
    if (currentPath.startsWith('/drivers')) return 'Drivers'
    if (currentPath.startsWith('/trips')) return 'Trips'
    if (currentPath.startsWith('/analytics')) return 'Analytics'
    if (currentPath.startsWith('/maintenance')) return 'Maintenance'
    if (currentPath.startsWith('/expenses')) return 'Fuel & Expenses'
    if (currentPath.startsWith('/settings')) return 'Settings'
    return ''
  }

  const activeTab = getActiveTab()

  const handleNavClick = (tabName: string) => {
    setIsMobileMenuOpen(false)
    if (tabName === 'Dashboard') navigate('/dashboard')
    else if (tabName === 'Fleet') navigate('/fleet')
    else if (tabName === 'Drivers') navigate('/drivers')
    else if (tabName === 'Trips') navigate('/trips')
    else if (tabName === 'Maintenance') navigate('/maintenance')
    else if (tabName === 'Fuel & Expenses') navigate('/expenses')
    else if (tabName === 'Analytics') navigate('/analytics')
    else if (tabName === 'Settings') navigate('/settings')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSearchSubmit = () => {
    if (layoutSearchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(layoutSearchQuery)}`)
    }
  }

  const navItemsOperations = [
    { name: 'Dashboard', icon: 'dashboard' },
    { name: 'Fleet', icon: 'directions_bus' },
    { name: 'Drivers', icon: 'person' },
    { name: 'Trips', icon: 'route' },
  ]

  const navItemsManagement = [
    { name: 'Analytics', icon: 'leaderboard' },
    ...(canViewMaintenance(user?.role) ? [{ name: 'Maintenance', icon: 'build' }] : []),
    ...(canViewFuel(user?.role) ? [{ name: 'Fuel & Expenses', icon: 'local_gas_station' }] : []),
    { name: 'Settings', icon: 'settings' },
  ]

  return (
    <div className="bg-background text-on-surface h-screen w-full flex overflow-hidden font-sans p-2 md:p-4 gap-4">
      {/* SIDEBAR NAVIGATION (Collapsible Desktop Component) */}
      <Sidebar
        activeTab={activeTab}
        handleNavClick={handleNavClick}
        handleLogout={handleLogout}
        layoutSearchQuery={layoutSearchQuery}
        setLayoutSearchQuery={setLayoutSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        userName={user?.name ?? ''}
        userRole={user?.role}
      />

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="w-64 bg-background h-full flex flex-col py-6 animate-slide-in-right" onClick={e => e.stopPropagation()}>
            <div className="px-6 mb-4 flex justify-between items-center">
              <p className="text-[9px] font-bold tracking-widest">
                <span className="text-white/40">TRANSIT</span>
                <span className="text-[#34a853]">OPS</span>
              </p>
              <button className="text-white" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="px-6 mb-6 flex items-center gap-2.5">
              <img
                src={transitopsIcon}
                alt="TransitOps Logo"
                className="w-8 h-8 rounded-lg object-contain shrink-0"
              />
              <div className="flex flex-col">
                <div className="flex items-baseline text-sm font-bold leading-none tracking-tight">
                  <span className="text-white">Transit</span>
                  <span className="text-[#34a853]">Ops</span>
                </div>
                <p className="text-[7.2px] font-bold text-white/40 uppercase tracking-[0.16em] mt-1.5 leading-none">
                  SMART TRANSPORT OPERATIONS
                </p>
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
                      onClick={() => handleNavClick(item.name)}
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
                      onClick={() => handleNavClick(item.name)}
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
      <main className="flex-1 bg-dashboard-canvas rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
        <Outlet context={{ setIsMobileMenuOpen }} />
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
          onClick={() => handleNavClick('Settings')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'Settings' ? 'text-on-background' : 'text-on-surface-variant/50'
          }`}
        >
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[10px] font-bold uppercase">Profile</span>
        </button>
      </nav>
    </div>
  )
}
