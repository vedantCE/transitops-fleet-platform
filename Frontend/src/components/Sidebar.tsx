import { useState } from 'react'

interface SidebarProps {
  activeTab: string
  handleNavClick: (tabName: string) => void
  handleLogout: () => void
  layoutSearchQuery: string
  setLayoutSearchQuery: (q: string) => void
  onSearchSubmit: () => void
}

export default function Sidebar({
  activeTab,
  handleNavClick,
  handleLogout,
  layoutSearchQuery,
  setLayoutSearchQuery,
  onSearchSubmit,
}: SidebarProps) {
  // Persistent Collapsible State
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })

  const toggleCollapse = () => {
    const nextState = !isCollapsed
    setIsCollapsed(nextState)
    localStorage.setItem('sidebar-collapsed', String(nextState))
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
    <aside
      className={`flex flex-col py-6 z-40 hidden md:flex shrink-0 transition-all duration-300 relative border-r border-white/5 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* BRANDING SECTION */}
      <div className={`px-4 mb-2 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest transition-opacity duration-300">
            TRANSITOPS
          </p>
        )}
        <button
          onClick={toggleCollapse}
          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-all hover:scale-105"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <span className="material-symbols-outlined text-[16px]">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      <div className={`px-4 mb-8 flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-white">rocket_launch</span>
        </div>
        {!isCollapsed && (
          <div className="transition-opacity duration-300">
            <h1 className="text-sm font-bold text-white leading-none">TransitOps</h1>
            <p className="text-white/60 text-[10px] uppercase tracking-widest mt-1">Global Command</p>
          </div>
        )}
      </div>

      {/* SEARCH SECTION */}
      <div className="px-4 mb-6">
        {isCollapsed ? (
          <div className="flex justify-center">
            <button
              onClick={toggleCollapse}
              className="w-9 h-9 bg-white/10 hover:bg-white/20 text-white/60 hover:text-white rounded-full flex items-center justify-center cursor-pointer transition-all"
              title="Search"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
          </div>
        ) : (
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[20px]">
              search
            </span>
            <input
              className="w-full bg-white/10 border-none rounded-full px-10 py-2 text-sm text-white placeholder-white/40 focus:ring-1 focus:ring-white/20 outline-none"
              placeholder="Search..."
              type="text"
              value={layoutSearchQuery}
              onChange={e => setLayoutSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  onSearchSubmit()
                }
              }}
            />
          </div>
        )}
      </div>

      {/* NAVIGATION ITEMS */}
      <nav className="flex-grow px-3 space-y-2 overflow-y-auto custom-scrollbar">
        {/* OPERATIONS SECTION */}
        <div className="space-y-1">
          {!isCollapsed ? (
            <p className="px-4 py-2 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 transition-opacity duration-300">
              OPERATIONS
            </p>
          ) : (
            <div className="h-[1px] bg-white/10 mx-2 my-3"></div>
          )}
          <div className="space-y-1">
            {navItemsOperations.map(item => (
              <button
                key={item.name}
                className={`w-full flex items-center rounded-xl transition-all duration-200 font-medium text-sm text-left cursor-pointer ${
                  isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-4 py-2.5'
                } ${
                  activeTab === item.name
                    ? 'text-white bg-white/10 shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => handleNavClick(item.name)}
                title={isCollapsed ? item.name : undefined}
              >
                <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* MANAGEMENT SECTION */}
        <div className="space-y-1">
          {!isCollapsed ? (
            <p className="px-4 py-2 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 transition-opacity duration-300">
              MANAGEMENT
            </p>
          ) : (
            <div className="h-[1px] bg-white/10 mx-2 my-3"></div>
          )}
          <div className="space-y-1">
            {navItemsManagement.map(item => (
              <button
                key={item.name}
                className={`w-full flex items-center rounded-xl transition-all duration-200 font-medium text-sm text-left cursor-pointer ${
                  isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-4 py-2.5'
                } ${
                  activeTab === item.name
                    ? 'text-white bg-white/10 shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => handleNavClick(item.name)}
                title={isCollapsed ? item.name : undefined}
              >
                <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* USER PROFILE SECTION */}
        <div className="space-y-1">
          {!isCollapsed ? (
            <>
              <div className="h-[1px] bg-white/10 w-full my-6"></div>
              <p className="px-4 py-2 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 transition-opacity duration-300">
                USER PROFILE
              </p>
            </>
          ) : (
            <div className="h-[1px] bg-white/10 mx-2 my-3"></div>
          )}
          <div className="space-y-1">
            <button
              className={`w-full flex items-center rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium text-sm text-left cursor-pointer ${
                isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-4 py-2.5'
              }`}
              onClick={() => handleNavClick('Settings')}
              title={isCollapsed ? 'Fleet Manager' : undefined}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">account_circle</span>
              {!isCollapsed && <span className="truncate">Fleet Manager</span>}
            </button>
            <button
              className={`w-full flex items-center rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium text-sm text-left cursor-pointer ${
                isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-4 py-2.5'
              }`}
              onClick={handleLogout}
              title={isCollapsed ? 'Logout' : undefined}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">logout</span>
              {!isCollapsed && <span className="truncate">Logout</span>}
            </button>
          </div>
        </div>
      </nav>
    </aside>
  )
}
