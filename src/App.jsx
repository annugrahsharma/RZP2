import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Onboarding from './components/onboarding/Onboarding'
import Dashboard from './components/dashboard/Dashboard'
import { OnboardingProvider } from './context/OnboardingContext'
import { KAMProvider } from './context/KAMContext'
import KAMLayout from './components/kam/KAMLayout'
import KAMOverview from './components/kam/KAMOverview'
import KAMMerchantTable from './components/kam/KAMMerchantTable'
import KAMMerchantDetail from './components/kam/KAMMerchantDetail'
import './styles/App.css'

// Wrapper component for onboarding with provider
function OnboardingWrapper() {
  return (
    <OnboardingProvider>
      <Onboarding />
    </OnboardingProvider>
  )
}

function MobileLayout() {
  return (
    <div className="app-container">
      <div className="mobile-frame">
        <Outlet />
      </div>
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/kam" element={<KAMProvider><KAMLayout /></KAMProvider>}>
          <Route index element={<KAMOverview />} />
          <Route path="merchants" element={<KAMMerchantTable />} />
          <Route path="merchant/:merchantId" element={<KAMMerchantDetail />} />
        </Route>
        <Route element={<MobileLayout />}>
          <Route path="/" element={<Navigate to="/kam" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<OnboardingWrapper />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
