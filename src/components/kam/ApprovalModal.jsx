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
  
 "‡ecturn (
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
  
 "‡ecturn (
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
  
 "‡e`´urn RISK ASSESSMENT
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
  
 "‡e`´urn (JSX)