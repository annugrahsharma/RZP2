import React, { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { merchants as allMerchantsData, gateways, generateSeedRules } from '../../data/kamMockData'

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

export default function KAMAgentView() {
  const { merchantId } = useParams()

  const merchant = useMemo(
    () => allMerchantsData.find(m => m.id === merchantId),
    [merchantId]
  )

  const rules = useMemo(
    () => (merchant ? generateSeedRules(merchant) : []),
    [merchant]
  )

  const terminalCount = merchant?.gatewayMetrics?.length || 0
  const activeRuleCount = rules.filter(r => r.enabled && !r.isDefault && !r.isMethodDefault).length
  const dealLabel = merchant?.dealType === 'tsp' ? 'TSP' : merchant?.dealType === 'offer_linked' ? 'Offer-linked' : 'Standard'

  if (!merchant) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
        <h3>Merchant not found</h3>
        <Link to="/kam/merchants" style={{ color: '#528FF0' }}>Back to Merchants</Link>
      </div>
    )
  }

  // Build the Thesys agent URL with merchant context
  const agentUrl = `https://app.thesys.dev/app/embed/cm8obofvx00u0jn01g16uv9qg`

  return (
    <div className="kam-agent-view">
      {/* Minimal header */}
      <div className="kam-agent-header">
        <div className="kam-agent-header-left">
          <Link to={`/kam/merchant/${merchantId}`} className="kam-agent-back">
            <ArrowLeftIcon />
            <span>Back to Classic View</span>
          </Link>
          <div className="kam-agent-title">
            <h2>{merchant.name}</h2>
            <span className="kam-agent-mid">{merchant.mid}</span>
          </div>
        </div>
      </div>

      {/* Context banner */}
      <div className="kam-agent-banner">
        <div className="kam-agent-stat">
          <span className="kam-agent-stat-label">Terminals</span>
          <span className="kam-agent-stat-value">{terminalCount}</span>
        </div>
        <div className="kam-agent-stat-divider" />
        <div className="kam-agent-stat">
          <span className="kam-agent-stat-label">Active Rules</span>
          <span className="kam-agent-stat-value">{activeRuleCount}</span>
        </div>
        <div className="kam-agent-stat-divider" />
        <div className="kam-agent-stat">
          <span className="kam-agent-stat-label">Deal Type</span>
          <span className={`kam-badge ${merchant.dealType === 'tsp' ? 'deal-tsp' : merchant.dealType === 'offer_linked' ? 'deal-offer' : 'neutral'}`}>
            {dealLabel}
          </span>
        </div>
        <div className="kam-agent-stat-divider" />
        <div className="kam-agent-stat">
          <span className="kam-agent-stat-label">Avg SR</span>
          <span className="kam-agent-stat-value">{merchant.avgPaymentSuccessRate}%</span>
        </div>
        <div className="kam-agent-stat-divider" />
        <div className="kam-agent-stat">
          <span className="kam-agent-stat-label">Strategy</span>
          <span className="kam-agent-stat-value" style={{ fontSize: 13 }}>
            {merchant.routingStrategy === 'success_rate' ? 'SR Optimised' : 'Cost Optimised'}
          </span>
        </div>
      </div>

      {/* Agent iframe */}
      <div className="kam-agent-iframe-container">
        <iframe
          src={agentUrl}
          title={`AI Agent — ${merchant.name}`}
          className="kam-agent-iframe"
          allow="clipboard-write"
        />
      </div>

      <style>{`
        .kam-agent-view {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #f9fafb;
          overflow: hidden;
        }

        .kam-agent-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          background: #fff;
          border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .kam-agent-header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .kam-agent-back {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #528FF0;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          background: #fff;
          transition: background 0.15s;
        }

        .kam-agent-back:hover {
          background: #f3f4f6;
        }

        .kam-agent-title {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }

        .kam-agent-title h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .kam-agent-mid {
          font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
          font-size: 12px;
          color: #6b7280;
          background: #f3f4f6;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .kam-agent-banner {
          display: flex;
          align-items: center;
          gap: 0;
          padding: 10px 24px;
          background: #fff;
          border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0;
        }

        .kam-agent-stat {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 20px;
        }

        .kam-agent-stat:first-child {
          padding-left: 0;
        }

        .kam-agent-stat-divider {
          width: 1px;
          height: 24px;
          background: #e5e7eb;
        }

        .kam-agent-stat-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .kam-agent-stat-value {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .kam-agent-iframe-container {
          flex: 1;
          min-height: 0;
          padding: 0;
        }

        .kam-agent-iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }
      `}</style>
    </div>
  )
}
