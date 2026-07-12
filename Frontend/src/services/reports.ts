import { api } from '../lib/api'
import type { DashboardKpis, VehicleStats } from '../types'

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const res = await api.get('/reports/kpis')
  return res.data.data
}

export async function getVehicleStats(vehicleId: string): Promise<VehicleStats> {
  const res = await api.get(`/reports/vehicles/${vehicleId}/stats`)
  return res.data.data.stats
}

export async function downloadFleetReportCsv(): Promise<Blob> {
  const res = await api.get('/reports/export', { responseType: 'blob' })
  return res.data
}
