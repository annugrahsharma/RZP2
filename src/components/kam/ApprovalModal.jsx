import { useState } from 'react'
import { useApprovals } from '../../context/ApprovalContext'

const riskColors = {
  critical: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', badge: '#dc2626', label: 'CRITICAL' },
  high: { bg: '#fff7ed', border: '#fed7aa', text: '#9a3412', badge: '#ea580c', label: 'HIGH' },
  medium: { bg: '#fefce8', border: '#fde68a', text: '#92400e', badge: '#d97706', label: 'MEDIUM' },
}

function ImpactCard({ impact, riskLevel }) {
  const rc = riskColors[riskLevel] || riskColors.medium
  return (
    <div style={{
      background: rc.bg, border: `1px solid ${rc.border}`, borderRadius: 10,
      padding: 16, marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={rc.badge} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span style={{ fontSize: 12, fontWeight: 700, color: rc.text, letterSpacing: 0.5 }}>
          NTF RISK ASSESSMENT
        </span>
        <span style={{
          marginLeft: 'auto', padding: '2px 8px', borderRadius: 4,
          background: rc.badge, color: 'white', fontSize: 10, fontWeight: 700,
        }}>
          {rc.label}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: rc.text }}>{impact.merchantCount}</div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>Merchants Affected</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: rc.text }}>{impact.estimatedTxnVolume}</div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>Daily Txn Volume</div>
        </div>
      </div>

      {impact.estimatedRevenue && (
        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: 12, marginTop: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: rc.text }}>{impact.estimatedRevenue}</div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>Estimated Daily Revenue at Risk</div>
        </div>
      )}

      {impact.merchantNames && impact.merchantNames.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: 6 }}>
            Affected Merchants
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {impact.merchantNames.map(name => (
              <span key={name} style={{
                padding: '3px 8px', fontSize: 10, background: 'rgba(255,255,255,0.8)',
                borderRadius: 4, color: rc.text, fontWeight: 500, border: `1px solid ${rc.border}`,
              }}>{name}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const ACTION_LABELS = {
  disable_terminal: 'Disable Terminal',
  avoid_terminal: 'Avoid Terminal in Routing',
  remove_network: 'Remove Network Support',
  remove_issuer: 'Remove Issuer Support',
}

export default function ApprovalModal() {
  const { approvalModal, managers } = useApprovals()
  const [reason, setReason] = useState('')
  const [managerId, setManagerId] = useState(managers[0]?.id || '')
  const [error, setError] = useState('')

  if (!approvalModal) return null

  const { action, impact, onConfirm, onCancel } = approvalModal
  const riskLevel = action.type === 'disable_terminal' ? 'critical' : action.type === 'avoid_terminal' ? 'high' : 'medium'

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for this change')
      return
    }
    if (!managerId) {
      setError('Please select an approving manager')
      return
    }
    onConfirm(reason.trim(), managerId)
    setReason('')
    setManagerId(managers[0]?.id || '')
    setError('')
  }

  const handleCancel = () => {
    setReason('')
    setManagerId(managers[0]?.id || '')
    setError('')
    onCancel()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'white', borderRadius: 14, width: 520, maxHeight: '85vh',
        overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px', borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: riskLevel === 'critical' ? '#fef2f2' : '#fff7ed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={riskLevel === 'critical' ? '#dc2626' : '#ea580c'} strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1f2937' }}>Manager Approval Required</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              {ACTION_LABELS[action.type] || action.type} — {action.terminalDisplayId || action.terminalId}
            </div>
          </div>
          <button
            onClick={handleCancel}
            style={{
              marginLeft: 'auto', width: 28, height: 28, borderRadius: 6,
              border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: '#6b7280',
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          {/* Action summary */}
          <div style={{
            background: '#f9fafb', borderRadius: 8, padding: 12, marginBottom: 16,
            border: '1px solid #e5e7eb',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
              <div>
                <span style={{ color: '#6b7280' }}>Terminal: </span>
                <span style={{ fontWeight: 600, color: '#1f2937' }}>{action.terminalDisplayId || action.terminalId}</span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Gateway: </span>
                <span style={{ fontWeight: 600, color: '#1f2937' }}>{action.gatewayName}</span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Method: </span>
                <span style={{ fontWeight: 600, color: '#1f2937' }}>{action.method}</span>
              </div>
              <div>
                <span style={{ color: '#6b7280' }}>Action: </span>
                <span style={{ fontWeight: 600, color: riskLevel === 'critical' ? '#dc2626' : '#ea580c' }}>
                  {ACTION_LABELS[action.type]}
                </span>
              </div>
            </div>
          </div>

          {/* NTF Impact Assessment */}
          <ImpactCard impact={impact} riskLevel={riskLevel} />

          {/* Reason field */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Reason for Change <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => { setReason(e.target.value); setError('') }}
              placeholder="Explain why this change is needed and what mitigation steps are in place..."
              rows={3}
              style={{
                width: '100%', padding: '10px 12px', fontSize: 12, border: '1px solid #d1d5db',
                borderRadius: 8, resize: 'vertical', fontFamily: 'inherit', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Manager selection */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Approving Manager <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {managers.map(m => (
                <label key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                  borderRadius: 8, border: managerId === m.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  background: managerId === m.id ? '#eff6ff' : 'white', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}>
                  <input
                    type="radio"
                    name="manager"
                    checked={managerId === m.id}
                    onChange={() => setManagerId(m.id)}
                    style={{ accentColor: '#3b82f6' }}
                  />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>{m.name}</div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>{m.role}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px', marginBottom: 16, fontSize: 12, color: '#dc2626' }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid #e5e7eb',
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '8px 20px', fontSize: 12, fontWeight: 600, borderRadius: 8,
              border: '1px solid #d1d5db', background: 'white', color: '#374151', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: '8px 20px', fontSize: 12, fontWeight: 600, borderRadius: 8,
              border: 'none', background: '#f59e0b', color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Submit for Approval
          </button>
        </div>
      </div>
    </div>
  )
}
