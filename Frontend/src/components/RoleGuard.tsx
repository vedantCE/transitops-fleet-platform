import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types/auth'

interface RoleGuardProps {
  allow: (role?: UserRole) => boolean
}

export default function RoleGuard({ allow }: RoleGuardProps) {
  const { user } = useAuth()

  if (!allow(user?.role)) {
    return <Navigate to="/restricted" replace />
  }

  return <Outlet />
}
