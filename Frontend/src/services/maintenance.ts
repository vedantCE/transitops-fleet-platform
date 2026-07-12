import { api } from '../lib/api'
import type { ListParams, MaintenanceInput, MaintenanceLog, MaintenanceStatus, Pagination } from '../types'

export interface MaintenanceListParams extends ListParams {
  status?: MaintenanceStatus
  vehicleId?: string
}

export async function listMaintenanceLogs(
  params: MaintenanceListParams = {}
): Promise<{ maintenanceLogs: MaintenanceLog[]; pagination: Pagination }> {
  const res = await api.get('/maintenance', { params })
  return res.data.data
}

export async function getMaintenanceLog(id: string): Promise<MaintenanceLog> {
  const res = await api.get(`/maintenance/${id}`)
  return res.data.data.maintenanceLog
}

export async function createMaintenanceLog(input: MaintenanceInput): Promise<MaintenanceLog> {
  const res = await api.post('/maintenance', input)
  return res.data.data.maintenanceLog
}

export async function closeMaintenanceLog(id: string): Promise<MaintenanceLog> {
  const res = await api.patch(`/maintenance/${id}/close`)
  return res.data.data.maintenanceLog
}
