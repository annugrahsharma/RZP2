import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { gateways, simulateRoutingPipeline } from '../../data/kamMockData'

// ════════════════════════════════════════════
// RoutingCopilot — GenUI Chat for Routing Rules
// ════════════════════════════════════════════

// ── Intent Classifier ──────────────────────
function classifyIntent(input) {
  const q = input.toLowerCase().trim()

  // Rule creation
  if (/create|add|new|write|make|set up|setup/.test(q) && /rule|routing|route/.test(q))
    return { type: 'create_rule', raw: input }
  if (/route\s+(all|every)?\s*(cards?|upi|nb|net\s*banking|emi)/i.test(q))
    return { type: 'create_rule', raw: input }

  // Simulation
  if (/what happens|simulate|send|trace|if i send|payment of|₹|inr/i.test(q) && /visa|master|rupay|upi|card|nb|emi|payment/i.test(q))
    return { type: 'simulate', raw: input }

  // NTF analysis
  if (/ntf|no terminal|why.*(fail|ntf|block)|failure|failing/i.test(q))
    return { type: 'ntf_analysis', raw: input }

  // Show rules
  if (/show|list|display|view|current|existing|what are/.test(q) && /rule|routing|config/i.test(q))
    return { type: 'show_rules', raw: input }

  // What-if
  if (/what if|if i disable|if i remove|if.*drops?|if.*down/i.test(q))
    return { type: 'what_if', raw: input }

  // Coverage gaps
  if (/coverage|gap|uncovered|missing|blind spot/i.test(q))
    return { type: 'coverage', raw: input }

  // Help
  if (/help|what can you|how do i|guide/i.test(q))
    return { type: 'help', raw: input }

  // Terminal info
  if (/terminal|gateway|hdfc|icici|axis|rbl|yes bank/i.test(q))
    return { type: 'terminal_info', raw: input }

  return { type: 'unknown', raw: input }
}

// ── Parse transaction from natural language ──
function parseTxnFromInput(input) {
  const q = input.toLowerCase()
  const txn = {
    payment_method: 'Cards',
    amount: 5000,
    card_network: 'Visa',
    card_type: 'credit',
    international: false,
  }

  if (/upi/i.test(q)) txn.payment_method = 'UPI'
  else if (/net\s*banking|nb/i.test(q)) txn.payment_method = 'NB'
  else if (/emi/i.test(q)) txn.payment_method = 'EMI'

  if (/master/i.test(q)) txn.card_network = 'Mastercard'
  else if (/rupay/i.test(q)) txn.card_network = 'RuPay'
  else if (/visa/i.test(q)) txn.card_network = 'Visa'

  if (/debit/i.test(q)) txn.card_type = 'debit'
  if (/international|intl/i.test(q)) txn.international = true

  const amtMatch = q.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/i) || q.match(/([\d,]+)\s*(?:₹|rs|rupee)/i)
  if (amtMatch) txn.amount = parseInt(amtMatch[1].replace(/,/g, ''))

  return txn
}

// ── Parse rule creation intent ──
function parseRuleIntent(input) {
  const q = input.toLowerCase()
  const intent = { method: null, network: null, terminal: null, gatewayShort: null }

  if (/upi/i.test(q)) intent.method = 'UPI'
  else if (/nb|net\s*banking/i.test(q)) intent.method = 'NB'
  else if (/emi/i.test(q)) intent.method = 'EMI'
  else if (/card/i.test(q)) intent.method = 'Cards'

  if (/visa/i.test(q)) intent.network = 'Visa'
  if (/master/i.test(q)) intent.network = 'Mastercard'
  if (/rupay/i.test(q)) intent.network = 'RuPay'

  // Terminal/gateway matching
  if (/hdfc/i.test(q)) intent.gatewayShort = 'HDFC'
  if (/icici/i.test(q)) intent.gatewayShort = 'ICICI'
  if (/axis/i.test(q)) intent.gatewayShort = 'Axis'
  if (/rbl/i.test(q)) intent.gatewayShort = 'RBL'
  if (/yes/i.test(q)) intent.gatewayShort = 'Yes'

  return intent
}

// ── What-if parser ──
function parseWhatIf(input) {
  const q = input.toLowerCase()
  if (/disable|remove|down/.test(q)) {
    if (/hdfc.?t1|term-hdfc-001/i.test(q)) return { type: 'disable_terminal', terminalId: 'term-hdfc-001', label: 'HDFC_T1' }
    if (/hdfc.?t2|term-hdfc-002/i.test(q)) return { type: 'disable_terminal', terminalId: 'term-hdfc-002', label: 'HDFC_T2' }
    if (/icici.?t1|term-icici-001/i.test(q)) return { type: 'disable_terminal', terminalId: 'term-icici-001', label: 'ICICI_T1' }
    if (/icici.?t2|term-icici-002/i.test(q)) return { type: 'disable_terminal', terminalId: 'term-icici-002', label: 'ICICI_T2' }
    if (/axis/i.test(q)) return { type: 'disable_terminal', terminalId: 'term-axis-001', label: 'AXIS_T1' }
    if (/rbl/i.test(q)) return { type: 'disable_terminal', terminalId: 'term-rbl-001', label: 'RBL_T1' }
    if (/yes/i.test(q)) return { type: 'disable_terminal', terminalId: 'term-yes-001', label: 'YES_T1' }

    // Rule disable
    const ruleMatch = q.match(/rule\s*#?(\d+)/i)
    if (ruleMatch) return { type: 'disable_rule', ruleIndex: parseInt(ruleMatch[1]) - 1 }
  }
  return null
}

// ════════════════════════════════════════════
// GenUI Response Components
// ════════════════════════════════════════════

// ── Pipeline Trace ──
function PipelineTrace({ result, txn }) {
  if (!result) return null
  const stages = result.stages || []

  return (
    <div className="gc-pipeline">
      <div className="gc-pipeline-header">
        <span className="gc-pipeline-label">
          {txn.payment_method} · {txn.card_network || ''} · ₹{txn.amount?.toLocaleString()} · {txn.international ? 'Intl' : 'Domestic'}
        </span>
        {result.isNTF ? (
          <span className="gc-badge gc-badge-danger">NTF — Payment Failed</span>
        ) : (
          <span className="gc-badge gc-badge-success">→ {result.selectedTerminal?.displayId}</span>
        )}
      </div>

      {stages.map((stage, i) => {
        const isNTF = stage.type === 'ntf' || stage.type === 'rule_ntf'
        const isFilter = stage.type === 'rule_filter'
        const isPass = stage.type === 'rule_pass' || stage.type === 'rule_skip'
        const isSorter = stage.type === 'sorter'
        const isPool = stage.type === 'initial'

        return (
          <div key={i} className={`gc-stage ${isNTF ? 'ntf' : isFilter ? 'filter' : isSorter ? 'sorter' : ''}`}>
            <div className="gc-stage-num">{i + 1}</div>
            <div className="gc-stage-body">
              <div className="gc-stage-label">{stage.label}</div>
              <div className="gc-stage-desc">{stage.description}</div>

              {/* Terminal chips */}
              {(stage.terminalsRemaining || []).length > 0 && (
                <div className="gc-chips">
                  {stage.terminalsRemaining.map(t => (
                    <span key={t.terminalId} className="gc-chip gc-chip-pass">
                      {t.displayId} <span className="gc-chip-sr">{t.successRate}%</span>
                    </span>
                  ))}
                </div>
              )}
              {(stage.terminalsEliminated || []).length > 0 && (
                <div className="gc-chips">
                  {stage.terminalsEliminated.map(t => (
                    <span key={t.terminalId} className="gc-chip gc-chip-fail">
                      {t.displayId} <span className="gc-chip-reason">{t.reason}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Sorter scores */}
              {isSorter && stage.scored && (
                <div className="gc-scores">
                  {stage.scored.map((t, si) => (
                    <div key={t.terminalId} className={`gc-score-row ${t.isSelected ? 'selected' : ''}`}>
                      <span className="gc-score-rank">#{si + 1}</span>
                      <span className="gc-score-name">{t.displayId}</span>
                      <div className="gc-score-bar-wrap">
                        <div className="gc-score-bar" style={{ width: `${t.finalScore}%` }}></div>
                      </div>
                      <span className="gc-score-val">{Math.round(t.finalScore)}</span>
                      {t.isSelected && <span className="gc-badge gc-badge-success" style={{ fontSize: 10, padding: '1px 6px' }}>Selected</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Rule Table ──
function RuleTable({ rules, merchant }) {
  const activeRules = rules.filter(r => r.enabled && !r.isDefault)
  const defaults = rules.filter(r => r.isDefault || r.isMethodDefault)

  const formatConditions = (rule) => {
    if (!rule.conditions || rule.conditions.length === 0) return 'All transactions'
    return rule.conditions.map(c => {
      const field = c.field.replace(/_/g, ' ')
      const val = Array.isArray(c.value) ? c.value.join(', ') : c.value
      return `${field} ${c.operator.replace(/_/g, ' ')} ${val}`
    }).join(' AND ')
  }

  const getTerminalLabel = (termId) => {
    for (const gw of gateways) {
      const term = gw.terminals.find(t => t.id === termId)
      if (term) return `${term.terminalId} (${gw.shortName})`
    }
    return termId
  }

  return (
    <div className="gc-rules">
      <div className="gc-rules-title">{merchant.name} — {activeRules.length} active rules, {defaults.length} defaults</div>
      <table className="gc-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Conditions</th>
            <th>Routes To</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {activeRules.map((r, i) => (
            <tr key={r.id}>
              <td><span className="gc-badge gc-badge-blue">{i + 1}</span></td>
              <td><strong>{r.name}</strong></td>
              <td style={{ fontSize: 12 }}>{formatConditions(r)}</td>
              <td>
                <div className="gc-chips" style={{ flexWrap: 'wrap' }}>
                  {r.action.type === 'split'
                    ? r.action.splits.map(s => (
                        <span key={s.terminalId} className="gc-chip gc-chip-pass">{getTerminalLabel(s.terminalId)} ({s.percentage}%)</span>
                      ))
                    : (r.action.terminals || []).map(tid => (
                        <span key={tid} className="gc-chip gc-chip-pass">{getTerminalLabel(tid)}</span>
                      ))
                  }
                </div>
              </td>
              <td><span className={`gc-badge ${r.type === 'volume_split' ? 'gc-badge-purple' : 'gc-badge-blue'}`}>{r.type === 'volume_split' ? 'Split' : 'Conditional'}</span></td>
            </tr>
          ))}
          {defaults.map(r => (
            <tr key={r.id} style={{ opacity: 0.6 }}>
              <td><span className="gc-badge gc-badge-gray">D</span></td>
              <td>{r.name}</td>
              <td style={{ fontSize: 12 }}>{formatConditions(r)}</td>
              <td>
                <div className="gc-chips" style={{ flexWrap: 'wrap' }}>
                  {(r.action.terminals || []).map(tid => (
                    <span key={tid} className="gc-chip gc-chip-pass">{getTerminalLabel(tid)}</span>
                  ))}
                </div>
              </td>
              <td><span className="gc-badge gc-badge-gray">Default</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Rule Creation Form (Progressive Conversational GenUI) ──
const RULE_STEPS = [
  { id: 'method', q: 'What payment method should this rule apply to?', options: ['Cards', 'UPI', 'NB', 'EMI'] },
  { id: 'network', q: 'Which card network?', options: ['Any', 'Visa', 'Mastercard', 'RuPay'], showIf: (s) => s.method === 'Cards' || s.method === 'EMI' },
  { id: 'cardType', q: 'Credit or Debit?', options: ['Any', 'Credit', 'Debit'], showIf: (s) => s.method === 'Cards' },
  { id: 'issuer', q: 'Any specific issuer bank?', options: ['Any', 'HDFC', 'ICICI', 'Axis', 'SBI', 'Kotak'] },
  { id: 'amount', q: 'Filter by amount range?', options: ['Any', '>₹5K', '>₹1L', '<₹100'] },
  { id: 'intl', q: 'Domestic or International?', options: ['Domestic', 'International', 'Both'] },
  { id: 'terminals', q: 'Route to which terminal(s)?', type: 'terminals' },
  { id: 'srThreshold', q: 'SR Safety Net — below what SR% should it fallback?', type: 'slider' },
]

function RuleForm({ merchant, rules, onRuleCreated, prefill }) {
  const [selections, setSelections] = useState({})
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTerminals, setSelectedTerminals] = useState([])
  const [srThreshold, setSrThreshold] = useState(90)
  const [submitted, setSubmitted] = useState(false)
  const [simResult, setSimResult] = useState(null)
  const stepsEndRef = useRef(null)

  useEffect(() => {
    // Scroll within the chat container, not the page
    const el = stepsEndRef.current
    if (el) {
      const container = el.closest('.gc-chat-area')
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }
  }, [currentStep, submitted])

  // Pre-fill from intent
  useEffect(() => {
    if (prefill?.method) {
      const initial = { method: prefill.method }
      setSelections(initial)
      // Skip to next relevant step
      let nextIdx = 1
      while (nextIdx < RULE_STEPS.length && RULE_STEPS[nextIdx].showIf && !RULE_STEPS[nextIdx].showIf(initial)) nextIdx++
      setCurrentStep(nextIdx)
    }
  }, [prefill])

  const merchantTerminals = useMemo(() => {
    const method = selections.method || 'Cards'
    return merchant.gatewayMetrics.map(gm => {
      const gw = gateways.find(g => g.id === gm.gatewayId)
      const term = gw?.terminals.find(t => t.id === gm.terminalId)
      return {
        id: gm.terminalId, displayId: term?.terminalId || gm.terminalId,
        gatewayShort: gw?.shortName || '??', successRate: gm.successRate,
        costPerTxn: gm.costPerTxn, supportedMethods: gm.supportedMethods || [],
      }
    }).filter(t => t.supportedMethods.includes(method))
  }, [merchant, selections.method])

  // Auto-select prefill gateway
  useEffect(() => {
    if (prefill?.gatewayShort && merchantTerminals.length) {
      const matching = merchantTerminals.filter(t => t.gatewayShort === prefill.gatewayShort)
      if (matching.length) setSelectedTerminals(matching.map(t => t.id))
    }
  }, [prefill, merchantTerminals])

  const handleSelect = (stepId, value) => {
    const next = { ...selections, [stepId]: value }
    setSelections(next)

    // Find next visible step
    let nextIdx = currentStep + 1
    while (nextIdx < RULE_STEPS.length) {
      const step = RULE_STEPS[nextIdx]
      if (!step.showIf || step.showIf(next)) break
      nextIdx++
    }
    setCurrentStep(nextIdx)
  }

  const toggleTerminal = (id) => {
    setSelectedTerminals(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const confirmTerminals = () => {
    handleSelect('terminals', selectedTerminals)
  }

  const confirmSR = () => {
    handleSelect('srThreshold', srThreshold)
    // All steps done — submit
    setTimeout(() => doSubmit(), 100)
  }

  const doSubmit = () => {
    const s = { ...selections, terminals: selectedTerminals, srThreshold }
    const conditions = []
    if (s.method) conditions.push({ field: 'payment_method', operator: 'equals', value: s.method })
    if (s.network && s.network !== 'Any') conditions.push({ field: 'card_network', operator: 'equals', value: s.network })
    if (s.cardType && s.cardType !== 'Any') conditions.push({ field: 'card_type', operator: 'equals', value: s.cardType.toLowerCase() })
    if (s.issuer && s.issuer !== 'Any') conditions.push({ field: 'issuer_bank', operator: 'equals', value: s.issuer })
    if (s.amount === '>₹5K') conditions.push({ field: 'amount', operator: 'greater_than', value: 5000 })
    if (s.amount === '>₹1L') conditions.push({ field: 'amount', operator: 'greater_than', value: 100000 })
    if (s.amount === '<₹100') conditions.push({ field: 'amount', operator: 'less_than', value: 100 })
    if (s.intl === 'International') conditions.push({ field: 'international', operator: 'equals', value: true })

    const termLabels = selectedTerminals.map(tid => merchantTerminals.find(t => t.id === tid)?.displayId || tid)

    const newRule = {
      id: `rule-${merchant.id}-new-${Date.now()}`,
      name: `${s.method || 'Cards'}${s.network && s.network !== 'Any' ? ' ' + s.network : ''} → ${termLabels.join(' + ')}`,
      type: 'conditional', enabled: true,
      priority: rules.filter(r => !r.isDefault && !r.isMethodDefault).length + 1,
      conditions, conditionLogic: 'AND',
      action: { type: 'route', terminals: selectedTerminals, splits: [], srThreshold: s.srThreshold || 90, minPaymentCount: 100 },
      isDefault: false, createdAt: new Date().toISOString(), createdBy: 'anugrah.sharma@razorpay.com',
    }

    const txn = { payment_method: s.method || 'Cards', amount: 5000, card_network: s.network === 'Any' ? 'Visa' : (s.network || 'Visa'), card_type: s.cardType === 'Any' ? 'credit' : (s.cardType || 'credit').toLowerCase(), international: s.intl === 'International' }
    const withRule = simulateRoutingPipeline(merchant, txn, [...rules, newRule])
    const withoutRule = simulateRoutingPipeline(merchant, txn, rules)

    setSimResult({ newRule, withRule, withoutRule, txn })
    setSubmitted(true)
    if (onRuleCreated) onRuleCreated(newRule)
  }

  // Build visible conversation steps
  const visibleSteps = []
  for (let i = 0; i < RULE_STEPS.length && i <= currentStep; i++) {
    const step = RULE_STEPS[i]
    if (step.showIf && !step.showIf(selections)) continue
    visibleSteps.push({ ...step, idx: i })
  }

  // Render answer text for a step
  const getAnswerText = (stepId) => {
    if (stepId === 'terminals') {
      return selectedTerminals.map(tid => merchantTerminals.find(t => t.id === tid)?.displayId || tid).join(', ')
    }
    if (stepId === 'srThreshold') {
      return srThreshold === 0 ? 'Off (no fallback)' : `SR threshold: ${srThreshold}%`
    }
    return selections[stepId] || ''
  }

  return (
    <div className="gc-progressive">
      {visibleSteps.map((step, vi) => {
        const isAnswered = selections[step.id] !== undefined
        const isCurrent = step.idx === currentStep && !submitted

        return (
          <React.Fragment key={step.id}>
            {/* AI Question — left aligned, flat */}
            <div className="gc-pq">{step.q}</div>

            {/* Options (if current unanswered step) */}
            {isCurrent && step.options && (
              <div className="gc-btn-group gc-pq-options">
                {step.options.map(opt => (
                  <button key={opt} className="gc-btn-opt" onClick={() => handleSelect(step.id, opt)}>{opt}</button>
                ))}
              </div>
            )}

            {/* Terminal selection */}
            {isCurrent && step.type === 'terminals' && (
              <div className="gc-pq-options">
                <div className="gc-terminal-list">
                  {merchantTerminals.map(t => (
                    <div key={t.id} className={`gc-terminal-opt ${selectedTerminals.includes(t.id) ? 'selected' : ''}`} onClick={() => toggleTerminal(t.id)}>
                      <div className="gc-terminal-check">{selectedTerminals.includes(t.id) ? '✓' : ''}</div>
                      <div className="gc-terminal-info">
                        <strong>{t.displayId}</strong>
                        <span>{t.gatewayShort}</span>
                      </div>
                      <div className="gc-terminal-stats">
                        <span className="gc-terminal-sr">SR {t.successRate}%</span>
                        <span className="gc-terminal-cost">₹{t.costPerTxn}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedTerminals.length > 0 && (
                  <button className="gc-btn-opt active" style={{ marginTop: 8 }} onClick={confirmTerminals}>
                    Confirm {selectedTerminals.length} terminal{selectedTerminals.length > 1 ? 's' : ''} →
                  </button>
                )}
              </div>
            )}

            {/* SR Slider */}
            {isCurrent && step.type === 'slider' && (
              <div className="gc-pq-options">
                <input type="range" min="0" max="99" value={srThreshold} onChange={e => setSrThreshold(parseInt(e.target.value))} style={{ width: '100%' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>
                  <span>0% (no fallback)</span>
                  <span style={{ fontWeight: 700, color: srThreshold > 0 ? '#528FF0' : '#dc2626', fontSize: 14 }}>{srThreshold}%</span>
                  <span>99%</span>
                </div>
                <button className="gc-btn-opt active" onClick={confirmSR}>Create Rule & Preview Impact →</button>
              </div>
            )}

            {/* User Answer — right aligned */}
            {isAnswered && (
              <div className="gc-pa">{getAnswerText(step.id)}</div>
            )}
          </React.Fragment>
        )
      })}

      {/* Impact result — left aligned */}
      {submitted && simResult && (
        <div className="gc-pq-result">
          <div className="gc-form-result">
            <div className="gc-form-result-header">
              <span className="gc-badge gc-badge-success">✓ Rule Created</span>
              <strong>{simResult.newRule.name}</strong>
            </div>
            <div className="gc-impact">
              <div className="gc-impact-title">Impact Preview</div>
              <div className="gc-impact-grid">
                <div className="gc-impact-card">
                  <div className="gc-impact-label">Before</div>
                  <div className="gc-impact-val">
                    {simResult.withoutRule.isNTF ? <span style={{ color: 'var(--rzp-danger)' }}>NTF ❌</span> : <span>→ {simResult.withoutRule.selectedTerminal?.displayId}</span>}
                  </div>
                </div>
                <div className="gc-impact-arrow">→</div>
                <div className="gc-impact-card">
                  <div className="gc-impact-label">After</div>
                  <div className="gc-impact-val">
                    {simResult.withRule.isNTF ? <span style={{ color: 'var(--rzp-danger)' }}>NTF ❌</span> : <span style={{ color: 'var(--rzp-success)' }}>→ {simResult.withRule.selectedTerminal?.displayId}</span>}
                  </div>
                </div>
              </div>
              {simResult.withRule.isNTF && <div className="gc-warning-box">⚠️ This rule will cause NTF for {simResult.txn.payment_method} payments. The target terminals may not support this payment method.</div>}
              {!simResult.withRule.isNTF && !simResult.withoutRule.isNTF && (
                <div className="gc-info-box">Routing changes from <strong>{simResult.withoutRule.selectedTerminal?.displayId}</strong> to <strong>{simResult.withRule.selectedTerminal?.displayId}</strong> for {simResult.txn.payment_method} {simResult.txn.card_network} ₹{simResult.txn.amount} payments.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div ref={stepsEndRef} />
    </div>
  )
}

// ── Coverage Gaps ──
function CoverageGaps({ merchant, rules }) {
  const methods = ['Cards', 'UPI', 'NB']
  const gaps = []

  methods.forEach(method => {
    const hasRule = rules.some(r => r.enabled && !r.isDefault && r.conditions?.some(c => c.field === 'payment_method' && c.value === method))
    if (!hasRule) {
      const hasDefault = rules.some(r => (r.isDefault || r.isMethodDefault) && r.conditions?.some(c => c.field === 'payment_method' && c.value === method))
      gaps.push({ method, hasDefault, severity: hasDefault ? 'low' : 'high' })
    }
  })

  // Check networks within Cards
  const networks = ['Visa', 'Mastercard', 'RuPay']
  networks.forEach(net => {
    const hasRule = rules.some(r => r.enabled && !r.isDefault && r.conditions?.some(c => c.field === 'card_network' && c.value === net))
    if (!hasRule) gaps.push({ method: `Cards (${net})`, hasDefault: true, severity: 'low' })
  })

  return (
    <div className="gc-coverage">
      <div className="gc-coverage-title">Coverage Analysis — {merchant.name}</div>
      {gaps.length === 0 ? (
        <div className="gc-info-box">✅ All payment methods have specific routing rules.</div>
      ) : (
        <div className="gc-gap-list">
          {gaps.map((g, i) => (
            <div key={i} className={`gc-gap-item ${g.severity}`}>
              <span className={`gc-badge ${g.severity === 'high' ? 'gc-badge-danger' : 'gc-badge-gray'}`}>
                {g.severity === 'high' ? '⚠️ No Rule' : 'Default Only'}
              </span>
              <span className="gc-gap-method">{g.method}</span>
              <span className="gc-gap-note">
                {g.hasDefault ? 'Using ML-based default routing' : 'No rule or default — may cause NTF'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Terminal Info ──
function TerminalInfo({ merchant }) {
  return (
    <div className="gc-terminals">
      <div className="gc-rules-title">{merchant.name} — {merchant.gatewayMetrics.length} Terminals</div>
      <table className="gc-table">
        <thead>
          <tr><th>Terminal</th><th>Gateway</th><th>SR</th><th>Cost/Txn</th><th>Methods</th><th>Traffic</th></tr>
        </thead>
        <tbody>
          {merchant.gatewayMetrics.map(gm => {
            const gw = gateways.find(g => g.id === gm.gatewayId)
            const term = gw?.terminals.find(t => t.id === gm.terminalId)
            return (
              <tr key={gm.terminalId}>
                <td><strong style={{ fontFamily: 'monospace' }}>{term?.terminalId || gm.terminalId}</strong></td>
                <td>{gw?.shortName}</td>
                <td><span style={{ color: gm.successRate >= 72 ? 'var(--rzp-success)' : 'var(--rzp-warning)' }}>{gm.successRate}%</span></td>
                <td>{gm.costPerTxn === 0 ? <span className="gc-badge gc-badge-success">₹0</span> : `₹${gm.costPerTxn}`}</td>
                <td>{(gm.supportedMethods || []).join(', ')}</td>
                <td>{gm.txnShare}%</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Help Card ──
function HelpCard() {
  return (
    <div className="gc-help">
      <div className="gc-help-title">What I can help with</div>
      <div className="gc-help-grid">
        {[
          { icon: '📝', title: 'Create Rules', example: '"Create a rule to route all Visa cards to HDFC"' },
          { icon: '🔍', title: 'Simulate Payments', example: '"What happens if I send a UPI payment of ₹5000?"' },
          { icon: '⚠️', title: 'NTF Analysis', example: '"Why are Card transactions failing?"' },
          { icon: '📋', title: 'View Rules', example: '"Show me current routing rules"' },
          { icon: '🔄', title: 'What-If', example: '"What if I disable HDFC_T1?"' },
          { icon: '📊', title: 'Coverage', example: '"Show me coverage gaps"' },
        ].map((h, i) => (
          <div key={i} className="gc-help-item">
            <span className="gc-help-icon">{h.icon}</span>
            <div>
              <strong>{h.title}</strong>
              <div className="gc-help-example">{h.example}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════
// Main Chat Component
// ════════════════════════════════════════════

export default function RoutingCopilot({ merchant, rules, addRule, simOverrides }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const chatEndRef = useRef(null)

  useEffect(() => {
    // Scroll within the chat container, not the page
    const el = chatEndRef.current
    if (el) {
      const container = el.closest('.gc-chat-area')
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }
  }, [messages])

  // Initial greeting
  useEffect(() => {
    setMessages([{
      type: 'bot',
      content: 'greeting',
      data: { merchantName: merchant?.name },
      ts: Date.now(),
    }])
  }, [merchant?.id])

  const handleSend = useCallback(() => {
    if (!input.trim() || !merchant) return
    const userMsg = input.trim()
    setInput('')

    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: userMsg, ts: Date.now() }])

    // Classify and respond
    const intent = classifyIntent(userMsg)

    setTimeout(() => {
      let response

      switch (intent.type) {
        case 'simulate': {
          const txn = parseTxnFromInput(userMsg)
          const result = simulateRoutingPipeline(merchant, txn, rules, simOverrides)
          response = { type: 'bot', content: 'pipeline', data: { result, txn }, ts: Date.now() }
          break
        }

        case 'show_rules': {
          response = { type: 'bot', content: 'rule_table', data: { rules, merchant }, ts: Date.now() }
          break
        }

        case 'create_rule': {
          const prefill = parseRuleIntent(userMsg)
          response = { type: 'bot', content: 'rule_form', data: { merchant, rules, prefill }, ts: Date.now() }
          break
        }

        case 'ntf_analysis': {
          // Simulate all payment methods to find NTFs
          const methods = [
            { payment_method: 'Cards', card_network: 'Visa', card_type: 'credit', amount: 5000, international: false },
            { payment_method: 'Cards', card_network: 'Mastercard', card_type: 'credit', amount: 5000, international: false },
            { payment_method: 'Cards', card_network: 'RuPay', card_type: 'debit', amount: 2000, international: false },
            { payment_method: 'UPI', amount: 2000, international: false },
            { payment_method: 'NB', amount: 5000, international: false },
            { payment_method: 'Cards', card_network: 'Visa', card_type: 'credit', amount: 5000, international: true },
          ]
          const results = methods.map(txn => ({
            txn,
            result: simulateRoutingPipeline(merchant, txn, rules, simOverrides),
          }))
          const ntfs = results.filter(r => r.result.isNTF)
          const passing = results.filter(r => !r.result.isNTF)
          response = { type: 'bot', content: 'ntf_analysis', data: { ntfs, passing, merchant }, ts: Date.now() }
          break
        }

        case 'what_if': {
          const parsed = parseWhatIf(userMsg)
          if (parsed?.type === 'disable_terminal') {
            const overrides = {
              ...simOverrides,
              disabledTerminals: new Set([...(simOverrides?.disabledTerminals || []), parsed.terminalId]),
            }
            const methods = [
              { payment_method: 'Cards', card_network: 'Visa', card_type: 'credit', amount: 5000, international: false },
              { payment_method: 'UPI', amount: 2000, international: false },
              { payment_method: 'NB', amount: 5000, international: false },
            ]
            const before = methods.map(txn => ({ txn, result: simulateRoutingPipeline(merchant, txn, rules, simOverrides) }))
            const after = methods.map(txn => ({ txn, result: simulateRoutingPipeline(merchant, txn, rules, overrides) }))
            response = { type: 'bot', content: 'what_if', data: { label: parsed.label, before, after }, ts: Date.now() }
          } else {
            response = { type: 'bot', content: 'text', text: "I can simulate what happens if you disable a terminal. Try: \"What if I disable HDFC_T1?\" or \"What if ICICI_T1 goes down?\"", ts: Date.now() }
          }
          break
        }

        case 'coverage': {
          response = { type: 'bot', content: 'coverage', data: { merchant, rules }, ts: Date.now() }
          break
        }

        case 'terminal_info': {
          response = { type: 'bot', content: 'terminal_info', data: { merchant }, ts: Date.now() }
          break
        }

        case 'help': {
          response = { type: 'bot', content: 'help', ts: Date.now() }
          break
        }

        default: {
          response = { type: 'bot', content: 'text', text: "I'm not sure what you're asking. Try:\n• \"Show me current rules\"\n• \"Simulate a Visa card payment of ₹5000\"\n• \"Create a rule to route UPI to RBL\"\n• \"Why are payments failing?\"\n• \"What if I disable HDFC_T1?\"", ts: Date.now() }
        }
      }

      setMessages(prev => [...prev, response])
    }, 300)
  }, [input, merchant, rules, simOverrides])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickAction = (text) => {
    setInput(text)
    setTimeout(() => {
      setInput('')
      setMessages(prev => [...prev, { type: 'user', text, ts: Date.now() }])
      // Re-trigger the same logic
      const intent = classifyIntent(text)
      setTimeout(() => {
        let response
        switch (intent.type) {
          case 'show_rules':
            response = { type: 'bot', content: 'rule_table', data: { rules, merchant }, ts: Date.now() }
            break
          case 'simulate': {
            const txn = parseTxnFromInput(text)
            const result = simulateRoutingPipeline(merchant, txn, rules, simOverrides)
            response = { type: 'bot', content: 'pipeline', data: { result, txn }, ts: Date.now() }
            break
          }
          case 'create_rule': {
            const prefill = parseRuleIntent(text)
            response = { type: 'bot', content: 'rule_form', data: { merchant, rules, prefill }, ts: Date.now() }
            break
          }
          case 'ntf_analysis': {
            const methods = [
              { payment_method: 'Cards', card_network: 'Visa', card_type: 'credit', amount: 5000, international: false },
              { payment_method: 'UPI', amount: 2000, international: false },
              { payment_method: 'NB', amount: 5000, international: false },
            ]
            const results = methods.map(txn => ({ txn, result: simulateRoutingPipeline(merchant, txn, rules, simOverrides) }))
            response = { type: 'bot', content: 'ntf_analysis', data: { ntfs: results.filter(r => r.result.isNTF), passing: results.filter(r => !r.result.isNTF), merchant }, ts: Date.now() }
            break
          }
          default:
            response = { type: 'bot', content: 'help', ts: Date.now() }
        }
        setMessages(prev => [...prev, response])
      }, 300)
    }, 50)
  }

  // ── Render messages ──
  const renderMessage = (msg, i) => {
    if (msg.type === 'user') {
      return (
        <div key={i} className="gc-msg gc-msg-user">
          <div className="gc-msg-bubble gc-msg-bubble-user">{msg.text}</div>
        </div>
      )
    }

    // Bot messages with GenUI components
    return (
      <div key={i} className="gc-msg gc-msg-bot">
        <div className="gc-msg-avatar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#528FF0" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div className="gc-msg-bubble gc-msg-bubble-bot">
          {msg.content === 'greeting' && (
            <div>
              <div style={{ marginBottom: 12 }}>Hi! I'm <strong>Routing Copilot</strong> for <strong>{msg.data?.merchantName}</strong>. I can help you create routing rules, simulate payments, and diagnose NTF issues.</div>
              <div className="gc-quick-actions">
                <button className="gc-quick-btn" onClick={() => handleQuickAction("Show me current routing rules")}>📋 View Rules</button>
                <button className="gc-quick-btn" onClick={() => handleQuickAction("Simulate a Visa card payment of ₹5000")}>🔍 Simulate Payment</button>
                <button className="gc-quick-btn" onClick={() => handleQuickAction("Create a new routing rule")}>📝 Create Rule</button>
                <button className="gc-quick-btn" onClick={() => handleQuickAction("Why are payments getting NTF?")}>⚠️ NTF Analysis</button>
              </div>
            </div>
          )}

          {msg.content === 'text' && <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>}

          {msg.content === 'pipeline' && <PipelineTrace result={msg.data.result} txn={msg.data.txn} />}

          {msg.content === 'rule_table' && <RuleTable rules={msg.data.rules} merchant={msg.data.merchant} />}

          {msg.content === 'rule_form' && <RuleForm merchant={msg.data.merchant} rules={msg.data.rules} onRuleCreated={addRule} prefill={msg.data.prefill} />}

          {msg.content === 'coverage' && <CoverageGaps merchant={msg.data.merchant} rules={msg.data.rules} />}

          {msg.content === 'terminal_info' && <TerminalInfo merchant={msg.data.merchant} />}

          {msg.content === 'help' && <HelpCard />}

          {msg.content === 'ntf_analysis' && (
            <div className="gc-ntf-analysis">
              <div className="gc-ntf-summary">
                {msg.data.ntfs.length === 0 ? (
                  <div className="gc-info-box">✅ No NTF risk detected. All tested payment types route successfully.</div>
                ) : (
                  <div className="gc-warning-box">⚠️ {msg.data.ntfs.length} payment type(s) will result in NTF (No Terminal Found)</div>
                )}
              </div>

              {msg.data.ntfs.map((ntf, ni) => (
                <div key={ni} style={{ marginTop: 12 }}>
                  <div className="gc-badge gc-badge-danger" style={{ marginBottom: 4 }}>
                    NTF: {ntf.txn.payment_method} {ntf.txn.card_network || ''} {ntf.txn.international ? '(Intl)' : ''}
                  </div>
                  <PipelineTrace result={ntf.result} txn={ntf.txn} />
                </div>
              ))}

              {msg.data.passing.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div className="gc-rules-title" style={{ marginBottom: 6 }}>✅ Passing ({msg.data.passing.length})</div>
                  {msg.data.passing.map((p, pi) => (
                    <div key={pi} className="gc-pass-item">
                      <span>{p.txn.payment_method} {p.txn.card_network || ''} {p.txn.international ? '(Intl)' : ''}</span>
                      <span>→ {p.result.selectedTerminal?.displayId}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {msg.content === 'what_if' && (
            <div className="gc-what-if">
              <div className="gc-what-if-title">What if <strong>{msg.data.label}</strong> is disabled?</div>
              <table className="gc-table">
                <thead><tr><th>Payment Type</th><th>Before</th><th>After</th><th>Impact</th></tr></thead>
                <tbody>
                  {msg.data.before.map((b, bi) => {
                    const a = msg.data.after[bi]
                    const changed = b.result.selectedTerminal?.terminalId !== a.result.selectedTerminal?.terminalId
                    const nowNTF = a.result.isNTF && !b.result.isNTF
                    return (
                      <tr key={bi}>
                        <td>{b.txn.payment_method} {b.txn.card_network || ''}</td>
                        <td>{b.result.isNTF ? '❌ NTF' : b.result.selectedTerminal?.displayId}</td>
                        <td style={{ color: nowNTF ? 'var(--rzp-danger)' : changed ? 'var(--rzp-warning)' : 'inherit' }}>
                          {a.result.isNTF ? '❌ NTF' : a.result.selectedTerminal?.displayId}
                        </td>
                        <td>
                          {nowNTF ? <span className="gc-badge gc-badge-danger">⚠️ NTF Risk</span> :
                           changed ? <span className="gc-badge gc-badge-warning">Rerouted</span> :
                           <span className="gc-badge gc-badge-gray">No change</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="gc-copilot">
      <div className="gc-chat-area">
        {messages.map((msg, i) => renderMessage(msg, i))}
        <div ref={chatEndRef} />
      </div>

      <div className="gc-input-area">
        <input
          className="gc-input-main"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about routing rules, simulate payments, or create new rules..."
        />
        <button className="gc-send-btn" onClick={handleSend} disabled={!input.trim()}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  )
}
