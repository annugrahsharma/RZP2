import { NavLink } from 'react-router-dom'
import { kamProfile } from '../../data/kamMockData'

export default function KAMSidebar() {
  return (
    <aside className="kam-sidebar">
      <div className="kam-sidebar-brand">
        <svg
          className="kam-sidebar-logo"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 2L4 8v8c0 7.2 5.1 13.9 12 16 6.9-2.1 12-8.8 12-16V8L16 2z"
            fill="#3395FF"
          />
          <path
            d="M16 6l-8 4v5.3c0 5.1 3.4 9.8 8 11.4 4.6-1.6 8-6.3 8-11.4V10l-8-4z"
            fill="#fff"
            fillOpacity="0.2"
          />
          <path
            d="M14 14l-2 2 4 4 6-8-2-1.5L16 16l-2-2z"
            fill="#fff"
          />
        </svg>
        <div className="kam-sidebar-brand-text">
          <span className="kam-sidebar-brand-name">Razorpay</span>
          <span className="kam-sidebar-brand-sub">KAM Dashboard</span>
        </div>
      </div>

      <nav className="kam-sidebar-nav">
        <NavLink
          to="/kam"
          end
          className={({ isActive }) =>
            `kam-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor" />
            <rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor" />
            <rect x="2" y="11" width="7" height="7" rx="1.5" fill="currentColor" />
            <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor" />
          </svg>
          Overview
        </NavLink>
        <NavLink
          to="/kam/merchants"
          className={({ isActive }) =>
            `kam-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 4a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V4zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm8-8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V4z"
              fill="currentColor"
            />
            <circle cx="14" cy="14" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M7 18c0-2.2 1.8-4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="7" cy="10" r="0" fill="currentColor" />
            <path
              d="M10 17a5 5 0 00-7 0"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="6.5" cy="13.5" r="2" fill="currentColor" />
            <circle cx="13.5" cy="13.5" r="2" fill="currentColor" />
          </svg>
          Merchants
        </NavLink>
      </nav>

      <div className="kam-sidebar-profile">
        <div className="kam-sidebar-avatar">
          {kamProfile.avatarInitials}
        </div>
        <div className="kam-sidebar-profile-info">
          <span className="kam-sidebar-profile-name">{kamProfile.name}</span>
          <span className="kam-sidebar-profile-role">{kamProfile.role}</span>
        </div>
      </div>
    </aside>
  )
}
