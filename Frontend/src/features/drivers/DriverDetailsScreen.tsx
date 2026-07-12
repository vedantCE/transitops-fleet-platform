import { useParams, useNavigate } from 'react-router-dom'

interface DriverData {
  id: string
  name: string
  license: string
  licenseExpiry: string
  status: 'Available' | 'On Trip' | 'Off Duty' | 'Suspended'
  safetyScore: number
  safetyScoreTrend: string
  completedTrips: number
  totalTrips: number
  onTimePercent: string
  fuelEfficiency: string
  incidentsReported: number
  phone: string
  email: string
  joinedDate: string
  base: string
  experience: string
  avatar: string
  currentVehicle: string
}

const driverDatabase: Record<string, DriverData> = {
  'DRV001': {
    id: 'DRV001',
    name: 'Alex Patel',
    license: 'DL-7825',
    licenseExpiry: 'Oct 2026',
    status: 'Available',
    safetyScore: 94,
    safetyScoreTrend: '+2.4%',
    completedTrips: 48,
    totalTrips: 52,
    onTimePercent: '98.5%',
    fuelEfficiency: '8.2 / 10',
    incidentsReported: 0,
    phone: '+91 98765 43210',
    email: 'alex.patel@transitops.in',
    joinedDate: 'Jan 12, 2021',
    base: 'Ahmedabad Hub',
    experience: '4 years',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMcJWxoRkFFRA4EUGdIwFb6kCZazoQCz7_b9nkmpX1EYI9Ynhgo_uHxSroEWNwvdLbNFDDRdcf-kHFtoQ4bPNR_lkvEXffi3BiNfFYQPBzCCz6hGuAzlnKqslYRFT0laYD1szic4r4fEiQlC9U7yHkgBL8lZNvL7lY_F9nBRvUcwenfox8ygFz9Fm0w5_rKBfTkECbqdZvr-pFhigkdV_tU1eOd20_5ONUcwQ5wiOo6xHhgHAGbzNZB03LlmxHzEqf6JoBg1CZCCA',
    currentVehicle: 'VAN-05',
  },
  'DRV002': {
    id: 'DRV002',
    name: 'Priya Sharma',
    license: 'DL-4421',
    licenseExpiry: 'Mar 2027',
    status: 'On Trip',
    safetyScore: 88,
    safetyScoreTrend: '+1.1%',
    completedTrips: 62,
    totalTrips: 65,
    onTimePercent: '96.2%',
    fuelEfficiency: '7.8 / 10',
    incidentsReported: 1,
    phone: '+91 91234 56789',
    email: 'priya.sharma@transitops.in',
    joinedDate: 'Mar 05, 2020',
    base: 'Surat Terminal',
    experience: '6 years',
    avatar: '',
    currentVehicle: 'TRUCK-02',
  },
  'DRV003': {
    id: 'DRV003',
    name: 'Rahul Barot',
    license: 'DL-9903',
    licenseExpiry: 'Sep 2025',
    status: 'Off Duty',
    safetyScore: 79,
    safetyScoreTrend: '-0.5%',
    completedTrips: 31,
    totalTrips: 33,
    onTimePercent: '93.8%',
    fuelEfficiency: '7.1 / 10',
    incidentsReported: 2,
    phone: '+91 97532 14680',
    email: 'rahul.barot@transitops.in',
    joinedDate: 'Jun 18, 2022',
    base: 'Vadodara Depot',
    experience: '2 years',
    avatar: '',
    currentVehicle: 'None',
  },
}

const recentTripsMap: Record<string, Array<{ id: string; route: string; status: string; vehicle: string; date: string }>> = {
  'DRV001': [
    { id: 'TR001', route: 'Ahmedabad → Surat', status: 'Dispatched', vehicle: 'VAN-05', date: 'Oct 24, 08:30' },
    { id: 'TR084', route: 'Surat → Ahmedabad', status: 'Completed', vehicle: 'VAN-05', date: 'Oct 22, 14:15' },
    { id: 'TR071', route: 'Ahmedabad → Rajkot', status: 'Completed', vehicle: 'VAN-05', date: 'Oct 20, 09:45' },
  ],
  'DRV002': [
    { id: 'TR003', route: 'Anand → Rajkot', status: 'Dispatched', vehicle: 'TRUCK-02', date: 'Oct 25, 07:00' },
    { id: 'TR055', route: 'Vadodara → Surat', status: 'Completed', vehicle: 'TRUCK-02', date: 'Oct 22, 10:00' },
  ],
  'DRV003': [
    { id: 'TR048', route: 'Vadodara → Anand', status: 'Completed', vehicle: 'VAN-05', date: 'Oct 18, 09:00' },
  ],
}

const activityTimelineMap: Record<string, Array<{ label: string; desc: string; time: string; color: string }>> = {
  'DRV001': [
    { label: 'Status Change: Available', desc: '', time: 'Today, 08:45 AM', color: 'bg-industrial-blue' },
    { label: 'Trip Completed: TR084', desc: 'Cargo delivered to Surat Terminal. No damages reported.', time: 'Oct 22, 02:15 PM', color: 'bg-success-green' },
    { label: 'Maintenance Alert: VAN-05', desc: 'Driver reported a minor vibration in front axle during descent.', time: 'Oct 22, 11:30 AM', color: 'bg-alert-yellow' },
    { label: 'Login: Mobile Terminal', desc: '', time: 'Oct 22, 06:10 AM', color: 'bg-industrial-blue' },
  ],
  'DRV002': [
    { label: 'Trip Dispatched: TR003', desc: 'Dispatched from Anand Hub. GPS tracking active.', time: 'Today, 07:00 AM', color: 'bg-industrial-blue' },
    { label: 'Trip Completed: TR055', desc: 'All cargo delivered. No incidents.', time: 'Oct 22, 04:00 PM', color: 'bg-success-green' },
  ],
  'DRV003': [
    { label: 'Status Change: Off Duty', desc: '', time: 'Today, 06:30 AM', color: 'bg-on-surface-variant' },
    { label: 'Trip Completed: TR048', desc: '', time: 'Oct 18, 02:00 PM', color: 'bg-success-green' },
  ],
}

export default function DriverDetailsScreen() {
  const { driverId } = useParams<{ driverId: string }>()
  const navigate = useNavigate()

  const driver = driverId ? driverDatabase[driverId] : null

  if (!driver) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4 text-on-surface-variant bg-dashboard-canvas">
        <span className="material-symbols-outlined text-[64px] opacity-30">badge</span>
        <p className="font-bold text-lg">Driver "{driverId}" not found</p>
        <button onClick={() => navigate('/drivers')} className="px-6 py-2.5 bg-industrial-blue text-white rounded-xl font-bold text-sm cursor-pointer">
          Back to Drivers
        </button>
      </div>
    )
  }

  const trips = recentTripsMap[driver.id] || []
  const activityTimeline = activityTimelineMap[driver.id] || []

  const statusColors: Record<string, string> = {
    Available: 'bg-success-green/10 text-success-green border-success-green/20',
    'On Trip': 'bg-industrial-blue/10 text-industrial-blue border-industrial-blue/20',
    'Off Duty': 'bg-gray-100 text-gray-500 border-gray-200',
    Suspended: 'bg-error-red/10 text-error-red border-error-red/20',
  }

  const tripStatusColors: Record<string, string> = {
    Dispatched: 'bg-industrial-blue/10 text-industrial-blue border-industrial-blue/20',
    Completed: 'bg-success-green/10 text-success-green border-success-green/20',
    Draft: 'bg-gray-100 text-gray-500 border-gray-200',
  }

  const complianceItems = [
    { icon: 'check_circle', label: 'License Valid', sub: `CDL #DL${driver.license.slice(3)} valid thru ${driver.licenseExpiry}`, color: 'text-success-green', warning: false },
    { icon: 'check_circle', label: 'Medical Certificate', sub: 'DOT Physical Exam cleared - Exp: 12/2024', color: 'text-success-green', warning: false },
    { icon: 'check_circle', label: 'HOS Compliance', sub: 'Reset period completed. 70h clock available.', color: 'text-success-green', warning: false },
    { icon: 'warning', label: 'Safety Training', sub: 'Winter Driving refresher due in 14 days', color: 'text-alert-yellow', warning: true },
  ]

  const eligibilityChecks = [
    { label: 'Drug & Alcohol Clear', info: 'Updated 2d ago' },
    { label: 'HOS Hour Balance', info: '14h available' },
    { label: 'Vehicle Inspection (Pre)', info: 'Cleared' },
    { label: 'Background Check', info: 'Valid' },
  ]

  return (
    <>
      {/* Header */}
      <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/5 bg-white/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/drivers')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-industrial-blue transition-colors group cursor-pointer text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            Drivers
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-1.5 bg-surface-container-high text-on-surface text-xs font-bold rounded-xl hover:bg-outline-variant transition-all cursor-pointer flex items-center gap-1.5 border border-outline-variant">
            <span className="material-symbols-outlined text-[14px]">edit</span>
            Edit Driver
          </button>
          <button className="px-4 py-1.5 bg-surface-container-high text-on-surface text-xs font-bold rounded-xl hover:bg-outline-variant transition-all cursor-pointer flex items-center gap-1.5 border border-outline-variant">
            <span className="material-symbols-outlined text-[14px]">timer_off</span>
            Set Off Duty
          </button>
          <button className="px-4 py-1.5 bg-error-red/10 text-error-red text-xs font-bold rounded-xl hover:bg-error-red hover:text-white transition-all cursor-pointer flex items-center gap-1.5 border border-error-red/20">
            <span className="material-symbols-outlined text-[14px]">block</span>
            Suspend Driver
          </button>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">

        {/* Driver Identity Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              {driver.avatar ? (
                <img src={driver.avatar} alt={driver.name} className="w-16 h-16 rounded-2xl border-2 border-industrial-blue object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-industrial-blue/10 flex items-center justify-center border-2 border-industrial-blue/30">
                  <span className="material-symbols-outlined text-industrial-blue text-[36px]">person</span>
                </div>
              )}
              {driver.status === 'Available' && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-green border-2 border-white rounded-full"></div>
              )}
              {driver.status === 'On Trip' && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-industrial-blue border-2 border-white rounded-full animate-pulse"></div>
              )}
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-3 mb-1">
                <h2 className="text-2xl font-bold text-on-surface font-headline-lg">{driver.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${statusColors[driver.status]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${driver.status === 'Available' ? 'bg-success-green animate-pulse' : driver.status === 'On Trip' ? 'bg-industrial-blue animate-pulse' : 'bg-gray-400'}`}></span>
                  {driver.status}
                </span>
                <span className="text-on-surface-variant text-sm font-mono font-semibold">{driver.license}</span>
              </div>
              {/* Tab Nav */}
              <div className="flex gap-4 text-sm text-on-surface-variant border-b border-outline-variant/30 pb-1">
                {['Safety & Compliance', 'Trip History', 'Documents', 'Vehicle Logs'].map((tab, i) => (
                  <button key={tab} className={`pb-1 text-xs font-bold cursor-pointer transition-colors ${i === 0 ? 'text-industrial-blue border-b-2 border-industrial-blue' : 'hover:text-on-surface'}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Safety Score', value: `${driver.safetyScore}%`, trend: driver.safetyScoreTrend,
              icon: 'verified_user', iconColor: 'text-success-green', sub: 'Ranked Top 5% in Fleet', barWidth: driver.safetyScore, barColor: 'bg-success-green',
            },
            {
              label: 'License Status', value: 'Valid', icon: 'badge', iconColor: 'text-industrial-blue',
              sub: `Class A CDL • Exp: ${driver.licenseExpiry}`, barWidth: 0, barColor: '', trend: '',
            },
            {
              label: 'Completed Trips', value: `${driver.completedTrips}`, icon: 'local_shipping', iconColor: 'text-on-surface-variant',
              sub: 'Last trip completed 2h ago', barWidth: 0, barColor: '', trend: '',
            },
            {
              label: 'Dispatch Status', value: 'Eligible', icon: 'check_circle', iconColor: 'text-success-green',
              sub: 'All compliance checks passed', barWidth: 0, barColor: '', trend: '',
            },
          ].map((kpi, i) => (
            <div key={i} className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm hover:border-industrial-blue transition-all">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-label-sm">{kpi.label}</p>
                <span className={`material-symbols-outlined text-[18px] ${kpi.iconColor}`}>{kpi.icon}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-xl font-bold text-on-surface">{kpi.value}</h3>
                {kpi.trend && <span className="text-success-green text-[10px] font-bold">{kpi.trend}</span>}
              </div>
              {kpi.barWidth > 0 && (
                <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className={`${kpi.barColor} h-full rounded-full`} style={{ width: `${kpi.barWidth}%` }}></div>
                </div>
              )}
              <p className="text-[11px] text-on-surface-variant mt-2">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT 8 cols */}
          <div className="col-span-12 lg:col-span-8 space-y-6">

            {/* Operational Summary + Compliance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Operational Summary */}
              <section className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-base font-bold text-on-surface font-headline-sm">Operational Summary</h4>
                  <span className="material-symbols-outlined text-on-surface-variant">info</span>
                </div>
                <div className="space-y-3 text-sm divide-y divide-surface-container-low">
                  {[
                    { label: 'Total Trips Assigned', value: driver.totalTrips },
                    { label: 'Completed Successfully', value: driver.completedTrips },
                    { label: 'Incidents Reported', value: driver.incidentsReported },
                    { label: 'On-Time Percentage', value: driver.onTimePercent, green: true },
                    { label: 'Fuel Efficiency Score', value: driver.fuelEfficiency, yellow: true },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center py-2">
                      <span className="text-on-surface-variant">{row.label}</span>
                      <span className={`font-bold ${row.green ? 'text-success-green' : row.yellow ? 'text-alert-yellow' : 'text-on-surface'}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Compliance Status */}
              <section className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-base font-bold text-on-surface font-headline-sm">Compliance Status</h4>
                  <span className="material-symbols-outlined text-success-green">verified</span>
                </div>
                <div className="space-y-3">
                  {complianceItems.map((item, i) => (
                    <div key={i} className={`p-3 rounded-xl border flex items-start gap-3 ${item.warning ? 'bg-alert-yellow/5 border-alert-yellow/20' : 'bg-surface-container-low border-success-green/10'}`}>
                      <span className={`material-symbols-outlined ${item.color} text-[20px] shrink-0`}>{item.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-on-surface">{item.label}</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Recent Trip History Table */}
            <section className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center">
                <h4 className="text-base font-bold text-on-surface font-headline-sm">Recent Trip History</h4>
                <button onClick={() => navigate('/trips')} className="text-industrial-blue text-xs font-bold hover:underline cursor-pointer">View All Records</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant uppercase tracking-widest text-[10px] font-label-sm">
                    <tr>
                      <th className="px-6 py-3 font-bold">Trip ID</th>
                      <th className="px-6 py-3 font-bold">Route</th>
                      <th className="px-6 py-3 font-bold">Status</th>
                      <th className="px-6 py-3 font-bold">Vehicle</th>
                      <th className="px-6 py-3 font-bold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 font-sans text-on-surface">
                    {trips.map((trip, i) => (
                      <tr key={i} onClick={() => navigate(`/trips/${trip.id}`)} className="hover:bg-surface-container-lowest transition-colors cursor-pointer">
                        <td className="px-6 py-4 font-mono font-bold text-industrial-blue">{trip.id}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{trip.route}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${tripStatusColors[trip.status] || ''}`}>
                            {trip.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-medium">{trip.vehicle}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{trip.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* RIGHT 4 cols */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Dispatch Eligibility */}
            <section className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
              <h4 className="text-base font-bold text-on-surface mb-4 font-headline-sm">Dispatch Eligibility</h4>
              <div className="space-y-3">
                {eligibilityChecks.map((check, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-success-green text-[18px]">check_circle</span>
                      <span className="text-sm text-on-surface">{check.label}</span>
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-bold">{check.info}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-outline-variant">
                <div className="bg-industrial-blue/5 p-4 rounded-xl border border-industrial-blue/20">
                  <div className="flex items-center gap-2 text-industrial-blue mb-1">
                    <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
                    <span className="text-xs font-bold">Current Assignment</span>
                  </div>
                  {driver.currentVehicle !== 'None' ? (
                    <div className="text-sm text-on-surface-variant">
                      Assigned to <span className="font-bold text-on-surface">{driver.currentVehicle}</span>
                      <button
                        onClick={() => navigate(`/fleet/${driver.currentVehicle}`)}
                        className="w-full mt-3 bg-industrial-blue text-white py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        View Vehicle
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-on-surface-variant">No Active Trip assigned to this driver.</p>
                      <button className="w-full mt-3 bg-industrial-blue text-white py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer">
                        Assign New Trip
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Activity Timeline */}
            <section className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-base font-bold text-on-surface font-headline-sm">Driver Activity</h4>
                <button className="text-on-surface-variant hover:text-on-surface cursor-pointer">
                  <span className="material-symbols-outlined text-[20px]">filter_list</span>
                </button>
              </div>
              <div className="relative space-y-5 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-outline-variant">
                {activityTimeline.map((item, i) => (
                  <div key={i} className="relative pl-9">
                    <div className={`absolute left-1.5 top-1.5 w-3 h-3 rounded-full ${item.color} border-2 border-white shadow-sm`}></div>
                    <p className="text-xs font-bold text-on-surface">{item.label}</p>
                    {item.desc && <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">{item.desc}</p>}
                    <p className="text-[10px] text-on-surface-variant mt-1 font-mono">{item.time}</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 border border-outline-variant text-on-surface-variant py-2.5 rounded-xl text-xs font-bold hover:bg-surface-container-low transition-colors cursor-pointer">
                Show More History
              </button>
            </section>

            {/* Digital Locker */}
            <section className="bg-background text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-[10px] font-bold mb-1 opacity-70 uppercase tracking-widest font-label-sm">Digital Locker</h4>
                <p className="text-base font-bold mb-4">4 Compliance Docs</p>
                <div className="flex flex-col gap-2">
                  {['CDL_AlexPatel_2024.pdf', 'DOT_Med_Cert_Exp24.pdf'].map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-industrial-blue text-[18px]">description</span>
                      <span className="text-[11px]">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-[0.07] pointer-events-none">
                <span className="material-symbols-outlined text-[80px]">folder_shared</span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
