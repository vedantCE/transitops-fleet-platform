import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './features/authentication/Login'
import Dashboard from './features/dashboard/Dashboard'
import FleetRegistry from './features/fleet/FleetRegistry'
import VehicleDetailsScreen from './features/fleet/VehicleDetailsScreen'
import TripManagement from './features/trips/TripManagement'
import TripDetailsScreen from './features/trips/TripDetailsScreen'
import MaintenanceManagement from './features/maintenance/MaintenanceManagement'
import MaintenanceDetailsScreen from './features/maintenance/MaintenanceDetailsScreen'
import FuelExpenseManagement from './features/expenses/FuelExpenseManagement'
import AnalyticsScreen from './features/analytics/AnalyticsScreen'
import SettingsScreen from './features/settings/SettingsScreen'
import DriversScreen from './features/drivers/DriversScreen'
import DriverDetailsScreen from './features/drivers/DriverDetailsScreen'
import AccessRestrictedScreen from './features/restricted/AccessRestrictedScreen'
import SearchResultsScreen from './features/search/SearchResultsScreen'
import PageNotFoundScreen from './features/errors/PageNotFoundScreen'
import MainLayout from './components/MainLayout'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/restricted" element={<AccessRestrictedScreen />} />
        
        {/* Layout Wrapped Routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/fleet" element={<FleetRegistry />} />
          <Route path="/fleet/:vehicleId" element={<VehicleDetailsScreen />} />
          <Route path="/trips" element={<TripManagement />} />
          <Route path="/trips/:tripId" element={<TripDetailsScreen />} />
          <Route path="/maintenance" element={<MaintenanceManagement />} />
          <Route path="/maintenance/:maintenanceId" element={<MaintenanceDetailsScreen />} />
          <Route path="/expenses" element={<FuelExpenseManagement />} />
          <Route path="/analytics" element={<AnalyticsScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/drivers" element={<DriversScreen />} />
          <Route path="/drivers/:driverId" element={<DriverDetailsScreen />} />
          <Route path="/search" element={<SearchResultsScreen />} />
          <Route path="*" element={<PageNotFoundScreen />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
