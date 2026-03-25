import { useState } from 'react'
import { useApprovals } from '../../context/ApprovalContext'

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const riskConfig = {
  critical: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', badge: '#dc2626', label: 'CRITICAL' },
  high: { bg: '#fff7ed', border: '#fed7aa', text: '#9a3412', badge: '#ea580c', label: 'HIGH' },
  medium: { bg: '#fefce8', border: '#fde68a', text: '#92400e', badge: '#d97706', label: 'MEDIUM' },
}

const statusConfig = {
  pending: { bg: '#fef3c7', text: '#92400e', label: 'PENDING' },
  approved: { bg: '#dcfce7', text: '#166534', label: 'APPROVED' },
  rejected: { bg: '#fef2f2', text: '#991b1b', label: 'REJECTED' },
}

const ACTION_LABELS = {
  disable_terminal: 'Disable Terminal',
  avoid_terminal: 'Avoid Terminal',
  remove_network: 'Remove Network',
  remove_issuer: 'Remove Issuer',
}

function ApprovalCard({ approval, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false)
  const [comment, setComment] = useState('')
  const [showActions, setShowActions] = useState(false)

  const rc = riskConfig[approval.riskLevel] || riskConfig.medium
  const sc = statusConfig[approval.status] || statusConfig.pending
  const isPending = approval.status === 'pending'

  return (
    <div style={{
      border: `1px solid ${isPending ? rc.border : '#e5e7eb'}`,
      borderRadius: 12, overflow: 'hidden', marginBottom: 12,
      background: 'white',
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto auto',
          alignItems: 'center',
          padding: '14px 18px',
          gap: 12,
          cursor: 'pointer',
          borderLeft: `4px solid ${isPending ? rc.badge : sc.text === '#166534' ? '#22c55e' : '#ef4444'}`,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>
              {ACTION_LABELS[approval.type]} — {approval.terminalDisplayId}
            </span>
            <span style={{
              padding: '2px 6px', borderRadius: 3, fontSize: 9, fontWeight: 700,
              background: rc.badge, color: 'white',
            }}>
              {rc.label}
            </span>
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>
            {approval.gatewayName} · {approval.method} · Requested by {approval.requestedBy.name}
          </div>
        </div>
        <span style={{
          padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
          background: sc.bg, color: sc.text,
        }}>
          {sc.label}
        </span>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>{timeAgo(approval.createdAt)}</span>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop: '1px solid #e5e7eb', padding: 18, background: '#f9fafb' }}>
          {/* Impact */}
          <div style={{
            background: rc.bg, border: `1px solid ${rc.border}`, borderRadius: 10,
            padding: 14, marginBottom: 16,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: rc.text, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
              NTF Impact Assessment
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: rc.text }}>{approval.impactSummary.merchantCount}</div>
                <div style={{ fontSize: 10, color: '#6b7280' }}>Merchants</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: rc.text }}>{approval.impactSummary.estimatedTxnVolume}</div>
                <div style={{ fontSize: 10, color: '#6b7280' }}>Daily Volume</div>
              </div>
              {approval.impactSummary.estimatedRevenue && (
                <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: rc.text }}>{approval.impactSummary.estimatedRevenue}</div>
                  <div style={{ fontSize: 10, color: '#6b7280' }}>Revenue at Risk</div>
                </div>
              )}
            </div>
            {approval.impactSummary.merchantNames && (
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {approval.impactSummary.merchantNames.map(n => (
                  <span key={n} style={{
                    padding: '2px 7px', fontSize: 10, borderRadius: 4,
                    background: 'rgba(255,255,255,0.8)', color: rc.text,
                    border: `1px solid ${rc.border}`,
                  }}>{n}</span>
                ))}
              </div>
            )}
          </div>

          {/* Reason */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Reason
            </div>
            <div style={{
              background: 'white', border: '1px solid #e5e7eb', borderRadius: 8,
              padding: 12, fontSize: 12, color: '#374151', lineHeight: 1.5,
            }}>
              {approval.reason}
            </div>
          </div>

          {/* Request details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, fontSize: 12 }}>
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>Requested By</div>
              <div style={{ fontWeight: 600, color: '#1f2937' }}>{approval.requestedBy.name}</div>
              <div style={{ color: '#6b7280', fontSize: 11 }}>{approval.requestedBy.role}</div>
            </div>
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>Assigned To</div>
              <div style={{ fontWeight: 600, color: '#1f2937' }}>{approval.assignedTo.name}</div>
              <div style={{ color: '#6b7280', fontSize: 11 }}>{approval.assignedTo.role}</div>
            </div>
          </div>

          {/* Comments */}
          {approval.comments.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Comments
              </div>
              {approval.comments.map((c, i) => (
                <div key={i} style={{
                  background: 'white', border: '1px solid #e5e7eb', borderRadius: 8,
                  padding: 10, marginBottom: 4, fontSize: 12,
                }}>
                  <span style={{ fontWeight: 600, color: '#1f2937' }}>{c.by}: </span>
                  <span style={{ color: '#374151' }}>{c.text}</span>
                  <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 8 }}>{timeAgo(c.at)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions for pending items */}
          {isPending && (
            <>
              {!showActions ? (
                <button
                  onClick={() => setShowActions(true)}
                  style={{
                    padding: '8px 20px', fontSize: 12, fontWeight: 600, borderRadius: 8,
                    border: '1px solid #3b82f6', background: 'transparent', color: '#3b82f6',
                    cursor: 'pointer',
                  }}
                >
                  Review & Decide
                </button>
              ) : (
                <div style={{
                  background: 'white', border: '1px solid #e5e7eb', borderRadius: 10,
                  padding: 16,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    Add Comment (optional)
                  </div>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Add a comment explaining your decision..."
                    rows={2}
                    style={{
                      width: '100%', padding: '8px 10px', fontSize: 12, border: '1px solid #d1d5db',
                      borderRadius: 6, resize: 'none', fontFamily: 'inherit', outline: 'none',
                      boxSizing: 'border-box', marginBottom: 12,
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => { onApprove(approval.id, comment); setShowActions(false); setComment('') }}
                      style={{
                        padding: '8px 20px', fontSize: 12, fontWeight: 600, borderRadius: 8,
                        border: 'none', background: '#22c55e', color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Approve
                    </button>
                    <button
                      onClick={() => { onReject(approval.id, comment); setShowActions(false); setComment('') }}
                      style={{
                        padding: '8px 20px', fontSize: 12, fontWeight: 600, borderRadius: 8,
                        border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      Reject
                    </button>
                    <button
                      onClick={() => setShowActions(false)}
                      style={{
                        padding: '8px 16px', fontSize: 12, fontWeight: 600, borderRadius: 8,
                        border: '1px solid #d1d5db', background: 'white', color: '#6b7280', cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function Approvals() {
  const { pendingApprovals, approveRequest, rejectRequest } = useApprovals()
  const [statusFilter, setStatusFilter] = useState('all')
  const [toast, setToast] = useState(null)

  const filtered = statusFilter === 'all'
    ? pendingApprovals
    : pendingApprovals.filter(a => a.status === statusFilter)

  const counts = {
    all: pendingApprovals.length,
    pending: pendingApprovals.filter(a => a.status === 'pending').length,
    approved: pendingApprovals.filter(a => a.status === 'approved').length,
    rejected: pendingApprovals.filter(a => a.status === 'rejected').length,
  }

  const handleApprove = (id, comment) => {
    approveRequest(id, comment)
    setToast('Approved')
    setTimeout(() => setToast(null), 2500)
  }

  const handleReject = (id, comment) => {
    rejectRequest(id, comment)
    setToast('Rejected')
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div style={{ padding: '0 0 40px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Approvals
        </h2>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0 30px' }}>
          Review and approve changes that may impact transaction flow. Critical actions require managerial sign-off before execution.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Requests', value: counts.all, color: '#3b82f6' },
          { label: 'Pending', value: counts.pending, color: '#d97706' },
          { label: 'Approved', value: counts.approved, color: '#22c55e' },
          { label: 'Rejected', value: counts.rejected, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 16px' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {['all', 'pending', 'approved', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '6px 16px', fontSize: 11, fontWeight: 600, borderRadius: 6,
              border: statusFilter === s ? 'none' : '1px solid #d1d5db',
              background: statusFilter === s ? '#3b82f6' : 'transparent',
              color: statusFilter === s ? 'white' : '#6b7280',
              cursor: 'pointer', textTransform: 'capitalize',
            }}
          >
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Approval cards */}
      {filtered.map(a => (
        <ApprovalCard key={a.id} approval={a} onApprove={handleApprove} onReject={handleReject} />
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 13 }}>
          No {statusFilter === 'all' ? '' : statusFilter} approval requests.
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24,
          background: toast === 'Approved' ? '#166534' : '#991b1b',
          color: 'white', padding: '10px 20px', borderRadius: 8,
          fontSize: 13, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999,
        }}>
          {toast === 'Approved' ? '✓' : '✕'} Request {toast.toLowerCase()}
        </div>
      )}
    </div>
  )
}
