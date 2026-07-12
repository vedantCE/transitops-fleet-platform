import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './features/authentication/Login'
import Dashboard from './features/dashboard/Dashboard'
import FleetRegistry from './features/fleet/FleetRegistry'
import TripManagement from './features/trips/TripManagement'
import MaintenanceManagement from './features/maintenance/MaintenanceManagement'
import FuelExpenseManagement from './features/expenses/FuelExpenseManagement'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/fleet" element={<FleetRegistry />} />
        <Route path="/trips" element={<TripManagement />} />
        <Route path="/maintenance" element={<MaintenanceManagement />} />
        <Route path="/expenses" element={<FuelExpenseManagement />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
