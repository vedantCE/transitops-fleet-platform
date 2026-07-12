export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'SUSPENDED'

export interface Driver {
  id: string
  userId: string | null
  name: string
  licenseNumber: string
  licenseCategory: string
  licenseExpiryDate: string
  contactNumber: string
  safetyScore: number
  status: DriverStatus
  createdAt: string
  updatedAt: string
}

export interface DriverInput {
  name: string
  licenseNumber: string
  licenseCategory: string
  licenseExpiryDate: string
  contactNumber: string
  safetyScore?: number
  status?: 'AVAILABLE' | 'OFF_DUTY' | 'SUSPENDED'
}
