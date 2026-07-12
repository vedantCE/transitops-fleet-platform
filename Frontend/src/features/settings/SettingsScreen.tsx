import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

export default function SettingsScreen() {
  const { setIsMobileMenuOpen } = useOutletContext<{ setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>> }>()

  // Settings states
  const [companyName, setCompanyName] = useState('TransitOps Logistics')
  const [currency, setCurrency] = useState('INR (₹)')
  const [distanceUnit, setDistanceUnit] = useState('Kilometers (km)')
  const [weightUnit, setWeightUnit] = useState('Kilograms (kg)')

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Configuration saved successfully!')
  }

  return (
    <>
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

      {/* CONTENT CANVAS */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface font-headline-lg">Settings &amp; RBAC</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body-md">Configure global fleet units, organization metadata and control user clearance levels</p>
          </div>
        </div>

        {/* Settings Columns split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* General Config (Left 6/12) */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-industrial-blue text-xl">settings</span>
              <h3 className="text-base font-bold text-on-surface font-headline-sm">General Preferences</h3>
            </div>
            
            <form onSubmit={handleSaveConfig} className="space-y-4 font-body-sm text-sm">
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Company Name</label>
                <input
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none"
                  type="text"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Preferred Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none cursor-pointer"
                >
                  <option>INR (₹)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Distance Unit</label>
                  <select
                    value={distanceUnit}
                    onChange={(e) => setDistanceUnit(e.target.value)}
                    className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none cursor-pointer"
                  >
                    <option>Kilometers (km)</option>
                    <option>Miles (mi)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider font-label-sm">Weight Unit</label>
                  <select
                    value={weightUnit}
                    onChange={(e) => setWeightUnit(e.target.value)}
                    className="w-full bg-dashboard-canvas/40 border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-industrial-blue outline-none cursor-pointer"
                  >
                    <option>Kilograms (kg)</option>
                    <option>Pounds (lbs)</option>
                    <option>Tonnes (t)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-background text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-background/25 cursor-pointer uppercase tracking-widest text-[10px]"
              >
                Save Preferences
              </button>
            </form>
          </div>

          {/* RBAC Settings (Right 6/12) */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-industrial-blue text-xl">shield</span>
              <h3 className="text-base font-bold text-on-surface font-headline-sm">Security &amp; Command Level Clearance</h3>
            </div>
            
            <div className="space-y-4 text-xs font-mono font-medium text-on-surface">
              <div className="flex justify-between items-center p-3.5 bg-dashboard-canvas/45 rounded-xl border border-black/[0.01]">
                <div className="font-sans">
                  <p className="font-bold text-on-surface">Global Administrator (Level 3)</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Read/Write full global system controls</p>
                </div>
                <span className="bg-success-green/10 text-success-green text-[9px] font-bold px-2 py-0.5 rounded border border-success-green/20">Enabled</span>
              </div>
              
              <div className="flex justify-between items-center p-3.5 bg-dashboard-canvas/45 rounded-xl border border-black/[0.01]">
                <div className="font-sans">
                  <p className="font-bold text-on-surface">Fleet Manager (Level 2)</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Manage assets, assign operators &amp; view logs</p>
                </div>
                <span className="bg-success-green/10 text-success-green text-[9px] font-bold px-2 py-0.5 rounded border border-success-green/20">Active Profile</span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-dashboard-canvas/45 rounded-xl border border-black/[0.01]">
                <div className="font-sans">
                  <p className="font-bold text-on-surface">Operator (Level 1)</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">View routes &amp; record fuel logs only</p>
                </div>
                <span className="bg-success-green/10 text-success-green text-[9px] font-bold px-2 py-0.5 rounded border border-success-green/20">Enabled</span>
              </div>
            </div>

            <div className="bg-red-50/10 border-l-4 border-error-red p-4 rounded-xl">
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-error-red">security</span>
                <div>
                  <p className="font-bold text-on-surface font-sans text-xs text-error-red">System Policy Restrictions</p>
                  <p className="text-on-surface-variant text-[11px] mt-0.5 leading-relaxed font-body-sm">
                    Modifying system parameters requires multi-factor clearance. Unprivileged edits will immediately log a security violation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
