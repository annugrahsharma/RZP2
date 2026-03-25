import { useApprovals } from '../../context/ApprovalContext'

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function PendingApprovalBanner({ terminalId, actionType }) {
  const { getApprovalForTerminal } = useApprovals()
  const approval = getApprovalForTerminal(terminalId, actionType)

  if (!approval) return null

  return (
    <div style={{
      background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8,
      padding: '10px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 7, background: '#fef3c7',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>
          Pending Approval
          <span style={{ fontWeight: 400, color: '#b45309', marginLeft: 6 }}>#{approval.id}</span>
        </div>
        <div style={{ fontSize: 11, color: '#92400e', marginTop: 2 }}>
          Awaiting approval from <strong>{approval.assignedTo.name}</strong> · Submitted {timeAgo(approval.createdAt)}
        </div>
      </div>
      <span style={{
        padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
        background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a',
      }}>
        PENDING
      </span>
    </div>
  )
}
