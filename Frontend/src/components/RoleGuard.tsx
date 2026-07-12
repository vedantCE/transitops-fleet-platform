import { Navigate, Outlet, useOutletContext } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types/auth'

interface RoleGuardProps {
  allow: (role?: UserRole) => boolean
}

export default function RoleGuard({ allow }: RoleGuardProps) {
  const { user } = useAuth()
  const outletContext = useOutletContext()

  if (!allow(user?.role)) {
    return <Navigate to="/restricted" replace />
  }

  return <Outlet context={outletContext} />
}
