export type UserRole = 'FLEET_MANAGER' | 'DRIVER' | 'SAFETY_OFFICER' | 'FINANCIAL_ANALYST'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
}
