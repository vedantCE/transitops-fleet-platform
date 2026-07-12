interface RelatedVehicle {
  id: string
  registrationNumber: string
  name: string
}

interface RelatedTrip {
  id: string
  source: string
  destination: string
}

export interface FuelLog {
  id: string
  vehicleId: string
  tripId: string | null
  liters: number
  cost: number
  date: string
  createdAt: string
  vehicle: RelatedVehicle
  trip: RelatedTrip | null
}

export interface FuelLogInput {
  vehicleId: string
  tripId?: string
  liters: number
  cost: number
  date?: string
}

export interface Expense {
  id: string
  vehicleId: string
  tripId: string | null
  type: string
  amount: number
  description: string | null
  date: string
  createdAt: string
  vehicle: RelatedVehicle
  trip: RelatedTrip | null
}

export interface ExpenseInput {
  vehicleId: string
  tripId?: string
  type: string
  amount: number
  description?: string
  date?: string
}
