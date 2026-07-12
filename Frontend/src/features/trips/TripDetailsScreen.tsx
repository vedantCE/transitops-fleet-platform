import { useParams, useNavigate } from 'react-router-dom'

interface TripData {
  id: string
  source: string
  destination: string
  vehicle: string
  vehiclePlate: string
  vehicleLastService: string
  driver: string
  driverLicense: string
  driverSafetyRating: number
  driverMobile: string
  driverAvatar: string
  cargo: number
  cargoTotal: number
  distance: number
  revenue: number
  status: 'Dispatched' | 'Completed' | 'Draft'
  time: string
  currentLocation: string
  operatingMargin: number
}

const tripDatabase: Record<string, TripData> = {
  TR001: {
    id: 'TR001',
    source: 'Ahmedabad',
    destination: 'Surat',
    vehicle: 'VAN-05',
    vehiclePlate: 'GJ-01-XX-9090',
    vehicleLastService: '15 Days Ago',
    driver: 'Alex Patel',
    driverLicense: 'Commercial (Class A)',
    driverSafetyRating: 4.9,
    driverMobile: '+91 98765 43210',
    driverAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMcJWxoRkFFRA4EUGdIwFb6kCZazoQCz7_b9nkmpX1EYI9Ynhgo_uHxSroEWNwvdLbNFDDRdcf-kHFtoQ4bPNR_lkvEXffi3BiNfFYQPBzCCz6hGuAzlnKqslYRFT0laYD1szic4r4fEiQlC9U7yHkgBL8lZNvL7lY_F9nBRvUcwenfox8ygFz9Fm0w5_rKBfTkECbqdZvr-pFhigkdV_tU1eOd20_5ONUcwQ5wiOo6xHhgHAGbzNZB03LlmxHzEqf6JoBg1CZCCA',
    cargo: 450,
    cargoTotal: 500,
    distance: 265,
    revenue: 18000,
    status: 'Dispatched',
    time: '10:42 AM',
    currentLocation: 'Near Bharuch Highway (NH-48)',
    operatingMargin: 64,
  },
  TR002: {
    id: 'TR002',
    source: 'Vadodara',
    destination: 'Ahmedabad',
    vehicle: 'Not Assigned',
    vehiclePlate: 'N/A',
    vehicleLastService: 'N/A',
    driver: 'Not Assigned',
    driverLicense: 'N/A',
    driverSafetyRating: 0,
    driverMobile: 'N/A',
    driverAvatar: '',
    cargo: 1200,
    cargoTotal: 1500,
    distance: 110,
    revenue: 8500,
    status: 'Draft',
    time: '11:05 AM',
    currentLocation: 'Not Started',
    operatingMargin: 0,
  },
  TR003: {
    id: 'TR003',
    source: 'Anand',
    destination: 'Rajkot',
    vehicle: 'TRUCK-02',
    vehiclePlate: 'GJ-05-CD-5678',
    vehicleLastService: '32 Days Ago',
    driver: 'Priya Sharma',
    driverLicense: 'Commercial (Class B)',
    driverSafetyRating: 4.7,
    driverMobile: '+91 91234 56789',
    driverAvatar: '',
    cargo: 2200,
    cargoTotal: 5000,
    distance: 310,
    revenue: 25000,
    status: 'Completed',
    time: '09:30 AM',
    currentLocation: 'Rajkot Terminal',
    operatingMargin: 78,
  },
}

export default function TripDetailsScreen() {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()

  const trip = tripId ? tripDatabase[tripId] : null

  if (!trip) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4 text-on-surface-variant bg-dashboard-canvas">
        <span className="material-symbols-outlined text-[64px] opacity-30">route</span>
        <p className="font-bold text-lg">Trip "{tripId}" not found</p>
        <button
          onClick={() => navigate('/trips')}
          className="px-6 py-2.5 bg-industrial-blue text-white rounded-xl font-bold text-sm cursor-pointer"
        >
          Back to Trips
        </button>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    Dispatched: 'bg-industrial-blue/10 text-industrial-blue border-industrial-blue/20',
    Completed: 'bg-success-green/10 text-success-green border-success-green/20',
    Draft: 'bg-gray-100 text-gray-500 border-gray-200',
  }

  const steps: { label: string; icon: string; time: string }[] = [
    { label: 'Draft', icon: 'edit_note', time: '24 Oct, 09:15' },
    { label: 'Dispatched', icon: 'local_shipping', time: '25 Oct, 14:00' },
    { label: 'Completed', icon: 'flag', time: trip.status === 'Completed' ? '25 Oct, 18:30' : 'Pending' },
  ]

  const currentStepIndex = trip.status === 'Draft' ? 0 : trip.status === 'Dispatched' ? 1 : 2

  const cargoPercent = Math.round((trip.cargo / trip.cargoTotal) * 100)

  const validationChecks = [
    'Vehicle Fitness Certificate',
    'Driver Breathalyzer Test',
    'Cargo Security Check',
  ]

  const activityTimeline = [
    { icon: 'add', label: 'Trip Created', desc: 'Automatic generation based on Order #ORD-8829', time: '24 Oct, 09:15 AM' },
    { icon: 'assignment_ind', label: 'Resources Assigned', desc: `Vehicle ${trip.vehicle} and Driver ${trip.driver} linked by Dispatcher Sarah Miller`, time: '25 Oct, 11:30 AM' },
    ...(trip.status !== 'Draft' ? [{ icon: 'near_me', label: 'Trip Dispatched', desc: "Status changed to 'Dispatched'. Real-time GPS tracking initiated.", time: '25 Oct, 14:00 PM' }] : []),
    ...(trip.status === 'Completed' ? [{ icon: 'task_alt', label: 'Trip Completed', desc: 'Vehicle returned. All cargo delivered successfully.', time: '25 Oct, 18:30 PM' }] : []),
  ]

  return (
    <>
      {/* Header */}
      <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/5 bg-white/60 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/trips')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-industrial-blue transition-colors group cursor-pointer text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            Back to Trips
          </button>
          <div className="hidden sm:block h-6 w-px bg-outline-variant mx-2"></div>
          <div className="hidden sm:flex items-center gap-3">
            <h2 className="text-base font-bold text-on-surface">Trip {trip.id}</h2>
            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${statusColors[trip.status]}`}>
              {trip.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {trip.status === 'Dispatched' && (
            <>
              <button className="px-4 py-1.5 bg-background text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm">Complete Trip</button>
              <button className="px-4 py-1.5 bg-white border border-error-red/30 text-error-red text-xs font-bold rounded-xl hover:bg-error-red/5 transition-all cursor-pointer">Cancel Trip</button>
            </>
          )}
          {trip.status === 'Draft' && (
            <button className="px-4 py-1.5 bg-industrial-blue text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm">Dispatch Trip</button>
          )}
          {trip.status === 'Completed' && (
            <span className="px-4 py-1.5 bg-success-green/10 text-success-green text-xs font-bold rounded-xl border border-success-green/20">Completed</span>
          )}
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">

        {/* Trip Lifecycle Stepper */}
        <div className="bg-white p-6 md:p-8 border border-outline-variant rounded-2xl shadow-sm">
          <div className="flex justify-between relative">
            {/* Connector base */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-outline-variant z-0"></div>
            {/* Completed progress bar */}
            <div
              className="absolute top-5 left-0 h-0.5 bg-industrial-blue z-0 transition-all"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            ></div>
            {steps.map((step, i) => {
              const isCompleted = i < currentStepIndex
              const isCurrent = i === currentStepIndex
              return (
                <div key={i} className="relative z-10 flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                    isCompleted || isCurrent ? 'bg-industrial-blue text-white' : 'bg-surface-container-high text-on-surface-variant'
                  } ${isCurrent && trip.status === 'Dispatched' ? 'animate-pulse shadow-md' : ''}`}>
                    <span className="material-symbols-outlined text-[18px]">{isCompleted ? 'check' : step.icon}</span>
                  </div>
                  <span className={`mt-2 text-xs font-bold ${isCurrent ? 'text-industrial-blue' : 'text-on-surface-variant'} font-label-md`}>{step.label}</span>
                  <span className="text-[10px] text-on-surface-variant opacity-70 mt-0.5 font-mono">{step.time}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main 12-col grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* LEFT COLUMN (8) */}
          <div className="col-span-12 lg:col-span-8 space-y-4">

            {/* Route + Cargo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Trip Route */}
              <div className="bg-white p-6 border border-outline-variant rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Trip Route</h3>
                  <span className="material-symbols-outlined text-industrial-blue text-[20px]">map</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col space-y-6 relative flex-1">
                    <div className="absolute left-[7px] top-4 bottom-4 w-[2px] border-l-2 border-dashed border-outline-variant"></div>
                    <div className="flex items-center relative z-10">
                      <div className="w-4 h-4 rounded-full bg-success-green border-2 border-white ring-2 ring-success-green/20 shadow-sm shrink-0"></div>
                      <div className="ml-4">
                        <p className="text-[10px] text-on-surface-variant font-label-sm">Source</p>
                        <p className="text-base font-bold text-on-surface">{trip.source}</p>
                      </div>
                    </div>
                    <div className="flex items-center relative z-10">
                      <div className="w-4 h-4 rounded-full bg-error-red border-2 border-white ring-2 ring-error-red/20 shadow-sm shrink-0"></div>
                      <div className="ml-4">
                        <p className="text-[10px] text-on-surface-variant font-label-sm">Destination</p>
                        <p className="text-base font-bold text-on-surface">{trip.destination}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-on-surface-variant font-label-sm">Planned Distance</p>
                    <p className="text-base font-bold font-mono text-on-surface">{trip.distance} km</p>
                  </div>
                </div>
              </div>

              {/* Cargo Capacity */}
              <div className="bg-white p-6 border border-outline-variant rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Cargo Capacity</h3>
                    <span className="material-symbols-outlined text-safety-orange text-[20px]">inventory_2</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-on-surface">{cargoPercent}%</span>
                    <span className="text-sm text-on-surface-variant">Utilization</span>
                  </div>
                  <div className="w-full h-3 bg-surface-container-high rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-safety-orange transition-all duration-700 rounded-full" style={{ width: `${cargoPercent}%` }}></div>
                  </div>
                </div>
                <div className="flex justify-between mt-4 text-center">
                  <div className="flex-1 border-r border-outline-variant">
                    <p className="text-[10px] text-on-surface-variant font-label-sm">Used</p>
                    <p className="text-sm font-bold font-mono text-on-surface">{trip.cargo}kg</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-on-surface-variant font-label-sm">Total</p>
                    <p className="text-sm font-bold font-mono text-on-surface">{trip.cargoTotal}kg</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation + Financial */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dispatch Validation */}
              <div className="bg-white p-6 border border-outline-variant rounded-2xl shadow-sm">
                <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-6 font-label-sm">Dispatch Validation</h3>
                <div className="space-y-3">
                  {validationChecks.map((check, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-success-green/5 border border-success-green/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-success-green text-[18px]">check_circle</span>
                        <span className="text-sm text-on-surface">{check}</span>
                      </div>
                      <span className="text-[10px] font-bold text-success-green font-label-sm">PASSED</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-background p-6 border border-background rounded-2xl text-white shadow-lg">
                <h3 className="text-[10px] font-bold opacity-60 uppercase tracking-wider mb-6 font-label-sm">Financial Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-sm opacity-80">Projected Revenue</span>
                    <span className="text-lg font-bold font-mono text-inverse-primary">₹{trip.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-sm opacity-80">Fuel Cost</span>
                    <span className="px-2 py-0.5 bg-alert-yellow/20 text-alert-yellow text-[10px] font-bold rounded border border-alert-yellow/30">
                      {trip.status === 'Completed' ? 'LOGGED' : 'PENDING'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-bold">Operating Margin</span>
                    <div className="text-right">
                      <span className="text-xl font-bold font-mono text-success-green">{trip.operatingMargin > 0 ? `${trip.operatingMargin}%` : '—'}</span>
                      <p className="text-[10px] opacity-50">Estimated</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white p-6 md:p-8 border border-outline-variant rounded-2xl shadow-sm">
              <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-8 font-label-sm">Trip Activity Timeline</h3>
              <div className="space-y-8">
                {activityTimeline.map((item, i) => (
                  <div key={i} className="flex">
                    <div className="flex flex-col items-center mr-6 shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
                        item.icon === 'near_me' || item.icon === 'task_alt'
                          ? 'bg-industrial-blue text-white'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                      </div>
                      {i < activityTimeline.length - 1 && (
                        <div className="w-0.5 flex-1 bg-outline-variant mt-2 opacity-30 min-h-[24px]"></div>
                      )}
                    </div>
                    <div className="pb-6">
                      <p className={`text-sm font-bold ${item.icon === 'near_me' || item.icon === 'task_alt' ? 'text-industrial-blue' : 'text-on-surface'}`}>
                        {item.label}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-1 leading-relaxed max-w-md">{item.desc}</p>
                      <p className="text-[10px] text-on-surface-variant opacity-60 mt-2 font-mono">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (4) */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {/* Assigned Resources */}
            <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Assigned Resources</h3>
                <span className="material-symbols-outlined text-industrial-blue text-[20px]">link</span>
              </div>

              {/* Vehicle */}
              <div className="p-6 border-b border-outline-variant">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mr-4 border border-outline-variant/30 shrink-0">
                    <span className="material-symbols-outlined text-on-surface-variant text-[24px]">local_shipping</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-label-sm">Vehicle</p>
                    <p className="text-base font-bold text-on-surface">{trip.vehicle}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Model</span>
                    <span className="font-medium text-on-surface">Tata Winger 2022</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Plate</span>
                    <span className="font-mono font-bold bg-surface-container-high px-2 py-0.5 rounded border border-outline-variant/20 text-on-surface">{trip.vehiclePlate}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Last Service</span>
                    <span className="text-on-surface">{trip.vehicleLastService}</span>
                  </div>
                </div>
                {trip.vehicle !== 'Not Assigned' && (
                  <button
                    onClick={() => navigate(`/fleet/${trip.vehicle}`)}
                    className="w-full mt-4 py-2 border border-outline-variant text-xs font-bold text-on-surface-variant hover:bg-industrial-blue hover:text-white hover:border-industrial-blue rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    View Vehicle
                  </button>
                )}
              </div>

              {/* Driver */}
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="relative mr-4 shrink-0">
                    {trip.driverAvatar ? (
                      <img
                        src={trip.driverAvatar}
                        alt={trip.driver}
                        className="w-12 h-12 rounded-xl bg-surface-container-high object-cover border border-outline-variant/30"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-industrial-blue/10 flex items-center justify-center border border-outline-variant/30">
                        <span className="material-symbols-outlined text-industrial-blue">person</span>
                      </div>
                    )}
                    {trip.status === 'Dispatched' && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-green border-2 border-white rounded-full shadow-sm"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-label-sm">Driver</p>
                    <p className="text-base font-bold text-on-surface">{trip.driver}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>License</span>
                    <span className="font-medium text-on-surface">{trip.driverLicense}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant items-center">
                    <span>Safety Rating</span>
                    <div className="flex items-center gap-1 text-alert-yellow">
                      <span className="material-symbols-outlined text-[14px]">star</span>
                      <span className="font-bold text-on-surface">{trip.driverSafetyRating > 0 ? trip.driverSafetyRating : '—'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Mobile</span>
                    <span className="font-mono text-on-surface">{trip.driverMobile}</span>
                  </div>
                </div>
                {trip.driver !== 'Not Assigned' && (
                  <button className="w-full mt-4 py-2 border-2 border-outline-variant text-xs font-bold text-on-surface-variant hover:bg-industrial-blue hover:text-white hover:border-industrial-blue rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <span className="material-symbols-outlined text-[16px]">chat</span>
                    Contact Driver
                  </button>
                )}
              </div>
            </div>

            {/* Live Map Inset */}
            {trip.status === 'Dispatched' && (
              <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden h-56 relative shadow-sm">
                <div className="absolute inset-0 bg-surface-container-high">
                  <div className="w-full h-full bg-gradient-to-br from-surface-container-high via-surface-container to-surface-variant opacity-60"></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-outline-variant/30 flex items-center shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-industrial-blue animate-ping mr-2"></span>
                  <span className="text-[10px] font-bold text-on-surface tracking-tight font-label-sm">LIVE TRACKING</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white/70 text-[10px] uppercase tracking-widest font-label-sm">Current Location</p>
                  <p className="text-white text-sm font-bold mt-0.5">{trip.currentLocation}</p>
                </div>
                {/* Grid lines to simulate map look */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)',
                  backgroundSize: '32px 32px'
                }}></div>
              </div>
            )}

            {trip.status === 'Completed' && (
              <div className="bg-success-green/5 border border-success-green/20 rounded-2xl p-6 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-success-green/10 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-success-green text-[28px]">task_alt</span>
                </div>
                <p className="text-sm font-bold text-on-surface">Trip Completed</p>
                <p className="text-xs text-on-surface-variant">All cargo delivered. Vehicle returned to base.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
