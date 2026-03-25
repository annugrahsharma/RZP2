import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Onboarding from './components/onboarding/Onboarding'
import Dashboard from './components/dashboard/Dashboard'
import { OnboardingProvider } from './context/OnboardingContext'
import { KAMProvider } from './context/KAMContext'
import { ApprovalProvider } from './context/ApprovalContext'
import KAMLayout from './components/kam/KAMLayout'
import KAMOverview from './components/kam/KAMOverview'
import KAMMerchantTable from './components/kam/KAMMerchantTable'
import KAMMerchantDetail from './components/kam/KAMMerchantDetail'
import TerminalConfig from './components/kam/TerminalConfig'
import Approvals from './components/kam/Approvals'
import ApprovalModal from './components/kam/ApprovalModal'
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
      <ApprovalProvider>
        <Routes>
          <Route path="/kam" element={<KAMProvider><KAMLayout /></KAMProvider>}>
            <Route index element={<KAMOverview />} />
            <Route path="merchants" element={<KAMMerchantTable />} />
            <Route path="merchant/:merchantId" element={<KAMMerchantDetail />} />
            <Route path="terminals" element={<TerminalConfig />} />
            <Route path="approvals" element={<Approvals />} />
          </Route>
          <Route element={<MobileLayout />}>
            <Route path="/" element={<Navigate to="/kam" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<OnboardingWrapper />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
        <ApprovalModal />
      </ApprovalProvider>
    </HashRouter>
  )
}

export default App
