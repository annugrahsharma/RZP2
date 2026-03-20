import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKAM } from '../../context/KAMContext'
import { formatINR, formatNumber } from '../../data/kamMockData'

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function KAMOverview() {
  const {
    targetData,
    retentionRisks, nrOpportunities,
  } = useKAM()
  const navigate = useNavigate()

  // Derive current month label like "Mar'26" and last year "Mar'25"
  const monthLabels = useMemo(() => {
    const now = new Date()
    const m = MONTH_SHORT[now.getMonth()]
    const y = String(now.getFullYear()).slice(2)
    const yPrev = String(now.getFullYear() - 1).slice(2)
    return { current: `${m}'${y}`, lastYear: `${m}'${yPrev}` }
  }, [])

  return (
    <>
      {/* Page Header */}
      <div className="kam-page-header">
        <h2>Dashboard Overview</h2>
        <p>Monitor your enterprise merchant portfolio and revenue targets</p>
      </div>

      {/* Wallet Share Risk */}
      {retentionRisks.length > 0 && (
        <div className="kam-card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="kam-card-header">
            <h3 className="kam-card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--rzp-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="18" y1="8" x2="23" y2="13" />
                <line x1="23" y1="8" x2="18" y2="13" />
              </svg>
              Wallet Share Risk
            </h3>
            <span className="kam-badge danger">{retentionRisks.length} at risk</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--rzp-text-secondary)', marginBottom: 12, fontFamily: 'var(--font-secondary)' }}>
            Merchants with significant YoY transaction volume decline — potential wallet share risk
          </div>
          {retentionRisks.map((risk) => (
            <div
              key={risk.merchantId}
              className="kam-risk-row"
              onClick={() => navigate(`/kam/merchant/${risk.merchantId}`)}
            >
              <div className="kam-merchant-info">
                <span className="name">
                  {risk.merchantName}
                  {risk.srSensitive && (
                    <span className="kam-badge-sr" style={{ marginLeft: 6 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      SR
                    </span>
                  )}
                </span>
              </div>
              <div className="kam-risk-stats">
                <div className="stat-item">
                  <span className="stat-label">YoY Change</span>
                  <span className="stat-value negative">{risk.yoyChange}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{monthLabels.current}</span>
                  <span className="stat-value">{formatNumber(risk.currentVolume)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">{monthLabels.lastYear}</span>
                  <span className="stat-value">{formatNumber(risk.lastYearVolume)}</span>
                </div>
                <span className={`kam-badge ${risk.riskLevel === 'critical' ? 'danger' : risk.riskLevel === 'high' ? 'warning' : 'info'}`}>
                  {risk.riskLevel}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Net Revenue Opportunity */}
      {nrOpportunities.length > 0 && (
        <div className="kam-card">
          <div className="kam-card-header">
            <h3 className="kam-card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--rzp-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Net Revenue Opportunity
            </h3>
            <span className="kam-badge info">
              {formatINR(targetData.target - targetData.achieved)} remaining to {formatINR(targetData.target)} target
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--rzp-text-secondary)', marginBottom: 12, fontFamily: 'var(--font-secondary)' }}>
            Non-SR-sensitive merchants on success-rate routing — potential N/R uplift via cost routing
          </div>
          {nrOpportunities.map((opp) => (
            <div
              key={opp.merchantId}
              className="kam-risk-row"
              onClick={() => navigate(`/kam/merchant/${opp.merchantId}`)}
            >
              <div className="kam-merchant-info">
                <span className="name">{opp.merchantName}</span>
                <span className="mid">{opp.mid}</span>
              </div>
              <div className="kam-risk-stats">
                <div className="stat-item">
                  <span className="stat-label">Current N/R</span>
                  <span className="stat-value">{formatINR(opp.currentNR)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Potential N/R</span>
                  <span className="stat-value positive">{formatINR(opp.potentialNR)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Saving</span>
                  <span className="stat-value positive">+{formatINR(opp.potentialSaving)}</span>
                </div>
                <span className="kam-badge success" style={{ fontSize: 11, maxWidth: 180, whiteSpace: 'normal', textAlign: 'left', lineHeight: 1.3 }}>
                  {opp.suggestedAction}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
