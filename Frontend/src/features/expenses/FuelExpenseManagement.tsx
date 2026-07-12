import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

interface FuelLog {
  vehicleId: string
  vehicleType: string
  date: string
  quantity: string
  cost: number
}

interface OtherExpense {
  subject: string
  category: 'Maintenance' | 'Admin' | 'Tolls' | 'Other'
  detail: string
  cost: number
}

interface VehicleEfficiency {
  id: string
  mileage: string
  totalCost: number
  costPerKm: number
  status: 'Optimal' | 'Requires Audit'
}

export default function FuelExpenseManagement() {
  const { setIsMobileMenuOpen } = useOutletContext<{ setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>> }>()

  // Filters State
  const [selectedVehicle, setSelectedVehicle] = useState('All Vehicles')
  const [fromDate, setFromDate] = useState('2023-10-01')
  const [toDate, setToDate] = useState('2023-10-31')
  const [searchQuery, setSearchQuery] = useState('')

  // State-backed lists matching Stitch mockups
  const initialFuelLogs: FuelLog[] = [
    { vehicleId: 'F-201', vehicleType: 'Freightliner', date: '24 Oct, 08:12', quantity: '450.2 L', cost: 742.83 },
    { vehicleId: 'V-102', vehicleType: 'Volvo VNL', date: '24 Oct, 11:45', quantity: '582.0 L', cost: 960.30 },
    { vehicleId: 'P-509', vehicleType: 'Peterbilt', date: '23 Oct, 16:30', quantity: '390.5 L', cost: 652.14 },
  ]
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(initialFuelLogs)

  const initialOtherExpenses: OtherExpense[] = [
    { subject: 'V-102', category: 'Maintenance', detail: 'Engine Tuning • Routine 50k check • 22 Oct', cost: 1200.00 },
    { subject: 'Fleet Wide', category: 'Admin', detail: 'Insurance Premium • Q4 Installment • 20 Oct', cost: 4500.00 },
    { subject: 'F-201', category: 'Maintenance', detail: 'Brake Pad Replace • Safety audit fail • 19 Oct', cost: 845.20 },
  ]
  const [otherExpenses, setOtherExpenses] = useState<OtherExpense[]>(initialOtherExpenses)

  const initialEfficiency: VehicleEfficiency[] = [
    { id: 'F-201', mileage: '12,450 km', totalCost: 3120.40, costPerKm: 0.25, status: 'Optimal' },
    { id: 'V-102', mileage: '10,800 km', totalCost: 4860.00, costPerKm: 0.45, status: 'Requires Audit' },
    { id: 'P-509', mileage: '15,100 km', totalCost: 4228.00, costPerKm: 0.28, status: 'Optimal' },
  ]
  const [efficiencies] = useState<VehicleEfficiency[]>(initialEfficiency)

  const handleLogFuelClick = () => {
    // Quick add simulated fuel record
    const newLog: FuelLog = {
      vehicleId: 'F-201',
      vehicleType: 'Freightliner',
      date: 'Today, 10:30',
      quantity: '120.5 L',
      cost: 114.50,
    }
    setFuelLogs([newLog, ...fuelLogs])
    alert('Simulated fuel record logged successfully!')
  }

  const handleAddExpenseClick = () => {
    const newExpense: OtherExpense = {
      subject: 'P-509',
      category: 'Tolls',
      detail: 'Highway Toll • Expressway Pass • Today',
      cost: 150.00,
    }
    setOtherExpenses([newExpense, ...otherExpenses])
    alert('Simulated other expense added successfully!')
  }

  // Filtered Fuel Logs
  const filteredFuelLogs = fuelLogs.filter(f => {
    if (selectedVehicle !== 'All Vehicles' && !f.vehicleId.toLowerCase().includes(selectedVehicle.toLowerCase().split(' ')[0])) return false
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      return f.vehicleId.toLowerCase().includes(q) || f.vehicleType.toLowerCase().includes(q)
    }
    return true
  })

  // Filtered Other Expenses
  const filteredOtherExpenses = otherExpenses.filter(e => {
    if (selectedVehicle !== 'All Vehicles' && !e.subject.toLowerCase().includes(selectedVehicle.toLowerCase().split(' ')[0])) return false
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      return e.subject.toLowerCase().includes(q) || e.detail.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <>
      {/* TOP HEADER */}
      <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/5 bg-white/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button className="md:hidden text-on-surface p-1 hover:bg-black/5 rounded" onClick={() => setIsMobileMenuOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-on-surface font-headline-sm">Fuel &amp; Expense Management</h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-black/5 transition-all relative">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error-red rounded-full"></span>
          </button>
          <div className="h-6 w-[1px] bg-outline-variant mx-2 hidden sm:block"></div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-on-surface-variant font-body-md">Audit Center</p>
          </div>
        </div>
      </header>

      {/* CONTENT CANVAS */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
        {/* Header summary & CTA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface font-headline-lg font-bold">Fuel &amp; Expense Management</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body-md">Audit fuel logs, calculate asset efficiency, and record general operational expenses</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleLogFuelClick}
              className="bg-white border border-black/5 text-on-surface px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-black/5 transition-all flex items-center gap-2 shadow-sm uppercase tracking-wider cursor-pointer font-sans"
            >
              <span className="material-symbols-outlined text-[16px] text-on-surface">local_gas_station</span>
              Log Fuel
            </button>
            <button
              onClick={handleAddExpenseClick}
              className="bg-background text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-lg uppercase tracking-wider cursor-pointer font-sans"
            >
              <span className="material-symbols-outlined text-[16px] text-white">add_circle</span>
              Add Expense
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white p-5 rounded-2xl flex flex-wrap gap-4 items-end shadow-sm border border-black/[0.01] font-body-sm text-sm">
          <div className="flex-1 min-w-[180px] space-y-1">
            <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider font-label-sm">Asset Unit</label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full bg-dashboard-canvas/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-success-green outline-none cursor-pointer"
            >
              <option>All Vehicles</option>
              <option>F-201 (Freightliner)</option>
              <option>V-102 (Volvo VNL)</option>
              <option>P-509 (Peterbilt)</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px] space-y-1">
            <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider font-label-sm">From Date</label>
            <input
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-dashboard-canvas/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-success-green outline-none cursor-pointer font-mono"
              type="date"
            />
          </div>
          <div className="flex-1 min-w-[150px] space-y-1">
            <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider font-label-sm">To Date</label>
            <input
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-dashboard-canvas/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-success-green outline-none cursor-pointer font-mono"
              type="date"
            />
          </div>
          <div className="flex-1 min-w-[200px] space-y-1">
            <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider font-label-sm">Search Detail</label>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dashboard-canvas/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-success-green outline-none"
              placeholder="Search registration, category..."
              type="text"
            />
          </div>
          <button
            onClick={() => alert('Filter queries simulated!')}
            className="bg-on-background text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md cursor-pointer font-sans"
          >
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Apply
          </button>
        </div>

        {/* KPI Dashboard Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-28 border-l-4 border-l-industrial-blue">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="text-[10px] font-bold uppercase tracking-wider font-label-sm">Total Distance MTD</span>
              <span className="material-symbols-outlined text-industrial-blue">route</span>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-on-surface">38,350 km</p>
              <p className="text-[10px] text-on-surface-variant mt-1 font-body-sm">Across active units</p>
            </div>
          </div>
          <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-28 border-l-4 border-l-success-green">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="text-[10px] font-bold uppercase tracking-wider font-label-sm">Avg Efficiency</span>
              <span className="material-symbols-outlined text-success-green">speed</span>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-on-surface">2.42 km/L</p>
              <p className="text-[10px] text-success-green font-bold mt-1 font-body-sm">+4.2% improvement</p>
            </div>
          </div>
          <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-28 border-l-4 border-l-safety-orange">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="text-[10px] font-bold uppercase tracking-wider font-label-sm">Total OPEX MTD</span>
              <span className="material-symbols-outlined text-safety-orange">payments</span>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-on-surface">₹ 2,35,420</p>
              <p className="text-[10px] text-on-surface-variant mt-1 font-body-sm">Fuel &amp; Maintenance combined</p>
            </div>
          </div>
        </div>

        {/* Expenses List Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Fuel Logs (Left 7/12) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden flex flex-col min-h-[380px]">
            <div className="px-6 py-4 border-b border-black/5 bg-gray-50/50 flex justify-between items-center">
              <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider font-headline-sm">Fuel Receipt Log</h4>
              <span className="bg-industrial-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">{filteredFuelLogs.length} Receipts</span>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-sm font-body-md border-collapse">
                <thead className="bg-dashboard-canvas text-on-surface-variant text-[11px] uppercase tracking-wider font-label-sm">
                  <tr>
                    <th className="px-6 py-3 font-bold border-b border-black/5">Vehicle</th>
                    <th className="px-6 py-3 font-bold border-b border-black/5">Refuel Date</th>
                    <th className="px-6 py-3 font-bold border-b border-black/5 text-right">Quantity</th>
                    <th className="px-6 py-3 font-bold border-b border-black/5 text-right">Cost (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs font-mono font-medium text-on-surface">
                  {filteredFuelLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/10 transition-colors">
                      <td className="px-6 py-4 font-sans">
                        <span className="font-bold text-on-surface block">{log.vehicleId}</span>
                        <span className="text-[10px] text-on-surface-variant font-sans font-medium">{log.vehicleType}</span>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant font-sans">{log.date}</td>
                      <td className="px-6 py-4 text-right font-bold text-on-surface">{log.quantity}</td>
                      <td className="px-6 py-4 text-right font-bold text-on-surface">₹ {log.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Other Expenses (Right 5/12) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden flex flex-col min-h-[380px]">
            <div className="px-6 py-4 border-b border-black/5 bg-gray-50/50 flex justify-between items-center">
              <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider font-headline-sm">Miscellaneous Expenses</h4>
            </div>
            <div className="p-4 space-y-4 font-body-sm text-xs">
              {filteredOtherExpenses.map((expense, idx) => (
                <div key={idx} className="flex justify-between items-start pb-4 border-b border-gray-50 last:border-none last:pb-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-on-surface font-mono">{expense.subject}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        expense.category === 'Maintenance' ? 'bg-amber-50 text-safety-orange border border-safety-orange/10' : 'bg-gray-100 text-on-surface-variant'
                      }`}>
                        {expense.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed font-sans">{expense.detail}</p>
                  </div>
                  <span className="font-bold text-on-surface font-mono shrink-0">₹ {expense.cost.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fuel Efficiency Index */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-black/5 bg-gray-50/50">
            <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider font-headline-sm">Fuel Efficiency index</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-body-md border-collapse">
              <thead className="bg-dashboard-canvas text-on-surface-variant text-[11px] uppercase tracking-wider font-label-sm">
                <tr>
                  <th className="px-6 py-3 font-bold border-b border-black/5">Vehicle Unit</th>
                  <th className="px-6 py-3 font-bold border-b border-black/5 text-right">Odometer MTD</th>
                  <th className="px-6 py-3 font-bold border-b border-black/5 text-right">Fuel Cost MTD</th>
                  <th className="px-6 py-3 font-bold border-b border-black/5 text-right">Cost Per Km</th>
                  <th className="px-6 py-3 font-bold border-b border-black/5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-mono font-medium text-on-surface">
                {efficiencies.map(eff => (
                  <tr key={eff.id} className="hover:bg-blue-50/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-industrial-blue">{eff.id}</td>
                    <td className="px-6 py-4 text-right font-bold text-on-surface">{eff.mileage}</td>
                    <td className="px-6 py-4 text-right font-bold text-on-surface">₹ {eff.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-right font-bold text-on-surface">₹ {eff.costPerKm.toFixed(2)} / km</td>
                    <td className="px-6 py-4 text-center font-sans">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                        eff.status === 'Optimal'
                          ? 'bg-green-50 text-success-green border-success-green/10'
                          : 'bg-red-50 text-error-red border-error-red/10 animate-pulse'
                      }`}>
                        {eff.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
