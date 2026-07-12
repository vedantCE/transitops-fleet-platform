import { useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'

interface Vehicle {
  registrationNumber: string
  vehicleId: string
  model: string
  type: string
  capacity: string
  odometer: string
  cost: string
  status: 'Available' | 'On Trip' | 'In Shop' | 'Retired'
}

export default function FleetRegistry() {
  const { setIsMobileMenuOpen } = useOutletContext<{ setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>> }>()
  const navigate = useNavigate()
  
  // Fleet drawer open/close
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All Types')
  const [statusFilter, setStatusFilter] = useState('All Status')

  // Mock list of vehicles matching Stitch mockup
  const initialVehicles: Vehicle[] = [
    {
      registrationNumber: 'GJ05AB1234',
      vehicleId: 'VAN-05',
      model: 'Tata Winger',
      type: 'Van',
      capacity: '500 kg',
      odometer: '74,000 km',
      cost: '₹4,00,000',
      status: 'Available',
    },
    {
      registrationNumber: 'GJ05CD5678',
      vehicleId: 'TRUCK-02',
      model: 'Tata Prima',
      type: 'Truck',
      capacity: '5,000 kg',
      odometer: '112,000 km',
      cost: '₹20,00,000',
      status: 'On Trip',
    },
    {
      registrationNumber: 'GJ05EF9012',
      vehicleId: 'ACE-05',
      model: 'Tata Ace',
      type: 'Mini Truck',
      capacity: '750 kg',
      odometer: '48,000 km',
      cost: '₹6,00,000',
      status: 'In Shop',
    },
    {
      registrationNumber: 'GJ05GH3456',
      vehicleId: 'TRK-09',
      model: 'BharatBenz 3528C',
      type: 'Truck',
      capacity: '10,000 kg',
      odometer: '98,000 km',
      cost: '₹45,00,000',
      status: 'Retired',
    },
  ]

  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles)

  // Add Vehicle Form States
  const [newRegNumber, setNewRegNumber] = useState('')
  const [newVehicleId, setNewVehicleId] = useState('')
  const [newType, setNewType] = useState('Van')
  const [newModel, setNewModel] = useState('')
  const [newCapacity, setNewCapacity] = useState('')
  const [newOdometer, setNewOdometer] = useState('')
  const [newCost, setNewCost] = useState('')

  const handleFilterApply = () => {
    let filtered = [...initialVehicles]

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        v =>
          v.registrationNumber.toLowerCase().includes(q) ||
          v.vehicleId.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q)
      )
    }

    if (vehicleTypeFilter !== 'All Types') {
      filtered = filtered.filter(
        v => v.type.toLowerCase() === vehicleTypeFilter.toLowerCase()
      )
    }

    if (statusFilter !== 'All Status') {
      filtered = filtered.filter(
        v => v.status.toLowerCase() === statusFilter.toLowerCase()
      )
    }

    setVehicles(filtered)
  }

  const handleRegisterVehicle = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newRegNumber || !newVehicleId || !newModel) {
      alert('Please fill out all required fields.')
      return
    }

    const newVehicle: Vehicle = {
      registrationNumber: newRegNumber.toUpperCase(),
      vehicleId: newVehicleId.toUpperCase(),
      model: newModel,
      type: newType,
      capacity: newCapacity ? `${newCapacity} kg` : '0 kg',
      odometer: newOdometer ? `${Number(newOdometer).toLocaleString()} km` : '0 km',
      cost: newCost ? `₹${Number(newCost).toLocaleString()}` : '₹0',
      status: 'Available',
    }

    setVehicles([newVehicle, ...vehicles])
    setIsDrawerOpen(false)

    // Reset fields
    setNewRegNumber('')
    setNewVehicleId('')
    setNewType('Van')
    setNewModel('')
    setNewCapacity('')
    setNewOdometer('')
    setNewCost('')
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
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-background text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition-all flex items-center gap-2 shadow-lg cursor-pointer uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Asset
          </button>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-5 rounded-2xl flex flex-wrap gap-4 items-end shadow-sm border border-black/[0.01] font-body-sm text-sm">
          <div className="flex-1 min-w-[200px] space-y-1">
            <label className="text-[10px] text-on-surface-variant px-1 uppercase font-bold tracking-wider font-label-sm">Search</label>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dashboard-canvas/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-success-green outline-none"
              placeholder="Search Reg, Vehicle ID, Model..."
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
              <option>Van</option>
              <option>Truck</option>
              <option>Mini Truck</option>
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

        {/* Vehicle Registry Grid */}
        <div className="bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-body-md border-collapse">
              <thead className="bg-dashboard-canvas text-on-surface-variant text-[11px] uppercase tracking-wider font-label-sm">
                <tr>
                  <th className="px-6 py-4 font-bold border-b border-black/5">Reg Number</th>
                  <th className="px-6 py-4 font-bold border-b border-black/5">Vehicle ID</th>
                  <th className="px-6 py-4 font-bold border-b border-black/5">Model</th>
                  <th className="px-6 py-4 font-bold border-b border-black/5">Type</th>
                  <th className="px-6 py-4 font-bold border-b border-black/5 text-right">Capacity</th>
                  <th className="px-6 py-4 font-bold border-b border-black/5 text-right">Odometer</th>
                  <th className="px-6 py-4 font-bold border-b border-black/5 text-right">Cost Value</th>
                  <th className="px-6 py-4 font-bold border-b border-black/5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-mono font-medium text-on-surface">
                {vehicles.map(vehicle => (
                  <tr key={vehicle.registrationNumber} className="hover:bg-blue-50/10 transition-colors cursor-pointer" onClick={() => navigate(`/fleet/${vehicle.vehicleId}`)}>
                    <td className="px-6 py-4 font-sans font-bold text-on-surface">{vehicle.registrationNumber}</td>
                    <td className="px-6 py-4 font-bold text-industrial-blue">{vehicle.vehicleId}</td>
                    <td className="px-6 py-4 font-sans text-on-surface-variant">{vehicle.model}</td>
                    <td className="px-6 py-4 font-sans">{vehicle.type}</td>
                    <td className="px-6 py-4 text-right">{vehicle.capacity}</td>
                    <td className="px-6 py-4 text-right">{vehicle.odometer}</td>
                    <td className="px-6 py-4 text-right text-on-surface font-sans">{vehicle.cost}</td>
                    <td className="px-6 py-4 text-center font-sans">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                        vehicle.status === 'Available'
                          ? 'bg-green-50 text-success-green border-success-green/10'
                          : vehicle.status === 'On Trip'
                            ? 'bg-blue-50 text-industrial-blue border-industrial-blue/10'
                            : vehicle.status === 'In Shop'
                              ? 'bg-amber-50 text-safety-orange border-safety-orange/10'
                              : 'bg-red-50 text-error-red border-error-red/10'
                      }`}>
                        {vehicle.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Table Footer */}
          <div className="bg-white p-4 flex justify-between items-center text-[10px] font-bold text-on-surface-variant border-t border-black/5 font-label-sm">
            <p className="uppercase">Showing {vehicles.length} of {vehicles.length} assets</p>
            <div className="flex gap-2 font-sans font-normal">
              <button className="px-3 py-1 border border-gray-200 rounded hover:bg-dashboard-canvas transition-colors disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 border border-transparent rounded bg-background text-white font-bold">1</button>
              <button className="px-3 py-1 border border-gray-200 rounded hover:bg-dashboard-canvas transition-colors">Next</button>
            </div>
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
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-label-sm">Vehicle ID</label>
                  <input
                    value={newVehicleId}
                    onChange={(e) => setNewVehicleId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-black/5 bg-dashboard-canvas/40 focus:ring-1 focus:ring-industrial-blue rounded-xl outline-none"
                    placeholder="e.g. VAN-06"
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
                  </select>
                </div>
              </div>
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
                  className="flex-1 px-4 py-3 bg-background text-white rounded-xl font-bold hover:opacity-90 transition-all uppercase tracking-wider text-xs cursor-pointer shadow-md"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
