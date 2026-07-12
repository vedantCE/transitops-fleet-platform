import { api } from '../lib/api'
import type { Driver, DriverInput, DriverStatus, ListParams, Pagination } from '../types'

export interface DriverListParams extends ListParams {
  status?: DriverStatus
  licenseCategory?: string
  dispatchable?: boolean
}

export async function listDrivers(
  params: DriverListParams = {}
): Promise<{ drivers: Driver[]; pagination: Pagination }> {
  const res = await api.get('/drivers', { params })
  return res.data.data
}

export async function getDriver(id: string): Promise<Driver> {
  const res = await api.get(`/drivers/${id}`)
  return res.data.data.driver
}

export async function createDriver(input: DriverInput): Promise<Driver> {
  const res = await api.post('/drivers', input)
  return res.data.data.driver
}

export async function updateDriver(id: string, input: Partial<DriverInput>): Promise<Driver> {
  const res = await api.patch(`/drivers/${id}`, input)
  return res.data.data.driver
}

export async function deleteDriver(id: string): Promise<void> {
  await api.delete(`/drivers/${id}`)
}
