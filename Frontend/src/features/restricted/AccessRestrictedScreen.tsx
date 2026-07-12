import { useNavigate } from 'react-router-dom'

export default function AccessRestrictedScreen() {
  const navigate = useNavigate()

  const handleRequestElevation = () => {
    alert('Access elevation request submitted to Security Officer.')
  }

  return (
    <div className="bg-background text-white h-screen w-full flex overflow-hidden font-sans p-4 gap-4 items-center justify-center relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-industrial-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-error-red/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      
      {/* CARD BODY */}
      <div className="w-full max-w-xl bg-white text-on-surface p-8 rounded-3xl border border-black/5 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
        
        {/* Animated warning lock badge */}
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-error-red mb-6 relative animate-pulse">
          <span className="material-symbols-outlined text-[44px]">gpp_maybe</span>
        </div>

        <span className="px-3 py-1 bg-red-50 text-error-red text-[10px] font-bold uppercase tracking-widest rounded-full mb-3 font-mono border border-red-100">
          Security Alert: Access Blocked
        </span>
        
        <h2 className="text-2xl font-bold font-headline-lg text-on-surface">Access Restricted</h2>
        <p className="text-on-surface-variant text-sm mt-2 max-w-sm leading-relaxed font-body-sm">
          Your current session role does not have the required command clearance level to view this module.
        </p>

        {/* Access logs data */}
        <div className="w-full bg-dashboard-canvas/50 rounded-2xl p-5 border border-black/5 text-left text-xs font-mono font-medium text-on-surface space-y-3 mt-6">
          <div className="flex justify-between border-b border-black/[0.03] pb-2">
            <span className="text-on-surface-variant font-sans">Error Signature</span>
            <span className="font-bold text-error-red">SEC-ERR-403</span>
          </div>
          <div className="flex justify-between border-b border-black/[0.03] pb-2">
            <span className="text-on-surface-variant font-sans">Clearence Level Required</span>
            <span className="font-bold text-on-surface">Global Administrator (Level 3)</span>
          </div>
          <div className="flex justify-between border-b border-black/[0.03] pb-2">
            <span className="text-on-surface-variant font-sans">Current Active Role</span>
            <span className="font-bold text-on-surface">Fleet Manager</span>
          </div>
          <div className="flex justify-between border-b border-black/[0.03] pb-2">
            <span className="text-on-surface-variant font-sans">Requester IP Address</span>
            <span className="font-bold text-on-surface">192.168.1.144</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant font-sans">Timestamp (UTC)</span>
            <span className="font-bold text-on-surface">{new Date().toISOString().replace('T', ' ').substring(0, 19)}</span>
          </div>
        </div>

        {/* Actions button group */}
        <div className="w-full grid grid-cols-2 gap-4 mt-8 font-body-sm text-sm">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-3 border border-black/5 bg-dashboard-canvas text-on-surface hover:bg-gray-100 rounded-xl font-bold transition-all uppercase tracking-wider text-xs cursor-pointer"
          >
            Go to Dashboard
          </button>
          <button
            onClick={handleRequestElevation}
            className="px-5 py-3 bg-background text-white rounded-xl font-bold hover:opacity-90 transition-all uppercase tracking-wider text-xs cursor-pointer shadow-md"
          >
            Request Elevation
          </button>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="mt-6 text-xs text-industrial-blue hover:underline font-semibold cursor-pointer"
        >
          Switch Operator Profile
        </button>
      </div>
    </div>
  )
}
