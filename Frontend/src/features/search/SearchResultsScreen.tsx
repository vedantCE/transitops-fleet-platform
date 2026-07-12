import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

interface VehicleResult {
  vehicleId: string
  model: string
  registrationNumber: string
  status: 'Available' | 'On Trip' | 'In Shop'
  fuel: number
  odometer: string
}

interface DriverResult {
  name: string
  avatar: string
  status: 'Available' | 'On Trip' | 'Suspended' | 'Off Duty'
  licenseNo: string
  safetyScore: number
}

interface TripResult {
  id: string
  source: string
  destination: string
  status: 'Dispatched' | 'Completed' | 'Draft'
  time: string
  assignedUnit: string
}

interface MaintenanceResult {
  service: string
  detail: string
  vehicleId: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'Active' | 'Scheduled'
}

export default function SearchResultsScreen() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || 'VAN-05'
  const [activeFilter, setActiveFilter] = useState<'All' | 'Vehicles' | 'Drivers' | 'Trips' | 'Maintenance'>('All')

  // Sample data corresponding directly to search results mockup
  const vehicles: VehicleResult[] = [
    { vehicleId: 'VAN-05', model: 'Tata Winger', registrationNumber: 'GJ05AB1234', status: 'Available', fuel: 82, odometer: '42k km' }
  ]

  const drivers: DriverResult[] = [
    {
      name: 'Alex Patel',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUMJ6MA6xv8who0syio-PLhMtf9i9uPB-X4HZFqZjt73Cm6KWWHXynU_i4KJpcNJ8Xe78NEiZdY0CPxoqmSAE25e-D2FmSHRNLfHufxliAupr9zvjOUwT3hcQmsnRfbmc6t9JGG_LUAcGhU0SAwhN63dEneLQ23nFxyc1TezNx0q6I520zFhOMNQo_rYR3jagj5V8OywkbQNjft9frfHZjL14kdsxquQcGBFGzP8SN7wqVtF-BOT0ZkTuAxBQV1bBay1Pbt7jJSDI',
      status: 'Available',
      licenseNo: 'DL-7825',
      safetyScore: 94
    }
  ]

  const trips: TripResult[] = [
    { id: 'TR001', source: 'Ahmedabad', destination: 'Surat', status: 'Dispatched', time: '08:30 AM', assignedUnit: 'VAN-05' }
  ]

  const maintenance: MaintenanceResult[] = [
    { service: 'Oil Change', detail: 'Preventative Maintenance', vehicleId: 'VAN-05', priority: 'Medium', status: 'Active' },
    { service: 'Tire Rotation', detail: 'Scheduled next week', vehicleId: 'VAN-05', priority: 'Low', status: 'Scheduled' }
  ]

  const totalResults = vehicles.length + drivers.length + trips.length + maintenance.length + 3 // Add simulated hidden items

  return (
    <>
      {/* Top Nav Breadcrumbs */}
      <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/[0.03] bg-white/40 backdrop-blur-md">
        <div className="flex items-center gap-4 text-xs font-medium font-body-sm text-on-surface-variant">
          <button onClick={() => navigate('/dashboard')} className="hover:text-industrial-blue transition-colors">Command Center</button>
          <span className="material-symbols-outlined text-[14px] opacity-40">chevron_right</span>
          <span className="text-on-surface font-semibold">Global Search</span>
        </div>
        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-on-surface-variant font-body-md uppercase tracking-wider">Search Manifest</p>
        </div>
      </header>

      {/* Main Canvas body */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
        {/* Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-on-surface font-headline-lg">
              Search results for <span className="text-industrial-blue">"{query}"</span>
            </h2>
            <span className="px-3 py-1 bg-surface-container-high rounded-lg font-mono text-[10px] font-bold text-on-surface-variant border border-outline-variant/30">
              {totalResults} items found
            </span>
          </div>
          <button
            onClick={() => navigate('/trips')}
            className="bg-background text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-lg cursor-pointer uppercase tracking-wider font-sans self-start"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Transit Record
          </button>
        </div>

        {/* Industrial Filters Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide text-xs font-bold font-label-sm uppercase tracking-wide">
          <button
            onClick={() => setActiveFilter('All')}
            className={`px-5 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'All'
                ? 'bg-industrial-blue text-white shadow-lg shadow-industrial-blue/20'
                : 'bg-white border border-outline-variant text-on-surface hover:bg-surface-container-low'
            }`}
          >
            All Results ({totalResults})
          </button>
          <button
            onClick={() => setActiveFilter('Vehicles')}
            className={`px-5 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeFilter === 'Vehicles'
                ? 'bg-industrial-blue text-white shadow-lg shadow-industrial-blue/20'
                : 'bg-white border border-outline-variant text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] ${activeFilter === 'Vehicles' ? 'text-white' : 'text-industrial-blue'}`}>directions_bus</span>
            Vehicles ({vehicles.length + 1})
          </button>
          <button
            onClick={() => setActiveFilter('Drivers')}
            className={`px-5 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeFilter === 'Drivers'
                ? 'bg-industrial-blue text-white shadow-lg shadow-industrial-blue/20'
                : 'bg-white border border-outline-variant text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] ${activeFilter === 'Drivers' ? 'text-white' : 'text-industrial-blue'}`}>person</span>
            Drivers ({drivers.length})
          </button>
          <button
            onClick={() => setActiveFilter('Trips')}
            className={`px-5 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeFilter === 'Trips'
                ? 'bg-industrial-blue text-white shadow-lg shadow-industrial-blue/20'
                : 'bg-white border border-outline-variant text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] ${activeFilter === 'Trips' ? 'text-white' : 'text-industrial-blue'}`}>route</span>
            Trips ({trips.length + 2})
          </button>
          <button
            onClick={() => setActiveFilter('Maintenance')}
            className={`px-5 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeFilter === 'Maintenance'
                ? 'bg-industrial-blue text-white shadow-lg shadow-industrial-blue/20'
                : 'bg-white border border-outline-variant text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] ${activeFilter === 'Maintenance' ? 'text-white' : 'text-industrial-blue'}`}>build</span>
            Maintenance ({maintenance.length})
          </button>
        </div>

        {/* Results Sections */}
        <div className="space-y-12">
          {/* Vehicles Section */}
          {(activeFilter === 'All' || activeFilter === 'Vehicles') && (
            <section>
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Vehicles</h3>
                <div className="h-px flex-grow bg-outline-variant opacity-30"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((v, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate('/fleet')}
                    className="bg-white border border-outline-variant rounded-2xl p-6 hover:shadow-xl hover:border-industrial-blue/50 transition-all group cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[180px]"
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-14 h-14 rounded-xl bg-surface-container-low flex items-center justify-center border border-outline-variant group-hover:bg-industrial-blue/10 group-hover:border-industrial-blue/30 transition-colors">
                        <span className="material-symbols-outlined text-[32px] text-industrial-blue">local_shipping</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold bg-success-green/10 text-success-green uppercase tracking-wider border border-success-green/20">
                        {v.status}
                      </span>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-lg font-bold text-on-surface font-headline-sm">{v.vehicleId}</h4>
                      <p className="text-xs text-on-surface-variant font-body-sm mt-0.5">
                        {v.model} • <span className="font-mono text-on-surface font-medium">{v.registrationNumber}</span>
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/30 mt-4 text-[10px] font-bold font-mono">
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">opacity</span>
                        <span>{v.fuel}% Fuel</span>
                      </div>
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">speed</span>
                        <span>{v.odometer}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {/* 1 Hidden Result Card */}
                <div
                  onClick={() => navigate('/fleet')}
                  className="bg-white border border-outline-variant border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-on-surface-variant hover:border-industrial-blue hover:text-industrial-blue transition-colors cursor-pointer group min-h-[180px]"
                >
                  <span className="material-symbols-outlined text-[32px] mb-3 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all">add_circle</span>
                  <p className="text-xs font-bold font-label-md uppercase tracking-wider">1 Hidden Result</p>
                </div>
              </div>
            </section>
          )}

          {/* Drivers Section */}
          {(activeFilter === 'All' || activeFilter === 'Drivers') && (
            <section>
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Drivers</h3>
                <div className="h-px flex-grow bg-outline-variant opacity-30"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drivers.map((d, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate('/drivers')}
                    className="bg-white border border-outline-variant rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between min-h-[220px]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl border-2 border-surface-container-high overflow-hidden shrink-0">
                        <img alt={d.name} className="w-full h-full object-cover" src={d.avatar} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-on-surface font-headline-sm">{d.name}</h4>
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[9px] font-bold bg-success-green/10 text-success-green border border-success-green/20 uppercase tracking-wider">
                          {d.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2 p-3 bg-surface-container-low rounded-xl mt-4 font-mono font-bold text-[10px]">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-sans text-on-surface-variant font-bold opacity-70">License</span>
                        <span>{d.licenseNo}</span>
                      </div>
                      <div className="h-8 w-px bg-outline-variant/50"></div>
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] uppercase font-sans text-on-surface-variant font-bold opacity-70">Safety</span>
                        <span className="text-success-green">{d.safetyScore}% Score</span>
                      </div>
                    </div>

                    <button className="w-full mt-4 py-2 text-industrial-blue bg-industrial-blue/5 hover:bg-industrial-blue hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
                      Assign Vehicle
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Trips Section */}
          {(activeFilter === 'All' || activeFilter === 'Trips') && (
            <section>
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Trips</h3>
                <div className="h-px flex-grow bg-outline-variant opacity-30"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {trips.map((t, idx) => (
                  <div key={idx} className="bg-white border border-outline-variant rounded-2xl overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between">
                    <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center border-b border-outline-variant/30 text-xs font-bold font-mono">
                      <div className="flex items-center gap-3">
                        <span className="bg-white px-2 py-1 rounded border border-outline-variant/30 text-on-surface font-bold">{t.id}</span>
                        <span className="px-2.5 py-0.5 rounded text-[9px] font-bold bg-industrial-blue/10 text-industrial-blue uppercase border border-industrial-blue/20 tracking-wider">
                          {t.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-on-surface-variant font-sans font-medium">Scheduled: {t.time}</span>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
                        <div className="flex items-center gap-6 flex-grow">
                          <div className="text-center min-w-[100px]">
                            <p className="text-[9px] font-bold text-on-surface-variant uppercase mb-1 opacity-60 font-label-sm">Origin</p>
                            <p className="text-sm font-bold text-on-surface font-headline-sm">{t.source}</p>
                          </div>
                          <div className="flex-grow relative flex items-center justify-center">
                            <div className="w-full h-px bg-outline-variant border-t border-dashed border-industrial-blue/30"></div>
                            <div className="absolute w-8 h-8 rounded-full bg-white border border-industrial-blue/30 flex items-center justify-center text-industrial-blue">
                              <span className="material-symbols-outlined text-[16px]">route</span>
                            </div>
                          </div>
                          <div className="text-center min-w-[100px]">
                            <p className="text-[9px] font-bold text-on-surface-variant uppercase mb-1 opacity-60 font-label-sm">Destination</p>
                            <p className="text-sm font-bold text-on-surface font-headline-sm">{t.destination}</p>
                          </div>
                        </div>
                        <div className="w-full sm:w-px sm:h-12 bg-outline-variant/30"></div>
                        <div className="text-center sm:text-right">
                          <p className="text-[9px] text-on-surface-variant font-bold uppercase mb-1 opacity-60 font-label-sm">Assigned Unit</p>
                          <span className="font-mono text-xs font-bold text-on-surface bg-surface-container-highest px-3 py-1.5 rounded-lg border border-outline-variant/30 inline-block">
                            {t.assignedUnit}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Placeholder Context */}
                <div className="bg-surface-container-low/40 border border-outline-variant border-dashed rounded-2xl flex items-center justify-center p-6 italic text-on-surface-variant/60 font-bold text-[10px] uppercase tracking-wider font-label-sm">
                  + 2 other active trips matching query context
                </div>
              </div>
            </section>
          )}

          {/* Maintenance Section */}
          {(activeFilter === 'All' || activeFilter === 'Maintenance') && (
            <section className="pb-10">
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Maintenance Logs</h3>
                <div className="h-px flex-grow bg-outline-variant opacity-30"></div>
              </div>
              <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-surface-container-low border-b border-outline-variant/30 font-bold font-label-sm text-on-surface-variant uppercase tracking-widest text-[10px]">
                      <tr>
                        <th className="px-6 py-4">Issue/Service</th>
                        <th className="px-6 py-4">Asset ID</th>
                        <th className="px-6 py-4">Priority</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 font-mono font-medium text-on-surface">
                      {maintenance.map((m, idx) => (
                        <tr key={idx} className="hover:bg-surface-container-lowest transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-safety-orange/10 flex items-center justify-center text-safety-orange border border-safety-orange/20 shrink-0">
                                <span className="material-symbols-outlined text-[20px]">oil_barrel</span>
                              </div>
                              <div className="font-sans">
                                <p className="font-bold text-on-surface">{m.service}</p>
                                <p className="text-[10px] text-on-surface-variant opacity-70 mt-0.5">{m.detail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-bold text-on-surface">{m.vehicleId}</span>
                          </td>
                          <td className="px-6 py-5 font-sans">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                              m.priority === 'High'
                                ? 'bg-red-50 text-error-red border-error-red/10'
                                : m.priority === 'Medium'
                                  ? 'bg-amber-50 text-alert-yellow border-alert-yellow/10'
                                  : 'bg-blue-50 text-industrial-blue border-industrial-blue/10'
                            }`}>
                              {m.priority}
                            </span>
                          </td>
                          <td className="px-6 py-5 font-sans">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${m.status === 'Active' ? 'bg-industrial-blue animate-pulse' : 'bg-gray-400'}`}></div>
                              <span className="font-bold text-on-surface">{m.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right font-sans">
                            <button
                              onClick={() => navigate('/maintenance')}
                              className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-industrial-blue hover:text-white rounded-lg transition-all ml-auto cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
