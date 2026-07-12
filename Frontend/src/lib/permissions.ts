import type { UserRole } from '../types/auth'

// Mirrors the backend's actual RBAC restrictTo(...) calls exactly — every
// role can read everything (all GET endpoints are open to any authenticated
// user), so these only gate write actions (create/update/delete/transition).
export const canManageVehicles = (role?: UserRole) => role === 'FLEET_MANAGER'
export const canManageDrivers = (role?: UserRole) => role === 'FLEET_MANAGER' || role === 'SAFETY_OFFICER'
export const canManageTrips = (role?: UserRole) => role === 'DRIVER' || role === 'FLEET_MANAGER'
export const canManageMaintenance = (role?: UserRole) => role === 'FLEET_MANAGER'
export const canLogFuel = (role?: UserRole) => role === 'FLEET_MANAGER' || role === 'DRIVER'
export const canDeleteFuel = (role?: UserRole) => role === 'FLEET_MANAGER'
export const canManageExpenses = (role?: UserRole) => role === 'FLEET_MANAGER' || role === 'FINANCIAL_ANALYST'
export const canExportReports = (role?: UserRole) => role === 'FLEET_MANAGER' || role === 'FINANCIAL_ANALYST'

// Safety Officers are focused on driver compliance and have no business
// need to see fuel spend or maintenance records, so those modules are
// hidden from them entirely (not just write-protected).
export const canViewMaintenance = (role?: UserRole) => role !== 'SAFETY_OFFICER'
export const canViewFuel = (role?: UserRole) => role !== 'SAFETY_OFFICER'
