import { api } from '../lib/api'
import type { ListParams, Pagination, Vehicle, VehicleInput, VehicleStatus } from '../types'

export interface VehicleListParams extends ListParams {
  status?: VehicleStatus
  type?: string
  region?: string
  dispatchable?: boolean
}

export async function listVehicles(
  params: VehicleListParams = {}
): Promise<{ vehicles: Vehicle[]; pagination: Pagination }> {
  const res = await api.get('/vehicles', { params })
  return res.data.data
}

export async function getVehicle(id: string): Promise<Vehicle> {
  const res = await api.get(`/vehicles/${id}`)
  return res.data.data.vehicle
}

export async function createVehicle(input: VehicleInput): Promise<Vehicle> {
  const res = await api.post('/vehicles', input)
  return res.data.data.vehicle
}

export async function updateVehicle(id: string, input: Partial<VehicleInput>): Promise<Vehicle> {
  const res = await api.patch(`/vehicles/${id}`, input)
  return res.data.data.vehicle
}

export async function deleteVehicle(id: string): Promise<void> {
  await api.delete(`/vehicles/${id}`)
}
