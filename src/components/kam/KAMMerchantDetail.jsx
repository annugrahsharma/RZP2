import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useKAM } from '../../context/KAMContext'
import {
  formatINR,
  formatNumber,
  computeMerchantRevenue,
  isTerminalZeroCost,
  computeTSPCompliance,
  computeCBROrder,
  getBackwardPricingBreakdown,
  generateMerchantTransactions,
  generateSRTimeSeries,
  generateRecommendations,
  generateSankeyData,
  RULE_CONDITIONS,
  RULE_OPERATOR_LABELS,
  AMOUNT_PRESETS,
  PAYMENT_METHOD_GROUPS,
  groupRulesByMethod,
  evaluateRules,
  detectNTFGaps,
  simulateTransaction,
  simulateRoutingPipeline,
  batchSimulatePayments,
  traceNTFRuleChain,
  getTerminalDisplayId,
  getTerminalGatewayInfo,
  parseRuleIntent,
  generateNTFAnalysis,
  computeRuleCoverageMatrix,
  transactionToSimInput,
  generateRoutingAnalysis,
  merchants as allMerchantsData,
  gateways as gatewayData,
  getPlatformRulesForMerchant,
  generateMethodExplainer,
  toCompassDocument,
  buildCompassESQuery,
  buildCompassRuntimeAnnotation,
  COMPASS_NAMESPACES,
} from '../../data/kamMockData'
import RoutingCopilot from './RoutingCopilot'
import '../../styles/routing-copilot.css'

// ---------------------------------------------------------------------------
// Deterministic pseudo-random from a string (for methods & daily volumes)
// ---------------------------------------------------------------------------
function hashStr(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0x7fffffff
  }
  return hash
}

const METHOD_MAP = {
  HDFC: 'Cards',
  ICICI: 'UPI',
  AXIS: 'Cards',
  RBL: 'NB',
  YES: 'UPI',
}

function pickMethod(terminalId) {
  const prefix = terminalId.split('_')[0]
  return METHOD_MAP[prefix] || 'UPI'
}

function pickDailyVolume(terminalId) {
  // 8L - 60L range
  const h = hashStr(terminalId + '_vol')
  return 800000 + (h % 5200000)
}

function formatLakhs(amount) {
  return '\u20B9' + (amount / 100000).toFixed(1) + 'L'
}

// ---------------------------------------------------------------------------
// Inline SVG icons
// ---------------------------------------------------------------------------
const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const TrendUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

const ActivityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
)

const DollarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const CreditCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
)

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const PercentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
)

const LayersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
)

const LightningIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

const DollarLargeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const WarningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const ChevronIcon = ({ className }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const RoutingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
)

const ServerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </svg>
)

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
)

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const ShieldAlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const AlertCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

// ---------------------------------------------------------------------------
// SR Line Chart sub-component
// ---------------------------------------------------------------------------

const SR_COLORS = {
  overall: '#528FF0',
  CC: '#E65100',
  DC: '#1565C0',
  UPI: '#2E7D32',
  NB: '#7B1FA2',
}

const METHOD_DISPLAY = {
  CC: 'Credit',
  DC: 'Debit',
  UPI: 'UPI',
  NB: 'NB',
}

function SRLineChart({ srData }) {
  const [selectedSeries, setSelectedSeries] = useState(() => new Set(['overall']))
  const [expandedMethods, setExpandedMethods] = useState(() => new Set())
  const [hoverIdx, setHoverIdx] = useState(null)

  const { dates, overall, byMethod } = srData
  const methodKeys = Object.keys(byMethod)

  // Build all visible lines with their data & color
  const visibleLines = useMemo(() => {
    const lines = []
    if (selectedSeries.has('overall')) {
      lines.push({ key: 'overall', label: 'All Methods', color: SR_COLORS.overall, data: overall })
    }
    methodKeys.forEach((m) => {
      if (selectedSeries.has(m)) {
        lines.push({ key: m, label: METHOD_DISPLAY[m] || m, color: SR_COLORS[m] || '#888', data: byMethod[m].sr })
      }
      // Terminal lines
      const terminals = byMethod[m].terminals
      Object.keys(terminals).forEach((tId) => {
        const tKey = m + ':' + tId
        if (selectedSeries.has(tKey)) {
          lines.push({ key: tKey, label: tId, color: SR_COLORS[m] || '#888', data: terminals[tId], dashed: true })
        }
      })
    })
    return lines
  }, [selectedSeries, overall, byMethod, methodKeys])

  // Compute Y-axis bounds
  const { yMin, yMax, yTicks } = useMemo(() => {
    let lo = 100, hi = 0
    visibleLines.forEach((l) => l.data.forEach((v) => { if (v < lo) lo = v; if (v > hi) hi = v }))
    if (lo === 100 && hi === 0) { lo = 85; hi = 100 } // fallback
    const padding = 2
    const rMin = Math.floor((lo - padding) / 2) * 2
    const rMax = Math.ceil((hi + padding) / 2) * 2
    const ticks = []
    for (let t = rMin; t <= rMax; t += 2) ticks.push(t)
    if (ticks.length < 3) { ticks.unshift(ticks[0] - 2); ticks.push(ticks[ticks.length - 1] + 2) }
    return { yMin: ticks[0], yMax: ticks[ticks.length - 1], yTicks: ticks }
  }, [visibleLines])

  // Chart layout constants
  const chartPadLeft = 44
  const chartPadRight = 12
  const chartPadTop = 10
  const chartPadBottom = 28
  const chartH = 280

  const toggleSeries = useCallback((key) => {
    setSelectedSeries((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }, [])

  const toggleExpand = useCallback((method) => {
    setExpandedMethods((prev) => {
      const next = new Set(prev)
      if (next.has(method)) next.delete(method); else next.add(method)
      return next
    })
  }, [])

  // Convert data point to SVG coordinates
  const toX = useCallback((i, w) => chartPadLeft + (i / (dates.length - 1)) * (w - chartPadLeft - chartPadRight), [dates.length])
  const toY = useCallback((v) => chartPadTop + ((yMax - v) / (yMax - yMin)) * (chartH - chartPadTop - chartPadBottom), [yMin, yMax])

  // Build polyline points string
  const buildPoints = useCallback((data, w) => data.map((v, i) => `${toX(i, w)},${toY(v)}`).join(' '), [toX, toY])

  // Build area path (fill under line)
  const buildArea = useCallback((data, w) => {
    const bottom = chartH - chartPadBottom
    const pts = data.map((v, i) => `${toX(i, w)},${toY(v)}`)
    return `M${toX(0, w)},${bottom} L${pts.join(' L')} L${toX(data.length - 1, w)},${bottom} Z`
  }, [toX, toY])

  // SVG ref for measuring width
  const [svgWidth, setSvgWidth] = useState(600)
  const svgRef = useCallback((node) => {
    if (node) {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) setSvgWidth(entry.contentRect.width)
      })
      ro.observe(node)
      setSvgWidth(node.getBoundingClientRect().width)
    }
  }, [])

  // Hover handling
  const handleMouseMove = useCallback((e) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const dataAreaStart = chartPadLeft
    const dataAreaEnd = svgWidth - chartPadRight
    if (mouseX < dataAreaStart || mouseX > dataAreaEnd) { setHoverIdx(null); return }
    const ratio = (mouseX - dataAreaStart) / (dataAreaEnd - dataAreaStart)
    const idx = Math.round(ratio * (dates.length - 1))
    setHoverIdx(Math.max(0, Math.min(dates.length - 1, idx)))
  }, [svgWidth, dates.length])

  const handleMouseLeave = useCallback(() => setHoverIdx(null), [])

  // Format date for display
  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="kam-sr-chart-card">
      <div className="kam-sr-chart-card-header">
        <h3 className="kam-sr-chart-card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Success Rate Trend
        </h3>
        <span className="kam-sr-chart-period">Last 30 days</span>
      </div>

      <div className="kam-sr-chart-body">
        {/* ── Sidebar ── */}
        <div className="kam-sr-chart-sidebar">
          {/* All Methods */}
          <label className="kam-sr-method-item overall">
            <input type="checkbox" checked={selectedSeries.has('overall')} onChange={() => toggleSeries('overall')} />
            <span className="kam-sr-color-dot" style={{ background: SR_COLORS.overall }} />
            <span className="kam-sr-method-label">All</span>
            <span className="kam-sr-method-value">{overall[overall.length - 1]}%</span>
          </label>

          {/* Per-method */}
          {methodKeys.map((m) => {
            const md = byMethod[m]
            const isExpanded = expandedMethods.has(m)
            const terminalKeys = Object.keys(md.terminals)
            return (
              <div key={m}>
                <div className="kam-sr-method-item">
                  <input type="checkbox" checked={selectedSeries.has(m)} onChange={() => toggleSeries(m)} />
                  <span className="kam-sr-color-dot" style={{ background: SR_COLORS[m] || '#888' }} />
                  <span className="kam-sr-method-label">{METHOD_DISPLAY[m] || m}</span>
                  <span className="kam-sr-method-value">{md.sr[md.sr.length - 1]}%</span>
                  {terminalKeys.length > 0 && (
                    <span className={`kam-sr-method-expand${isExpanded ? ' open' : ''}`} onClick={() => toggleExpand(m)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                    </span>
                  )}
                </div>
                <div className={`kam-sr-terminal-list ${isExpanded ? 'expanded' : 'collapsed'}`}>
                  {terminalKeys.map((tId) => {
                    const tKey = m + ':' + tId
                    const tData = md.terminals[tId]
                    return (
                      <label key={tKey} className="kam-sr-terminal-item">
                        <input type="checkbox" checked={selectedSeries.has(tKey)} onChange={() => toggleSeries(tKey)} />
                        <span className="kam-sr-color-dot" style={{ background: SR_COLORS[m] || '#888', opacity: 0.6 }} />
                        <span className="kam-sr-method-label">{tId}</span>
                        <span className="kam-sr-method-value">{tData[tData.length - 1]}%</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Chart Area ── */}
        <div className="kam-sr-chart-area">
          <svg
            ref={svgRef}
            className="kam-sr-chart-svg"
            viewBox={`0 0 ${svgWidth} ${chartH}`}
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Grid lines */}
            {yTicks.map((t) => (
              <g key={t}>
                <line
                  x1={chartPadLeft} y1={toY(t)} x2={svgWidth - chartPadRight} y2={toY(t)}
                  stroke="var(--rzp-border, #E8E8E8)" strokeDasharray="4 4" strokeWidth="1"
                />
                <text x={chartPadLeft - 6} y={toY(t) + 4} textAnchor="end" fontSize="11" fill="#888" fontFamily="inherit">
                  {t}%
                </text>
              </g>
            ))}

            {/* X-axis date labels (every 5th day) */}
            {dates.map((d, i) => (i % 5 === 0 || i === dates.length - 1) ? (
              <text key={d} x={toX(i, svgWidth)} y={chartH - 4} textAnchor="middle" fontSize="10" fill="#888" fontFamily="inherit">
                {formatDate(d)}
              </text>
            ) : null)}

            {/* Area fills */}
            {visibleLines.map((line) => (
              <path
                key={'area-' + line.key}
                d={buildArea(line.data, svgWidth)}
                fill={line.color}
                opacity={0.06}
              />
            ))}

            {/* Lines */}
            {visibleLines.map((line) => (
              <polyline
                key={'line-' + line.key}
                points={buildPoints(line.data, svgWidth)}
                fill="none"
                stroke={line.color}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={line.dashed ? '6 3' : 'none'}
              />
            ))}

            {/* Hover crosshair */}
            {hoverIdx !== null && (
              <line
                x1={toX(hoverIdx, svgWidth)} y1={chartPadTop}
                x2={toX(hoverIdx, svgWidth)} y2={chartH - chartPadBottom}
                stroke="#aaa" strokeDasharray="3 3" strokeWidth="1"
              />
            )}

            {/* Hover dots */}
            {hoverIdx !== null && visibleLines.map((line) => (
              <circle
                key={'dot-' + line.key}
                cx={toX(hoverIdx, svgWidth)}
                cy={toY(line.data[hoverIdx])}
                r="4"
                fill="#fff"
                stroke={line.color}
                strokeWidth="2"
              />
            ))}
          </svg>

          {/* Tooltip */}
          {hoverIdx !== null && (
            <div
              className="kam-sr-chart-tooltip"
              style={{
                left: Math.min(toX(hoverIdx, svgWidth) + 12, svgWidth - 170),
                top: 20,
              }}
            >
              <div className="kam-sr-tooltip-date">{formatDate(dates[hoverIdx])}</div>
              {visibleLines.map((line) => (
                <div key={line.key} className="kam-sr-tooltip-row">
                  <span className="kam-sr-tooltip-dot" style={{ background: line.color }} />
                  <span className="kam-sr-tooltip-label">{line.label}</span>
                  <span className="kam-sr-tooltip-value">{line.data[hoverIdx]}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SR Threshold Slider sub-component (single-handle)
// ---------------------------------------------------------------------------
const SR_MIN = 70
const SR_MAX = 100

function SRThresholdSlider({ value, onChange }) {
  const pct = ((value - SR_MIN) / (SR_MAX - SR_MIN)) * 100

  const handleChange = useCallback((e) => {
    onChange(Number(e.target.value))
  }, [onChange])

  return (
    <div className="kam-sr-range-control">
      <div className="kam-sr-range-labels">
        <div className="kam-sr-range-label">
          <span className="label">SR Threshold</span>
          <span className="value low">{value}%</span>
        </div>
      </div>

      <div className="kam-sr-range-track-wrapper">
        {/* Background track */}
        <div className="kam-sr-range-track" />
        {/* Colored zones */}
        <div className="kam-sr-range-zone danger" style={{ left: 0, width: `${pct}%` }} />
        <div className="kam-sr-range-zone eligible" style={{ left: `${pct}%`, width: `${100 - pct}%` }} />
        {/* Single range input */}
        <input
          type="range"
          min={SR_MIN}
          max={SR_MAX}
          step={1}
          value={value}
          onChange={handleChange}
          className="kam-sr-range-input low"
        />
      </div>

      <div className="kam-sr-range-scale">
        <span>{SR_MIN}%</span>
        <span>80%</span>
        <span>90%</span>
        <span>{SR_MAX}%</span>
      </div>

      <div className="kam-sr-range-legend">
        <span className="kam-sr-range-legend-item danger">
          <span className="dot" /> Below {value}% — fallback
        </span>
        <span className="kam-sr-range-legend-item eligible">
          <span className="dot" /> Above {value}% — CBR eligible
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sankey Chart sub-component (pure SVG)
// ---------------------------------------------------------------------------
const SANKEY_CHART_H = 580
const SANKEY_NODE_W = 130
const SANKEY_NODE_GAP = 5
const SANKEY_PAD_TOP = 40
const SANKEY_PAD_BOTTOM = 10

function computeSankeyLayout(data, width) {
  const availH = SANKEY_CHART_H - SANKEY_PAD_TOP - SANKEY_PAD_BOTTOM
  const colXs = [60, width / 2 - SANKEY_NODE_W / 2, width - SANKEY_NODE_W - 60]

  // Group nodes by column
  const columns = [[], [], []]
  data.nodes.forEach((n) => columns[n.column].push({ ...n }))

  // Compute node positions for each column
  columns.forEach((col, ci) => {
    const total = col.reduce((s, n) => s + n.value, 0)
    const minH = 14
    const gapSize = col.length > 8 ? 3 : SANKEY_NODE_GAP
    const gaps = Math.max(0, col.length - 1) * gapSize
    const usable = availH - gaps

    // First pass: compute ideal heights
    const heights = col.map((n) => Math.max(minH, (n.value / total) * usable))
    // If total exceeds usable, scale down proportionally
    const hTotal = heights.reduce((s, h) => s + h, 0)
    if (hTotal > usable) {
      const scale = usable / hTotal
      heights.forEach((h, i) => { heights[i] = Math.max(minH * 0.7, h * scale) })
    }

    let y = SANKEY_PAD_TOP
    col.forEach((n, i) => {
      n.x = colXs[ci]
      n.y = y
      n.h = heights[i]
      y += heights[i] + gapSize
    })
  })

  // Flatten back to a map
  const nodeMap = {}
  columns.flat().forEach((n) => { nodeMap[n.id] = n })

  // Compute link paths with stacking
  // Track how much vertical space has been used on each side of each node
  const sourceOffsets = {}
  const targetOffsets = {}

  const layoutLinks = data.links.map((l) => {
    const src = nodeMap[l.source]
    const tgt = nodeMap[l.target]
    if (!src || !tgt) return null

    const srcTotal = data.links.filter((x) => x.source === l.source).reduce((s, x) => s + x.value, 0)
    const tgtTotal = data.links.filter((x) => x.target === l.target).reduce((s, x) => s + x.value, 0)

    const linkW_src = (l.value / srcTotal) * src.h
    const linkW_tgt = (l.value / tgtTotal) * tgt.h

    if (!sourceOffsets[l.source]) sourceOffsets[l.source] = 0
    if (!targetOffsets[l.target]) targetOffsets[l.target] = 0

    const sy = src.y + sourceOffsets[l.source] + linkW_src / 2
    const ty = tgt.y + targetOffsets[l.target] + linkW_tgt / 2

    sourceOffsets[l.source] += linkW_src
    targetOffsets[l.target] += linkW_tgt

    const sx = src.x + SANKEY_NODE_W
    const tx = tgt.x

    const midX = (sx + tx) / 2

    return {
      ...l,
      path: `M${sx},${sy - linkW_src / 2} C${midX},${sy - linkW_src / 2} ${midX},${ty - linkW_tgt / 2} ${tx},${ty - linkW_tgt / 2} L${tx},${ty + linkW_tgt / 2} C${midX},${ty + linkW_tgt / 2} ${midX},${sy + linkW_src / 2} ${sx},${sy + linkW_src / 2} Z`,
      color: src.color,
    }
  }).filter(Boolean)

  return { nodeMap, layoutLinks, columns }
}

function SankeyChart({ data }) {
  const [svgWidth, setSvgWidth] = useState(700)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [tooltip, setTooltip] = useState(null)

  const containerRef = useCallback((node) => {
    if (node) {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) setSvgWidth(entry.contentRect.width)
      })
      ro.observe(node)
      setSvgWidth(node.getBoundingClientRect().width)
    }
  }, [])

  const layout = useMemo(() => computeSankeyLayout(data, svgWidth), [data, svgWidth])

  const connectedLinks = useMemo(() => {
    if (!hoveredNode) return new Set()
    const ids = new Set()
    data.links.forEach((l, i) => {
      if (l.source === hoveredNode || l.target === hoveredNode) ids.add(i)
    })
    return ids
  }, [hoveredNode, data.links])

  const formatVol = (v) => {
    if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M'
    if (v >= 1000) return (v / 1000).toFixed(0) + 'K'
    return String(v)
  }

  const handleNodeEnter = useCallback((node, e) => {
    setHoveredNode(node.id)
    const rect = e.currentTarget.closest('svg').getBoundingClientRect()
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      name: node.name,
      value: node.value,
      pct: ((node.value / data.totalTxn) * 100).toFixed(1),
      gateway: node.gatewayShort || null,
    })
  }, [data.totalTxn])

  const handleNodeLeave = useCallback(() => {
    setHoveredNode(null)
    setTooltip(null)
  }, [])

  const colHeaders = ['Payment Method', 'Network / Sub-type', 'Terminal']

  return (
    <div className="kam-sankey-container" ref={containerRef}>
      <svg
        className="kam-sankey-svg"
        viewBox={`0 0 ${svgWidth} ${SANKEY_CHART_H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Column headers */}
        {colHeaders.map((label, i) => {
          const x = i === 0 ? 60 + SANKEY_NODE_W / 2 : i === 1 ? svgWidth / 2 : svgWidth - 60 - SANKEY_NODE_W / 2
          return (
            <text key={i} className="kam-sankey-col-header" x={x} y={20} textAnchor="middle">
              {label}
            </text>
          )
        })}

        {/* Links */}
        {layout.layoutLinks.map((l, i) => (
          <path
            key={i}
            d={l.path}
            fill={l.color}
            className="kam-sankey-link"
            opacity={hoveredNode ? (connectedLinks.has(i) ? 0.5 : 0.06) : 0.25}
          />
        ))}

        {/* Nodes */}
        {layout.columns.flat().map((node) => {
          const isActive = !hoveredNode || hoveredNode === node.id ||
            data.links.some((l) => (l.source === node.id && l.target === hoveredNode) || (l.target === node.id && l.source === hoveredNode))
          const nodeOpacity = hoveredNode ? (isActive ? 1 : 0.3) : 1

          return (
            <g
              key={node.id}
              className="kam-sankey-node"
              opacity={nodeOpacity}
              onMouseEnter={(e) => handleNodeEnter(node, e)}
              onMouseLeave={handleNodeLeave}
            >
              <rect
                x={node.x}
                y={node.y}
                width={SANKEY_NODE_W}
                height={node.h}
                rx={4}
                fill={node.color}
              />
              {node.h >= 22 && (
                <text
                  x={node.x + SANKEY_NODE_W / 2}
                  y={node.y + node.h / 2 - (node.h >= 36 ? 5 : 0)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="kam-sankey-label"
                >
                  {node.name}
                </text>
              )}
              {node.h >= 36 && (
                <text
                  x={node.x + SANKEY_NODE_W / 2}
                  y={node.y + node.h / 2 + 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="kam-sankey-value"
                >
                  {formatVol(node.value)} txns
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="kam-sankey-tooltip"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 10,
          }}
        >
          <div className="kam-sankey-tooltip-name">{tooltip.name}</div>
          {tooltip.gateway && <div className="kam-sankey-tooltip-detail">Gateway: {tooltip.gateway}</div>}
          <div className="kam-sankey-tooltip-detail">{formatVol(tooltip.value)} transactions</div>
          <div className="kam-sankey-tooltip-detail">{tooltip.pct}% of total</div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// TracePipeline — renders the routing pipeline stages for a single transaction
// ---------------------------------------------------------------------------
function TracePipeline({ txn, merchant, rules }) {
  const simInput = transactionToSimInput(txn)
  const result = simulateRoutingPipeline(merchant, simInput, rules, {})

  return (
    <div className="kam-trace-pipeline">
      {result.stages.map((stage, idx) => (
        <div key={stage.id || idx} className={`kam-trace-stage ${stage.type === 'ntf' || stage.type === 'rule_ntf' ? 'ntf' : ''}`}>
          <div className="kam-trace-stage-num">{idx + 1}</div>
          <div className="kam-trace-stage-content">
            <div className="kam-trace-stage-label">{stage.label}</div>
            <div className="kam-trace-stage-desc">{stage.description}</div>
            {stage.terminalsRemaining && (
              <div className="kam-trace-terminals">
                <span className="kam-trace-remaining">{stage.terminalsRemaining.length} remaining</span>
                {stage.terminalsEliminated?.length > 0 && (
                  <span className="kam-trace-eliminated">&minus;{stage.terminalsEliminated.length} eliminated</span>
                )}
              </div>
            )}
            {(stage.type === 'rule_ntf' || stage.type === 'ntf') && (
              <div className="kam-trace-ntf-cause">
                <strong>NTF Cause:</strong> {stage.description}
                {stage.causeRuleId && (
                  <span className="kam-trace-fix-hint"> — Consider editing rule &ldquo;{stage.causeRuleName}&rdquo;</span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Final result */}
      {result.selectedTerminal && (
        <div className="kam-trace-result success">
          <strong>&rarr; Routed to {result.selectedTerminal.displayId}</strong> ({result.selectedTerminal.gatewayShort})
          <br/>SR {result.selectedTerminal.successRate}% &middot; &#8377;{result.selectedTerminal.costPerTxn}/txn &middot; Score {result.selectedTerminal.finalScore}
        </div>
      )}
      {result.isNTF && (
        <div className="kam-trace-result ntf">
          <strong>&#10005; Payment Failed — No Terminal Found</strong>
          {result.warnings?.map((w, i) => <div key={i} className="kam-trace-warning">{w}</div>)}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function KAMMerchantDetail() {
  const { merchantId } = useParams()
  const navigate = useNavigate()
  const {
    getMerchantById,
    allMerchants,
    gateways,
    auditLog,
    addAuditEntry,
    showToast,
    toggleSRSensitive,
    updateSRThreshold,
    addRule,
    updateRule,
    deleteRule,
    toggleRuleEnabled,
    reorderRules,
  } = useKAM()

  const merchant = getMerchantById(merchantId)

  // ---- Terminal management state ----
  const [terminalSearch, setTerminalSearch] = useState('')
  const [terminalStates, setTerminalStates] = useState({})
  const [confirmTerminal, setConfirmTerminal] = useState(null)
  const [showDealWarning, setShowDealWarning] = useState(false)
  const [expandedTerminal, setExpandedTerminal] = useState(null)
  const [expandedRecs, setExpandedRecs] = useState(new Set())
  const [expandedCapSection, setExpandedCapSection] = useState(null)

  // ---- Tab & scroll-based navigation ----
  const TAB_ORDER = ['ai-recs', 'routing', 'terminals', 'metrics', 'sr-trend', 'transactions', 'ntfs', 'audit']
  const TAB_LABELS = { 'ai-recs': 'AI Recommendations', routing: 'Routing', terminals: 'Terminals', metrics: 'Metrics', 'sr-trend': 'SR Trend', transactions: 'Transactions', ntfs: 'NTFs', audit: 'Audit Log' }
  const [activeTab, setActiveTab] = useState('ai-recs')
  const sectionRefs = useRef({})
  const tabsBarRef = useRef(null)
  const isScrollingToSection = useRef(false)

  const scrollToSection = useCallback((tabId) => {
    const idx = TAB_ORDER.indexOf(tabId)
    const sections = document.querySelectorAll('.kam-tab-section')
    const el = sections[idx]
    if (!el) return
    isScrollingToSection.current = true
    setActiveTab(tabId)
    const tabsBar = tabsBarRef.current
    const tabsHeight = tabsBar ? tabsBar.offsetHeight + 8 : 50
    const top = el.getBoundingClientRect().top + window.scrollY - tabsHeight
    window.scrollTo({ top, behavior: 'smooth' })
    setTimeout(() => { isScrollingToSection.current = false }, 700)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingToSection.current) return
      const tabsBar = tabsBarRef.current
      const triggerLine = tabsBar ? tabsBar.getBoundingClientRect().bottom + 80 : 160
      // Query all section elements directly from DOM
      const sections = document.querySelectorAll('.kam-tab-section')
      // Walk backwards — last section whose top is above trigger line wins
      for (let i = TAB_ORDER.length - 1; i >= 0; i--) {
        const el = sections[i]
        if (!el) continue
        if (el.getBoundingClientRect().top <= triggerLine) {
          setActiveTab(TAB_ORDER[i])
          return
        }
      }
      setActiveTab(TAB_ORDER[0])
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [merchant])

  const [txnSearch, setTxnSearch] = useState('')
  const [selectedTxn, setSelectedTxn] = useState(null)
  const [txnPage, setTxnPage] = useState(0)
  const [txnPageSize, setTxnPageSize] = useState(10)
  const [txnSort, setTxnSort] = useState({ field: 'timestamp', direction: 'desc' })
  const [txnMethodFilter, setTxnMethodFilter] = useState([])
  const [txnStatusFilter, setTxnStatusFilter] = useState([])
  const [txnGatewayFilter, setTxnGatewayFilter] = useState([])
  const [txnDateRange, setTxnDateRange] = useState('all')
  const [txnNTFFilter, setTxnNTFFilter] = useState(false)
  const [openTxnDropdown, setOpenTxnDropdown] = useState(null)

  // ---- Recommendation state ----
  const [approvedRecs, setApprovedRecs] = useState(new Set())
  const [dismissedRecs, setDismissedRecs] = useState(new Set())

  // ---- Routing Copilot state ----
  const [simOverrides, setSimOverrides] = useState({})


  // ---- Computed values (hooks must be unconditional — guard is below) ----
  const tspCompliance = useMemo(() => merchant ? computeTSPCompliance(merchant) : null, [merchant])
  const revenue = merchant ? computeMerchantRevenue(merchant) : { grossRevenue: 0, backwardCost: 0, netRevenue: 0 }

  // Bank-disabled terminals
  const bankDisabledTerminals = useMemo(() => {
    if (!merchant) return []
    return merchant.gatewayMetrics.flatMap(gm => {
      const gw = gatewayData.find(g => g.id === gm.gatewayId)
      const term = gw?.terminals.find(t => t.id === gm.terminalId)
      if (term?.bankStatus === 'disabled') return [{ ...term, gatewayShort: gw?.shortName }]
      return []
    })
  }, [merchant])

  // Doppler routing percentage — derived from routing strategy, rule count, and deal type
  const dopplerRoutePercent = useMemo(() => {
    if (!merchant) return 0
    // Base: SR-optimised merchants rely more on Doppler ML, cost-based use more manual rules
    let base = merchant.routingStrategy === 'success_rate' ? 88 : 62
    // srSensitive merchants (Doppler fully active) get a boost
    if (merchant.srSensitive) base += 6
    // Manual rules reduce Doppler share — each rule eats ~3%
    const manualRules = (merchant.routingRules?.selectRules || 0) + (merchant.routingRules?.rejectRules || 0)
    base -= manualRules * 3
    // TSP deals lock routing to specific gateways, reducing Doppler's control
    if (merchant.dealType === 'tsp') base -= 12
    // Offer-linked deals partially constrain routing
    if (merchant.dealType === 'offer-linked') base -= 8
    // Clamp between 30 and 99
    return Math.max(30, Math.min(99, base))
  }, [merchant])

  const [expandedNTFs, setExpandedNTFs] = useState(new Set())
  const [copiedNTF, setCopiedNTF] = useState(null)
  const [expandedProfiles, setExpandedProfiles] = useState(new Set())
  const [ntfActiveLayer, setNtfActiveLayer] = useState({})
  const [copiedTemplate, setCopiedTemplate] = useState(null)
  const [traceTransaction, setTraceTransaction] = useState(null)
  const [ntfViewMode, setNtfViewMode] = useState('ntf')

  const cbrOrder = useMemo(() => {
    if (!merchant || merchant.srSensitive) return null
    return computeCBROrder(merchant)
  }, [merchant])

  // Build terminal rows from gatewayMetrics
  const terminals = useMemo(() => {
    if (!merchant) return []
    return merchant.gatewayMetrics.map((gm) => {
      const gw = gateways.find((g) => g.id === gm.gatewayId)
      const term = gw?.terminals.find((t) => t.id === gm.terminalId)
      const terminalId = term?.terminalId || gm.terminalId
      return {
        key: gm.terminalId,
        terminalId,
        provider: gw?.name || 'Unknown',
        providerShort: gw?.shortName || '??',
        method: gm.supportedMethods && gm.supportedMethods.length > 0 ? gm.supportedMethods[0] : pickMethod(terminalId),
        successRate: gm.successRate,
        costPerTxn: gm.costPerTxn,
        txnShare: gm.txnShare,
        dailyVolume: pickDailyVolume(terminalId),
        gatewayId: gm.gatewayId,
        internalTermId: gm.terminalId,
        bankStatus: term?.bankStatus || 'active',
        bankStatusReason: term?.bankStatusReason || null,
        bankStatusSince: term?.bankStatusSince || null,
        supportedMethods: gm.supportedMethods || [],
        supportedNetworks: gm.supportedNetworks || [],
        supportedIssuers: gm.supportedIssuers || [],
        supportedCardTypes: gm.supportedCardTypes || [],
        supportedUPIFlows: gm.supportedUPIFlows || [],
        supportedVPAHandles: gm.supportedVPAHandles || [],
        supportsRecurring: gm.supportsRecurring || false,
        supportedNBBanks: gm.supportedNBBanks || [],
      }
    })
  }, [merchant?.gatewayMetrics, gateways])

  // Filtered terminals
  const filteredTerminals = useMemo(() => {
    if (!terminalSearch) return terminals
    const q = terminalSearch.toLowerCase()
    return terminals.filter(
      (t) =>
        t.terminalId.toLowerCase().includes(q) ||
        t.provider.toLowerCase().includes(q) ||
        t.method.toLowerCase().includes(q)
    )
  }, [terminals, terminalSearch])

  // Group terminals by payment method
  const METHOD_ORDER = ['Cards', 'UPI', 'NB']
  const METHOD_LABELS = { Cards: 'Cards', UPI: 'UPI', NB: 'Net Banking' }
  const groupedTerminals = useMemo(() => {
    const groups = {}
    filteredTerminals.forEach((t) => {
      const method = t.method
      if (!groups[method]) groups[method] = []
      groups[method].push(t)
    })
    // Sort by METHOD_ORDER, then any extras
    return METHOD_ORDER.filter(m => groups[m]).map(m => ({ method: m, label: METHOD_LABELS[m], terminals: groups[m] }))
  }, [filteredTerminals])

  // Transaction data
  const transactions = useMemo(() => merchant ? generateMerchantTransactions(merchant) : [], [merchant])
  const srData = useMemo(() => merchant ? generateSRTimeSeries(merchant) : { dates: [], overall: [], byMethod: {} }, [merchant])
  const recommendations = useMemo(() => merchant ? generateRecommendations(merchant) : [], [merchant])
  const sankeyData = useMemo(() => merchant ? generateSankeyData(merchant) : { nodes: [], links: [] }, [merchant])

  const ntfTransactions = useMemo(() => {
    return transactions.filter(t => t.isNTF)
  }, [transactions])
  const ntfCount = ntfTransactions.length

  const ntfAnalysis = useMemo(() => {
    if (!merchant || ntfTransactions.length === 0) return null
    const rules = merchant.routingRulesV2 || []
    return generateNTFAnalysis(merchant, ntfTransactions, rules)
  }, [merchant, ntfTransactions])

  const routingHealthData = useMemo(() => {
    if (!merchant || transactions.length === 0) return null
    const rules = merchant.routingRulesV2 || []
    return generateRoutingAnalysis(merchant, transactions, rules)
  }, [merchant, transactions])

  const filteredTxns = useMemo(() => {
    let result = transactions

    // Text search
    if (txnSearch) {
      const q = txnSearch.toLowerCase()
      result = result.filter(t =>
        t.txnId.toLowerCase().includes(q) ||
        t.paymentMethod.type.toLowerCase().includes(q) ||
        t.paymentMethod.short.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q) ||
        t.routingDecision.selectedGatewayShort.toLowerCase().includes(q)
      )
    }

    // Method filter
    if (txnMethodFilter.length > 0) {
      result = result.filter(t => txnMethodFilter.includes(t.paymentMethod.short))
    }

    // Status filter
    if (txnStatusFilter.length > 0) {
      result = result.filter(t => txnStatusFilter.includes(t.status))
    }

    // Gateway filter
    if (txnGatewayFilter.length > 0) {
      result = result.filter(t => txnGatewayFilter.includes(t.routingDecision.selectedGatewayShort))
    }

    // NTF filter
    if (txnNTFFilter) {
      result = result.filter(t => t.isNTF)
    }

    // Date range filter
    if (txnDateRange !== 'all') {
      const now = new Date('2026-03-11T23:59:59')
      const hours = txnDateRange === '24h' ? 24 : txnDateRange === '7d' ? 168 : 720
      const cutoff = new Date(now.getTime() - hours * 3600000)
      result = result.filter(t => t.timestamp >= cutoff)
    }

    // Sort
    result = [...result].sort((a, b) => {
      let aVal, bVal
      switch (txnSort.field) {
        case 'timestamp': aVal = a.timestamp; bVal = b.timestamp; break
        case 'amount': aVal = a.amount; bVal = b.amount; break
        case 'txnId': aVal = a.txnId; bVal = b.txnId; break
        case 'method': aVal = a.paymentMethod.short; bVal = b.paymentMethod.short; break
        case 'status': aVal = a.status; bVal = b.status; break
        case 'gateway': aVal = a.routingDecision.selectedGatewayShort; bVal = b.routingDecision.selectedGatewayShort; break
        default: return 0
      }
      if (aVal < bVal) return txnSort.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return txnSort.direction === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [transactions, txnSearch, txnMethodFilter, txnStatusFilter, txnGatewayFilter, txnNTFFilter, txnDateRange, txnSort])

  const paginatedTxns = useMemo(() => {
    const start = txnPage * txnPageSize
    return filteredTxns.slice(start, start + txnPageSize)
  }, [filteredTxns, txnPage, txnPageSize])

  const totalTxnPages = Math.ceil(filteredTxns.length / txnPageSize)

  // Reset page when filters change
  useEffect(() => { setTxnPage(0) }, [txnSearch, txnMethodFilter, txnStatusFilter, txnGatewayFilter, txnNTFFilter, txnDateRange])

  // Close filter dropdowns when clicking outside
  useEffect(() => {
    if (!openTxnDropdown) return
    const handleClick = (e) => {
      if (!e.target.closest('.kam-txn-filter-wrap')) setOpenTxnDropdown(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openTxnDropdown])

  const gatewayOptions = useMemo(() => {
    const set = new Set(transactions.map(t => t.routingDecision.selectedGatewayShort))
    return [...set].sort()
  }, [transactions])

  const toggleTxnSort = useCallback((field) => {
    setTxnSort(prev =>
      prev.field === field
        ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: field === 'timestamp' ? 'desc' : 'asc' }
    )
  }, [])

  const exportTxnCSV = useCallback(() => {
    const headers = ['Txn ID','Timestamp','Amount','Method','Status','Gateway']
    const rows = filteredTxns.map(t => [
      t.txnId,
      t.timestamp.toISOString(),
      t.amount.toFixed(2),
      t.paymentMethod.type,
      t.status,
      t.routingDecision.selectedGatewayShort
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${merchant.name.replace(/\s/g,'_')}_transactions.csv`
    a.click(); URL.revokeObjectURL(url)
  }, [filteredTxns, merchant])

  const toggleTxnFilter = useCallback((type, value) => {
    const setter = type === 'method' ? setTxnMethodFilter : type === 'status' ? setTxnStatusFilter : setTxnGatewayFilter
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])
  }, [])

  const clearTxnFilters = useCallback(() => {
    setTxnMethodFilter([])
    setTxnStatusFilter([])
    setTxnGatewayFilter([])
    setTxnNTFFilter(false)
    setTxnDateRange('all')
    setTxnSearch('')
  }, [])

  const hasActiveTxnFilters = txnMethodFilter.length > 0 || txnStatusFilter.length > 0 || txnGatewayFilter.length > 0 || txnNTFFilter || txnDateRange !== 'all' || txnSearch !== ''

  // Filtered audit log for this merchant
  const relevantLogs = useMemo(() => {
    return auditLog
      .filter((e) => e.merchantId === merchantId || !e.merchantId)
      .slice(0, 5)
  }, [auditLog, merchantId])

  // ---- Terminal toggle helpers ----
  const isTerminalActive = useCallback(
    (termKey) => {
      if (terminalStates[termKey] !== undefined) return terminalStates[termKey]
      return true // default active
    },
    [terminalStates]
  )

  const handleTerminalToggle = useCallback(
    (terminal) => {
      if (!merchant) return
      const currentlyActive = isTerminalActive(terminal.key)
      if (currentlyActive) {
        // About to disable -- show confirmation
        setConfirmTerminal(terminal)
      } else {
        // Re-enable directly
        setTerminalStates((prev) => ({ ...prev, [terminal.key]: true }))
        addAuditEntry(
          `Enabled terminal ${terminal.terminalId} for ${merchant.name}`,
          'Manual re-enable',
          merchantId
        )
        showToast(`Terminal ${terminal.terminalId} enabled`)
      }
    },
    [isTerminalActive, merchant, merchantId, addAuditEntry, showToast]
  )

  const confirmDisableTerminal = useCallback(() => {
    if (!confirmTerminal || !merchant) return
    setTerminalStates((prev) => ({ ...prev, [confirmTerminal.key]: false }))
    addAuditEntry(
      `Disabled terminal ${confirmTerminal.terminalId} for ${merchant.name}`,
      `Processes ${formatLakhs(confirmTerminal.dailyVolume)} daily`,
      merchantId
    )
    showToast(`Terminal ${confirmTerminal.terminalId} disabled`, 'info')
    setConfirmTerminal(null)
  }, [confirmTerminal, merchant, merchantId, addAuditEntry, showToast])

  // ---- Recommendation handlers ----
  const handleApproveRec = useCallback(
    (rec) => {
      setApprovedRecs((prev) => new Set([...prev, rec.id]))

      if (rec.action === 'enable_sr_sensitive') {
        toggleSRSensitive(merchantId)
      } else if (rec.action === 'procure_terminal') {
        addAuditEntry(
          `Raised instrument request: ${rec.meta?.gwName} terminal`,
          rec.description.length > 140 ? rec.description.substring(0, 140) + '…' : rec.description,
          merchantId
        )
        showToast(`Instrument request raised for ${rec.meta?.gwName} terminal`)
      } else {
        addAuditEntry(
          `Approved AI recommendation: ${rec.title}`,
          rec.description.length > 140 ? rec.description.substring(0, 140) + '…' : rec.description,
          merchantId
        )
        showToast(`Recommendation approved: ${rec.title}`)
      }
    },
    [merchantId, toggleSRSensitive, addAuditEntry, showToast]
  )

  const handleDismissRec = useCallback((recId) => {
    setDismissedRecs((prev) => new Set([...prev, recId]))
  }, [])

  const visibleRecs = useMemo(
    () => recommendations.filter((r) => !dismissedRecs.has(r.id)),
    [recommendations, dismissedRecs]
  )

  // ---- Guard (after all hooks to respect Rules of Hooks) ----
  if (!merchant) {
    return (
      <div className="kam-empty-state" style={{ minHeight: 400 }}>
        <ServerIcon />
        <h4>Merchant not found</h4>
        <p>The merchant you are looking for does not exist or has been removed.</p>
        <Link to="/kam/merchants" className="kam-btn kam-btn-primary" style={{ marginTop: 16 }}>
          Back to Merchants
        </Link>
      </div>
    )
  }

  // ---- Status & category badge helpers ----
  const statusBadgeClass = merchant.status === 'active' ? 'success' : 'warning'
  const statusLabel = merchant.status === 'active' ? 'Active' : 'Inactive'

  return (
    <>
      {/* ── Back Link ────────────────────────────────────────────── */}
      <Link to="/kam/merchants" className="kam-detail-back">
        <ArrowLeftIcon />
        Back to Merchants
      </Link>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="kam-detail-header">
        <div>
          <div className="kam-detail-title">
            <h2>{merchant.name}</h2>
            <span className="mid">{merchant.mid}</span>
            <span className="kam-badge neutral">{merchant.category}</span>
            <span className={`kam-badge ${statusBadgeClass}`}>{statusLabel}</span>
            {merchant.dealType === 'tsp' && (
              <span className="kam-badge deal-tsp">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                TSP
              </span>
            )}
            {merchant.dealType === 'offer_linked' && (
              <span className="kam-badge deal-offer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 12 20 22 4 22 4 12" />
                  <rect x="2" y="7" width="20" height="5" />
                  <line x1="12" y1="22" x2="12" y2="7" />
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
                Offer
              </span>
            )}
            {merchant.srSensitive && (
              <span className="kam-badge-sr" style={{ padding: '2px 10px', fontSize: 11 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                SR Sensitive
              </span>
            )}
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: 'var(--rzp-text-secondary)', fontFamily: 'var(--font-secondary)' }}>
            {merchant.contactName} &middot; {merchant.contactEmail}
            {merchant.mcc && (
              <span style={{ marginLeft: 12, color: 'var(--rzp-text-muted)' }}>
                &middot; MCC {merchant.mcc} &middot; {merchant.mccLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs (sticky, scroll-based) ──────────────────────── */}
      <div className="kam-detail-tabs kam-detail-tabs-sticky" ref={tabsBarRef}>
        {TAB_ORDER.map(tab => (
          <button
            key={tab}
            className={`kam-detail-tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => scrollToSection(tab)}
          >
            {tab === 'transactions' ? `Transactions (${filteredTxns.length})` : tab === 'ntfs' ? `NTFs (${ntfCount})` : TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 1: AI RECOMMENDATIONS                              */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div ref={el => sectionRefs.current['ai-recs'] = el} className="kam-tab-section">
      {visibleRecs.length > 0 && (
        <div className="kam-card kam-recs-card">
          <div className="kam-card-header">
            <h3 className="kam-card-title">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              AI Recommendations
              <span className="kam-recs-ai-label">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                AI
              </span>
            </h3>
            <span className="kam-recs-pending-count">
              {visibleRecs.filter(r => !approvedRecs.has(r.id)).length} of {visibleRecs.length} actions pending
            </span>
          </div>

          <div className="kam-recs-list">
            {visibleRecs.map((rec) => {
              const isRecExpanded = expandedRecs.has(rec.id)
              return (
              <div
                key={rec.id}
                className={`kam-rec-card ${rec.type}${approvedRecs.has(rec.id) ? ' approved' : ''}`}
              >
                {/* Collapsed header — always visible, clickable */}
                <div
                  className="kam-rec-accordion-trigger"
                  onClick={() => setExpandedRecs(prev => {
                    const next = new Set(prev)
                    next.has(rec.id) ? next.delete(rec.id) : next.add(rec.id)
                    return next
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                    <span className={`kam-rec-badge ${rec.type}`}>
                      {rec.type === 'critical' ? 'Critical' : rec.type === 'warning' ? 'Warning' : rec.type === 'opportunity' ? 'Opportunity' : 'Info'}
                    </span>
                    <span className="kam-rec-title" style={{ margin: 0 }}>{rec.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {approvedRecs.has(rec.id) && (
                      <span className="kam-rec-approved-badge" style={{ fontSize: 11 }}>
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {rec.action === 'procure_terminal' ? 'Request Raised' : 'Approved'}
                      </span>
                    )}
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className={`kam-recs-chevron${isRecExpanded ? ' expanded' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Expandable detail content */}
                {isRecExpanded && (
                <div className="kam-rec-detail">
                  {/* Confidence */}
                  <div className="kam-rec-section-label">Confidence</div>
                  <div className="kam-rec-meta-row">
                    <div className="kam-rec-confidence">
                      <div className="kam-rec-confidence-bar">
                        <div
                          className={`kam-rec-confidence-fill${rec.confidence >= 85 ? ' high' : rec.confidence >= 70 ? ' medium' : ' low'}`}
                          style={{ width: `${rec.confidence}%` }}
                        />
                      </div>
                      <span className="kam-rec-confidence-value">{rec.confidence}%</span>
                    </div>
                  </div>

                  {/* Evidence */}
                  <div className="kam-rec-section-label">Evidence</div>
                  <div className="kam-rec-evidence">
                    <span className="kam-rec-signal">{rec.signal}</span>
                    <span className="kam-rec-desc">{rec.description}</span>
                    {rec.affectedArea && (
                      <span className="kam-rec-affected">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        Affects: {rec.affectedArea}
                      </span>
                    )}
                  </div>

                  {/* MCC Peer Comparison — when terminal procurement is recommended */}
                  {rec.meta?.peerComparison && (
                    <>
                      <div className="kam-rec-section-label">MCC Peer Comparison</div>
                      <div className="kam-rec-peer-comparison">
                        <div className="kam-rec-peer-row this-merchant">
                          <span className="kam-rec-peer-name">{merchant.name}</span>
                          <div className="kam-rec-peer-bar-wrap">
                            <div className="kam-rec-peer-bar this" style={{ width: `${(merchant.avgPaymentSuccessRate / 100) * 100}%` }} />
                          </div>
                          <span className="kam-rec-peer-sr">{merchant.avgPaymentSuccessRate}%</span>
                          <span className="kam-rec-peer-terminals">{rec.meta.merchantTerminalCount} terminals</span>
                        </div>
                        {rec.meta.peerComparison.map((peer) => (
                          <div key={peer.name} className="kam-rec-peer-row peer">
                            <span className="kam-rec-peer-name">{peer.name}</span>
                            <div className="kam-rec-peer-bar-wrap">
                              <div className="kam-rec-peer-bar peer" style={{ width: `${(peer.sr / 100) * 100}%` }} />
                            </div>
                            <span className="kam-rec-peer-sr">{peer.sr}%</span>
                            <span className="kam-rec-peer-terminals">{peer.terminalCount} terminals</span>
                          </div>
                        ))}
                        {rec.meta.missingGateways && rec.meta.missingGateways.length > 0 && (
                          <div className="kam-rec-missing-gateways">
                            <span className="kam-rec-missing-label">Missing terminals:</span>
                            {rec.meta.missingGateways.map((gw) => (
                              <span key={gw.gatewayId} className="kam-rec-missing-chip">
                                {gw.gwName} <span className="kam-rec-missing-sr">{gw.successRate}% SR</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Recommended Action */}
                  <div className="kam-rec-section-label">Recommended Action</div>
                  <div className="kam-rec-impact">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                    <strong>Impact: </strong>{rec.impact}
                  </div>

                  {/* Actions */}
                  {!approvedRecs.has(rec.id) && (
                  <div className="kam-rec-actions">
                    {rec.action === 'procure_terminal' ? (
                      <>
                        <button
                          className="kam-rec-approve-btn kam-rec-instrument-btn"
                          onClick={(e) => { e.stopPropagation(); handleApproveRec(rec) }}
                        >
                          Raise Instrument Request
                        </button>
                        <button
                          className="kam-rec-dismiss-btn kam-rec-status-btn"
                          onClick={(e) => { e.stopPropagation(); handleDismissRec(rec.id) }}
                        >
                          Check terminal status
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="kam-rec-approve-btn"
                          onClick={(e) => { e.stopPropagation(); handleApproveRec(rec) }}
                        >
                          Approve
                        </button>
                        <button
                          className="kam-rec-dismiss-btn"
                          onClick={(e) => { e.stopPropagation(); handleDismissRec(rec.id) }}
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                  </div>
                  )}
                </div>
                )}
              </div>
            )})}
          </div>

          {/* Footer: severity summary */}
          <div className="kam-recs-footer">
            {(() => {
              const critical = visibleRecs.filter(r => r.type === 'critical').length
              const warning = visibleRecs.filter(r => r.type === 'warning').length
              const opportunity = visibleRecs.filter(r => r.type === 'opportunity').length
              const info = visibleRecs.filter(r => r.type === 'info').length
              const parts = []
              if (critical > 0) parts.push(`${critical} critical`)
              if (warning > 0) parts.push(`${warning} warning`)
              if (opportunity > 0) parts.push(`${opportunity} opportunity`)
              if (info > 0) parts.push(`${info} info`)
              return parts.join(' · ')
            })()}
          </div>
        </div>
      )}
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 2: ROUTING STRATEGY                                */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div ref={el => sectionRefs.current.routing = el} className="kam-tab-section">

      {/* ── Deal Constraint Banners ────────────────────────────────── */}
      {merchant.dealType === 'tsp' && merchant.dealDetails && (
        <div className="kam-deal-banner tsp">
          <div className="kam-deal-banner-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className="kam-deal-banner-content">
            <div className="kam-deal-banner-title">
              TSP Deal Active
              <span className="kam-badge deal-tsp" style={{ fontSize: 10, padding: '1px 6px' }}>Routing Locked</span>
            </div>
            <div className="kam-deal-banner-desc">{merchant.dealDetails.description}</div>
            {merchant.dealDetails.constraint && (
              <div className="kam-deal-banner-desc" style={{ fontWeight: 600, color: 'var(--rzp-text-primary)', marginBottom: 4 }}>
                Constraint: {merchant.dealDetails.constraint}
              </div>
            )}
            {tspCompliance && (
              <div style={{ margin: '8px 0 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="kam-tsp-gauge" style={{ margin: 0, maxWidth: 320 }}>
                    <div className="kam-tsp-gauge-bar">
                      <div
                        className={`kam-tsp-gauge-fill ${tspCompliance.status === 'off_track' ? 'violation' : tspCompliance.status === 'at_risk' ? 'at-risk' : ''}`}
                        style={{ width: `${tspCompliance.gmvCommitment > 0 ? Math.min((tspCompliance.projectedAnnualGMV / tspCompliance.gmvCommitment) * 100, 100) : 0}%` }}
                      />
                      <div className="kam-tsp-gauge-threshold" style={{ left: '100%' }} />
                    </div>
                    <span className="kam-tsp-gauge-label">{formatINR(tspCompliance.projectedAnnualGMV)} / {formatINR(tspCompliance.gmvCommitment)} commitment</span>
                  </div>
                  <span className={`kam-badge ${tspCompliance.status === 'on_track' ? 'success' : tspCompliance.status === 'at_risk' ? 'warning' : 'danger'}`}>
                    {tspCompliance.status === 'on_track' ? 'On Track' : tspCompliance.status === 'at_risk' ? 'At Risk' : 'Off Track'}
                  </span>
                </div>
                {tspCompliance.status === 'off_track' && (
                  <div style={{ fontSize: 12, color: 'var(--rzp-danger)', fontWeight: 600, marginTop: 6 }}>
                    At current routing ({tspCompliance.actualTrafficPct}% via {tspCompliance.lockedGatewayName}), projected annual GMV is {formatINR(tspCompliance.projectedAnnualGMV)} against {formatINR(tspCompliance.gmvCommitment)} commitment. Consider increasing {tspCompliance.lockedGatewayName} traffic share to ~{tspCompliance.suggestedTrafficPct}%.
                  </div>
                )}
                {tspCompliance.status === 'at_risk' && (
                  <div style={{ fontSize: 12, color: '#E65100', fontWeight: 600, marginTop: 6 }}>
                    At current routing ({tspCompliance.actualTrafficPct}% via {tspCompliance.lockedGatewayName}), projected annual GMV is {formatINR(tspCompliance.projectedAnnualGMV)} against {formatINR(tspCompliance.gmvCommitment)} commitment. Suggest routing ~{tspCompliance.suggestedTrafficPct}% via {tspCompliance.lockedGatewayName} to meet target.
                  </div>
                )}
              </div>
            )}
            <div className="kam-deal-banner-meta">
              {merchant.dealDetails.expiresAt && (
                <span>Expires: <strong>{merchant.dealDetails.expiresAt}</strong></span>
              )}
              {merchant.dealDetails.contact && (
                <span>Contact: <a href={`mailto:${merchant.dealDetails.contact}`}>{merchant.dealDetails.contact}</a></span>
              )}
            </div>
          </div>
        </div>
      )}

      {merchant.dealType === 'offer_linked' && merchant.dealDetails && (
        <div className="kam-deal-banner offer">
          <div className="kam-deal-banner-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#7B1FA2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          </div>
          <div className="kam-deal-banner-content">
            <div className="kam-deal-banner-title">
              Offer-Linked Deal
              <span className="kam-badge deal-offer" style={{ fontSize: 10, padding: '1px 6px' }}>Active</span>
            </div>
            <div className="kam-deal-banner-desc">{merchant.dealDetails.description}</div>
            {merchant.dealDetails.constraint && (
              <div className="kam-deal-banner-desc" style={{ fontWeight: 600, color: 'var(--rzp-text-primary)', marginBottom: 4 }}>
                Constraint: {merchant.dealDetails.constraint}
              </div>
            )}
            <div className="kam-deal-banner-meta">
              {merchant.dealDetails.expiresAt && (
                <span>Expires: <strong>{merchant.dealDetails.expiresAt}</strong></span>
              )}
              {merchant.dealDetails.contact && (
                <span>Contact: <a href={`mailto:${merchant.dealDetails.contact}`}>{merchant.dealDetails.contact}</a></span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── GMV Commitment Progress (TSP + non-SR-sensitive) ──── */}
      {!merchant.srSensitive && tspCompliance && (
        <div className="kam-cbr-gmv-card">
          <div className="kam-cbr-gmv-header">
            <div className="kam-cbr-gmv-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              GMV Commitment Progress
            </div>
            <span className={`kam-badge ${
              tspCompliance.status === 'on_track' ? 'success'
              : tspCompliance.status === 'at_risk' ? 'warning'
              : 'danger'
            }`}>
              {tspCompliance.status === 'on_track' ? 'On Track'
              : tspCompliance.status === 'at_risk' ? 'At Risk'
              : 'Off Track'}
            </span>
          </div>

          <div className="kam-cbr-gmv-details">
            <div className="kam-cbr-gmv-row">
              <span className="kam-cbr-gmv-label">Locked Gateway</span>
              <span className="kam-cbr-gmv-value">{tspCompliance.lockedGatewayName}</span>
            </div>
            <div className="kam-cbr-gmv-row">
              <span className="kam-cbr-gmv-label">Annual Commitment</span>
              <span className="kam-cbr-gmv-value">{formatINR(tspCompliance.gmvCommitment)}</span>
            </div>
            <div className="kam-cbr-gmv-row">
              <span className="kam-cbr-gmv-label">Projected Annual GMV</span>
              <span className="kam-cbr-gmv-value">{formatINR(tspCompliance.projectedAnnualGMV)}</span>
            </div>
            <div className="kam-cbr-gmv-row">
              <span className="kam-cbr-gmv-label">Current Traffic Share</span>
              <span className="kam-cbr-gmv-value">{tspCompliance.actualTrafficPct}%</span>
            </div>
            <div className="kam-cbr-gmv-row">
              <span className="kam-cbr-gmv-label">Required Traffic Share</span>
              <span className="kam-cbr-gmv-value">{tspCompliance.suggestedTrafficPct}%</span>
            </div>
          </div>

          <div className="kam-cbr-gmv-progress">
            <div className="kam-cbr-gmv-progress-label">
              <span>Progress</span>
              <span>{Math.min(100, Math.round((tspCompliance.projectedAnnualGMV / tspCompliance.gmvCommitment) * 100))}%</span>
            </div>
            <div className="kam-cbr-gmv-progress-bar">
              <div
                className="kam-cbr-gmv-progress-fill"
                style={{
                  width: `${Math.min(100, (tspCompliance.projectedAnnualGMV / tspCompliance.gmvCommitment) * 100)}%`,
                  background: tspCompliance.status === 'on_track' ? 'var(--rzp-success)'
                    : tspCompliance.status === 'at_risk' ? '#FF9800'
                    : '#E53E3E',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Routing Copilot ──────────────────────────────────────── */}
      <div className="kam-detail-card" style={{ marginTop: 16 }}>
        <div className="kam-card-header">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#528FF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <h3 style={{ margin: 0 }}>Routing Copilot</h3>
          <span className="kam-badge info" style={{ fontSize: 10 }}>AI</span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: 'var(--rzp-text-muted)' }}>Ask about rules, simulate payments, create routing rules</span>
        </div>
        <RoutingCopilot
          merchant={merchant}
          rules={merchant.routingRulesV2 || []}
          addRule={(rule) => addRule(merchant.id, rule)}
          simOverrides={simOverrides}
        />
      </div>

      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 3: TERMINAL MANAGEMENT                             */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div ref={el => sectionRefs.current.terminals = el} className="kam-tab-section">
      <div className="kam-detail-section" id="terminal-section">

        {/* ── Bank-Disabled Terminal Alert Banner ──── */}
        {bankDisabledTerminals.length > 0 && (
          <div className="kam-bank-disabled-banner">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span><strong>{bankDisabledTerminals.length} terminal{bankDisabledTerminals.length > 1 ? 's' : ''} disabled by bank</strong> — these terminals cannot process payments regardless of your routing configuration. Contact TR team to resolve.</span>
          </div>
        )}

        <div className="kam-card">
          <div className="kam-card-header">
            <h3 className="kam-card-title">
              <ServerIcon />
              Terminal Management
            </h3>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--rzp-text-muted)', pointerEvents: 'none', display: 'flex' }}>
                <SearchIcon />
              </span>
              <input
                type="text"
                className="kam-search-input"
                style={{ width: 220, paddingLeft: 32 }}
                placeholder="Search terminals..."
                value={terminalSearch}
                onChange={(e) => setTerminalSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {filteredTerminals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--rzp-text-muted)' }}>
                No terminals match your search.
              </div>
            ) : (
              groupedTerminals.map((group) => (
                <div key={group.method} className="kam-terminal-method-group">
                  <div className="kam-terminal-method-header">
                    <span className={`kam-method-badge ${group.method.toLowerCase()}`}>{group.method}</span>
                    <span className="kam-terminal-method-label">{group.label}</span>
                    <span className="kam-terminal-method-count">{group.terminals.length} terminal{group.terminals.length > 1 ? 's' : ''}</span>
                  </div>
                  <table className="kam-terminal-table">
                    <caption className="kam-sr-only">Terminal management data for {merchant.name} — {group.label}</caption>
                    <thead>
                      <tr>
                        <th>Terminal ID</th>
                        <th>Provider</th>
                        <th>Current SR</th>
                        <th>Daily Volume</th>
                        <th>Txn Share</th>
                        <th>Status</th>
                        <th style={{ width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.terminals.map((t) => {
                        const active = isTerminalActive(t.key)
                        const srOptimal = t.successRate >= 71
                        const isExpanded = expandedTerminal === t.key
                        // Build compact summary of methods
                        const methods = t.supportedMethods || []
                        const summaryParts = []
                        if (methods.includes('Cards')) {
                          const nets = (t.supportedNetworks || []).join(', ')
                          summaryParts.push(nets || 'Cards')
                        }
                        if (methods.includes('UPI')) {
                          const flows = (t.supportedUPIFlows || []).join(', ')
                          summaryParts.push(flows ? `UPI: ${flows}` : 'UPI')
                        }
                        if (methods.includes('NB')) summaryParts.push('NB')
                        return (
                          <React.Fragment key={t.key}>
                            <tr style={{ opacity: active ? 1 : 0.5, cursor: 'pointer' }} onClick={() => setExpandedTerminal(isExpanded ? null : t.key)}>
                              <td>
                                <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 13 }}>
                                  {t.terminalId}
                                </span>
                                {t.bankStatus === 'disabled' && (
                                  <span className="kam-bank-disabled-badge">Bank Disabled</span>
                                )}
                                {t.bankStatus === 'disabled' && t.bankStatusReason && (
                                  <div className="kam-bank-disabled-info">
                                    {t.bankStatusReason}
                                    {t.bankStatusSince && ` — since ${new Date(t.bankStatusSince).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                  </div>
                                )}
                              </td>
                              <td>{t.provider}</td>
                              <td>
                                <span style={{ fontWeight: 600 }}>{t.successRate}%</span>
                                {' '}
                                <span className={`kam-badge ${srOptimal ? 'success' : 'warning'}`} style={{ fontSize: 10 }}>
                                  {srOptimal ? 'Optimal' : 'Sub-optimal'}
                                </span>
                              </td>
                              <td style={{ fontFamily: 'var(--font-secondary)' }}>
                                {formatLakhs(t.dailyVolume)}
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div className="kam-progress-bar" style={{ width: 60, height: 6 }}>
                                    <div
                                      className="kam-progress-fill"
                                      style={{
                                        width: `${t.txnShare}%`,
                                        background: 'var(--rzp-blue)',
                                      }}
                                    />
                                  </div>
                                  <span style={{ fontSize: 12, color: 'var(--rzp-text-secondary)' }}>
                                    {t.txnShare}%
                                  </span>
                                </div>
                              </td>
                              <td>
                                <button
                                  className={`kam-toggle${active ? ' active' : ''}`}
                                  onClick={(e) => { e.stopPropagation(); handleTerminalToggle(t) }}
                                  aria-label={`Toggle terminal ${t.terminalId}`}
                                />
                              </td>
                              <td>
                                <button
                                  className="kam-btn kam-btn-ghost kam-btn-sm"
                                  onClick={(e) => { e.stopPropagation(); setExpandedTerminal(isExpanded ? null : t.key) }}
                                  style={{ padding: 4 }}
                                  aria-label="Toggle capability details"
                                >
                                  <svg
                                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                  >
                                    <polyline points="6 9 12 15 18 9" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="kam-pricing-expanded-row">
                                <td colSpan={7} style={{ padding: 0 }}>
                                  <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '12px 16px' }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                      Terminal Capabilities — {t.terminalId}
                                    </div>
                                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                                      {/* Cards section */}
                                      {methods.includes('Cards') && (
                                        <div style={{ flex: '1 1 220px', background: 'white', borderRadius: 8, border: '1px solid #e5e7eb', padding: '10px 14px' }}>
                                          <div style={{ fontSize: 10, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
                                            Cards
                                          </div>
                                          <div style={{ marginBottom: 8 }}>
                                            <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>Supported Networks</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                              {(t.supportedNetworks || []).map(net => (
                                                <span key={net} style={{ fontSize: 10, background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>{net}</span>
                                              ))}
                                              {!(t.supportedNetworks || []).length && <span style={{ fontSize: 10, color: '#9ca3af', fontStyle: 'italic' }}>Not specified</span>}
                                            </div>
                                          </div>
                                          <div style={{ marginBottom: 8 }}>
                                            <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>Supported Issuer Banks</div>
                                            {(() => {
                                              const items = t.supportedIssuers || []
                                              if (items.includes('ALL')) return <span style={{ fontSize: 10, background: '#f5f3ff', color: '#7c3aed', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>All Issuers</span>
                                              const SHOW_LIMIT = 5
                                              const showAll = expandedCapSection === `${t.key}-issuers`
                                              const visible = showAll ? items : items.slice(0, SHOW_LIMIT)
                                              return (
                                                <>
                                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                    {visible.map(iss => <span key={iss} style={{ fontSize: 10, background: '#f5f3ff', color: '#7c3aed', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>{iss}</span>)}
                                                  </div>
                                                  {items.length > SHOW_LIMIT && (
                                                    <button
                                                      onClick={(e) => { e.stopPropagation(); setExpandedCapSection(showAll ? null : `${t.key}-issuers`) }}
                                                      style={{ fontSize: 10, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', marginTop: 4, fontWeight: 500 }}
                                                    >
                                                      {showAll ? 'Show less' : `Show all (${items.length})`}
                                                    </button>
                                                  )}
                                                </>
                                              )
                                            })()}
                                            {!(t.supportedIssuers || []).length && <span style={{ fontSize: 10, color: '#9ca3af', fontStyle: 'italic' }}>Not specified</span>}
                                          </div>
                                          <div>
                                            <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>Card Types</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                              {(t.supportedCardTypes || []).map(ct => (
                                                <span key={ct} style={{ fontSize: 10, background: '#fffbeb', color: '#d97706', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>{ct.charAt(0).toUpperCase() + ct.slice(1)}</span>
                                              ))}
                                              {!(t.supportedCardTypes || []).length && <span style={{ fontSize: 10, color: '#9ca3af', fontStyle: 'italic' }}>Not specified</span>}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      {/* UPI section */}
                                      {methods.includes('UPI') && (
                                        <div style={{ flex: '1 1 220px', background: 'white', borderRadius: 8, border: '1px solid #e5e7eb', padding: '10px 14px' }}>
                                          <div style={{ fontSize: 10, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
                                            UPI
                                          </div>
                                          <div style={{ marginBottom: 8 }}>
                                            <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>Supported Flows</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                              {(t.supportedUPIFlows || []).map(flow => (
                                                <span key={flow} style={{ fontSize: 10, background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>{flow}</span>
                                              ))}
                                              {!(t.supportedUPIFlows || []).length && <span style={{ fontSize: 10, color: '#9ca3af', fontStyle: 'italic' }}>Not specified</span>}
                                            </div>
                                          </div>
                                          <div style={{ marginBottom: 8 }}>
                                            <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>VPA Handles</div>
                                            {(() => {
                                              const items = t.supportedVPAHandles || []
                                              if (items.includes('ALL')) return <span style={{ fontSize: 10, background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>All Handles</span>
                                              const SHOW_LIMIT = 5
                                              const showAll = expandedCapSection === `${t.key}-vpa`
                                              const visible = showAll ? items : items.slice(0, SHOW_LIMIT)
                                              return (
                                                <>
                                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                    {visible.map(h => <span key={h} style={{ fontSize: 10, background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>{h}</span>)}
                                                  </div>
                                                  {items.length > SHOW_LIMIT && (
                                                    <button
                                                      onClick={(e) => { e.stopPropagation(); setExpandedCapSection(showAll ? null : `${t.key}-vpa`) }}
                                                      style={{ fontSize: 10, color: '#059669', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', marginTop: 4, fontWeight: 500 }}
                                                    >
                                                      {showAll ? 'Show less' : `Show all (${items.length})`}
                                                    </button>
                                                  )}
                                                </>
                                              )
                                            })()}
                                            {!(t.supportedVPAHandles || []).length && <span style={{ fontSize: 10, color: '#9ca3af', fontStyle: 'italic' }}>Not specified</span>}
                                          </div>
                                          <div>
                                            <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>Recurring / Mandate</div>
                                            {t.supportsRecurring
                                              ? <span style={{ fontSize: 10, background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>Supported</span>
                                              : <span style={{ fontSize: 10, background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>Not Supported</span>
                                            }
                                          </div>
                                        </div>
                                      )}
                                      {/* NB section */}
                                      {methods.includes('NB') && (
                                        <div style={{ flex: '1 1 220px', background: 'white', borderRadius: 8, border: '1px solid #e5e7eb', padding: '10px 14px' }}>
                                          <div style={{ fontSize: 10, fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c2410c', display: 'inline-block' }} />
                                            Net Banking
                                          </div>
                                          <div>
                                            <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>Supported Banks</div>
                                            {(() => {
                                              const items = t.supportedNBBanks || []
                                              if (items.includes('ALL')) return <span style={{ fontSize: 10, background: '#fff7ed', color: '#c2410c', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>All Banks</span>
                                              const SHOW_LIMIT = 5
                                              const showAll = expandedCapSection === `${t.key}-banks`
                                              const visible = showAll ? items : items.slice(0, SHOW_LIMIT)
                                              return (
                                                <>
                                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                    {visible.map(b => <span key={b} style={{ fontSize: 10, background: '#fff7ed', color: '#c2410c', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>{b}</span>)}
                                                  </div>
                                                  {items.length > SHOW_LIMIT && (
                                                    <button
                                                      onClick={(e) => { e.stopPropagation(); setExpandedCapSection(showAll ? null : `${t.key}-banks`) }}
                                                      style={{ fontSize: 10, color: '#c2410c', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', marginTop: 4, fontWeight: 500 }}
                                                    >
                                                      {showAll ? 'Show less' : `Show all (${items.length})`}
                                                    </button>
                                                  )}
                                                </>
                                              )
                                            })()}
                                            {!(t.supportedNBBanks || []).length && <span style={{ fontSize: 10, color: '#9ca3af', fontStyle: 'italic' }}>Not specified</span>}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 4: METRICS                                         */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div ref={el => sectionRefs.current.metrics = el} className="kam-tab-section">
      <div className="kam-card">
        <div className="kam-card-header">
          <h3 className="kam-card-title">
            <BarChartIcon />
            Key Metrics
          </h3>
        </div>
        <div className="kam-detail-metrics">
          <MetricCard
            icon={<CheckCircleIcon />}
            iconBg="var(--rzp-success-light)"
            iconColor="var(--rzp-success)"
            label="Success Rate"
            value={`${merchant.avgPaymentSuccessRate}%`}
            delta={merchant.avgPaymentSuccessRate >= 72 ? '+0.3%' : null}
            deltaType={merchant.avgPaymentSuccessRate >= 72 ? 'positive' : 'negative'}
          />
          <MetricCard
            icon={<BarChartIcon />}
            iconBg="var(--rzp-blue-light)"
            iconColor="var(--rzp-blue)"
            label="Monthly Transactions"
            value={formatNumber(merchant.monthlyTxnVolume)}
            delta="+2.1%"
            deltaType="positive"
          />
          <MetricCard
            icon={<RoutingIcon />}
            iconBg={dopplerRoutePercent >= 80 ? 'var(--rzp-blue-light)' : 'var(--rzp-warning-light)'}
            iconColor={dopplerRoutePercent >= 80 ? 'var(--rzp-blue)' : 'var(--rzp-warning)'}
            label="SR Based Routing"
            value={`${dopplerRoutePercent}%`}
            delta={dopplerRoutePercent >= 80 ? 'Healthy' : 'Below 80% threshold'}
            deltaType={dopplerRoutePercent >= 80 ? 'positive' : 'negative'}
          />
          <MetricCard
            icon={<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>}
            iconBg={ntfCount > 0 ? 'var(--rzp-danger-light, #fff5f5)' : 'var(--rzp-success-light)'}
            iconColor={ntfCount > 0 ? 'var(--rzp-danger)' : 'var(--rzp-success)'}
            label="NTF Failures"
            value={ntfCount}
            delta={ntfCount > 0 ? `${((ntfCount / transactions.length) * 100).toFixed(1)}% of txns` : 'No NTFs'}
            deltaType={ntfCount > 0 ? 'negative' : 'positive'}
          />
        </div>
      </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 5: SR TREND                                        */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div ref={el => sectionRefs.current['sr-trend'] = el} className="kam-tab-section">
      <SRLineChart srData={srData} />
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 6: TRANSACTIONS                                    */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div ref={el => sectionRefs.current.transactions = el} className="kam-tab-section">
        <div className="kam-card">
          {/* Header */}
          <div className="kam-card-header">
            <h3 className="kam-card-title">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              Transactions
            </h3>
            <button className="kam-txn-export-btn" onClick={exportTxnCSV} title="Export filtered transactions as CSV">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export CSV
            </button>
          </div>

          {/* Toolbar: search + date presets */}
          <div className="kam-txn-toolbar">
            <div className="kam-txn-search">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search by ID, method, status, or gateway..."
                value={txnSearch}
                onChange={(e) => setTxnSearch(e.target.value)}
              />
              {txnSearch && (
                <button className="kam-txn-search-clear" onClick={() => setTxnSearch('')} title="Clear search">
                  <XIcon />
                </button>
              )}
            </div>
            <div className="kam-txn-date-presets">
              {[{ key: 'all', label: 'All' }, { key: '30d', label: '30d' }, { key: '7d', label: '7d' }, { key: '24h', label: '24h' }].map(d => (
                <button
                  key={d.key}
                  className={`kam-txn-date-btn${txnDateRange === d.key ? ' active' : ''}`}
                  onClick={() => setTxnDateRange(d.key)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter dropdowns */}
          <div className="kam-txn-filters">
            {/* Method filter */}
            <div className="kam-txn-filter-wrap">
              <button
                className={`kam-txn-filter-btn${txnMethodFilter.length > 0 ? ' active' : ''}`}
                onClick={() => setOpenTxnDropdown(openTxnDropdown === 'method' ? null : 'method')}
              >
                Method {txnMethodFilter.length > 0 && <span className="kam-txn-filter-count">{txnMethodFilter.length}</span>}
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {openTxnDropdown === 'method' && (
                <div className="kam-txn-filter-dropdown">
                  {['Cards', 'UPI', 'NB'].map(m => (
                    <label key={m} className="kam-txn-filter-option">
                      <input type="checkbox" checked={txnMethodFilter.includes(m)} onChange={() => toggleTxnFilter('method', m)} />
                      <span className={`kam-method-badge ${m.toLowerCase()}`}>{m}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Status filter */}
            <div className="kam-txn-filter-wrap">
              <button
                className={`kam-txn-filter-btn${txnStatusFilter.length > 0 ? ' active' : ''}`}
                onClick={() => setOpenTxnDropdown(openTxnDropdown === 'status' ? null : 'status')}
              >
                Status {txnStatusFilter.length > 0 && <span className="kam-txn-filter-count">{txnStatusFilter.length}</span>}
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {openTxnDropdown === 'status' && (
                <div className="kam-txn-filter-dropdown">
                  {['success', 'failed', 'refunded'].map(s => (
                    <label key={s} className="kam-txn-filter-option">
                      <input type="checkbox" checked={txnStatusFilter.includes(s)} onChange={() => toggleTxnFilter('status', s)} />
                      <span className={`kam-txn-status ${s}`}>{s}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Gateway filter */}
            <div className="kam-txn-filter-wrap">
              <button
                className={`kam-txn-filter-btn${txnGatewayFilter.length > 0 ? ' active' : ''}`}
                onClick={() => setOpenTxnDropdown(openTxnDropdown === 'gateway' ? null : 'gateway')}
              >
                Gateway {txnGatewayFilter.length > 0 && <span className="kam-txn-filter-count">{txnGatewayFilter.length}</span>}
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {openTxnDropdown === 'gateway' && (
                <div className="kam-txn-filter-dropdown">
                  {gatewayOptions.map(g => (
                    <label key={g} className="kam-txn-filter-option">
                      <input type="checkbox" checked={txnGatewayFilter.includes(g)} onChange={() => toggleTxnFilter('gateway', g)} />
                      {g}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* NTF filter toggle */}
            <button
              className={`kam-txn-filter-btn${txnNTFFilter ? ' active' : ''}`}
              onClick={() => setTxnNTFFilter(prev => !prev)}
              style={txnNTFFilter ? { background: 'var(--rzp-danger)', color: '#fff', borderColor: 'var(--rzp-danger)' } : {}}
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              NTF Only
            </button>

            {hasActiveTxnFilters && (
              <button className="kam-txn-clear-filters" onClick={clearTxnFilters}>
                <XIcon /> Clear all
              </button>
            )}
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="kam-txn-table">
              <caption className="kam-sr-only">Transaction history for {merchant.name}</caption>
              <thead>
                <tr>
                  {[
                    { field: 'txnId', label: 'Txn ID' },
                    { field: 'timestamp', label: 'Timestamp' },
                    { field: 'amount', label: 'Amount' },
                    { field: 'method', label: 'Method' },
                    { field: 'status', label: 'Status' },
                    { field: 'gateway', label: 'Gateway' },
                    { field: '_trace', label: '' },
                  ].map(col => (
                    <th
                      key={col.field}
                      className={col.field !== '_trace' ? 'kam-txn-sortable' : ''}
                      onClick={col.field !== '_trace' ? () => toggleTxnSort(col.field) : undefined}
                      style={col.field === '_trace' ? { width: 40 } : undefined}
                    >
                      {col.label}
                      {col.field !== '_trace' && (
                        <span className="kam-txn-sort-icon">
                          {txnSort.field === col.field ? (
                            txnSort.direction === 'asc' ? (
                              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
                            ) : (
                              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                            )
                          ) : (
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3"><polyline points="18 15 12 9 6 15"/></svg>
                          )}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedTxns.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--rzp-text-muted)' }}>
                      No transactions match your filters.
                    </td>
                  </tr>
                ) : (
                  paginatedTxns.map((txn) => (
                    <tr key={txn.txnId} onClick={() => setSelectedTxn(txn)}>
                      <td><span className="txn-id">{txn.txnId}</span></td>
                      <td>{txn.timestamp.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} {txn.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                      <td style={{ fontWeight: 600 }}>{formatINR(txn.amount)}</td>
                      <td><span className="kam-badge neutral">{txn.paymentMethod.short}</span></td>
                      <td><span className={`kam-txn-status ${txn.status}`}>{txn.status}</span></td>
                      <td>{txn.routingDecision.selectedGatewayShort}</td>
                      <td>
                        <button
                          className="kam-txn-trace-btn"
                          title="Trace routing pipeline"
                          onClick={(e) => { e.stopPropagation(); setTraceTransaction(txn) }}
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="kam-txn-pagination">
            <div className="kam-txn-pagination-info">
              Showing {filteredTxns.length === 0 ? 0 : txnPage * txnPageSize + 1}–{Math.min((txnPage + 1) * txnPageSize, filteredTxns.length)} of {filteredTxns.length}
            </div>
            <div className="kam-txn-pagination-controls">
              <button
                className="kam-txn-page-btn"
                disabled={txnPage === 0}
                onClick={() => setTxnPage(p => p - 1)}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              {Array.from({ length: totalTxnPages }, (_, i) => (
                <button
                  key={i}
                  className={`kam-txn-page-btn${txnPage === i ? ' active' : ''}`}
                  onClick={() => setTxnPage(i)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="kam-txn-page-btn"
                disabled={txnPage >= totalTxnPages - 1}
                onClick={() => setTxnPage(p => p + 1)}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
            <div className="kam-txn-page-size-wrap">
              <select
                className="kam-txn-page-size"
                value={txnPageSize}
                onChange={(e) => { setTxnPageSize(Number(e.target.value)); setTxnPage(0) }}
              >
                {[10, 25, 50, 100].map(n => (
                  <option key={n} value={n}>{n} / page</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 7: NTF ANALYSIS                                    */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div ref={el => sectionRefs.current.ntfs = el} className="kam-tab-section">
        <div className="kam-card">
          <div className="kam-card-header">
            <h3 className="kam-card-title">
              <WarningIcon style={{ display: 'inline', verticalAlign: '-3px', marginRight: 6 }} />
              Routing Health
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="kam-ntfa-layer-tabs" style={{ marginBottom: 0 }}>
                <button
                  className={`kam-ntfa-layer-tab ${ntfViewMode === 'ntf' ? 'active' : ''}`}
                  onClick={() => setNtfViewMode('ntf')}
                >
                  Routing Health
                </button>
                <button
                  className={`kam-ntfa-layer-tab ${ntfViewMode === 'health' ? 'active' : ''}`}
                  onClick={() => setNtfViewMode('health')}
                >
                  Routing Health
                </button>
              </div>
              {ntfViewMode === 'ntf' && ntfAnalysis?.summary && (
                <span className="kam-badge danger">{ntfAnalysis.summary.totalNTFCount} failures</span>
              )}
            </div>
          </div>

          {ntfViewMode === 'health' && routingHealthData ? (
            <div className="kam-routing-health">
              <div className="kam-routing-health-header">
                <h3>Routing Health Report</h3>
                <span className="kam-badge info">Based on {routingHealthData.totalTransactions} transactions</span>
              </div>

              {/* Summary cards */}
              <div className="kam-routing-health-summary">
                <div className="kam-routing-health-card">
                  <div className="kam-routing-health-card-label">NTF Rate</div>
                  <div className="kam-routing-health-card-value">{routingHealthData.ntfPercentage}%</div>
                </div>
                <div className="kam-routing-health-card">
                  <div className="kam-routing-health-card-label">Active Terminals</div>
                  <div className="kam-routing-health-card-value">{routingHealthData.terminalDistribution.filter(t => t.count > 0).length}</div>
                </div>
                <div className="kam-routing-health-card">
                  <div className="kam-routing-health-card-label">Active Rules</div>
                  <div className="kam-routing-health-card-value">{routingHealthData.highImpactRules.length}</div>
                </div>
                <div className="kam-routing-health-card">
                  <div className="kam-routing-health-card-label">Dormant Rules</div>
                  <div className={`kam-routing-health-card-value ${routingHealthData.dormantRules.length > 0 ? 'warning' : ''}`}>
                    {routingHealthData.dormantRules.length}
                  </div>
                </div>
              </div>

              {/* Terminal distribution */}
              <div className="kam-routing-health-section">
                <h4>Terminal Distribution</h4>
                {routingHealthData.terminalDistribution.map(td => (
                  <div key={td.terminalId} className="kam-routing-health-dist-row">
                    <span className="kam-routing-health-dist-name">{td.displayId} ({td.gatewayShort})</span>
                    <div className="kam-routing-health-dist-bar-wrap">
                      <div className="kam-routing-health-dist-bar" style={{ width: `${td.percentage}%` }}></div>
                    </div>
                    <span className="kam-routing-health-dist-pct">{td.percentage}% ({td.count})</span>
                  </div>
                ))}
              </div>

              {/* Method breakdown */}
              <div className="kam-routing-health-section">
                <h4>By Payment Method</h4>
                {Object.entries(routingHealthData.methodGroups).map(([method, data]) => (
                  <div key={method} className="kam-routing-health-method-row">
                    <span className="kam-routing-health-method-name">{method}</span>
                    <span>{data.count} txns</span>
                    <span>{data.ntf} NTFs</span>
                    <span className={data.ntf > 0 ? 'danger' : 'success'}>
                      {((data.ntf / data.count) * 100).toFixed(1)}% NTF rate
                    </span>
                  </div>
                ))}
              </div>

              {/* High impact rules */}
              <div className="kam-routing-health-section">
                <h4>Most Active Rules</h4>
                {routingHealthData.highImpactRules.map(r => {
                  const fullRule = (merchant.routingRulesV2 || []).find(rr => rr.id === r.ruleId)
                  const hasCompass = fullRule?._compassDoc
                  return (
                    <div key={r.ruleId} className="kam-routing-health-rule-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="kam-routing-health-rule-name">{r.ruleName}</span>
                        {hasCompass && <span style={{ fontSize: 8, background: '#e3f2fd', color: '#1565c0', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>COMPASS</span>}
                        {fullRule?.compassAction && fullRule.compassAction !== 'include' && (
                          <span style={{ fontSize: 8, background: fullRule.compassAction === 'exclude' ? '#ffebee' : '#e8f5e9', color: fullRule.compassAction === 'exclude' ? '#c62828' : '#2e7d32', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>{fullRule.compassAction.toUpperCase()}</span>
                        )}
                        <span>{r.affectedPayments} txns</span>
                        <span>{r.eliminatedTerminals} terminals eliminated</span>
                      </div>
                      {hasCompass && (
                        <details style={{ marginTop: 4 }}>
                          <summary style={{ fontSize: 10, color: '#666', cursor: 'pointer' }}>View COMPASS document</summary>
                          <pre style={{ fontSize: 9, background: '#1a1a2e', color: '#e0e0e0', padding: 8, borderRadius: 6, marginTop: 4, overflowX: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{JSON.stringify(fullRule._compassDoc, null, 2)}</pre>
                        </details>
                      )}
                    </div>
                  )
                })}
                {routingHealthData.highImpactRules.length === 0 && (
                  <div className="kam-routing-health-empty">No rules matched any transactions.</div>
                )}
              </div>

              {/* Dormant rules */}
              {routingHealthData.dormantRules.length > 0 && (
                <div className="kam-routing-health-section warning">
                  <h4>Dormant Rules (Never Matched)</h4>
                  <p className="kam-routing-health-dormant-desc">
                    These rules are enabled but did not match any of the sample transactions. Consider reviewing or disabling them.
                  </p>
                  {routingHealthData.dormantRules.map(r => (
                    <div key={r.id} className="kam-routing-health-dormant-rule">
                      <span>{r.name}</span>
                      <span className="kam-badge neutral">No matches</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : ntfViewMode === 'health' && !routingHealthData ? (
            <div className="kam-empty-state" style={{ minHeight: 120 }}>
              <ActivityIcon />
              <p>No transaction data available for routing health analysis.</p>
            </div>
          ) : !ntfAnalysis || ntfAnalysis.profiles.length === 0 ? (
            <div className="kam-empty-state" style={{ minHeight: 120 }}>
              <CheckCircleIcon />
              <p>No NTF failures detected. All transactions routed successfully.</p>
            </div>
          ) : (
            <>
              {/* Summary banner */}
              <div className="kam-ntfa-summary">
                <div className="kam-ntfa-summary-metrics">
                  <div className="kam-ntfa-summary-metric">
                    <span className="kam-ntfa-metric-label">Total NTFs</span>
                    <span className="kam-ntfa-metric-value">{ntfAnalysis.summary.totalNTFCount}</span>
                  </div>
                  <div className="kam-ntfa-summary-metric">
                    <span className="kam-ntfa-metric-label">Revenue Lost</span>
                    <span className="kam-ntfa-metric-value danger">{formatINR(ntfAnalysis.summary.totalRevenueLost)}</span>
                  </div>
                  <div className="kam-ntfa-summary-metric">
                    <span className="kam-ntfa-metric-label">SR Impact</span>
                    <span className="kam-ntfa-metric-value danger">{ntfAnalysis.summary.totalSRImpact}%</span>
                  </div>
                  <div className="kam-ntfa-summary-metric">
                    <span className="kam-ntfa-metric-label">Top Cause</span>
                    <span className="kam-ntfa-metric-value small">{ntfAnalysis.summary.topCause}</span>
                    <span className="kam-ntfa-metric-sub">{ntfAnalysis.summary.topCausePercentage}% of NTFs</span>
                  </div>
                </div>
              </div>

              {/* Profile list */}
              <div className="kam-ntfa-profiles">
                {ntfAnalysis.profiles.map(profile => {
                  const isExpanded = expandedProfiles.has(profile.id)
                  const activeLayer = ntfActiveLayer[profile.id] || 'isolate'
                  return (
                    <div key={profile.id} className={`kam-ntfa-profile ${isExpanded ? 'expanded' : ''}`}>
                      <div
                        className="kam-ntfa-profile-header"
                        onClick={() => {
                          setExpandedProfiles(prev => {
                            const next = new Set(prev)
                            next.has(profile.id) ? next.delete(profile.id) : next.add(profile.id)
                            return next
                          })
                        }}
                      >
                        <div className="kam-ntfa-profile-info">
                          <span className="kam-ntfa-profile-label">{profile.profileLabel}</span>
                          <span className={`kam-badge ${profile.ntfCause === 'rule_elimination' ? 'danger' : profile.ntfCause === 'method_unsupported' ? 'warning' : 'neutral'}`}>
                            {profile.ntfCauseLabel}
                          </span>
                        </div>
                        <div className="kam-ntfa-profile-stats">
                          <span className="kam-badge danger">{profile.txnCount} txns</span>
                          <span className="kam-ntfa-revenue-lost">{formatINR(profile.totalAmount)} failed</span>
                          <ChevronIcon className={`kam-ntfa-chevron ${isExpanded ? 'expanded' : ''}`} />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="kam-ntfa-profile-body">
                          {/* Layer tabs */}
                          <div className="kam-ntfa-layer-tabs">
                            {['isolate', 'understand', 'act'].map(layer => (
                              <button
                                key={layer}
                                className={`kam-ntfa-layer-tab ${activeLayer === layer ? 'active' : ''}`}
                                onClick={() => setNtfActiveLayer(prev => ({ ...prev, [profile.id]: layer }))}
                              >
                                {layer === 'isolate' ? 'Rule Chain' : layer === 'understand' ? 'Impact' : 'Actions'}
                              </button>
                            ))}
                          </div>

                          {/* Layer 1: Isolate — Visual rule chain funnel */}
                          {activeLayer === 'isolate' && (() => {
                            const steps = profile.ruleChainTrace.steps
                            const initialCount = steps[0]?.terminalsRemaining?.length || 0
                            const totalTerminals = initialCount + (steps[0]?.terminalsEliminated?.length || 0)
                            return (
                            <div className="kam-ntfa-funnel">
                              {/* Funnel header */}
                              <div className="kam-ntfa-funnel-header">
                                <span className="kam-ntfa-funnel-title">Terminal Elimination Funnel</span>
                                <span className="kam-ntfa-funnel-subtitle">{totalTerminals} total terminals → {initialCount} eligible → 0 remaining</span>
                              </div>

                              {steps.map((step, si) => {
                                const remainCount = step.terminalsRemaining?.length || 0
                                const elimCount = step.terminalsEliminated?.length || 0
                                const barWidth = initialCount > 0 ? Math.max((remainCount / initialCount) * 100, 0) : 0
                                const elimWidth = initialCount > 0 ? (elimCount / initialCount) * 100 : 0
                                const isNTF = step.type === 'ntf'
                                const isNTFCause = step.type === 'rule_ntf' || step.type === 'pipeline_filter'
                                const isFilter = step.type === 'rule_filter'
                                const isSkip = step.type === 'rule_skip'
                                const isInitial = step.type === 'initial'
                                const isPass = step.type === 'rule_pass'

                                if (isNTF) {
                                  return (
                                    <div key={si} className="kam-ntfa-funnel-ntf">
                                      <div className="kam-ntfa-funnel-ntf-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                                      </div>
                                      <div className="kam-ntfa-funnel-ntf-content">
                                        <span className="kam-ntfa-funnel-ntf-label">{step.label}</span>
                                        <span className="kam-ntfa-funnel-ntf-desc">{step.description}</span>
                                      </div>
                                    </div>
                                  )
                                }

                                return (
                                  <div key={si} className={`kam-ntfa-funnel-step ${isNTFCause ? 'ntf-cause' : isFilter ? 'filtered' : isSkip ? 'skipped' : ''}`}>
                                    {/* Step number + connector */}
                                    <div className="kam-ntfa-funnel-left">
                                      <div className={`kam-ntfa-funnel-num ${isNTFCause ? 'danger' : isFilter ? 'warning' : isSkip ? 'neutral' : 'success'}`}>
                                        {step.stepNumber}
                                      </div>
                                      {si < steps.length - 1 && <div className="kam-ntfa-funnel-connector" />}
                                    </div>

                                    <div className="kam-ntfa-funnel-body">
                                      {/* Step header with label and counts */}
                                      <div className="kam-ntfa-funnel-step-header">
                                        <div className="kam-ntfa-funnel-step-info">
                                          <span className="kam-ntfa-funnel-step-label">{step.label}</span>
                                          {step.ruleType && <span className="kam-badge neutral" style={{ fontSize: 10 }}>{step.ruleType}</span>}
                                          {isSkip && <span className="kam-badge neutral" style={{ fontSize: 10 }}>Skipped</span>}
                                        </div>
                                        <div className="kam-ntfa-funnel-counts">
                                          {!isInitial && elimCount > 0 && (
                                            <span className="kam-ntfa-count-elim">−{elimCount}</span>
                                          )}
                                          <span className={`kam-ntfa-count-remain ${remainCount === 0 ? 'zero' : ''}`}>
                                            {remainCount} left
                                          </span>
                                        </div>
                                      </div>

                                      {/* Description */}
                                      <p className="kam-ntfa-funnel-desc">{step.description}</p>

                                      {/* Visual funnel bar */}
                                      {!isSkip && (
                                        <div className="kam-ntfa-funnel-bar-wrapper">
                                          <div className="kam-ntfa-funnel-bar">
                                            <div
                                              className={`kam-ntfa-funnel-bar-fill ${remainCount === 0 ? 'empty' : isFilter || isNTFCause ? 'warning' : 'success'}`}
                                              style={{ width: `${barWidth}%` }}
                                            />
                                            {elimCount > 0 && (
                                              <div
                                                className="kam-ntfa-funnel-bar-elim"
                                                style={{ width: `${elimWidth}%` }}
                                              />
                                            )}
                                          </div>
                                          <span className="kam-ntfa-funnel-bar-label">
                                            {remainCount}/{initialCount}
                                          </span>
                                        </div>
                                      )}

                                      {/* Terminal chips — remaining + eliminated in one row */}
                                      {((step.terminalsRemaining && step.terminalsRemaining.length > 0) || (step.terminalsEliminated && step.terminalsEliminated.length > 0)) && (
                                        <div className="kam-ntfa-funnel-terminals">
                                          {step.terminalsRemaining?.map(t => (
                                            <span key={t.terminalId || t.displayId} className="kam-ntfa-terminal-chip remaining">
                                              {t.displayId || t.terminalId}
                                            </span>
                                          ))}
                                          {step.terminalsEliminated?.map(t => (
                                            <span key={t.terminalId || t.displayId} className="kam-ntfa-terminal-chip eliminated">
                                              {t.displayId || t.terminalId} ✕
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            )
                          })()
                          }

                          {/* Layer 2: Understand — Impact */}
                          {activeLayer === 'understand' && (
                            <div className="kam-ntfa-understand">
                              <div className="kam-ntfa-impact-grid">
                                <div className="kam-ntfa-impact-card">
                                  <span className="kam-ntfa-metric-label">Revenue Lost</span>
                                  <span className="kam-ntfa-metric-value danger">{formatINR(profile.impact.revenueLost)}</span>
                                </div>
                                <div className="kam-ntfa-impact-card">
                                  <span className="kam-ntfa-metric-label">SR Impact</span>
                                  <span className="kam-ntfa-metric-value danger">{profile.impact.srImpact}%</span>
                                </div>
                                <div className="kam-ntfa-impact-card">
                                  <span className="kam-ntfa-metric-label">Failed Txns</span>
                                  <span className="kam-ntfa-metric-value">{profile.txnCount}</span>
                                </div>
                              </div>

                              <div className="kam-ntfa-explain-card">
                                <h4>Trade-off</h4>
                                <p>{profile.impact.tradeOff}</p>
                              </div>

                              {profile.impact.alternativeTerminals.length > 0 && (
                                <div className="kam-ntfa-explain-card alt">
                                  <h4>Alternative Terminals</h4>
                                  <p>These terminals could be procured to provide coverage:</p>
                                  <div className="kam-ntfa-alt-terminals">
                                    {profile.impact.alternativeTerminals.map(t => (
                                      <div key={t.terminalId} className="kam-ntfa-alt-row">
                                        <span className="kam-ntfa-terminal-chip remaining">{t.displayId}</span>
                                        <span>{t.gatewayShort}</span>
                                        <span>SR: {t.successRate}%</span>
                                        <span>Cost: ₹{t.costPerTxn.toFixed(2)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Layer 3: Act — Recommendations */}
                          {activeLayer === 'act' && (
                            <div className="kam-ntfa-actions">
                              {profile.actions.map(action => (
                                <div key={action.id} className={`kam-ntfa-action ${action.priority}`}>
                                  <div className="kam-ntfa-action-header">
                                    <span className={`kam-badge ${action.priority === 'high' ? 'danger' : action.priority === 'medium' ? 'warning' : 'info'}`}>
                                      {action.priority}
                                    </span>
                                    <span className="kam-badge neutral">{action.owner}</span>
                                  </div>
                                  <h4 className="kam-ntfa-action-title">{action.title}</h4>
                                  <p className="kam-ntfa-action-desc">{action.description}</p>
                                  <div className="kam-ntfa-action-footer">
                                    {action.type === 'external' && action.escalationTemplate && (
                                      <button
                                        className="kam-btn kam-btn-sm kam-btn-outline"
                                        onClick={() => {
                                          const tpl = action.escalationTemplate
                                          const text = `To: ${tpl.to}\nSubject: ${tpl.subject}\n\n${tpl.body}`
                                          navigator.clipboard.writeText(text)
                                          setCopiedTemplate(action.id)
                                          setTimeout(() => setCopiedTemplate(null), 2000)
                                        }}
                                      >
                                        {copiedTemplate === action.id ? 'Copied!' : 'Copy Escalation Template'}
                                      </button>
                                    )}
                                    {action.type === 'in-dashboard' && (
                                      <span className="kam-ntfa-action-hint">Review in Rules tab above</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  SECTION 8: AUDIT LOG                                       */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div ref={el => sectionRefs.current.audit = el} className="kam-tab-section">
      <div className="kam-card">
        <div className="kam-card-header">
          <h3 className="kam-card-title">
            <ClockIcon style={{ display: 'inline', verticalAlign: '-3px', marginRight: 6 }} />
            Audit Log
          </h3>
          <span className="kam-badge neutral">{relevantLogs.length} entries</span>
        </div>

        {relevantLogs.length === 0 ? (
          <div className="kam-empty-state" style={{ minHeight: 120 }}>
            <ClockIcon />
            <p>No audit entries yet for this merchant.</p>
          </div>
        ) : (
          <div className="kam-audit-timeline">
            {relevantLogs.map((entry) => (
              <div className="kam-audit-entry" key={entry.id}>
                <div className="audit-header">
                  <span className="audit-time">{entry.timestamp}</span>
                  <span className="audit-user">{entry.user}</span>
                </div>
                <div className="audit-action">{entry.action}</div>
                {entry.reason && (
                  <div className="audit-reason">{entry.reason}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      {/* ── Transaction Routing Drawer ─────────────────────── */}
      {selectedTxn && (
        <>
          <div className="kam-drawer-overlay" onClick={() => setSelectedTxn(null)} />
          <div className="kam-drawer">
            <div className="kam-drawer-header">
              <h3>Routing Decision</h3>
              <button className="kam-drawer-close" onClick={() => setSelectedTxn(null)}>
                <XIcon />
              </button>
            </div>
            <div className="kam-drawer-body">
              {/* Transaction Info */}
              <div className="kam-drawer-section">
                <div className="kam-drawer-section-title">Transaction Details</div>
                <div className="kam-drawer-info-grid">
                  <div className="kam-drawer-info-item">
                    <span className="label">Transaction ID</span>
                    <span className="value">{selectedTxn.txnId}</span>
                  </div>
                  <div className="kam-drawer-info-item">
                    <span className="label">Amount</span>
                    <span className="value">{formatINR(selectedTxn.amount)}</span>
                  </div>
                  <div className="kam-drawer-info-item">
                    <span className="label">Payment Method</span>
                    <span className="value">{selectedTxn.paymentMethod.type}</span>
                  </div>
                  <div className="kam-drawer-info-item">
                    <span className="label">Status</span>
                    <span className="value"><span className={`kam-txn-status ${selectedTxn.status}`}>{selectedTxn.status}</span></span>
                  </div>
                  <div className="kam-drawer-info-item">
                    <span className="label">Timestamp</span>
                    <span className="value">{selectedTxn.timestamp.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} {selectedTxn.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                  </div>
                </div>
              </div>

              {/* Routing Decision */}
              <div className="kam-drawer-section">
                <div className="kam-drawer-section-title">Routing Decision</div>
                <div className={`kam-routing-explanation ${merchant.srSensitive ? 'sr-locked' : selectedTxn.routingDecision.wasDePrioritized ? 'deprioritized' : 'normal'}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {merchant.srSensitive ? (
                      <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>
                    ) : selectedTxn.routingDecision.wasDePrioritized ? (
                      <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>
                    ) : (
                      <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>
                    )}
                  </svg>
                  <div>{selectedTxn.routingDecision.reason}</div>
                </div>
              </div>

              {/* Routing Pipeline */}
              <div className="kam-drawer-section">
                <div className="kam-drawer-section-title">Routing Pipeline — All Evaluated Terminals</div>
                <div className="kam-pipeline-list">
                  {selectedTxn.routingDecision.allEvaluated.map((item, i) => (
                    <div
                      key={i}
                      className={`kam-pipeline-item ${item.status === 'selected' ? 'selected' : 'rejected'}`}
                    >
                      <div className="kam-pipeline-item-header">
                        <span className="kam-pipeline-item-terminal">
                          {item.terminalId} <span style={{ fontWeight: 400, color: 'var(--rzp-text-muted)', fontSize: 12 }}>({item.gatewayShort})</span>
                        </span>
                        <span className={`kam-pipeline-item-status ${item.status === 'selected' ? 'selected' : 'rejected'}`}>
                          {item.status === 'selected' ? 'Selected' : 'Rejected'}
                        </span>
                      </div>
                      <div className="kam-pipeline-item-metrics">
                        <span>SR: <strong>{item.successRate}%</strong></span>
                        <span>Cost: <strong>{'\u20B9'}{item.costPerTxn.toFixed(2)}</strong></span>
                      </div>
                      <div className="kam-pipeline-item-reason">{item.statusReason}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Transaction Trace Drawer ────────────────────────────── */}
      {traceTransaction && (
        <div className="kam-trace-overlay" onClick={() => setTraceTransaction(null)}>
          <div className="kam-trace-drawer" onClick={e => e.stopPropagation()}>
            <div className="kam-trace-drawer-header">
              <h3>Routing Trace</h3>
              <button className="kam-trace-close" onClick={() => setTraceTransaction(null)}>&times;</button>
            </div>

            {/* Transaction summary */}
            <div className="kam-trace-txn-summary">
              <div className="kam-trace-txn-id">{traceTransaction.txnId}</div>
              <div className="kam-trace-txn-details">
                {traceTransaction.paymentMethod?.type} &middot; {formatINR(traceTransaction.amount)} &middot;{' '}
                <span className={`kam-badge ${traceTransaction.status === 'success' ? 'success' : traceTransaction.status === 'failed' ? 'danger' : 'warning'}`}>
                  {traceTransaction.status}
                </span>
                {traceTransaction.isNTF && <span className="kam-badge danger">NTF</span>}
              </div>
            </div>

            {/* Pipeline trace */}
            <TracePipeline txn={traceTransaction} merchant={merchant} rules={merchant.routingRulesV2 || []} />
          </div>
        </div>
      )}

      {/* ── Terminal Confirmation Modal ───────────────────────────── */}
      {confirmTerminal && (
        <div className="kam-modal-overlay" onClick={() => setConfirmTerminal(null)}>
          <div className="kam-modal" onClick={(e) => e.stopPropagation()}>
            <div className="kam-modal-header">
              <div>
                <h3>Disable Terminal</h3>
                <p>This action will remove the terminal from active routing.</p>
              </div>
              <button className="kam-modal-close" onClick={() => setConfirmTerminal(null)}>
                <XIcon />
              </button>
            </div>
            <div className="kam-modal-body">
              <div className="kam-confirm-icon warning">
                <WarningIcon />
              </div>
              <p style={{ fontSize: 14, fontFamily: 'var(--font-secondary)', color: 'var(--rzp-text-primary)', lineHeight: 1.6 }}>
                Are you sure you want to disable{' '}
                <strong>{confirmTerminal.terminalId}</strong>?
              </p>
              <p style={{ fontSize: 14, fontFamily: 'var(--font-secondary)', color: 'var(--rzp-text-secondary)', lineHeight: 1.6, marginTop: 8 }}>
                This terminal currently processes{' '}
                <strong style={{ color: 'var(--rzp-warning)' }}>
                  {formatLakhs(confirmTerminal.dailyVolume)}
                </strong>{' '}
                in daily volume. Disabling it will redistribute traffic to the remaining active
                terminals.
              </p>
            </div>
            <div className="kam-modal-footer">
              <button className="kam-btn kam-btn-secondary" onClick={() => setConfirmTerminal(null)}>
                Cancel
              </button>
              <button className="kam-btn kam-btn-danger" onClick={confirmDisableTerminal}>
                Confirm Disable
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Deal Warning Modal ─────────────────────────────────────── */}
      {showDealWarning && (
        <div className="kam-modal-overlay" onClick={() => setShowDealWarning(false)}>
          <div className="kam-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="kam-modal-header">
              <div>
                <h3>Gateway Change Warning</h3>
                <p>{merchant.name}</p>
              </div>
              <button className="kam-modal-close" onClick={() => setShowDealWarning(false)}>
                <XIcon />
              </button>
            </div>
            <div className="kam-modal-body">
              <div className="kam-warning-box" style={{ marginBottom: 16 }}>
                <WarningIcon />
                <span>
                  This merchant has an active <strong>{merchant.dealType === 'tsp' ? 'TSP deal' : 'offer-linked deal'}</strong>.
                  Changing the primary gateway may void negotiated rates or break offer routing constraints.
                </span>
              </div>
              {merchant.dealDetails?.constraint && (
                <p style={{ fontSize: 13, fontFamily: 'var(--font-secondary)', color: 'var(--rzp-text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
                  <strong>Current constraint:</strong> {merchant.dealDetails.constraint}
                </p>
              )}
              {merchant.dealDetails?.contact && (
                <p style={{ fontSize: 13, fontFamily: 'var(--font-secondary)', color: 'var(--rzp-text-secondary)', lineHeight: 1.5 }}>
                  Please contact <a href={`mailto:${merchant.dealDetails.contact}`} style={{ color: 'var(--rzp-blue)' }}>{merchant.dealDetails.contact}</a> before making changes.
                </p>
              )}
            </div>
            <div className="kam-modal-footer">
              <button className="kam-btn kam-btn-secondary" onClick={() => setShowDealWarning(false)}>
                Cancel
              </button>
              <button
                className="kam-btn kam-btn-danger"
                onClick={() => {
                  setShowDealWarning(false)
                  const el = document.getElementById('terminal-section')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// MetricCard sub-component
// ---------------------------------------------------------------------------
function MetricCard({ icon, iconBg, iconColor, label, value, delta, deltaType }) {
  return (
    <div className="kam-metric-card">
      <div className="metric-icon" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {delta && (
        <div className={`metric-delta ${deltaType}`}>
          {deltaType === 'positive' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
              <polyline points="17 18 23 18 23 12" />
            </svg>
          )}
          {delta}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Visual Pipeline (NetLogo-style routing simulator)
// ---------------------------------------------------------------------------
function GaltonBoard({ merchant, rules, simOverrides, setSimOverrides, gateways: gwData }) {
  const [galtonRange, setGaltonRange] = useState('7d')
  const [galtonBalls, setGaltonBalls] = useState([])
  const [isDropping, setIsDropping] = useState(false)
  const [hoveredBin, setHoveredBin] = useState(null)
  const dropTimerRef = useRef(null)

  // Generate transactions and filter by date range
  const allTxns = useMemo(() => merchant ? generateMerchantTransactions(merchant) : [], [merchant])

  const filteredTxns = useMemo(() => {
    const now = new Date(2026, 2, 11, 10, 0, 0)
    const rangeMs = {
      '24h': 24 * 3600000,
      '7d': 7 * 24 * 3600000,
      '30d': 30 * 24 * 3600000,
      'all': Infinity,
    }
    const cutoff = rangeMs[galtonRange] || rangeMs['7d']
    if (cutoff === Infinity) return allTxns
    return allTxns.filter(t => (now.getTime() - t.timestamp.getTime()) <= cutoff)
  }, [allTxns, galtonRange])

  // Batch simulation result
  const batchResult = useMemo(() => {
    if (!merchant || !merchant.gatewayMetrics) return { totalPayments: 0, terminalDistribution: [], ntfCount: 0, ntfPercentage: 0, traces: [], ruleImpact: [] }
    return batchSimulatePayments(merchant, filteredTxns, rules, simOverrides)
  }, [merchant, filteredTxns, rules, simOverrides])

  // Build terminal columns (always show all terminals + NTF bin)
  const terminalCols = useMemo(() => {
    if (!merchant || !merchant.gatewayMetrics || !batchResult?.terminalDistribution) return []
    const cols = merchant.gatewayMetrics.map(gm => {
      const gw = gwData.find(g => g.id === gm.gatewayId)
      const term = gw?.terminals.find(t => t.id === gm.terminalId)
      const dist = batchResult.terminalDistribution.find(d => d.terminalId === gm.terminalId)
      return {
        terminalId: gm.terminalId,
        displayId: term?.terminalId || gm.terminalId,
        gatewayShort: gw?.shortName || '??',
        count: dist?.count || 0,
        percentage: dist?.percentage || 0,
        avgSR: dist?.avgSR || gm.successRate,
        avgCost: dist?.avgCost || gm.costPerTxn,
      }
    })
    // Add NTF bin
    cols.push({
      terminalId: '__ntf__',
      displayId: 'NTF',
      gatewayShort: 'Failed',
      count: batchResult.ntfCount,
      percentage: batchResult.ntfPercentage,
      avgSR: 0,
      avgCost: 0,
      isNTF: true,
    })
    return cols
  }, [merchant, gwData, batchResult])

  // Extract rule rows from simulation for the peg board
  const ruleRows = useMemo(() => {
    if (!merchant || !merchant.gatewayMetrics) return []
    // Run a single representative txn to get the rule stages
    const sampleTxn = {
      payment_method: 'Cards',
      amount: 5000,
      card_network: 'Visa',
      card_type: 'credit',
      international: false,
    }
    const sampleResult = simulateRoutingPipeline(merchant, sampleTxn, rules, simOverrides)
    const ruleStages = sampleResult.stages.filter(s =>
      s.type === 'rule_filter' || s.type === 'rule_ntf' || s.type === 'rule_skip' || s.type === 'rule_pass' || s.type === 'rule_disabled'
    )
    return ruleStages.map(stage => {
      const eliminatedIds = new Set((stage.terminalsEliminated || []).map(t => t.terminalId))
      const remainingIds = new Set((stage.terminalsRemaining || []).map(t => t.terminalId))
      return {
        ruleId: stage.ruleId,
        ruleName: stage.ruleName || stage.label,
        type: stage.type,
        eliminatedIds,
        remainingIds,
        isDisabled: stage.isWhatIfDisabled,
      }
    })
  }, [merchant, rules, simOverrides])

  // Sorter scores for deflector widths
  const sorterScores = useMemo(() => {
    const sampleTxn = { payment_method: 'Cards', amount: 5000, card_network: 'Visa', card_type: 'credit', international: false }
    const sampleResult = simulateRoutingPipeline(merchant, sampleTxn, rules, simOverrides)
    const sorterStage = sampleResult.stages.find(s => s.type === 'sorter')
    if (!sorterStage?.scored) return {}
    const scoreMap = {}
    sorterStage.scored.forEach(t => { scoreMap[t.terminalId] = t.finalScore })
    return scoreMap
  }, [merchant, rules, simOverrides])

  // Layout constants
  const W = 800, H = 600
  const colCount = terminalCols.length
  const laneW = W / colCount
  const entryY = 60
  const pegStartY = 100
  const pegRowH = ruleRows.length > 0 ? Math.min(45, 160 / ruleRows.length) : 45
  const sorterY = pegStartY + ruleRows.length * pegRowH + 20
  const binStartY = sorterY + 60
  const binH = H - binStartY - 30

  // Max fill for bin scaling
  const maxCount = Math.max(...terminalCols.map(c => c.count), 1)

  // Ball color by payment method
  const ballColor = (pm) => {
    if (pm === 'UPI') return '#16a34a'
    if (pm === 'NB') return '#9333ea'
    return '#2563eb' // Cards default
  }

  // Handle dropping balls
  // Ref to track dropping state without stale closures
  const isDroppingRef = useRef(false)

  const handleDrop = useCallback(() => {
    if (isDroppingRef.current) return
    if (!batchResult || !batchResult.traces || batchResult.traces.length === 0 || terminalCols.length === 0) return
    isDroppingRef.current = true
    setIsDropping(true)
    setGaltonBalls([])

    const traces = batchResult.traces
    const cols = terminalCols
    const rows = ruleRows

    const balls = traces.map((trace, i) => {
      // Determine which column this ball lands in
      let targetColIdx = cols.findIndex(c => c.terminalId === trace.finalTerminalId)
      if (trace.isNTF || targetColIdx < 0) targetColIdx = cols.length - 1

      // Jitter: +/- 8px horizontal randomness per peg row
      const jitters = rows.map((_, ri) => ((hashStr(trace.id + '-j-' + ri) % 17) - 8))

      return {
        id: trace.id,
        targetColIdx,
        color: ballColor(trace.paymentMethod),
        delay: i * 30,
        isNTF: trace.isNTF,
        jitters,
        paymentMethod: trace.paymentMethod,
        amount: trace.amount,
      }
    })

    // Stagger ball entry
    let ballIdx = 0
    if (dropTimerRef.current) clearInterval(dropTimerRef.current)
    const interval = setInterval(() => {
      if (ballIdx >= balls.length) {
        clearInterval(interval)
        setTimeout(() => {
          isDroppingRef.current = false
          setIsDropping(false)
        }, 1800)
        return
      }
      setGaltonBalls(prev => [...prev, { ...balls[ballIdx], startTime: Date.now() }])
      ballIdx++
    }, 30)
    dropTimerRef.current = interval
  }, [batchResult, terminalCols, ruleRows])

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (dropTimerRef.current) clearInterval(dropTimerRef.current)
      isDroppingRef.current = false
    }
  }, [])

  // Auto-drop on first render or when batch result changes
  useEffect(() => {
    // Clear previous animation
    if (dropTimerRef.current) {
      clearInterval(dropTimerRef.current)
      dropTimerRef.current = null
    }
    isDroppingRef.current = false
    setIsDropping(false)
    setGaltonBalls([])
    const t = setTimeout(() => handleDrop(), 300)
    return () => clearTimeout(t)
  }, [batchResult]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleRule = (ruleId) => {
    if (!ruleId) return
    setSimOverrides(prev => {
      const next = new Set(prev.disabledRules)
      next.has(ruleId) ? next.delete(ruleId) : next.add(ruleId)
      return { ...prev, disabledRules: next }
    })
  }

  // Generate CSS keyframes for each ball dynamically
  const generateBallStyle = useCallback((ball) => {
    if (!ball || !ball.id) return null
    const targetX = laneW * ball.targetColIdx + laneW / 2
    const startX = W / 2
    const totalDuration = 1500 // ms

    // Build keyframe path through peg rows
    const steps = []
    steps.push({ pct: 0, x: startX, y: entryY - 15 })
    steps.push({ pct: 8, x: startX, y: entryY + 10 })

    ruleRows.forEach((_, ri) => {
      const pct = 15 + (ri / Math.max(ruleRows.length, 1)) * 40
      const progress = (ri + 1) / Math.max(ruleRows.length, 1)
      const x = startX + (targetX - startX) * progress * 0.6 + (ball.jitters?.[ri] || 0)
      const y = pegStartY + ri * pegRowH + pegRowH / 2
      steps.push({ pct, x, y })
    })

    // Sorter deflection
    steps.push({ pct: 65, x: startX + (targetX - startX) * 0.85, y: sorterY + 15 })
    // Final position: into the bin
    steps.push({ pct: 88, x: targetX, y: binStartY + 5 })
    steps.push({ pct: 100, x: targetX, y: binStartY + binH * 0.5 })

    const keyframes = steps.map(s =>
      `${s.pct}% { transform: translate(${s.x}px, ${s.y}px); opacity: ${s.pct > 92 ? 0.3 : s.pct < 5 ? 0 : 1}; }`
    ).join('\n')

    const animName = `galton-ball-${(ball.id || 'unknown').replace(/[^a-zA-Z0-9]/g, '')}`

    return {
      animName,
      keyframes,
      duration: totalDuration,
      delay: ball.delay,
    }
  }, [laneW, W, entryY, pegStartY, pegRowH, ruleRows, sorterY, binStartY, binH])

  // Build stylesheet for all active balls (deduplicate by animation name)
  const ballStyleSheet = useMemo(() => {
    if (galtonBalls.length === 0) return ''
    const seen = new Set()
    return galtonBalls.map(ball => {
      const s = generateBallStyle(ball)
      if (!s || seen.has(s.animName)) return ''
      seen.add(s.animName)
      return `@keyframes ${s.animName} { ${s.keyframes} }`
    }).filter(Boolean).join('\n')
  }, [galtonBalls, generateBallStyle])

  if (terminalCols.length === 0) return null

  return (
    <div className="kam-galton-board">
      {/* Inline keyframes for ball animation */}
      {ballStyleSheet && <style>{ballStyleSheet}</style>}

      {/* Controls row */}
      <div className="kam-galton-controls">
        <div className="kam-galton-range-btns">
          {['24h', '7d', '30d', 'all'].map(r => (
            <button
              key={r}
              className={`kam-galton-range-btn${galtonRange === r ? ' active' : ''}`}
              onClick={() => setGaltonRange(r)}
            >{r === 'all' ? 'All' : r}</button>
          ))}
        </div>
        <span className="kam-galton-count">{filteredTxns.length} payments in range</span>
        <button
          className={`kam-galton-drop-btn${isDropping ? ' dropping' : ''}`}
          onClick={handleDrop}
          disabled={isDropping}
        >
          {isDropping ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3"/></svg>
              Dropping...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="8 12 12 16 16 12"/><line x1="12" y1="8" x2="12" y2="16"/>
              </svg>
              Drop Payments
            </>
          )}
        </button>
      </div>

      {/* SVG Board */}
      <svg className="kam-galton-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="galton-glow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="galton-bin-fill-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="var(--rzp-blue)" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="var(--rzp-blue)" stopOpacity="0.3"/>
          </linearGradient>
          <linearGradient id="galton-ntf-fill-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="var(--rzp-danger)" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="var(--rzp-danger)" stopOpacity="0.3"/>
          </linearGradient>
        </defs>

        {/* ── Entry zone: funnel ── */}
        <path
          d={`M ${W / 2 - 80} ${entryY - 10} L ${W / 2 + 80} ${entryY - 10} L ${W / 2 + 30} ${entryY + 20} L ${W / 2 - 30} ${entryY + 20} Z`}
          className="kam-galton-funnel"
        />
        <text x={W / 2} y={entryY + 5} textAnchor="middle" className="kam-galton-funnel-label">
          {filteredTxns.length} payments
        </text>

        {/* ── Lane dividers (vertical dotted lines) ── */}
        {terminalCols.map((_, ci) => (
          <line
            key={`lane-${ci}`}
            x1={laneW * (ci + 1)} y1={pegStartY - 10}
            x2={laneW * (ci + 1)} y2={H - 10}
            className="kam-galton-lane-divider"
          />
        ))}

        {/* ── Lane headers ── */}
        {terminalCols.map((col, ci) => (
          <text
            key={`hdr-${ci}`}
            x={laneW * ci + laneW / 2}
            y={pegStartY - 15}
            textAnchor="middle"
            className={`kam-galton-lane-header${col.isNTF ? ' ntf' : ''}`}
          >
            {col.displayId.length > 12 ? col.displayId.slice(-8) : col.displayId}
          </text>
        ))}

        {/* ── Peg rows (one per rule) ── */}
        {ruleRows.map((row, ri) => {
          const rowY = pegStartY + ri * pegRowH + pegRowH / 2
          return (
            <g key={`rule-row-${ri}`}>
              {/* Rule label on left */}
              <text
                x={8} y={rowY + 4}
                className={`kam-galton-rule-label${row.isDisabled ? ' disabled' : ''}`}
              >
                {(row.ruleName || '').length > 14 ? (row.ruleName || '').slice(0, 14) + '..' : row.ruleName}
              </text>

              {/* Pegs per terminal column */}
              {terminalCols.map((col, ci) => {
                if (col.isNTF) return null
                const cx = laneW * ci + laneW / 2
                const isEliminated = row.eliminatedIds.has(col.terminalId)
                const isKept = row.remainingIds.has(col.terminalId)
                const isSkip = row.type === 'rule_skip'
                const isDisabled = row.isDisabled

                let pegClass = 'kam-galton-peg'
                if (isDisabled) pegClass += ' disabled'
                else if (isEliminated) pegClass += ' blocking'
                else if (isKept) pegClass += ' open'
                else if (isSkip) pegClass += ' skip'
                else pegClass += ' neutral'

                return (
                  <g key={`peg-${ri}-${ci}`}
                    style={{ cursor: row.ruleId ? 'pointer' : 'default' }}
                    onClick={() => handleToggleRule(row.ruleId)}
                  >
                    <circle cx={cx} cy={rowY} r={8} className={pegClass} />
                    {isEliminated && !isDisabled && (
                      <line x1={cx - 5} y1={rowY - 5} x2={cx + 5} y2={rowY + 5}
                        className="kam-galton-peg-strike" />
                    )}
                  </g>
                )
              })}
            </g>
          )
        })}

        {/* ── Sorter row: angled deflectors ── */}
        <text x={8} y={sorterY + 15} className="kam-galton-rule-label">Sorter</text>
        {terminalCols.map((col, ci) => {
          if (col.isNTF) return null
          const cx = laneW * ci + laneW / 2
          const score = sorterScores[col.terminalId] || 50
          // Normalize score to deflector width (min 10, max laneW-10)
          const maxScore = Math.max(...Object.values(sorterScores), 1)
          const deflW = 10 + (score / maxScore) * (laneW * 0.6 - 10)
          return (
            <g key={`defl-${ci}`}>
              {/* Funnel shape representing sorter weight */}
              <path
                d={`M ${cx - deflW / 2} ${sorterY} L ${cx + deflW / 2} ${sorterY} L ${cx + deflW / 3} ${sorterY + 30} L ${cx - deflW / 3} ${sorterY + 30} Z`}
                className="kam-galton-deflector"
              />
              <text x={cx} y={sorterY + 48} textAnchor="middle" className="kam-galton-deflector-score">
                {Math.round(score)}
              </text>
            </g>
          )
        })}

        {/* ── Terminal bins ── */}
        {terminalCols.map((col, ci) => {
          const bx = laneW * ci + 6
          const bw = laneW - 12
          const fillPct = maxCount > 0 ? col.count / maxCount : 0
          const fillH = Math.max(4, fillPct * (binH - 20))
          const isNTFBin = col.isNTF

          return (
            <g key={`bin-${ci}`}
              onMouseEnter={() => setHoveredBin(ci)}
              onMouseLeave={() => setHoveredBin(null)}
              className="kam-galton-bin-group"
            >
              {/* Bin outline */}
              <rect
                x={bx} y={binStartY}
                width={bw} height={binH - 10}
                rx={4}
                className={`kam-galton-bin${isNTFBin ? ' ntf' : ''}`}
              />
              {/* Fill bar from bottom */}
              <rect
                x={bx + 2} y={binStartY + (binH - 12) - fillH}
                width={bw - 4} height={fillH}
                rx={3}
                className={`kam-galton-bin-fill${isNTFBin ? ' ntf' : ''}`}
              />
              {/* Count label */}
              <text
                x={laneW * ci + laneW / 2}
                y={binStartY + binH - 18}
                textAnchor="middle"
                className={`kam-galton-bin-count${isNTFBin ? ' ntf' : ''}`}
              >
                {col.count}
              </text>
              {/* Percentage */}
              <text
                x={laneW * ci + laneW / 2}
                y={binStartY + binH - 4}
                textAnchor="middle"
                className={`kam-galton-bin-pct${isNTFBin ? ' ntf' : ''}`}
              >
                {col.percentage}%
              </text>
              {/* Terminal info below bin */}
              <text
                x={laneW * ci + laneW / 2}
                y={binStartY + binH + 10}
                textAnchor="middle"
                className={`kam-galton-bin-label${isNTFBin ? ' ntf' : ''}`}
              >
                {col.gatewayShort}
              </text>

              {/* Hover tooltip */}
              {hoveredBin === ci && (
                <g>
                  <rect
                    x={laneW * ci + laneW / 2 - 65}
                    y={binStartY - 55}
                    width={130} height={48} rx={6}
                    className="kam-galton-tooltip-bg"
                  />
                  <text x={laneW * ci + laneW / 2} y={binStartY - 38} textAnchor="middle" className="kam-galton-tooltip-text">
                    {isNTFBin ? `${col.count} failed payments` : `SR: ${col.avgSR}% | Cost: ₹${col.avgCost}`}
                  </text>
                  <text x={laneW * ci + laneW / 2} y={binStartY - 22} textAnchor="middle" className="kam-galton-tooltip-sub">
                    {isNTFBin ? 'No terminal found' : `${col.count} payments (${col.percentage}%)`}
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* ── Animated balls ── */}
        {galtonBalls.map((ball, bi) => {
          const s = generateBallStyle(ball)
          if (!s) return null
          return (
            <circle
              key={`${ball.id || bi}-${bi}`}
              r={4}
              className={`kam-galton-ball${ball.isNTF ? ' ntf' : ''}`}
              style={{
                fill: ball.color,
                animation: `${s.animName} ${s.duration}ms ease-in-out forwards`,
                animationDelay: `${s.delay}ms`,
              }}
            />
          )
        })}
      </svg>

      {/* Legend */}
      <div className="kam-galton-legend">
        <span className="kam-galton-legend-item">
          <span className="kam-galton-dot" style={{ background: '#2563eb' }}></span> Cards
        </span>
        <span className="kam-galton-legend-item">
          <span className="kam-galton-dot" style={{ background: '#16a34a' }}></span> UPI
        </span>
        <span className="kam-galton-legend-item">
          <span className="kam-galton-dot" style={{ background: '#9333ea' }}></span> NB
        </span>
        <span className="kam-galton-legend-sep"></span>
        <span className="kam-galton-legend-item">
          <span className="kam-galton-dot blocking"></span> Blocks terminal
        </span>
        <span className="kam-galton-legend-item">
          <span className="kam-galton-dot open"></span> Passes through
        </span>
        <span className="kam-galton-legend-item">
          <span className="kam-galton-dot skip"></span> Rule skipped
        </span>
        <span className="kam-galton-legend-hint">Click pegs to toggle rules</span>
      </div>
    </div>
  )
}

