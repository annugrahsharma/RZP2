import { useState, useMemo } from 'react'
import { gateways, merchants } from '../../data/kamMockData'
import { useApprovals } from '../../context/ApprovalContext'
import PendingApprovalBanner from './PendingApprovalBanner'

// ── Collect all unique values from merchant gatewayMetrics ──
function collectTerminalCapabilities() {
  const capMap = {}
  // seed from gateways
  for (const gw of gateways) {
    for (const t of gw.terminals) {
      capMap[t.id] = {
        id: t.id,
        displayId: t.terminalId,
        gatewayId: gw.id,
        gatewayName: gw.name,
        gatewayShort: gw.shortName,
        method: t.method,
        successRate: t.successRate,
        costPerTxn: t.costPerTxn,
        isZeroCost: t.isZeroCost,
        bankStatus: t.bankStatus || 'active',
        bankStatusReason: t.bankStatusReason || null,
        // capability fields – aggregate from merchants
        supportedNetworks: new Set(),
        supportedIssuers: new Set(),
        supportedCardTypes: new Set(),
        supportedUPIFlows: new Set(),
        supportedVPAHandles: new Set(),
        supportsRecurring: false,
        supportedNBBanks: new Set(),
        merchantCount: 0,
        merchantNames: [],
      }
    }
  }
  // aggregate from merchants
  for (const m of merchants) {
    if (!m.gatewayMetrics) continue
    for (const gm of m.gatewayMetrics) {
      const cap = capMap[gm.terminalId]
      if (!cap) continue
      cap.merchantCount++
      if (!cap.merchantNames.includes(m.name)) cap.merchantNames.push(m.name)
      if (gm.supportedNetworks) gm.supportedNetworks.forEach(n => cap.supportedNetworks.add(n))
      if (gm.supportedIssuers) gm.supportedIssuers.forEach(n => cap.supportedIssuers.add(n))
      if (gm.supportedCardTypes) gm.supportedCardTypes.forEach(n => cap.supportedCardTypes.add(n))
      if (gm.supportedUPIFlows) gm.supportedUPIFlows.forEach(n => cap.supportedUPIFlows.add(n))
      if (gm.supportedVPAHandles) gm.supportedVPAHandles.forEach(n => cap.supportedVPAHandles.add(n))
      if (gm.supportsRecurring) cap.supportsRecurring = true
      if (gm.supportedNBBanks) gm.supportedNBBanks.forEach(n => cap.supportedNBBanks.add(n))
    }
  }
  return Object.values(capMap).map(c => ({
    ...c,
    supportedNetworks: [...c.supportedNetworks],
    supportedIssuers: [...c.supportedIssuers],
    supportedCardTypes: [...c.supportedCardTypes],
    supportedUPIFlows: [...c.supportedUPIFlows],
    supportedVPAHandles: [...c.supportedVPAHandles],
    supportedNBBanks: [...c.supportedNBBanks],
  }))
}

const ALL_NETWORKS = ['Visa', 'Mastercard', 'RuPay', 'Amex', 'Maestro', 'Diners']
const ALL_CARD_TYPES = ['credit', 'debit', 'prepaid']
const ALL_ISSUERS = ['ALL', 'HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'Yes Bank', 'IndusInd', 'Federal', 'RBL', 'IDFC', 'Bandhan', 'Punjab National', 'Bank of Baroda', 'Canara', 'Union Bank']
const ALL_UPI_FLOWS = ['Collect', 'Intent', 'QR']

// ── Pill / Tag component ──
function Tag({ label, active, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 10px', fontSize: 11, fontWeight: 500,
        borderRadius: 12,
        border: active ? 'none' : '1px solid #d1d5db',
        background: active ? (color || '#3b82f6') : 'transparent',
        color: active ? 'white' : '#6b7280',
        cursor: 'pointer', transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

// ── Editable row for one terminal ──
function TerminalRow({ terminal, onUpdate, expanded, onToggleExpand, onRequestDisable }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null)

  const startEdit = () => {
    setDraft({
      supportedNetworks: [...terminal.supportedNetworks],
      supportedIssuers: [...terminal.supportedIssuers],
      supportedCardTypes: [...terminal.supportedCardTypes],
      supportedUPIFlows: [...terminal.supportedUPIFlows],
      supportedVPAHandles: [...terminal.supportedVPAHandles],
      supportsRecurring: terminal.supportsRecurring,
      supportedNBBanks: [...terminal.supportedNBBanks],
    })
    setEditing(true)
  }

  const toggleInDraft = (field, value) => {
    setDraft(prev => {
      const arr = [...prev[field]]
      const idx = arr.indexOf(value)
      if (idx >= 0) arr.splice(idx, 1)
      else arr.push(value)
      return { ...prev, [field]: arr }
    })
  }

  const saveEdit = () => {
    onUpdate(terminal.id, draft)
    setEditing(false)
    setDraft(null)
  }

  const cancelEdit = () => {
    setEditing(false)
    setDraft(null)
  }

  const isCards = terminal.method === 'Cards'
  const isUPI = terminal.method === 'UPI'
  const isNB = terminal.method === 'NB'
  const isDisabled = terminal.bankStatus === 'disabled'

  return (
    <div style={{
      border: '1px solid #e5e7eb', borderRadius: 10, marginBottom: 10,
      background: isDisabled ? '#fafafa' : 'white',
      opacity: isDisabled ? 0.7 : 1,
      overflow: 'hidden',
    }}>
      {/* Header row */}
      <div
        onClick={onToggleExpand}
        style={{
          display: 'grid',
          gridTemplateColumns: '200px 100px 90px 80px 1fr 120px',
          alignItems: 'center',
          padding: '12px 16px',
          cursor: 'pointer',
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1f2937' }}>{terminal.displayId}</div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>{terminal.gatewayName}</div>
        </div>
        <div>
          <span style={{
            display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
            background: isCards ? '#eff6ff' : isUPI ? '#f0fdf4' : '#faf5ff',
            color: isCards ? '#1e40af' : isUPI ? '#166534' : '#7e22ce',
          }}>
            {terminal.method}
          </span>
        </div>
        <div style={{ fontSize: 12, color: terminal.successRate >= 72 ? '#166534' : '#92400e' }}>
          {terminal.successRate}%
        </div>
        <div style={{ fontSize: 12, color: terminal.isZeroCost ? '#166534' : '#374151' }}>
          {terminal.isZeroCost ? 'Free' : `₹${terminal.costPerTxn}`}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {isCards && terminal.supportedNetworks.map(n => (
            <span key={n} style={{ padding: '2px 6px', fontSize: 10, background: '#f3f4f6', borderRadius: 4, color: '#374151' }}>{n}</span>
          ))}
          {isUPI && terminal.supportedUPIFlows.map(f => (
            <span key={f} style={{ padding: '2px 6px', fontSize: 10, background: '#f0fdf4', borderRadius: 4, color: '#166534' }}>{f}</span>
          ))}
          {isNB && (
            <span style={{ padding: '2px 6px', fontSize: 10, background: '#faf5ff', borderRadius: 4, color: '#7e22ce' }}>
              {terminal.supportedNBBanks.includes('ALL') ? 'All Banks' : `${terminal.supportedNBBanks.length} banks`}
            </span>
          )}
          {isDisabled && (
            <span style={{ padding: '2px 6px', fontSize: 10, background: '#fef2f2', borderRadius: 4, color: '#991b1b', fontWeight: 600 }}>DISABLED</span>
          )}
        </div>
        <div style={{ textAlign: 'right', fontSize: 11, color: '#9ca3af' }}>
          {terminal.merchantCount} merchant{terminal.merchantCount !== 1 ? 's' : ''}
          <span style={{ marginLeft: 6 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: '1px solid #e5e7eb', padding: 16, background: '#f9fafb' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Left: Capabilities */}
            <div>
              {isCards && (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Supported Networks
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {ALL_NETWORKS.map(n => {
                        const active = editing ? draft.supportedNetworks.includes(n) : terminal.supportedNetworks.includes(n)
                        return <Tag key={n} label={n} active={active} onClick={editing ? () => toggleInDraft('supportedNetworks', n) : undefined} color="#3b82f6" />
                      })}
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Card Types
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {ALL_CARD_TYPES.map(ct => {
                        const active = editing ? draft.supportedCardTypes.includes(ct) : terminal.supportedCardTypes.includes(ct)
                        return <Tag key={ct} label={ct} active={active} onClick={editing ? () => toggleInDraft('supportedCardTypes', ct) : undefined} color="#8b5cf6" />
                      })}
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Supported Issuers
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {ALL_ISSUERS.map(iss => {
                        const active = editing ? draft.supportedIssuers.includes(iss) : terminal.supportedIssuers.includes(iss)
                        return <Tag key={iss} label={iss} active={active} onClick={editing ? () => toggleInDraft('supportedIssuers', iss) : undefined} color="#059669" />
                      })}
                    </div>
                  </div>
                </>
              )}
              {isUPI && (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      UPI Flows
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {ALL_UPI_FLOWS.map(f => {
                        const active = editing ? draft.supportedUPIFlows.includes(f) : terminal.supportedUPIFlows.includes(f)
                        return <Tag key={f} label={f} active={active} onClick={editing ? () => toggleInDraft('supportedUPIFlows', f) : undefined} color="#059669" />
                      })}
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Recurring Support
                    </div>
                    <Tag
                      label={editing ? (draft.supportsRecurring ? 'Yes' : 'No') : (terminal.supportsRecurring ? 'Yes' : 'No')}
                      active={editing ? draft.supportsRecurring : terminal.supportsRecurring}
                      onClick={editing ? () => setDraft(prev => ({ ...prev, supportsRecurring: !prev.supportsRecurring })) : undefined}
                      color="#059669"
                    />
                  </div>
                </>
              )}
              {isNB && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Supported Banks
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {['ALL', 'SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Yes Bank', 'Punjab National', 'Bank of Baroda', 'Canara', 'Union Bank'].map(b => {
                      const active = editing ? draft.supportedNBBanks.includes(b) : terminal.supportedNBBanks.includes(b)
                      return <Tag key={b} label={b} active={active} onClick={editing ? () => toggleInDraft('supportedNBBanks', b) : undefined} color="#7e22ce" />
                    })}
                  </div>
                </div>
              )}
            </div>
            {/* Right: Merchants + status */}
            <div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Active on Merchants ({terminal.merchantCount})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {terminal.merchantNames.map(name => (
                    <span key={name} style={{ padding: '3px 8px', fontSize: 10, background: '#eff6ff', borderRadius: 4, color: '#1e40af', fontWeight: 500 }}>{name}</span>
                  ))}
                </div>
              </div>
              {isDisabled && terminal.bankStatusReason && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px', fontSize: 11, color: '#991b1b', marginBottom: 12 }}>
                  <strong>Disabled:</strong> {terminal.bankStatusReason}
                </div>
              )}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Terminal Status
                </div>
                <span style={{
                  padding: '3px 10px', fontSize: 11, borderRadius: 4, fontWeight: 600,
                  background: isDisabled ? '#fef2f2' : '#f0fdf4',
                  color: isDisabled ? '#991b1b' : '#166534',
                }}>
                  {isDisabled ? 'Disabled' : 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Pending approval banner */}
          <PendingApprovalBanner terminalId={terminal.id} actionType="disable_terminal" />

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
            {!editing ? (
              <>
                <button
                  onClick={startEdit}
                  style={{
                    padding: '6px 16px', fontSize: 12, fontWeight: 600, borderRadius: 6,
                    border: '1px solid #3b82f6', background: 'transparent', color: '#3b82f6',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  Edit Capabilities
                </button>
                {!isDisabled && (
                  <button
                    onClick={() => onRequestDisable(terminal)}
                    style={{
                      padding: '6px 16px', fontSize: 12, fontWeight: 600, borderRadius: 6,
                      border: '1px solid #dc2626', background: 'transparent', color: '#dc2626',
                      cursor: 'pointer', transition: 'all 0.15s', marginLeft: 'auto',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                      </svg>
                      Disable Terminal
                    </span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={saveEdit}
                  style={{
                    padding: '6px 16px', fontSize: 12, fontWeight: 600, borderRadius: 6,
                    border: 'none', background: '#3b82f6', color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Save Changes
                </button>
                <button
                  onClick={cancelEdit}
                  style={{
                    padding: '6px 16px', fontSize: 12, fontWeight: 600, borderRadius: 6,
                    border: '1px solid #d1d5db', background: 'transparent', color: '#6b7280',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ──
export default function TerminalConfig() {
  const [terminals, setTerminals] = useState(() => collectTerminalCapabilities())
  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState('All')
  const [gatewayFilter, setGatewayFilter] = useState('All')
  const [expandedId, setExpandedId] = useState(null)
  const [saveToast, setSaveToast] = useState(null)
  const { requestApproval, pendingCount } = useApprovals()

  const handleRequestDisable = async (terminal) => {
    // Calculate estimated daily txn volume based on merchant count
    const estTxnPerMerchant = 300
    const estRevenuePerTxn = 1500
    const dailyTxn = terminal.merchantCount * estTxnPerMerchant
    const dailyRevenue = dailyTxn * estRevenuePerTxn

    const result = await requestApproval(
      {
        type: 'disable_terminal',
        terminalId: terminal.id,
        terminalDisplayId: terminal.displayId,
        gatewayName: terminal.gatewayName,
        method: terminal.method,
      },
      {
        merchantCount: terminal.merchantCount,
        merchantNames: terminal.merchantNames.slice(0, 8),
        estimatedTxnVolume: `~${dailyTxn.toLocaleString()} txn/day`,
        estimatedRevenue: `₹${(dailyRevenue / 100000).toFixed(1)}L/day`,
      }
    )

    if (result.submitted) {
      setSaveToast(`Approval request ${result.approvalId} submitted`)
      setTimeout(() => setSaveToast(null), 3000)
    }
  }

  const uniqueGateways = useMemo(() => [...new Set(terminals.map(t => t.gatewayShort))], [terminals])
  const methods = ['All', 'Cards', 'UPI', 'NB']

  const filtered = useMemo(() => {
    return terminals.filter(t => {
      if (methodFilter !== 'All' && t.method !== methodFilter) return false
      if (gatewayFilter !== 'All' && t.gatewayShort !== gatewayFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (!t.displayId.toLowerCase().includes(q) && !t.gatewayName.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [terminals, methodFilter, gatewayFilter, search])

  const handleUpdate = (terminalId, updates) => {
    setTerminals(prev => prev.map(t => t.id === terminalId ? { ...t, ...updates } : t))
    setSaveToast(`Updated ${terminalId}`)
    setTimeout(() => setSaveToast(null), 2500)
  }

  // Stats
  const totalTerminals = terminals.length
  const cardTerminals = terminals.filter(t => t.method === 'Cards').length
  const upiTerminals = terminals.filter(t => t.method === 'UPI').length
  const nbTerminals = terminals.filter(t => t.method === 'NB').length
  const disabledCount = terminals.filter(t => t.bankStatus === 'disabled').length

  return (
    <div style={{ padding: '0 0 40px 0' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          Terminal Configuration
        </h2>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0 30px' }}>
          View and edit terminal capabilities — supported networks, issuers, card types, and UPI flows across all gateways.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Terminals', value: totalTerminals, color: '#3b82f6' },
          { label: 'Cards', value: cardTerminals, color: '#1e40af' },
          { label: 'UPI', value: upiTerminals, color: '#166534' },
          { label: 'Net Banking', value: nbTerminals, color: '#7e22ce' },
          { label: 'Disabled', value: disabledCount, color: '#991b1b' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 16px' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search terminals..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '8px 12px', fontSize: 12, border: '1px solid #d1d5db',
            borderRadius: 6, width: 240, outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 4 }}>
          {methods.map(m => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              style={{
                padding: '6px 14px', fontSize: 11, fontWeight: 600, borderRadius: 6,
                border: methodFilter === m ? 'none' : '1px solid #d1d5db',
                background: methodFilter === m ? '#3b82f6' : 'transparent',
                color: methodFilter === m ? 'white' : '#6b7280',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {m}
            </button>
          ))}
        </div>
        <select
          value={gatewayFilter}
          onChange={e => setGatewayFilter(e.target.value)}
          style={{
            padding: '7px 10px', fontSize: 12, border: '1px solid #d1d5db',
            borderRadius: 6, background: 'white', color: '#374151', cursor: 'pointer',
          }}
        >
          <option value="All">All Gateways</option>
          {uniqueGateways.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#9ca3af' }}>
          {filtered.length} of {totalTerminals} terminals
        </div>
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '200px 100px 90px 80px 1fr 120px',
        padding: '8px 16px',
        fontSize: 10,
        fontWeight: 600,
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        gap: 12,
      }}>
        <span>Terminal</span>
        <span>Method</span>
        <span>Success Rate</span>
        <span>Cost/Txn</span>
        <span>Capabilities</span>
        <span style={{ textAlign: 'right' }}>Merchants</span>
      </div>

      {/* Terminal rows */}
      {filtered.map(t => (
        <TerminalRow
          key={t.id}
          terminal={t}
          onUpdate={handleUpdate}
          expanded={expandedId === t.id}
          onToggleExpand={() => setExpandedId(expandedId === t.id ? null : t.id)}
          onRequestDisable={handleRequestDisable}
        />
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 13 }}>
          No terminals match your filters.
        </div>
      )}

      {/* Save toast */}
      {saveToast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: '#166534', color: 'white',
          padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.5" fill="none"/>
            <path d="M5 8.5l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {saveToast}
        </div>
      )}
    </div>
  )
}
