import { useLocation } from 'react-router-dom'

function getPageTitle(pathname) {
  if (pathname === '/kam' || pathname === '/kam/') return 'Overview'
  if (pathname === '/kam/merchants') return 'Merchants'
  if (pathname === '/kam/terminals') return 'Terminal Configuration'
  if (pathname === '/kam/approvals') return 'Approvals'
  if (pathname.startsWith('/kam/merchant/')) return 'Merchant Detail'
  return 'Dashboard'
}

export default function KAMTopbar() {
  const location = useLocation()
  const title = getPageTitle(location.pathname)

  return (
    <header className="kam-topbar">
      <h1 className="kam-topbar-title">{title}</h1>
      <div className="kam-topbar-actions">
        <button className="kam-topbar-icon" aria-label="Notifications">
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 004 15h14a1 1 0 00.707-1.707L17 11.586V8a6 6 0 00-6-6z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 15v1a2 2 0 104 0v-1"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="kam-topbar-badge">3</span>
        </button>
      </div>
    </header>
  )
}
