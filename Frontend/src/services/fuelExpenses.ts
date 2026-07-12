import { api } from '../lib/api'
import type { Expense, ExpenseInput, FuelLog, FuelLogInput, ListParams, Pagination } from '../types'

export interface FuelLogListParams extends ListParams {
  vehicleId?: string
  tripId?: string
}

export interface ExpenseListParams extends ListParams {
  vehicleId?: string
  tripId?: string
  type?: string
}

export async function listFuelLogs(
  params: FuelLogListParams = {}
): Promise<{ fuelLogs: FuelLog[]; pagination: Pagination }> {
  const res = await api.get('/fuel-logs', { params })
  return res.data.data
}

export async function createFuelLog(input: FuelLogInput): Promise<FuelLog> {
  const res = await api.post('/fuel-logs', input)
  return res.data.data.fuelLog
}

export async function deleteFuelLog(id: string): Promise<void> {
  await api.delete(`/fuel-logs/${id}`)
}

export async function listExpenses(
  params: ExpenseListParams = {}
): Promise<{ expenses: Expense[]; pagination: Pagination }> {
  const res = await api.get('/expenses', { params })
  return res.data.data
}

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  const res = await api.post('/expenses', input)
  return res.data.data.expense
}

export async function deleteExpense(id: string): Promise<void> {
  await api.delete(`/expenses/${id}`)
}
