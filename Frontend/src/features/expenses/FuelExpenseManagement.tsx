import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface ExpenseRecord {
  id: string
  date: string
  tripId: string
  vehicleId: string
  category: 'Fuel' | 'Toll' | 'Insurance' | 'Maintenance' | 'Other'
  liters?: number
  rate?: number
  amount: number
  status: 'Approved' | 'Pending'
}

export default function FuelExpenseManagement() {
  const navigate = useNavigate()
  
  // Navigation active tab
  const [activeTab, setActiveTab] = useState('Fuel & Expenses')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Expense List state
  const initialExpenses: ExpenseRecord[] = [
    { id: 'EXP001', date: '12-07-2026', tripId: 'TR001', vehicleId: 'VAN-05', category: 'Fuel', liters: 45, rate: 95.5, amount: 4297.5, status: 'Approved' },
    { id: 'EXP002', date: '11-07-2026', tripId: 'TR002', vehicleId: 'TRUCK-02', category: 'Toll', amount: 850, status: 'Approved' },
    { id: 'EXP003', date: '11-07-2026', tripId: 'TR003', vehicleId: 'ACE-05', category: 'Fuel', liters: 30, rate: 96.2, amount: 2886, status: 'Pending' },
    { id: 'EXP004', date: '10-07-2026', tripId: '—', vehicleId: 'TRK-09', category: 'Insurance', amount: 15000, status: 'Approved' },
  ]
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(initialExpenses)

  // Register Expense Form states
  const [selectedVehicle, setSelectedVehicle] = useState('Select Vehicle')
  const [category, setCategory] = useState<'Fuel' | 'Toll' | 'Insurance' | 'Maintenance' | 'Other'>('Fuel')
  const [liters, setLiters] = useState('')
  const [rate, setRate] = useState('')
  const [amount, setAmount] = useState('')
  const [tripId, setTripId] = useState('')

  const handleNavClick = (tabName: string) => {
    if (tabName === 'Dashboard') navigate('/dashboard')
    else if (tabName === 'Fleet') navigate('/fleet')
    else if (tabName === 'Trips') navigate('/trips')
    else if (tabName === 'Maintenance') navigate('/maintenance')
    else if (tabName === 'Fuel & Expenses') navigate('/expenses')
    else setActiveTab(tabName)
  }

  const handleLogout = () => {
    navigate('/login')
  }

  const handleRegisterExpense = (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedVehicle === 'Select Vehicle') {
      alert('Please select a Vehicle.')
      return
    }

    const calculatedAmount = category === 'Fuel' && liters && rate 
      ? Number(liters) * Number(rate) 
      : Number(amount)

    if (!calculatedAmount) {
      alert('Please specify the expense amount or fuel rates.')
      return
    }

    const nextIdNum = expenses.length + 1
    const nextId = `EXP${String(nextIdNum).padStart(3, '0')}`

    const now = new Date()
    const dateStr = now.toLocaleDateString('en-GB').replace(/\//g, '-')

    const newExpense: ExpenseRecord = {
      id: nextId,
      date: dateStr,
      tripId: tripId || '—',
      vehicleId: selectedVehicle.split(' ')[0],
      category,
      liters: category === 'Fuel' ? Number(liters) : undefined,
      rate: category === 'Fuel' ? Number(rate) : undefined,
      amount: calculatedAmount,
      status: 'Pending',
    }

    setExpenses([newExpense, ...expenses])

    // Reset Form
    setSelectedVehicle('Select Vehicle')
    setCategory('Fuel')
    setLiters('')
    setRate('')
    setAmount('')
    setTripId('')
  }

  // Summary Metrics
  const totalOpex = expenses.reduce((sum, e) => sum + e.amount, 0)
  const fuelCostTotal = expenses.filter(e => e.category === 'Fuel').reduce((sum, e) => sum + e.amount, 0)
  const tollCostTotal = expenses.filter(e => e.category === 'Toll').reduce((sum, e) => sum + e.amount, 0)

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
    <div className="bg-background text-on-surface h-screen w-full flex overflow-hidden font-sans p-2 md:p-4 gap-4">
      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="w-64 flex flex-col py-6 z-40 hidden md:flex shrink-0">
        <div className="px-6 mb-2">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">TRANSITOPS</p>
        </div>
        <div className="px-6 mb-8 flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-white">rocket_launch</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">TransitOps</h1>
            <p className="text-white/60 text-[10px] uppercase tracking-widest mt-1">Global Command</p>
          </div>
        </div>

        <div className="px-4 mb-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[20px]">search</span>
            <input
              className="w-full bg-white/10 border-none rounded-full px-10 py-2 text-sm text-white placeholder-white/40 focus:ring-1 focus:ring-white/20 outline-none"
              placeholder="Search..."
              type="text"
            />
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {/* OPERATIONS SECTION */}
          <div className="px-4 py-2">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">OPERATIONS</p>
            <div className="space-y-1">
              {navItemsOperations.map(item => (
                <button
                  key={item.name}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm text-left ${
                    activeTab === item.name
                      ? 'text-white bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => handleNavClick(item.name)}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* MANAGEMENT SECTION */}
          <div className="px-4 py-4">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">MANAGEMENT</p>
            <div className="space-y-1">
              {navItemsManagement.map(item => (
                <button
                  key={item.name}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm text-left ${
                    activeTab === item.name
                      ? 'text-white bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => handleNavClick(item.name)}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* USER PROFILE SECTION */}
          <div className="px-4 py-2">
            <div className="h-[1px] bg-white/10 w-full mb-6"></div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">USER PROFILE</p>
            <div className="space-y-1">
              <button
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm text-left ${
                  activeTab === 'Role' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => handleNavClick('Role')}
              >
                <span className="material-symbols-outlined text-[20px]">account_circle</span>
                Fleet Manager
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium text-sm text-left"
                onClick={handleLogout}
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Logout
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 md:hidden flex" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="w-64 bg-background h-full flex flex-col py-6 animate-slide-in-right" onClick={e => e.stopPropagation()}>
            <div className="px-6 mb-4 flex justify-between items-center">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">TRANSITOPS</p>
              <button className="text-white" onClick={() => setIsMobileMenuOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="px-6 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                <span className="material-symbols-outlined text-white">rocket_launch</span>
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-none">TransitOps</h1>
                <p className="text-white/60 text-[10px] uppercase tracking-widest mt-1">Global Command</p>
              </div>
            </div>

            <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
              <div className="px-4 py-2">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">OPERATIONS</p>
                <div className="space-y-1">
                  {navItemsOperations.map(item => (
                    <button
                      key={item.name}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm text-left ${
                        activeTab === item.name
                          ? 'text-white bg-white/10'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                      onClick={() => {
                        handleNavClick(item.name)
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 py-4">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">MANAGEMENT</p>
                <div className="space-y-1">
                  {navItemsManagement.map(item => (
                    <button
                      key={item.name}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm text-left ${
                        activeTab === item.name
                          ? 'text-white bg-white/10'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                      onClick={() => {
                        handleNavClick(item.name)
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 py-2">
                <div className="h-[1px] bg-white/10 w-full mb-6"></div>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all font-medium text-sm text-left"
                  onClick={handleLogout}
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Logout
                </button>
              </div>
            </nav>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT CANVAS */}
      <main className="flex-1 bg-dashboard-canvas rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
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
              <p className="text-sm font-semibold text-on-surface-variant font-body-md">Command Center</p>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h2 className="text-2xl font-bold text-on-surface font-headline-lg">Opex &amp; Fuel Logs</h2>
              <p className="text-sm text-on-surface-variant mt-1 font-body-md">Monitor opex transactions and fuel efficiency records</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white px-6 py-3 rounded-xl shadow-sm text-center border border-black/5">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1 font-label-sm">Total OPEX</p>
                <p className="text-2xl font-bold text-success-green font-mono">₹ {totalOpex.toLocaleString()}</p>
              </div>
              <div className="bg-white px-6 py-3 rounded-xl shadow-sm text-center border border-black/5">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1 font-label-sm">Fuel Cost Total</p>
                <p className="text-2xl font-bold text-industrial-blue font-mono">₹ {fuelCostTotal.toLocaleString()}</p>
              </div>
              <div className="bg-white px-6 py-3 rounded-xl shadow-sm text-center border border-black/5">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1 font-label-sm">Tolls &amp; Permits</p>
                <p className="text-2xl font-bold text-safety-orange font-mono">₹ {tollCostTotal.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Recent Expenses Table */}
            <div className="xl:col-span-7 space-y-4">
              <h3 className="text-lg font-bold text-on-surface px-2 font-headline-sm">Recent Expenses</h3>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/[0.02]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-body-md">
                    <thead className="bg-white border-b border-gray-100">
                      <tr className="text-on-surface-variant text-[11px] uppercase tracking-wider font-label-sm">
                        <th className="px-6 py-5 font-bold">EXP ID</th>
                        <th className="px-6 py-5 font-bold">Date</th>
                        <th className="px-6 py-5 font-bold">Vehicle</th>
                        <th className="px-6 py-5 font-bold">Category</th>
                        <th className="px-6 py-5 text-center">Fuel Details</th>
                        <th className="px-6 py-5 text-right font-bold">Amount</th>
                        <th className="px-6 py-5 text-center font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {expenses.map(expense => (
                        <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-5 font-mono font-medium">{expense.id}</td>
                          <td className="px-6 py-5 font-mono text-xs">{expense.date}</td>
                          <td className="px-6 py-5 font-mono">{expense.vehicleId}</td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              expense.category === 'Fuel'
                                ? 'bg-blue-50 text-industrial-blue'
                                : expense.category === 'Toll'
                                  ? 'bg-amber-50 text-safety-orange'
                                  : expense.category === 'Insurance'
                                    ? 'bg-purple-50 text-purple-600'
                                    : expense.category === 'Maintenance'
                                      ? 'bg-red-50 text-error-red'
                                      : 'bg-gray-100 text-on-surface-variant'
                            }`}>
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-center font-mono text-xs text-on-surface-variant">
                            {expense.category === 'Fuel' && expense.liters 
                              ? `${expense.liters}L @ ₹${expense.rate}/L` 
                              : '—'}
                          </td>
                          <td className="px-6 py-5 font-mono text-right font-bold text-on-surface">₹ {expense.amount.toLocaleString()}</td>
                          <td className="px-6 py-5 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                              expense.status === 'Approved'
                                ? 'bg-green-50 text-success-green border-success-green/10'
                                : 'bg-amber-50 text-safety-orange border-safety-orange/10'
                            }`}>
                              {expense.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Register Expense Form */}
            <div className="xl:col-span-5 space-y-4">
              <div className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 font-headline-sm">
                  <span className="material-symbols-outlined text-industrial-blue">add_circle</span>
                  Register Expense
                </h3>
                <form onSubmit={handleRegisterExpense} className="space-y-4 font-body-sm text-sm">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Vehicle ID</label>
                    <select
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      className="w-full bg-white border border-black/5 rounded-xl px-3 py-2.5 focus:border-industrial-blue focus:ring-industrial-blue text-sm outline-none cursor-pointer"
                    >
                      <option>Select Vehicle</option>
                      <option>VAN-05</option>
                      <option>TRUCK-02</option>
                      <option>ACE-05</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Expense Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-white border border-black/5 rounded-xl px-3 py-2.5 focus:border-industrial-blue focus:ring-industrial-blue text-sm outline-none cursor-pointer"
                    >
                      <option value="Fuel">Fuel</option>
                      <option value="Toll">Toll Fee</option>
                      <option value="Insurance">Insurance Policy</option>
                      <option value="Maintenance">Maintenance Charge</option>
                      <option value="Other">Other Expenses</option>
                    </select>
                  </div>

                  {category === 'Fuel' ? (
                    <div className="grid grid-cols-2 gap-4 font-mono">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm font-sans">Liters (L)</label>
                        <input
                          required
                          value={liters}
                          onChange={(e) => setLiters(e.target.value)}
                          className="w-full bg-white border border-black/5 rounded-xl px-3 py-2.5 focus:border-industrial-blue outline-none text-sm"
                          placeholder="e.g. 45"
                          type="number"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm font-sans">Rate per Litre (₹)</label>
                        <input
                          required
                          value={rate}
                          onChange={(e) => setRate(e.target.value)}
                          className="w-full bg-white border border-black/5 rounded-xl px-3 py-2.5 focus:border-industrial-blue outline-none text-sm"
                          placeholder="e.g. 95.5"
                          type="number"
                          step="0.01"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 font-mono">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm font-sans">Total Amount (₹)</label>
                      <input
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-white border border-black/5 rounded-xl px-3 py-2.5 focus:border-industrial-blue outline-none text-sm"
                        placeholder="e.g. 1500"
                        type="number"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Associated Trip ID (Optional)</label>
                    <input
                      value={tripId}
                      onChange={(e) => setTripId(e.target.value)}
                      className="w-full bg-white border border-black/5 rounded-xl px-3 py-2.5 focus:border-industrial-blue outline-none text-sm font-mono"
                      placeholder="e.g. TR004"
                      type="text"
                    />
                  </div>

                  <div className="mt-2">
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-on-surface-variant/60 bg-dashboard-canvas/20 hover:border-industrial-blue/30 hover:bg-dashboard-canvas/40 transition-all cursor-pointer group">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 border border-gray-100 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-industrial-blue">cloud_upload</span>
                      </div>
                      <p className="text-sm font-bold text-on-surface">Upload Invoice Receipt</p>
                      <p className="text-[10px] mt-0.5 font-sans">PNG, PDF or JPG up to 10MB</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-on-background text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-md active:scale-[0.98] mt-2 uppercase tracking-widest text-[10px] cursor-pointer"
                  >
                    Register Expense
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-white shadow-2xl rounded-2xl flex items-center justify-around z-40 border border-black/[0.02]">
        <button
          onClick={() => handleNavClick('Dashboard')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'Dashboard' ? 'text-on-background' : 'text-on-surface-variant/50'
          }`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold uppercase">Home</span>
        </button>
        <button
          onClick={() => handleNavClick('Fleet')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'Fleet' ? 'text-on-background' : 'text-on-surface-variant/50'
          }`}
        >
          <span className="material-symbols-outlined">directions_bus</span>
          <span className="text-[10px] font-bold uppercase">Fleet</span>
        </button>
        <button
          onClick={() => handleNavClick('Trips')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'Trips' ? 'text-on-background' : 'text-on-surface-variant/50'
          }`}
        >
          <span className="material-symbols-outlined">route</span>
          <span className="text-[10px] font-bold uppercase">Trips</span>
        </button>
        <button
          onClick={() => handleNavClick('Role')}
          className={`flex flex-col items-center gap-1 ${
            activeTab === 'Role' ? 'text-on-background' : 'text-on-surface-variant/50'
          }`}
        >
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[10px] font-bold uppercase">Profile</span>
        </button>
      </nav>
    </div>
  )
}
