import { useEffect, useMemo, useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { listVehicles, createVehicle } from '../../services/vehicles'
import { getApiErrorMessage } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { canManageVehicles } from '../../lib/permissions'
import type { Vehicle, VehicleStatus } from '../../types'

const STATUS_LABELS: Record<VehicleStatus, string> = {
  AVAILABLE: 'Available',
  ON_TRIP: 'On Trip',
  IN_SHOP: 'In Shop',
  RETIRED: 'Retired',
}

const STATUS_BY_LABEL: Record<string, VehicleStatus> = {
  Available: 'AVAILABLE',
  'On Trip': 'ON_TRIP',
  'In Shop': 'IN_SHOP',
  Retired: 'RETIRED',
}

export default function FleetRegistry() {
  const { setIsMobileMenuOpen } = useOutletContext<{ setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>> }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canWrite = canManageVehicles(user?.role)

  // Fleet drawer open/close
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All Types')
  const [statusFilter, setStatusFilter] = useState('All Status')

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // Add Vehicle Form States
  const [newRegNumber, setNewRegNumber] = useState('')
  const [newType, setNewType] = useState('Van')
  const [newModel, setNewModel] = useState('')
  const [newCapacity, setNewCapacity] = useState('')
  const [newOdometer, setNewOdometer] = useState('')
  const [newCost, setNewCost] = useState('')
  const [newRegion, setNewRegion] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchVehicles = async () => {
    setIsLoading(true)
    setLoadError('')
    try {
      const { vehicles: data, pagination } = await listVehicles({
        limit: 100,
        search: searchQuery.trim() || undefined,
        type: vehicleTypeFilter !== 'All Types' ? vehicleTypeFilter : undefined,
        status: statusFilter !== 'All Status' ? STATUS_BY_LABEL[statusFilter] : undefined,
      })
      setVehicles(data)
      setTotal(pagination.total)
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Failed to load vehicles'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Vehicle type is free text on the backend, so the filter's options are
  // derived from whatever is actually in the loaded data rather than a
  // fixed guess list.
  const availableTypes = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.type))).sort(),
    [vehicles]
  )

  const handleFilterApply = () => {
    fetchVehicles()
  }

  const handleRegisterVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!newRegNumber || !newModel) {
      setFormError('Please fill out all required fields.')
      return
    }

    setIsSubmitting(true)
    try {
      await createVehicle({
        registrationNumber: newRegNumber.toUpperCase(),
        name: newModel,
        type: newType,
        maxLoadCapacity: Number(newCapacity) || 0,
        odometer: newOdometer ? Number(newOdometer) : 0,
        acquisitionCost: Number(newCost) || 0,
        region: newRegion.trim() || undefined,
      })

      setIsDrawerOpen(false)
      setNewRegNumber('')
      setNewType('Van')
      setNewModel('')
      setNewCapacity('')
      setNewOdometer('')
      setNewCost('')
      setNewRegion('')
      fetchVehicles()
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to register vehicle'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Top Nav inside Main Content */}
      <header className="h-16 flex justify-between items-center px-6 md:px-8 shrink-0 border-b border-black/5 bg-white/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button className="md:hidden text-on-surface p-1 hover:bg-black/5 rounded" onClick={() => setIsMobileMenuOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-on-surface font-headline-sm">Fleet Registry</h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-black/5 transition-all relative">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-error-red rounded-full border border-dashboard-canvas"></div>
          </button>
          <button className="p-2 rounded-full hover:bg-black/5 transition-all">
            <span className="material-symbols-outlined text-on-surface-variant">help_outline</span>
          </button>
          <div className="h-6 w-[1px] bg-outline-variant mx-2 hidden sm:block"></div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-on-surface-variant font-body-md uppercase tracking-wider">Ops Command</p>
          </div>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
        {/* Header Description & Action */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-on-surface font-headline-lg">Fleet Registry</h2>
            <p className="text-sm text-on-surface-variant mt-1 font-body-md">Register, track and manage the organization's transport assets.</p>
          </div>
          {canWrite && (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="bg-background text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-lg cursor-pointer uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Asset
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-5 rounded-2xl flex flex-wrap gap-4 items-end shadow-sm border border-black/[0.01] font-body-sm text-sm">
          <div className="flex-1 min-w-[200px] space-y-1">
            <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider font-label-sm">Search</label>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dashboard-canvas/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-success-green outline-none"
              placeholder="Search Reg Number or Model..."
              type="text"
            />
          </div>
          <div className="flex-1 min-w-[150px] space-y-1">
            <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider font-label-sm">Vehicle Type</label>
            <select
              value={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
              className="w-full bg-dashboard-canvas/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-success-green outline-none cursor-pointer"
            >
              <option>All Types</option>
              {availableTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px] space-y-1">
            <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider font-label-sm">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-dashboard-canvas/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-success-green outline-none cursor-pointer"
            >
              <option>All Status</option>
              <option>Available</option>
              <option>On Trip</option>
              <option>In Shop</option>
              <option>Retired</option>
            </select>
          </div>
          <button
            onClick={handleFilterApply}
            className="bg-on-background text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filter
          </button>
        </div>

        {loadError && (
          <div className="bg-error-red/10 border border-error-red/20 text-error-red text-sm rounded-xl px-4 py-3">
            {loadError}
          </div>
        )}

        {/* Vehicle Registry Grid */}
        <div className="bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-body-md border-collapse">
              <thead className="bg-dashboard-canvas text-on-surface-variant text-[11px] uppercase tracking-wider font-label-sm">
                <tr>
                  <th className="px-6 py-4 font-bold border-b border-black/5">Reg Number</th>
                  <th className="px-6 py-4 font-bold border-b border-black/5">Model</th>
                  <th className="px-6 py-4 font-bold border-b border-black/5">Type</th>
                  <th className="px-6 py-4 font-bold border-b border-black/5 text-right">Capacity</th>
                  <th className="px-6 py-4 font-bold border-b border-black/5 text-right">Odometer</th>
                  <th className="px-6 py-4 font-bold border-b border-black/5 text-right">Cost Value</th>
                  <th className="px-6 py-4 font-bold border-b border-black/5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-mono font-medium text-on-surface">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-on-surface-variant font-sans">
                      Loading vehicles...
                    </td>
                  </tr>
                ) : vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-on-surface-variant font-sans">
                      No vehicles match these filters.
                    </td>
                  </tr>
                ) : (
                  vehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="hover:bg-blue-50/10 transition-colors cursor-pointer"
                      onClick={() => navigate(`/fleet/${vehicle.id}`)}
                    >
                      <td className="px-6 py-4 font-sans font-bold text-on-surface">{vehicle.registrationNumber}</td>
                      <td className="px-6 py-4 font-sans text-on-surface-variant">{vehicle.name}</td>
                      <td className="px-6 py-4 font-sans">{vehicle.type}</td>
                      <td className="px-6 py-4 text-right">{vehicle.maxLoadCapacity.toLocaleString()} kg</td>
                      <td className="px-6 py-4 text-right">{vehicle.odometer.toLocaleString()} km</td>
                      <td className="px-6 py-4 text-right text-on-surface font-sans">₹{vehicle.acquisitionCost.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center font-sans">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                          vehicle.status === 'AVAILABLE'
                            ? 'bg-green-50 text-success-green border-success-green/10'
                            : vehicle.status === 'ON_TRIP'
                              ? 'bg-blue-50 text-industrial-blue border-industrial-blue/10'
                              : vehicle.status === 'IN_SHOP'
                                ? 'bg-amber-50 text-safety-orange border-safety-orange/10'
                                : 'bg-red-50 text-error-red border-error-red/10'
                        }`}>
                          {STATUS_LABELS[vehicle.status]}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Table Footer */}
          <div className="bg-white p-4 flex justify-between items-center text-[10px] font-bold text-on-surface-variant border-t border-black/5 font-label-sm">
            <p className="uppercase">Showing {vehicles.length} of {total} assets</p>
          </div>
        </div>
      </div>

      {/* DRAWER FOR REGISTERING VEHICLE */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex justify-end animate-fade-in" onClick={() => setIsDrawerOpen(false)}>
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-black/5 animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-base font-bold text-on-surface font-headline-sm">Register Fleet Asset</h3>
                <p className="text-xs text-on-surface-variant font-body-sm mt-0.5 font-medium">Add a new transport asset to registry</p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Drawer Body Form */}
            <form onSubmit={handleRegisterVehicle} className="flex-1 overflow-y-auto p-6 space-y-6 font-body-sm text-sm">
              {formError && (
                <div className="bg-error-red/10 border border-error-red/20 text-error-red text-xs rounded-xl px-4 py-3">
                  {formError}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Registration Number</label>
                <input
                  value={newRegNumber}
                  onChange={(e) => setNewRegNumber(e.target.value)}
                  className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 focus:ring-1 focus:ring-industrial-blue rounded-xl outline-none"
                  placeholder="e.g. GJ05AB1234"
                  type="text"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Model</label>
                  <input
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 focus:ring-1 focus:ring-industrial-blue rounded-xl outline-none"
                    placeholder="e.g. Tata Prima 5530.S"
                    type="text"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Asset Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2.5 border border-black/5 bg-dashboard-canvas/40 focus:ring-1 focus:ring-industrial-blue rounded-xl outline-none cursor-pointer"
                  >
                    <option>Van</option>
                    <option>Truck</option>
                    <option>Mini Truck</option>
                    <option>Pickup</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Capacity (kg)</label>
                  <input
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 focus:ring-1 focus:ring-industrial-blue rounded-xl outline-none"
                    placeholder="e.g. 5000"
                    type="number"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Odometer Reading (km)</label>
                  <input
                    value={newOdometer}
                    onChange={(e) => setNewOdometer(e.target.value)}
                    className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 focus:ring-1 focus:ring-industrial-blue rounded-xl outline-none"
                    placeholder="e.g. 10000"
                    type="number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Asset Cost (INR)</label>
                  <input
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 focus:ring-1 focus:ring-industrial-blue rounded-xl outline-none"
                    placeholder="e.g. 1500000"
                    type="number"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Region</label>
                  <input
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 focus:ring-1 focus:ring-industrial-blue rounded-xl outline-none"
                    placeholder="e.g. West"
                    type="text"
                  />
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-6 border-t border-black/5 flex gap-4 bg-white mt-8">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 px-4 py-3 border border-black/5 rounded-xl font-bold text-on-surface hover:bg-dashboard-canvas transition-all uppercase tracking-wider text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-background text-white rounded-xl font-bold hover:opacity-90 transition-all uppercase tracking-wider text-xs cursor-pointer shadow-md disabled:opacity-60"
                >
                  {isSubmitting ? 'Registering...' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
