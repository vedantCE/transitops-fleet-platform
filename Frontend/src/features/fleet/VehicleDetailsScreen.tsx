import { useParams, useNavigate } from 'react-router-dom'

interface VehicleData {
  vehicleId: string
  registrationNumber: string
  model: string
  type: string
  payloadLimit: string
  acquisitionCost: string
  fuelType: string
  status: 'Available' | 'On Trip' | 'In Shop' | 'Retired'
  odometer: string
  maxCapacity: string
  totalCostMTD: string
  utilization: number
  roi: string
  fuelExpenses: string
  maintenanceCost: string
  otherExpenses: string
  distanceCovered: string
  fuelConsumed: string
  fuelEfficiency: string
  activeDriver: string
  activeDriverInitials: string
  nextServiceIn: string
}

const vehicleDatabase: Record<string, VehicleData> = {
  'VAN-05': {
    vehicleId: 'VAN-05',
    registrationNumber: 'GJ05AB1234',
    model: 'Tata Winger 2022',
    type: 'Van (LVC)',
    payloadLimit: '1,200 kg',
    acquisitionCost: '₹12,40,000',
    fuelType: 'Diesel',
    status: 'Available',
    odometer: '74,000 km',
    maxCapacity: '500 kg',
    totalCostMTD: '₹8,150',
    utilization: 82,
    roi: '16.05%',
    fuelExpenses: '₹5,400',
    maintenanceCost: '₹2,250',
    otherExpenses: '₹500',
    distanceCovered: '420 km',
    fuelConsumed: '49.7 L',
    fuelEfficiency: '8.45 km/L',
    activeDriver: 'Rahul Barot',
    activeDriverInitials: 'RB',
    nextServiceIn: '1,250 km',
  },
  'TRUCK-02': {
    vehicleId: 'TRUCK-02',
    registrationNumber: 'GJ05CD5678',
    model: 'Tata Prima 2021',
    type: 'Truck (HCV)',
    payloadLimit: '5,000 kg',
    acquisitionCost: '₹20,00,000',
    fuelType: 'Diesel',
    status: 'On Trip',
    odometer: '112,000 km',
    maxCapacity: '5,000 kg',
    totalCostMTD: '₹18,320',
    utilization: 91,
    roi: '22.3%',
    fuelExpenses: '₹12,100',
    maintenanceCost: '₹5,200',
    otherExpenses: '₹1,020',
    distanceCovered: '890 km',
    fuelConsumed: '145 L',
    fuelEfficiency: '6.1 km/L',
    activeDriver: 'Priya Sharma',
    activeDriverInitials: 'PS',
    nextServiceIn: '3,200 km',
  },
  'ACE-05': {
    vehicleId: 'ACE-05',
    registrationNumber: 'GJ05EF9012',
    model: 'Tata Ace 2020',
    type: 'Mini Truck',
    payloadLimit: '750 kg',
    acquisitionCost: '₹6,00,000',
    fuelType: 'CNG',
    status: 'In Shop',
    odometer: '48,000 km',
    maxCapacity: '750 kg',
    totalCostMTD: '₹4,800',
    utilization: 40,
    roi: '8.2%',
    fuelExpenses: '₹2,500',
    maintenanceCost: '₹2,100',
    otherExpenses: '₹200',
    distanceCovered: '180 km',
    fuelConsumed: '22 kg',
    fuelEfficiency: '8.2 km/kg',
    activeDriver: 'Unassigned',
    activeDriverInitials: '--',
    nextServiceIn: 'In Service',
  },
}

export default function VehicleDetailsScreen() {
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const navigate = useNavigate()

  const vehicle = vehicleId ? vehicleDatabase[vehicleId] : null

  if (!vehicle) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4 text-on-surface-variant bg-dashboard-canvas">
        <span className="material-symbols-outlined text-[64px] opacity-30">directions_bus_filled</span>
        <p className="font-bold text-lg">Vehicle "{vehicleId}" not found</p>
        <button
          onClick={() => navigate('/fleet')}
          className="px-6 py-2.5 bg-industrial-blue text-white rounded-xl font-bold text-sm cursor-pointer"
        >
          Back to Fleet
        </button>
      </div>
    )
  }

  const statusColors = {
    Available: 'bg-success-green/10 text-success-green border-success-green/20',
    'On Trip': 'bg-industrial-blue/10 text-industrial-blue border-industrial-blue/20',
    'In Shop': 'bg-safety-orange/10 text-safety-orange border-safety-orange/20',
    Retired: 'bg-gray-100 text-gray-500 border-gray-200',
  }

  const maintenanceHistory = [
    { service: 'Oil Change & Filter', date: '24 Oct 2023', cost: '₹2,250', status: 'Active' as const },
    { service: 'Brake Pad Service', date: '12 Sep 2023', cost: '₹4,800', status: 'Completed' as const },
  ]

  const recentTrips = [
    { id: 'TR001', route: 'Hub-A → Central Dist', dist: '45 km', status: 'Delivered' },
    { id: 'TR084', route: 'Zone 4 → Terminal 2', dist: '12 km', status: 'Delivered' },
    { id: 'TR071', route: 'Industrial Park → Hub-A', dist: '88 km', status: 'Delivered' },
  ]

  const timeline = [
    { icon: 'local_shipping', color: 'bg-industrial-blue', label: 'Vehicle Dispatched', time: 'Today, 09:15 AM', desc: `Dispatched for TR092 (Mumbai Hub Express). Driver: ${vehicle.activeDriver}.` },
    { icon: 'task_alt', color: 'bg-success-green', label: 'Trip TR001 Completed', time: 'Yesterday, 06:45 PM', desc: 'Vehicle returned to Hub-A. All parcels delivered successfully.' },
    { icon: 'build', color: 'bg-safety-orange', label: 'Maintenance Started', time: '24 Oct, 10:00 AM', desc: 'Scheduled oil change and multi-point inspection initiated.' },
  ]

  return (
    <>
      {/* Top Header */}
      <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/5 bg-white/60 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/fleet')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-industrial-blue transition-colors group cursor-pointer text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            Back to Fleet
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-1.5 border border-industrial-blue text-industrial-blue text-xs font-bold rounded-xl hover:bg-industrial-blue/5 transition-all cursor-pointer">
            Edit Vehicle
          </button>
          <button className="px-4 py-1.5 bg-error-red text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm">
            Retire Vehicle
          </button>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">

        {/* Vehicle Identity Header */}
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl md:text-3xl font-bold text-on-surface font-headline-lg">{vehicle.vehicleId}</h2>
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${statusColors[vehicle.status]}`}>
                {vehicle.status}
              </span>
            </div>
            <p className="text-sm text-on-surface-variant font-body-md">
              <span className="font-mono font-bold text-on-surface">{vehicle.registrationNumber}</span> &bull; {vehicle.model} &bull; {vehicle.type.split(' ')[0]}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 font-label-sm">ROI Performance</p>
            <p className="text-2xl font-bold text-industrial-blue font-mono">{vehicle.roi}</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: 'speed', label: 'Odometer', value: vehicle.odometer, trend: '+2.4%', trendColor: 'text-success-green' },
            { icon: 'weight', label: 'Max Capacity', value: vehicle.maxCapacity, trend: null, trendColor: '' },
            { icon: 'payments', label: 'Total Cost (MTD)', value: vehicle.totalCostMTD, trend: 'High', trendColor: 'text-error-red' },
            { icon: 'analytics', label: 'Utilization', value: `${vehicle.utilization}%`, trend: null, trendColor: '', pulse: true, utilization: vehicle.utilization },
          ].map((kpi, i) => (
            <div key={i} className="bg-white border border-outline-variant rounded-2xl p-5 flex flex-col justify-between hover:border-industrial-blue transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-industrial-blue text-[24px]">{kpi.icon}</span>
                {kpi.trend && (
                  <span className={`text-[10px] font-bold flex items-center gap-1 font-mono ${kpi.trendColor}`}>
                    <span className="material-symbols-outlined text-[12px]">trending_up</span>
                    {kpi.trend}
                  </span>
                )}
                {kpi.pulse && <div className="w-2 h-2 rounded-full bg-success-green animate-pulse"></div>}
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 font-label-sm">{kpi.label}</p>
                <p className="text-xl font-bold text-on-surface font-mono">{kpi.value}</p>
              </div>
              {'utilization' in kpi && kpi.utilization !== undefined && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-industrial-blue/10">
                  <div className="h-full bg-industrial-blue transition-all" style={{ width: `${kpi.utilization}%` }}></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Vehicle Info & Operational Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Vehicle Information */}
          <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-industrial-blue">info</span>
              <h3 className="text-base font-bold text-on-surface font-headline-sm">Vehicle Information</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-y-6 text-sm">
              {[
                { label: 'Registration', value: vehicle.registrationNumber, mono: true },
                { label: 'Model', value: vehicle.model },
                { label: 'Type', value: vehicle.type },
                { label: 'Payload Limit', value: vehicle.payloadLimit },
                { label: 'Acquisition Cost', value: vehicle.acquisitionCost },
                { label: 'Fuel Type', value: vehicle.fuelType },
              ].map((field, i) => (
                <div key={i}>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 font-label-sm">{field.label}</p>
                  <p className={`font-medium text-on-surface ${field.mono ? 'font-mono' : ''}`}>{field.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Status */}
          <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-industrial-blue">monitoring</span>
              <h3 className="text-base font-bold text-on-surface font-headline-sm">Operational Status</h3>
            </div>
            <div className="p-6 space-y-5">
              <div className="p-4 bg-success-green/5 border border-success-green/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-success-green text-[20px]">check_circle</span>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Dispatch Eligibility</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Passed safety & compliance checks.</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-success-green text-white text-[9px] font-bold rounded-lg uppercase tracking-wider">Passed</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-outline-variant rounded-xl bg-surface-container-low">
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-2 font-label-sm">Active Driver</p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-industrial-blue text-[10px] text-white flex items-center justify-center font-bold shrink-0">{vehicle.activeDriverInitials}</div>
                    <p className="text-xs font-semibold text-on-surface truncate">{vehicle.activeDriver}</p>
                  </div>
                </div>
                <div className="p-4 border border-outline-variant rounded-xl bg-surface-container-low">
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-2 font-label-sm">Next Service In</p>
                  <p className="text-sm font-bold font-mono text-safety-orange">{vehicle.nextServiceIn}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cost & Fuel Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cost Summary */}
          <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-outline-variant">
              <h3 className="text-base font-bold text-on-surface font-headline-sm">Cost Summary</h3>
            </div>
            <div className="p-6 flex-1 space-y-4 text-sm">
              {[
                { label: 'Fuel Expenses', value: vehicle.fuelExpenses },
                { label: 'Maintenance', value: vehicle.maintenanceCost },
                { label: 'Other Expenses', value: vehicle.otherExpenses },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center text-on-surface-variant">
                  <span>{item.label}</span>
                  <span className="font-mono font-medium text-on-surface">{item.value}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-outline-variant flex justify-between items-center font-bold">
                <span className="text-on-surface">Total MTD</span>
                <span className="text-industrial-blue font-mono text-lg">{vehicle.totalCostMTD}</span>
              </div>
            </div>
          </div>

          {/* Fuel Performance Index */}
          <div className="bg-background text-white rounded-2xl p-6 lg:col-span-2 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-industrial-blue">local_gas_station</span>
                Fuel Performance Index
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-on-primary-container text-[10px] uppercase font-bold mb-1 tracking-widest">Distance Covered</p>
                  <p className="text-2xl font-mono font-bold">{vehicle.distanceCovered.split(' ')[0]} <span className="text-sm font-normal text-on-primary-container">km</span></p>
                </div>
                <div>
                  <p className="text-on-primary-container text-[10px] uppercase font-bold mb-1 tracking-widest">Fuel Consumed</p>
                  <p className="text-2xl font-mono font-bold">{vehicle.fuelConsumed}</p>
                </div>
                <div className="bg-industrial-blue/10 p-4 rounded-xl border border-industrial-blue/30">
                  <p className="text-industrial-blue text-[10px] uppercase font-bold mb-1 tracking-widest">Efficiency</p>
                  <p className="text-3xl font-mono font-bold">{vehicle.fuelEfficiency.split(' ')[0]} <span className="text-sm font-normal">{vehicle.fuelEfficiency.split(' ')[1]}</span></p>
                </div>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 opacity-[0.07] pointer-events-none group-hover:opacity-[0.12] transition-opacity">
              <span className="material-symbols-outlined text-[160px]">analytics</span>
            </div>
          </div>
        </div>

        {/* Maintenance & Recent Trips */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Maintenance History */}
          <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <h3 className="text-base font-bold text-on-surface font-headline-sm">Maintenance History</h3>
              <button className="text-industrial-blue text-xs font-bold hover:underline cursor-pointer">Full Log</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant uppercase tracking-widest text-[10px] font-label-sm">
                  <tr>
                    <th className="px-6 py-3">Service</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Cost</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 text-on-surface font-mono">
                  {maintenanceHistory.map((row, i) => (
                    <tr key={i} className="hover:bg-industrial-blue/[0.03] transition-colors">
                      <td className="px-6 py-4 font-sans font-medium">{row.service}</td>
                      <td className="px-6 py-4 font-sans text-on-surface-variant">{row.date}</td>
                      <td className="px-6 py-4">{row.cost}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border font-sans ${
                          row.status === 'Active'
                            ? 'bg-industrial-blue/10 text-industrial-blue border-industrial-blue/20'
                            : 'bg-success-green/10 text-success-green border-success-green/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-industrial-blue' : 'bg-success-green'}`}></span>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Trips */}
          <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
              <h3 className="text-base font-bold text-on-surface font-headline-sm">Recent Trips</h3>
              <button onClick={() => navigate('/trips')} className="text-industrial-blue text-xs font-bold hover:underline cursor-pointer">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-surface-container-low border-b border-outline-variant font-bold text-on-surface-variant uppercase tracking-widest text-[10px] font-label-sm">
                  <tr>
                    <th className="px-6 py-3">Trip ID</th>
                    <th className="px-6 py-3">Route</th>
                    <th className="px-6 py-3">Dist.</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 font-mono text-on-surface">
                  {recentTrips.map((trip, i) => (
                    <tr
                      key={i}
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className="hover:bg-industrial-blue/[0.03] transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 font-bold">{trip.id}</td>
                      <td className="px-6 py-4 font-sans text-on-surface-variant">{trip.route}</td>
                      <td className="px-6 py-4 font-sans">{trip.dist}</td>
                      <td className="px-6 py-4 font-sans text-success-green font-medium">{trip.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-industrial-blue">history</span>
            <h3 className="text-base font-bold text-on-surface font-headline-sm">Vehicle Activity Timeline</h3>
          </div>
          <div className="p-6">
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-industrial-blue before:via-outline-variant/40 before:to-transparent">
              {timeline.map((item, i) => (
                <div key={i} className="relative flex items-start group">
                  <div className={`absolute left-0 w-10 h-10 flex items-center justify-center ${item.color} text-white rounded-full z-10 shadow-sm shrink-0`}>
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                  </div>
                  <div className="ml-14 bg-surface-container-low p-4 border border-outline-variant rounded-xl group-hover:border-industrial-blue/50 transition-all w-full md:w-2/3 text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-on-surface">{item.label}</h4>
                      <span className="text-[10px] text-on-surface-variant font-mono ml-4 shrink-0">{item.time}</span>
                    </div>
                    <p className="text-on-surface-variant text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <footer className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-outline-variant text-[10px] font-bold uppercase tracking-wider text-on-surface-variant pb-4">
          <div className="flex items-center gap-6 font-label-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success-green"></span>
              <span>GPS Signal: Strong</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success-green"></span>
              <span>Engine: Healthy</span>
            </div>
          </div>
          <div className="font-mono text-[10px]">Last Telemetry Sync: 2 minutes ago</div>
        </footer>

      </div>
    </>
  )
}
