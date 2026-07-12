import { api } from '../lib/api'
import type { CompleteTripInput, ListParams, Pagination, Trip, TripInput, TripStatus } from '../types'

export interface TripListParams extends ListParams {
  status?: TripStatus
  vehicleId?: string
  driverId?: string
}

export async function listTrips(
  params: TripListParams = {}
): Promise<{ trips: Trip[]; pagination: Pagination }> {
  const res = await api.get('/trips', { params })
  return res.data.data
}

export async function getTrip(id: string): Promise<Trip> {
  const res = await api.get(`/trips/${id}`)
  return res.data.data.trip
}

export async function createTrip(input: TripInput): Promise<Trip> {
  const res = await api.post('/trips', input)
  return res.data.data.trip
}

export async function dispatchTrip(id: string): Promise<Trip> {
  const res = await api.patch(`/trips/${id}/dispatch`)
  return res.data.data.trip
}

export async function completeTrip(id: string, input: CompleteTripInput): Promise<Trip> {
  const res = await api.patch(`/trips/${id}/complete`, input)
  return res.data.data.trip
}

export async function cancelTrip(id: string): Promise<Trip> {
  const res = await api.patch(`/trips/${id}/cancel`)
  return res.data.data.trip
}

export async function deleteTrip(id: string): Promise<void> {
  await api.delete(`/trips/${id}`)
}
