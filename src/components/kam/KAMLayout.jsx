import { Outlet } from 'react-router-dom'
import KAMSidebar from './KAMSidebar'
import KAMTopbar from './KAMTopbar'
import { useKAM } from '../../context/KAMContext'

import '../../styles/kam.css'
import '../../styles/kam-components.css'
import '../../styles/kam-overview.css'
import '../../styles/kam-table.css'
import '../../styles/kam-modals.css'
import '../../styles/kam-detail.css'

export default function KAMLayout() {
  const { toast } = useKAM()

  return (
    <div className="kam-layout">
      <KAMSidebar />
      <div className="kam-main">
        <KAMTopbar />
        <div className="kam-content">
          <Outlet />
        </div>
      </div>
      {toast && (
        <div className={`kam-toast ${toast.type}`}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path
              d="M5.5 9.5l2 2 5-5"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {toast.message}
        </div>
      )}
    </div>
  )
}
