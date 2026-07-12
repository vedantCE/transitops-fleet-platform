import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { listFuelLogs, listExpenses, createFuelLog, createExpense } from '../../services/fuelExpenses'
import { listVehicles } from '../../services/vehicles'
import { getVehicleStats } from '../../services/reports'
import { getApiErrorMessage } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { canLogFuel, canManageExpenses } from '../../lib/permissions'
import type { Expense, FuelLog, Vehicle, VehicleStats } from '../../types'

export default function FuelExpenseManagement() {
  const { setIsMobileMenuOpen } = useOutletContext<{ setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>> }>()
  const { user } = useAuth()
  const canLogFuelWrite = canLogFuel(user?.role)
  const canExpenseWrite = canManageExpenses(user?.role)

  // Filters State
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [efficiencyRows, setEfficiencyRows] = useState<VehicleStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [isFuelDrawerOpen, setIsFuelDrawerOpen] = useState(false)
  const [fuelVehicleId, setFuelVehicleId] = useState('')
  const [fuelLiters, setFuelLiters] = useState('')
  const [fuelCost, setFuelCost] = useState('')
  const [fuelDate, setFuelDate] = useState('')
  const [fuelFormError, setFuelFormError] = useState('')
  const [isSubmittingFuel, setIsSubmittingFuel] = useState(false)

  const [isExpenseDrawerOpen, setIsExpenseDrawerOpen] = useState(false)
  const [expenseVehicleId, setExpenseVehicleId] = useState('')
  const [expenseType, setExpenseType] = useState('Toll')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseDetail, setExpenseDetail] = useState('')
  const [expenseDate, setExpenseDate] = useState('')
  const [expenseFormError, setExpenseFormError] = useState('')
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false)

  const fetchAll = async () => {
    setIsLoading(true)
    setLoadError('')
    try {
      const [v, f, e] = await Promise.all([
        listVehicles({ limit: 100 }),
        listFuelLogs({ vehicleId: selectedVehicleId || undefined, limit: 100, sortBy: 'date', sortOrder: 'desc' }),
        listExpenses({ vehicleId: selectedVehicleId || undefined, limit: 100, sortBy: 'date', sortOrder: 'desc' }),
      ])
      setVehicles(v.vehicles)
      setFuelLogs(f.fuelLogs)
      setExpenses(e.expenses)

      const statsTargets = v.vehicles.slice(0, 10)
      const stats = await Promise.all(statsTargets.map((veh) => getVehicleStats(veh.id).catch(() => null)))
      setEfficiencyRows(stats.filter((s): s is VehicleStats => s !== null))
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load fuel & expense data'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilterApply = () => {
    fetchAll()
  }

  const inDateRange = (dateStr: string) => {
    const d = new Date(dateStr).getTime()
    if (fromDate && d < new Date(fromDate).getTime()) return false
    if (toDate && d > new Date(toDate).getTime() + 24 * 60 * 60 * 1000) return false
    return true
  }

  const filteredFuelLogs = fuelLogs.filter((log) => {
    if (!inDateRange(log.date)) return false
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      return log.vehicle.registrationNumber.toLowerCase().includes(q) || log.vehicle.name.toLowerCase().includes(q)
    }
    return true
  })

  const filteredExpenses = expenses.filter((exp) => {
    if (!inDateRange(exp.date)) return false
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      return exp.vehicle.registrationNumber.toLowerCase().includes(q) || exp.type.toLowerCase().includes(q) || (exp.description ?? '').toLowerCase().includes(q)
    }
    return true
  })

  const totalFuelLiters = useMemo(() => filteredFuelLogs.reduce((s, f) => s + f.liters, 0), [filteredFuelLogs])
  const totalFuelCost = useMemo(() => filteredFuelLogs.reduce((s, f) => s + f.cost, 0), [filteredFuelLogs])
  const totalOtherCost = useMemo(() => filteredExpenses.reduce((s, e) => s + e.amount, 0), [filteredExpenses])

  const openFuelDrawer = () => {
    setFuelVehicleId('')
    setFuelLiters('')
    setFuelCost('')
    setFuelDate('')
    setFuelFormError('')
    setIsFuelDrawerOpen(true)
  }

  const handleLogFuel = async (e: React.FormEvent) => {
    e.preventDefault()
    setFuelFormError('')
    if (!fuelVehicleId || !fuelLiters || !fuelCost) {
      setFuelFormError('Please select a vehicle and enter liters and cost.')
      return
    }
    setIsSubmittingFuel(true)
    try {
      await createFuelLog({
        vehicleId: fuelVehicleId,
        liters: Number(fuelLiters),
        cost: Number(fuelCost),
        date: fuelDate || undefined,
      })
      setIsFuelDrawerOpen(false)
      fetchAll()
    } catch (err) {
      setFuelFormError(getApiErrorMessage(err, 'Failed to log fuel record'))
    } finally {
      setIsSubmittingFuel(false)
    }
  }

  const openExpenseDrawer = () => {
    setExpenseVehicleId('')
    setExpenseType('Toll')
    setExpenseAmount('')
    setExpenseDetail('')
    setExpenseDate('')
    setExpenseFormError('')
    setIsExpenseDrawerOpen(true)
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    setExpenseFormError('')
    if (!expenseVehicleId || !expenseAmount) {
      setExpenseFormError('Please select a vehicle and enter an amount.')
      return
    }
    setIsSubmittingExpense(true)
    try {
      await createExpense({
        vehicleId: expenseVehicleId,
        type: expenseType,
        amount: Number(expenseAmount),
        description: expenseDetail.trim() || undefined,
        date: expenseDate || undefined,
      })
      setIsExpenseDrawerOpen(false)
      fetchAll()
    } catch (err) {
      setExpenseFormError(getApiErrorMessage(err, 'Failed to add expense'))
    } finally {
      setIsSubmittingExpense(false)
    }
  }

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
      </header>

      {/* CONTENT CANVAS */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface font-headline-lg">Fuel &amp; Expense Management</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body-md">Audit fuel logs, calculate asset efficiency, and record general operational expenses</p>
          </div>
          <div className="flex gap-3">
            {canLogFuelWrite && (
            <button
              onClick={openFuelDrawer}
              className="bg-white border border-black/5 text-on-surface px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-black/5 transition-all flex items-center gap-2 shadow-sm uppercase tracking-wider cursor-pointer font-sans"
            >
              <span className="material-symbols-outlined text-[16px] text-on-surface">local_gas_station</span>
              Log Fuel
            </button>
            )}
            {canExpenseWrite && (
            <button
              onClick={openExpenseDrawer}
              className="bg-background text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-lg uppercase tracking-wider cursor-pointer font-sans"
            >
              <span className="material-symbols-outlined text-[16px] text-white">add_circle</span>
              Add Expense
            </button>
            )}
          </div>
        </div>

        {loadError && (
          <div className="bg-error-red/10 border border-error-red/20 text-error-red text-sm rounded-xl px-4 py-3">{loadError}</div>
        )}

        {/* Filters Panel */}
        <div className="bg-white p-5 rounded-2xl flex flex-wrap gap-4 items-end shadow-sm border border-black/[0.01] font-body-sm text-sm">
          <div className="flex-1 min-w-[180px] space-y-1">
            <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider font-label-sm">Asset Unit</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full bg-dashboard-canvas/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-success-green outline-none cursor-pointer"
            >
              <option value="">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.registrationNumber} ({v.name})</option>
              ))}
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
            <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider font-label-sm">Search</label>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dashboard-canvas/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-success-green outline-none"
              placeholder="Search registration, type..."
              type="text"
            />
          </div>
          <button
            onClick={handleFilterApply}
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
              <span className="text-[10px] font-bold uppercase tracking-wider font-label-sm">Total Fuel Logged</span>
              <span className="material-symbols-outlined text-industrial-blue">local_gas_station</span>
            </div>
            <p className="text-2xl font-bold font-mono text-on-surface">{totalFuelLiters.toLocaleString()} L</p>
          </div>
          <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-28 border-l-4 border-l-success-green">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="text-[10px] font-bold uppercase tracking-wider font-label-sm">Total Fuel Cost</span>
              <span className="material-symbols-outlined text-success-green">payments</span>
            </div>
            <p className="text-2xl font-bold font-mono text-on-surface">₹{totalFuelCost.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-black/5 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-28 border-l-4 border-l-safety-orange">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="text-[10px] font-bold uppercase tracking-wider font-label-sm">Other Expenses</span>
              <span className="material-symbols-outlined text-safety-orange">receipt_long</span>
            </div>
            <p className="text-2xl font-bold font-mono text-on-surface">₹{totalOtherCost.toLocaleString()}</p>
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
                  {isLoading ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center font-sans text-on-surface-variant">Loading...</td></tr>
                  ) : filteredFuelLogs.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center font-sans text-on-surface-variant">No fuel logs match these filters.</td></tr>
                  ) : (
                    filteredFuelLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-blue-50/10 transition-colors">
                        <td className="px-6 py-4 font-sans">
                          <span className="font-bold text-on-surface block">{log.vehicle.registrationNumber}</span>
                          <span className="text-[10px] text-on-surface-variant font-sans font-medium">{log.vehicle.name}</span>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant font-sans">{new Date(log.date).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-bold text-on-surface">{log.liters.toLocaleString()} L</td>
                        <td className="px-6 py-4 text-right font-bold text-on-surface">₹{log.cost.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
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
              {isLoading ? (
                <p className="text-center text-on-surface-variant py-6">Loading...</p>
              ) : filteredExpenses.length === 0 ? (
                <p className="text-center text-on-surface-variant py-6">No expenses match these filters.</p>
              ) : (
                filteredExpenses.map((expense) => (
                  <div key={expense.id} className="flex justify-between items-start pb-4 border-b border-gray-50 last:border-none last:pb-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface font-mono">{expense.vehicle.registrationNumber}</span>
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-amber-50 text-safety-orange border border-safety-orange/10">
                          {expense.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed font-sans">
                        {expense.description || expense.type} • {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-bold text-on-surface font-mono shrink-0">₹{expense.amount.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Fuel Efficiency Index */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-black/5 bg-gray-50/50">
            <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider font-headline-sm">Fuel Efficiency Index (all-time, top 10 vehicles)</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-body-md border-collapse">
              <thead className="bg-dashboard-canvas text-on-surface-variant text-[11px] uppercase tracking-wider font-label-sm">
                <tr>
                  <th className="px-6 py-3 font-bold border-b border-black/5">Vehicle Unit</th>
                  <th className="px-6 py-3 font-bold border-b border-black/5 text-right">Distance</th>
                  <th className="px-6 py-3 font-bold border-b border-black/5 text-right">Fuel Cost</th>
                  <th className="px-6 py-3 font-bold border-b border-black/5 text-right">Efficiency</th>
                  <th className="px-6 py-3 font-bold border-b border-black/5 text-right">Cost Per Km</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-mono font-medium text-on-surface">
                {efficiencyRows.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center font-sans text-on-surface-variant">No data yet.</td></tr>
                ) : (
                  efficiencyRows.map((eff) => (
                    <tr key={eff.vehicleId} className="hover:bg-blue-50/10 transition-colors">
                      <td className="px-6 py-4 font-bold text-industrial-blue">{eff.registrationNumber}</td>
                      <td className="px-6 py-4 text-right font-bold text-on-surface">{eff.totalDistance.toLocaleString()} km</td>
                      <td className="px-6 py-4 text-right font-bold text-on-surface">₹{eff.totalFuelCost.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-bold text-on-surface">{eff.fuelEfficiency} km/L</td>
                      <td className="px-6 py-4 text-right font-bold text-on-surface">
                        {eff.totalDistance > 0 ? `₹${(eff.totalFuelCost / eff.totalDistance).toFixed(2)} / km` : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* LOG FUEL DRAWER */}
      {isFuelDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex justify-end animate-fade-in" onClick={() => setIsFuelDrawerOpen(false)}>
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-black/5 animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-base font-bold text-on-surface font-headline-sm">Log Fuel</h3>
              <button onClick={() => setIsFuelDrawerOpen(false)} className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <form onSubmit={handleLogFuel} className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
              {fuelFormError && <div className="bg-error-red/10 border border-error-red/20 text-error-red text-xs rounded-xl px-4 py-3">{fuelFormError}</div>}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Vehicle</label>
                <select value={fuelVehicleId} onChange={(e) => setFuelVehicleId(e.target.value)} className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 rounded-xl outline-none cursor-pointer">
                  <option value="">Select vehicle...</option>
                  {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber} ({v.name})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Liters</label>
                  <input value={fuelLiters} onChange={(e) => setFuelLiters(e.target.value)} type="number" className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 rounded-xl outline-none font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Cost (₹)</label>
                  <input value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} type="number" className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 rounded-xl outline-none font-mono" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Date (optional, defaults to now)</label>
                <input value={fuelDate} onChange={(e) => setFuelDate(e.target.value)} type="date" className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 rounded-xl outline-none" />
              </div>
              <div className="pt-6 border-t border-black/5 flex gap-4">
                <button type="button" onClick={() => setIsFuelDrawerOpen(false)} className="flex-1 px-4 py-3 border border-black/5 rounded-xl font-bold text-on-surface hover:bg-dashboard-canvas transition-all uppercase tracking-wider text-xs cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmittingFuel} className="flex-1 px-4 py-3 bg-background text-white rounded-xl font-bold hover:opacity-90 transition-all uppercase tracking-wider text-xs cursor-pointer shadow-md disabled:opacity-60">
                  {isSubmittingFuel ? 'Saving...' : 'Log Fuel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD EXPENSE DRAWER */}
      {isExpenseDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex justify-end animate-fade-in" onClick={() => setIsExpenseDrawerOpen(false)}>
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-black/5 animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-base font-bold text-on-surface font-headline-sm">Add Expense</h3>
              <button onClick={() => setIsExpenseDrawerOpen(false)} className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
              {expenseFormError && <div className="bg-error-red/10 border border-error-red/20 text-error-red text-xs rounded-xl px-4 py-3">{expenseFormError}</div>}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Vehicle</label>
                <select value={expenseVehicleId} onChange={(e) => setExpenseVehicleId(e.target.value)} className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 rounded-xl outline-none cursor-pointer">
                  <option value="">Select vehicle...</option>
                  {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber} ({v.name})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Category</label>
                  <select value={expenseType} onChange={(e) => setExpenseType(e.target.value)} className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 rounded-xl outline-none cursor-pointer">
                    <option>Toll</option>
                    <option>Admin</option>
                    <option>Maintenance</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Amount (₹)</label>
                  <input value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} type="number" className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 rounded-xl outline-none font-mono" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Description (optional)</label>
                <input value={expenseDetail} onChange={(e) => setExpenseDetail(e.target.value)} className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 rounded-xl outline-none" placeholder="e.g. Expressway toll" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Date (optional, defaults to now)</label>
                <input value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} type="date" className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 rounded-xl outline-none" />
              </div>
              <div className="pt-6 border-t border-black/5 flex gap-4">
                <button type="button" onClick={() => setIsExpenseDrawerOpen(false)} className="flex-1 px-4 py-3 border border-black/5 rounded-xl font-bold text-on-surface hover:bg-dashboard-canvas transition-all uppercase tracking-wider text-xs cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmittingExpense} className="flex-1 px-4 py-3 bg-background text-white rounded-xl font-bold hover:opacity-90 transition-all uppercase tracking-wider text-xs cursor-pointer shadow-md disabled:opacity-60">
                  {isSubmittingExpense ? 'Saving...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
