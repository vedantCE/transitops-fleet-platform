import { useNavigate } from 'react-router-dom'

export default function PageNotFoundScreen() {
  const navigate = useNavigate()

  const quickLinks = [
    { name: 'Dashboard', icon: 'dashboard', desc: 'Fleet-wide status overview and real-time alerts.', route: '/dashboard' },
    { name: 'Fleet Assets', icon: 'directions_bus', desc: 'Detailed telemetry for all active vehicles.', route: '/fleet' },
    { name: 'Driver Manifest', icon: 'person', desc: 'Shift logs, performance metrics, and safety audits.', route: '/drivers' },
    { name: 'Active Trips', icon: 'route', desc: 'Real-time route optimization and ETAs.', route: '/trips' },
    { name: 'Maintenance', icon: 'build', desc: 'Service schedule and predictive repair logs.', route: '/maintenance' }
  ]

  return (
    <>
      {/* Top Nav inside Main Content */}
      <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/5 bg-white/40 backdrop-blur-md">
        <div className="flex items-center gap-4 text-xs font-medium font-body-sm text-on-surface-variant">
          <button onClick={() => navigate('/dashboard')} className="hover:text-industrial-blue transition-colors">Command Center</button>
          <span className="material-symbols-outlined text-[14px] opacity-40">chevron_right</span>
          <span className="text-on-surface font-semibold">Route Error</span>
        </div>
        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-on-surface-variant font-body-md uppercase tracking-wider">404 Manifest</p>
        </div>
      </header>

      {/* Main Canvas */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 custom-scrollbar">
        {/* Error Hero Section */}
        <section className="relative bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(59,130,246,0.02)_50%)] [background-size:100%_4px] opacity-25 pointer-events-none"></div>
          <div className="flex flex-col md:flex-row items-stretch min-h-[380px]">
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-center relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-error/10 text-error rounded-md mb-6 w-fit font-mono font-bold text-[10px]">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                <span className="uppercase tracking-wider">Error Code: 404</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-on-background font-headline-lg mb-4">Route Not Found</h2>
              <p className="text-sm md:text-base text-on-surface-variant max-w-lg mb-8 leading-relaxed font-body-md">
                The operational coordinates you are looking for are currently unavailable. The resource might have been relocated, decommissioned, or never existed in the current fleet manifest.
              </p>
              <div className="flex flex-wrap gap-4 font-body-sm text-xs">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-background text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-md cursor-pointer uppercase tracking-wider text-[10px]"
                >
                  <span className="material-symbols-outlined text-[18px]">dashboard</span>
                  Return to Dashboard
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="border border-industrial-blue text-industrial-blue bg-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-industrial-blue/5 active:scale-[0.98] transition-all cursor-pointer uppercase tracking-wider text-[10px]"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Go Back
                </button>
              </div>
            </div>
            
            <div className="w-full md:w-[320px] bg-surface-container-low flex items-center justify-center p-8 relative border-t md:border-t-0 md:border-l border-outline-variant shrink-0">
              <div className="relative w-full aspect-square max-w-[200px] flex flex-col items-center justify-center">
                {/* 404 background watermark */}
                <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
                  <span className="text-[120px] font-bold font-headline-lg text-industrial-blue/10 tracking-tighter">404</span>
                </div>
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="w-20 h-20 bg-industrial-blue/10 rounded-full flex items-center justify-center text-industrial-blue animate-pulse">
                    <span className="material-symbols-outlined text-4xl">location_off</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Navigation Hub */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant pb-4 font-body-sm text-xs">
            <h3 className="text-base font-bold text-on-background font-headline-sm">Fleet Manager Hub</h3>
            <span className="font-bold text-on-surface-variant uppercase tracking-widest font-label-sm text-[10px]">Quick Access Manifest</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {quickLinks.map((link, idx) => (
              <div
                key={idx}
                onClick={() => navigate(link.route)}
                className="group p-5 bg-white border border-outline-variant rounded-xl hover:shadow-md hover:border-industrial-blue transition-all cursor-pointer flex flex-col justify-between min-h-[160px]"
              >
                <div className="w-10 h-10 bg-industrial-blue/10 rounded-lg flex items-center justify-center text-industrial-blue mb-4 group-hover:bg-industrial-blue group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-lg">{link.icon}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-background mb-1 font-sans">{link.name}</h4>
                  <p className="text-[10px] text-on-surface-variant leading-relaxed font-body-sm">{link.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Support Footer */}
        <footer className="pt-8 border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4 opacity-60 text-[10px] font-bold font-label-sm uppercase tracking-wide">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success-green"></span> System Operational</span>
            <span className="text-on-surface-variant">|</span>
            <span>Server: TO-REGION-PRIME-01</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a className="hover:text-industrial-blue transition-colors underline-offset-4 hover:underline" href="#">Technical Support</a>
            <a className="hover:text-industrial-blue transition-colors underline-offset-4 hover:underline" href="#">Contact Administrator</a>
            <a className="hover:text-industrial-blue transition-colors underline-offset-4 hover:underline" href="#">API Status</a>
          </div>
        </footer>
      </div>
    </>
  )
}
