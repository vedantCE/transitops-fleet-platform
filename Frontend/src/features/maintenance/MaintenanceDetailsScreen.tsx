import { useParams, useNavigate } from 'react-router-dom'

interface MaintenanceData {
  id: string
  vehicleId: string
  vehicleModel: string
  serviceType: string
  status: 'Active' | 'Completed'
  estimatedCost: string
  scheduledTime: string
  actualStart: string
  notes: string
  mechanic: string
  location: string
  elapsedTime: string
  laborCost: string
  partsCost: string
  otherCost: string
  totalCost: string
}

const maintenanceDatabase: Record<string, MaintenanceData> = {
  MNT001: {
    id: 'MNT001',
    vehicleId: 'VAN-05',
    vehicleModel: 'Tata Winger 2022',
    serviceType: 'Oil Change',
    status: 'Active',
    estimatedCost: '₹4,000',
    scheduledTime: 'Oct 24, 2023 - 09:00 AM',
    actualStart: 'Oct 24, 2023 - 09:22 AM',
    notes: 'Routine oil and filter change. Check brake fluid levels and tire pressure as secondary inspection points. Driver reported slight vibration at high speeds, needs visual axle check.',
    mechanic: 'Suresh Varma (Lead Tech)',
    location: 'Main Hub Workshop - Bay 04',
    elapsedTime: '02h 45m',
    laborCost: '₹1,500',
    partsCost: '₹2,500',
    otherCost: '₹0',
    totalCost: '₹4,000',
  },
  MNT002: {
    id: 'MNT002',
    vehicleId: 'TRUCK-02',
    vehicleModel: 'Tata Prima 2021',
    serviceType: 'Brake System Flush',
    status: 'Completed',
    estimatedCost: '₹8,200',
    scheduledTime: 'Oct 18, 2023 - 08:00 AM',
    actualStart: 'Oct 18, 2023 - 08:10 AM',
    notes: 'Complete brake fluid flush and line inspection. Replace worn front pads.',
    mechanic: 'Rajan Patel (Senior Tech)',
    location: 'Main Hub Workshop - Bay 02',
    elapsedTime: '04h 30m',
    laborCost: '₹2,200',
    partsCost: '₹5,500',
    otherCost: '₹500',
    totalCost: '₹8,200',
  },
  MNT003: {
    id: 'MNT003',
    vehicleId: 'ACE-05',
    vehicleModel: 'Tata Ace 2020',
    serviceType: 'Tire Replacement',
    status: 'Active',
    estimatedCost: '₹6,400',
    scheduledTime: 'Oct 25, 2023 - 10:00 AM',
    actualStart: 'Oct 25, 2023 - 10:15 AM',
    notes: 'Replace all four tires. Check wheel alignment and balancing post-replacement.',
    mechanic: 'Rahul Mehta (Tire Specialist)',
    location: 'Main Hub Workshop - Bay 07',
    elapsedTime: '01h 20m',
    laborCost: '₹1,200',
    partsCost: '₹5,000',
    otherCost: '₹200',
    totalCost: '₹6,400',
  },
}

const vehicleHistoryMap: Record<string, Array<{ id: string; date: string; type: string; cost: string; status: string }>> = {
  'VAN-05': [
    { id: 'MNT-102', date: 'Sep 15, 2023', type: 'Tire Rotation', cost: '₹1,200', status: 'Completed' },
    { id: 'MNT-088', date: 'Aug 02, 2023', type: 'Brake Pad Replace', cost: '₹8,500', status: 'Completed' },
    { id: 'MNT-045', date: 'May 12, 2023', type: 'Oil Change', cost: '₹4,200', status: 'Completed' },
  ],
  'TRUCK-02': [
    { id: 'MNT-088', date: 'Jul 10, 2023', type: 'Engine Tune-up', cost: '₹12,500', status: 'Completed' },
    { id: 'MNT-071', date: 'May 18, 2023', type: 'Full Inspection', cost: '₹5,000', status: 'Completed' },
  ],
  'ACE-05': [
    { id: 'MNT-062', date: 'Jun 22, 2023', type: 'Oil Change', cost: '₹3,200', status: 'Completed' },
  ],
}

const timelineMap: Record<string, Array<{ label: string; time: string; desc: string; active: boolean }>> = {
  MNT001: [
    { label: 'Service Commenced', time: 'Oct 24, 09:22 AM · Suresh V.', desc: 'Vehicle pulled into Bay 04 and lifted.', active: true },
    { label: 'Check-In Completed', time: 'Oct 24, 09:15 AM · Admin', desc: 'Mileage recorded: 42,350 km.', active: false },
    { label: 'Record Created', time: 'Oct 23, 04:30 PM · Riya K.', desc: 'Scheduled via Fleet Watch engine.', active: false },
  ],
  MNT002: [
    { label: 'Service Completed', time: 'Oct 18, 12:40 PM · Rajan P.', desc: 'Brake pads replaced. QC passed.', active: true },
    { label: 'Check-In Completed', time: 'Oct 18, 08:10 AM · Admin', desc: 'Mileage recorded: 108,900 km.', active: false },
    { label: 'Record Created', time: 'Oct 17, 03:00 PM · Riya K.', desc: 'Scheduled maintenance via Fleet Watch.', active: false },
  ],
  MNT003: [
    { label: 'Service Commenced', time: 'Oct 25, 10:15 AM · Rahul M.', desc: 'Tires mounted in Bay 07.', active: true },
    { label: 'Record Created', time: 'Oct 24, 06:00 PM · Admin', desc: 'Scheduled urgent tire replacement.', active: false },
  ],
}

export default function MaintenanceDetailsScreen() {
  const { maintenanceId } = useParams<{ maintenanceId: string }>()
  const navigate = useNavigate()

  const record = maintenanceId ? maintenanceDatabase[maintenanceId] : null

  if (!record) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4 text-on-surface-variant bg-dashboard-canvas">
        <span className="material-symbols-outlined text-[64px] opacity-30">build</span>
        <p className="font-bold text-lg">Maintenance record "{maintenanceId}" not found</p>
        <button onClick={() => navigate('/maintenance')} className="px-6 py-2.5 bg-industrial-blue text-white rounded-xl font-bold text-sm cursor-pointer">
          Back to Maintenance
        </button>
      </div>
    )
  }

  const history = vehicleHistoryMap[record.vehicleId] || []
  const timeline = timelineMap[record.id] || []

  // Lifecycle stepper
  const steps = [
    { icon: 'edit_note', label: 'Logged', time: '08:00 AM' },
    { icon: 'check', label: 'Checked-In', time: '09:15 AM' },
    { icon: 'engineering', label: 'Service Active', time: 'In Progress' },
    { icon: 'verified', label: 'QC Pending', time: 'TBD' },
    { icon: 'flag', label: 'Completed', time: 'TBD' },
  ]
  const currentStep = record.status === 'Active' ? 2 : 4

  return (
    <>
      {/* Header */}
      <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/5 bg-white/60 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/maintenance')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-industrial-blue transition-colors group cursor-pointer text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            Maintenance
          </button>
          <span className="text-on-surface-variant opacity-30">/</span>
          <span className="text-on-surface text-sm font-semibold">{record.id}</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-1.5 bg-background text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Close Maintenance
          </button>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">

        {/* Page Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center flex-wrap gap-3 mb-1">
              <h2 className="text-2xl font-bold text-on-surface font-headline-lg">Record {record.id}</h2>
              <span className="px-3 py-0.5 bg-industrial-blue/10 text-industrial-blue text-[10px] font-bold rounded-lg border border-industrial-blue/20 uppercase tracking-wider">
                Service: {record.serviceType}
              </span>
              <div className="flex items-center gap-2 px-3 py-0.5 bg-success-green/10 text-success-green text-[10px] font-bold rounded-lg border border-success-green/20 uppercase tracking-wider">
                <span className="w-2 h-2 bg-success-green rounded-full animate-pulse"></span>
                {record.status}
              </div>
            </div>
            <p className="text-sm text-on-surface-variant font-body-md">
              Maintenance for Vehicle <span className="font-bold text-on-surface">{record.vehicleId}</span> initiated on Oct 24, 2023.
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Vehicle', value: record.vehicleId, sub: record.vehicleModel, icon: 'local_shipping' },
            { label: 'Service Type', value: record.serviceType, sub: 'Regular Periodic Maintenance', icon: 'oil_barrel' },
            { label: 'Est. Cost', value: record.estimatedCost, sub: '-5% vs avg', icon: 'payments', trendDown: true },
            { label: 'Current State', value: 'In Service', sub: `Elapsed: ${record.elapsedTime}`, icon: 'engineering', green: true },
          ].map((card, i) => (
            <div key={i} className={`bg-white border ${card.green ? 'border-l-4 border-l-success-green border-outline-variant' : 'border-outline-variant'} rounded-2xl p-5 shadow-sm hover:border-industrial-blue transition-all group`}>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-label-sm mb-1">{card.label}</p>
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-on-surface font-mono">{card.value}</p>
                <span className={`material-symbols-outlined text-[22px] ${card.green ? 'text-success-green' : 'text-industrial-blue'}`}>{card.icon}</span>
              </div>
              <p className={`text-[11px] mt-2 ${card.trendDown ? 'text-success-green flex items-center gap-1' : 'text-on-surface-variant'}`}>
                {card.trendDown && <span className="material-symbols-outlined text-[12px]">trending_down</span>}
                {card.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Main 2-col layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column (2/3) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Lifecycle Stepper */}
            <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-on-surface mb-6 flex items-center gap-2 font-headline-sm">
                <span className="material-symbols-outlined text-on-surface-variant">reorder</span>
                Maintenance Lifecycle
              </h3>
              <div className="relative flex items-center justify-between">
                {/* Connector base */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-outline-variant z-0"></div>
                {/* Progress fill */}
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-industrial-blue z-0 transition-all"
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                ></div>
                {steps.map((step, i) => {
                  const done = i < currentStep
                  const current = i === currentStep
                  return (
                    <div key={i} className={`relative z-10 flex flex-col items-center bg-white px-2 ${i > currentStep ? 'opacity-40' : ''}`}>
                      <div className={`flex items-center justify-center mb-2 ${
                        current
                          ? 'w-10 h-10 rounded-full border-2 border-industrial-blue text-industrial-blue ring-4 ring-industrial-blue/10 animate-pulse'
                          : done
                            ? 'w-8 h-8 rounded-full bg-industrial-blue text-white'
                            : 'w-8 h-8 rounded-full bg-outline-variant text-white'
                      }`}>
                        <span className="material-symbols-outlined text-[16px]">{done ? 'check' : step.icon}</span>
                      </div>
                      <span className={`text-[10px] font-bold font-label-sm ${current ? 'text-industrial-blue' : 'text-on-surface'}`}>{step.label}</span>
                      <span className="text-[9px] text-on-surface-variant font-mono">{step.time}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Maintenance Info */}
            <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant flex justify-between items-center">
                <h3 className="text-base font-bold text-on-surface font-headline-sm">Maintenance Information</h3>
                <button className="text-industrial-blue text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer">
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Edit Details
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest mb-1 font-label-sm">Scheduled Time</label>
                  <p className="text-on-surface font-medium">{record.scheduledTime}</p>
                </div>
                <div>
                  <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest mb-1 font-label-sm">Actual Start</label>
                  <p className="text-on-surface font-medium">{record.actualStart}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest mb-2 font-label-sm">Service Notes</label>
                  <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant text-on-surface-variant italic text-sm leading-relaxed">
                    "{record.notes}"
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest mb-2 font-label-sm">Assigned Mechanic</label>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-industrial-blue/10 flex items-center justify-center text-industrial-blue shrink-0">
                      <span className="material-symbols-outlined text-[16px]">engineering</span>
                    </div>
                    <span className="font-medium text-on-surface">{record.mechanic}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-on-surface-variant uppercase tracking-widest mb-2 font-label-sm">Service Location</label>
                  <p className="text-on-surface font-medium">{record.location}</p>
                </div>
              </div>
            </div>

            {/* History Table */}
            <div className="bg-white border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-outline-variant">
                <h3 className="text-base font-bold text-on-surface font-headline-sm">Vehicle Maintenance History ({record.vehicleId})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead className="bg-surface-container-low border-b border-outline-variant text-on-surface-variant uppercase tracking-widest text-[10px] font-label-sm">
                    <tr>
                      <th className="px-6 py-3 font-bold">ID</th>
                      <th className="px-6 py-3 font-bold">Date</th>
                      <th className="px-6 py-3 font-bold">Type</th>
                      <th className="px-6 py-3 font-bold text-right">Cost</th>
                      <th className="px-6 py-3 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 text-on-surface font-sans">
                    {history.map((row, i) => (
                      <tr key={i} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-industrial-blue">{row.id}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{row.date}</td>
                        <td className="px-6 py-4 font-medium">{row.type}</td>
                        <td className="px-6 py-4 text-right font-mono">{row.cost}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2.5 py-0.5 bg-surface-container-high text-on-surface-variant rounded text-[9px] font-bold uppercase">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 bg-surface border-t border-outline-variant flex justify-center">
                <button
                  onClick={() => navigate(`/fleet/${record.vehicleId}`)}
                  className="text-industrial-blue text-xs font-bold hover:underline cursor-pointer"
                >
                  View Full Vehicle History
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar Column (1/3) */}
          <div className="space-y-6">
            {/* Vehicle Impact */}
            <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[80px]">warning</span>
              </div>
              <h3 className="text-base font-bold text-on-surface mb-4 font-headline-sm relative z-10">Vehicle Impact</h3>
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-4 bg-error-red/5 p-3 rounded-xl border border-error-red/20">
                  <div className="w-10 h-10 rounded-full bg-error-red flex items-center justify-center text-white shrink-0">
                    <span className="material-symbols-outlined">block</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-error-red">In Shop</p>
                    <p className="text-[11px] text-on-surface-variant">Dispatch blocked by system</p>
                  </div>
                </div>
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant text-sm">
                  <p className="text-on-surface-variant text-[10px] font-bold uppercase mb-2 font-label-sm">Availability Warning</p>
                  <p className="text-on-surface">
                    {record.vehicleId} is currently <span className="text-error-red font-bold">Not Available for Dispatch</span>.
                  </p>
                  <div className="mt-4 pt-4 border-t border-outline-variant text-xs text-on-surface-variant">
                    Impact on Active Routes:
                    <div className="flex items-center gap-2 mt-2">
                      <span className="w-2 h-2 rounded-full bg-alert-yellow shrink-0"></span>
                      <span>Route #RT-99 rerouted to VAN-12</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-background text-white rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-base font-bold">Cost Breakdown</h3>
                <span className="material-symbols-outlined text-industrial-blue">monitoring</span>
              </div>
              <div className="space-y-3 mb-6 text-sm">
                {[
                  { label: 'Labor (3 hrs)', value: record.laborCost },
                  { label: 'Parts & Materials', value: record.partsCost },
                  { label: 'Other', value: record.otherCost },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between opacity-80">
                    <span>{item.label}</span>
                    <span className="font-mono">{item.value}</span>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-white/20 flex justify-between text-xs font-bold">
                  <span>TOTAL COST</span>
                  <span className="font-mono">{record.totalCost}</span>
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl text-[11px] leading-relaxed border border-white/10">
                <p className="flex items-center gap-2 mb-1 text-industrial-blue font-bold">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  SYSTEM AUTOMATION
                </p>
                This cost is automatically logged to <span className="text-white font-medium">OpEx: Maintenance</span> and contributes to the TCO analysis for {record.vehicleId}.
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-on-surface mb-6 font-headline-sm">Activity Log</h3>
              <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-outline-variant">
                {timeline.map((item, i) => (
                  <div key={i} className="relative pl-8">
                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full bg-white flex items-center justify-center z-10 ${item.active ? 'border-2 border-industrial-blue' : 'border-2 border-outline-variant'}`}>
                      <div className={`w-2 h-2 rounded-full ${item.active ? 'bg-industrial-blue' : 'bg-outline-variant'}`}></div>
                    </div>
                    <p className="text-xs font-bold text-on-surface">{item.label}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5 font-mono">{item.time}</p>
                    <p className="text-[11px] text-on-surface-variant mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
