import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { gateways, simulateRoutingPipeline } from '../../data/kamMockData'

// ════════════════════════════════════════════
// RoutingCopilot — Method-based sidebar layout
// ════════════════════════════════════════════

// ── Payment Method Definitions ──────────────
const ALL_PAYMENT_METHODS = [
  { key: 'Cards',  label: 'Cards',       Icon: IconCards  },
  { key: 'UPI',    label: 'UPI',         Icon: IconUPI    },
  { key: 'NB',     label: 'Net Banking', Icon: IconNB     },
  { key: 'EMI',    label: 'EMI',         Icon: IconEMI    },
  { key: 'Wallet', label: 'Wallet',      Icon: IconWallet },
]

// ── Icons ────────────────────────────────────
function IconCards()  { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> }
function IconUPI()    { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> }
function IconNB()     { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg> }
function IconEMI()    { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function IconWallet() { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 12V22H4a2 2 0 0 1-2-2V6a2 2 0 0 0 2 2h16v4z"/><path d="M22 12H4"/><path d="M6 6V4a2 2 0 0 1 2-2h12"/><circle cx="17" cy="17" r="1" fill="currentColor"/></svg> }

// ── Parse transaction from natural language ──
function parseTxnFromInput(input) {
  const q = input.toLowerCase()
  const txn = { payment_method: 'Cards', amount: 5000, card_network: 'Visa', card_type: 'credit', international: false }
  if (/upi/i.test(q)) txn.payment_method = 'UPI'
  else if (/net\s*banking|nb/i.test(q)) txn.payment_method = 'NB'
  else if (/emi/i.test(q)) txn.payment_method = 'EMI'
  if (/master/i.test(q)) txn.card_network = 'Mastercard'
  else if (/rupay/i.test(q)) txn.card_network = 'RuPay'
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
  if (/hdfc/i.test(q)) intent.gatewayShort = 'HDFC'
  if (/icici/i.test(q)) intent.gatewayShort = 'ICICI'
  if (/axis/i.test(q)) intent.gatewayShort = 'Axis'
  if (/rbl/i.test(q)) intent.gatewayShort = 'RBL'
  if (/yes/i.test(q)) intent.gatewayShort = 'Yes'
  return intent
}

// ════════════════════════════════════════════
// GenUI Components (kept for reuse)
// ════════════════════════════════════════════

// ── Pipeline Trace ──
function PipelineTrace({ result, txn }) {
  if (!result) return null
  const stages = result.stages || []
  return (
    <div className="gc-pipeline">
      <div className="gc-pipeline-header">
        <span className="gc-pipeline-label">
          {txn.payment_method}
          {txn.card_network ? ` · ${txn.card_network}` : ''}
          {txn.card_type ? ` ${txn.card_type}` : ''}
          {` · ₹${txn.amount?.toLocaleString()}`}
          {txn.international ? ' · Intl' : ' · Domestic'}
        </span>
        {result.isNTF
          ? <span className="gc-badge gc-badge-danger">NTF — Payment Failed</span>
          : <span className="gc-badge gc-badge-success">→ {result.selectedTerminal?.displayId}</span>
        }
      </div>
      {stages.map((stage, i) => {
        const isNTF    = stage.type === 'ntf' || stage.type === 'rule_ntf'
        const isFilter = stage.type === 'rule_filter'
        const isSorter = stage.type === 'sorter'
        return (
          <div key={i} className={`gc-stage ${isNTF ? 'ntf' : isFilter ? 'filter' : isSorter ? 'sorter' : ''}`}>
            <div className="gc-stage-num">{i + 1}</div>
            <div className="gc-stage-body">
              <div className="gc-stage-label">{stage.label}</div>
              <div className="gc-stage-desc">{stage.description}</div>
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
              {isSorter && stage.scored && (
                <div className="gc-scores">
                  {stage.scored.map((t, si) => (
                    <div key={t.terminalId} className={`gc-score-row${t.isSelected ? ' selected' : ''}`}>
                      <span className="gc-score-rank">#{si + 1}</span>
                      <span className="gc-score-name">{t.displayId}</span>
                      <div className="gc-score-bar-wrap"><div className="gc-score-bar" style={{ width: `${t.finalScore}%` }} /></div>
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
  const activeRules = rules.filter(r => r.enabled && !r.isDefault && !r.isMethodDefault)
  const defaults    = rules.filter(r => r.isDefault || r.isMethodDefault)

  const formatConditions = (rule) => {
    if (!rule.conditions || rule.conditions.length === 0) return 'All transactions'
    return rule.conditions.map(c => {
      const field = c.field.replace(/_/g, ' ')
      const val   = Array.isArray(c.value) ? c.value.join(', ') : c.value
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

  if (activeRules.length === 0 && defaults.length === 0) return null

  return (
    <div className="gc-rules">
      <table className="gc-table">
        <thead>
          <tr><th>#</th><th>Name</th><th>Conditions</th><th>Routes To</th><th>Type</th></tr>
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
                    ? r.action.splits.map(s => <span key={s.terminalId} className="gc-chip gc-chip-pass">{getTerminalLabel(s.terminalId)} ({s.percentage}%)</span>)
                    : (r.action.terminals || []).map(tid => <span key={tid} className="gc-chip gc-chip-pass">{getTerminalLabel(tid)}</span>)
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
                  {(r.action.terminals || []).map(tid => <span key={tid} className="gc-chip gc-chip-pass">{getTerminalLabel(tid)}</span>)}
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
  { id: 'method',      q: 'What payment method should this rule apply to?',              options: ['Cards', 'UPI', 'NB', 'EMI'] },
  { id: 'network',     q: 'Which card network?',                                          options: ['Any', 'Visa', 'Mastercard', 'RuPay'], showIf: s => s.method === 'Cards' || s.method === 'EMI' },
  { id: 'cardType',    q: 'Credit or Debit?',                                             options: ['Any', 'Credit', 'Debit'],             showIf: s => s.method === 'Cards' },
  { id: 'issuer',      q: 'Any specific issuer bank?',                                    options: ['Any', 'HDFC', 'ICICI', 'Axis', 'SBI', 'Kotak'] },
  { id: 'amount',      q: 'Filter by amount range?',                                      options: ['Any', '>₹5K', '>₹1L', '<₹100'] },
  { id: 'intl',        q: 'Domestic or International?',                                   options: ['Domestic', 'International', 'Both'] },
  { id: 'terminals',   q: 'Route to which terminal(s)?',                                  type: 'terminals' },
  { id: 'srThreshold', q: 'SR Safety Net — below what SR% should it fallback?',           type: 'slider' },
]

function RuleForm({ merchant, rules, onRuleCreated, prefill }) {
  const [selections, setSelections]         = useState({})
  const [currentStep, setCurrentStep]       = useState(0)
  const [selectedTerminals, setSelectedTerminals] = useState([])
  const [srThreshold, setSrThreshold]       = useState(90)
  const [submitted, setSubmitted]           = useState(false)
  const [simResult, setSimResult]           = useState(null)
  const stepsEndRef = useRef(null)

  useEffect(() => {
    const el = stepsEndRef.current
    if (el) {
      const container = el.closest('.gc-panel-body') || el.closest('.gc-chat-area')
      if (container) container.scrollTop = container.scrollHeight
    }
  }, [currentStep, submitted])

  useEffect(() => {
    if (prefill?.method) {
      const initial = { method: prefill.method }
      setSelections(initial)
      let nextIdx = 1
      while (nextIdx < RULE_STEPS.length && RULE_STEPS[nextIdx].showIf && !RULE_STEPS[nextIdx].showIf(initial)) nextIdx++
      setCurrentStep(nextIdx)
    }
  }, [prefill])

  const merchantTerminals = useMemo(() => {
    const method = selections.method || 'Cards'
    return merchant.gatewayMetrics.map(gm => {
      const gw   = gateways.find(g => g.id === gm.gatewayId)
      const term = gw?.terminals.find(t => t.id === gm.terminalId)
      return { id: gm.terminalId, displayId: term?.terminalId || gm.terminalId, gatewayShort: gw?.shortName || '??', successRate: gm.successRate, costPerTxn: gm.costPerTxn, supportedMethods: gm.supportedMethods || [] }
    }).filter(t => t.supportedMethods.includes(method))
  }, [merchant, selections.method])

  useEffect(() => {
    if (prefill?.gatewayShort && merchantTerminals.length) {
      const matching = merchantTerminals.filter(t => t.gatewayShort === prefill.gatewayShort)
      if (matching.length) setSelectedTerminals(matching.map(t => t.id))
    }
  }, [prefill, merchantTerminals])

  const handleSelect = (stepId, value) => {
    const next = { ...selections, [stepId]: value }
    setSelections(next)
    let nextIdx = currentStep + 1
    while (nextIdx < RULE_STEPS.length) {
      const step = RULE_STEPS[nextIdx]
      if (!step.showIf || step.showIf(next)) break
      nextIdx++
    }
    setCurrentStep(nextIdx)
  }

  const toggleTerminal = id => setSelectedTerminals(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const confirmTerminals = () => handleSelect('terminals', selectedTerminals)
  const confirmSR = () => { handleSelect('srThreshold', srThreshold); setTimeout(() => doSubmit(), 100) }

  const doSubmit = () => {
    const s = { ...selections, terminals: selectedTerminals, srThreshold }
    const conditions = []
    if (s.method) conditions.push({ field: 'payment_method', operator: 'equals', value: s.method })
    if (s.network && s.network !== 'Any') conditions.push({ field: 'card_network', operator: 'equals', value: s.network })
    if (s.cardType && s.cardType !== 'Any') conditions.push({ field: 'card_type', operator: 'equals', value: s.cardType.toLowerCase() })
    if (s.issuer && s.issuer !== 'Any') conditions.push({ field: 'issuer_bank', operator: 'equals', value: s.issuer })
    if (s.amount === '>₹5K')  conditions.push({ field: 'amount', operator: 'greater_than', value: 5000 })
    if (s.amount === '>₹1L')  conditions.push({ field: 'amount', operator: 'greater_than', value: 100000 })
    if (s.amount === '<₹100') conditions.push({ field: 'amount', operator: 'less_than',    value: 100 })
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
    const txn         = { payment_method: s.method || 'Cards', amount: 5000, card_network: s.network === 'Any' ? 'Visa' : (s.network || 'Visa'), card_type: s.cardType === 'Any' ? 'credit' : (s.cardType || 'credit').toLowerCase(), international: s.intl === 'International' }
    const withRule    = simulateRoutingPipeline(merchant, txn, [...rules, newRule])
    const withoutRule = simulateRoutingPipeline(merchant, txn, rules)
    setSimResult({ newRule, withRule, withoutRule, txn })
    setSubmitted(true)
    if (onRuleCreated) onRuleCreated(newRule)
  }

  const visibleSteps = []
  for (let i = 0; i < RULE_STEPS.length && i <= currentStep; i++) {
    const step = RULE_STEPS[i]
    if (step.showIf && !step.showIf(selections)) continue
    visibleSteps.push({ ...step, idx: i })
  }

  const getAnswerText = stepId => {
    if (stepId === 'terminals') return selectedTerminals.map(tid => merchantTerminals.find(t => t.id === tid)?.displayId || tid).join(', ')
    if (stepId === 'srThreshold') return srThreshold === 0 ? 'Off (no fallback)' : `SR threshold: ${srThreshold}%`
    return selections[stepId] || ''
  }

  return (
    <div className="gc-progressive">
      {visibleSteps.map(step => {
        const isAnswered = selections[step.id] !== undefined
        const isCurrent  = step.idx === currentStep && !submitted
        return (
          <React.Fragment key={step.id}>
            <div className="gc-pq">{step.q}</div>
            {isCurrent && step.options && (
              <div className="gc-btn-group gc-pq-options">
                {step.options.map(opt => <button key={opt} className="gc-btn-opt" onClick={() => handleSelect(step.id, opt)}>{opt}</button>)}
              </div>
            )}
            {isCurrent && step.type === 'terminals' && (
              <div className="gc-pq-options">
                <div className="gc-terminal-list">
                  {merchantTerminals.map(t => (
                    <div key={t.id} className={`gc-terminal-opt${selectedTerminals.includes(t.id) ? ' selected' : ''}`} onClick={() => toggleTerminal(t.id)}>
                      <div className="gc-terminal-check">{selectedTerminals.includes(t.id) ? '✓' : ''}</div>
                      <div className="gc-terminal-info"><strong>{t.displayId}</strong><span>{t.gatewayShort}</span></div>
                      <div className="gc-terminal-stats"><span className="gc-terminal-sr">SR {t.successRate}%</span><span className="gc-terminal-cost">₹{t.costPerTxn}</span></div>
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
            {isAnswered && <div className="gc-pa-wrap"><span className="gc-pa">{getAnswerText(step.id)}</span></div>}
          </React.Fragment>
        )
      })}
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

// ════════════════════════════════════════════
// Panel Components
// ════════════════════════════════════════════

// ── Simulate Panel ──
function SimulatePanel({ method, merchant, rules, simOverrides }) {
  const mkDefault = useCallback(() => {
    switch (method) {
      case 'Cards':  return { payment_method: 'Cards',  card_network: 'Visa', card_type: 'credit', amount: 5000,  international: false }
      case 'UPI':    return { payment_method: 'UPI',    amount: 2000,  international: false }
      case 'NB':     return { payment_method: 'NB',     amount: 5000,  international: false }
      case 'EMI':    return { payment_method: 'EMI',    card_network: 'Visa', emi_type: 'no_cost', amount: 15000, international: false }
      case 'Wallet': return { payment_method: 'Wallet', amount: 1000,  international: false }
      default:       return { payment_method: method,   amount: 5000,  international: false }
    }
  }, [method])

  const [params, setParams] = useState(mkDefault)
  const [result, setResult] = useState(null)

  useEffect(() => { setParams(mkDefault()); setResult(null) }, [method])

  const set = (k, v) => setParams(p => ({ ...p, [k]: v }))

  const runSim = () => {
    const r = simulateRoutingPipeline(merchant, params, rules, simOverrides)
    setResult(r)
  }

  const methodLabel = method === 'NB' ? 'Net Banking' : method

  return (
    <div className="gc-panel-body">
      <div className="gc-panel-hdr">
        <span className="gc-panel-title">Simulate {methodLabel} Payment</span>
      </div>

      <div className="gc-sim-form">
        <div className="gc-sim-field">
          <label className="gc-sim-label">Amount (₹)</label>
          <input
            type="number" className="gc-sim-input" value={params.amount} min={1}
            onChange={e => set('amount', parseInt(e.target.value) || 0)}
          />
        </div>

        {method === 'Cards' && <>
          <div className="gc-sim-field">
            <label className="gc-sim-label">Card Network</label>
            <div className="gc-btn-group">
              {['Visa', 'Mastercard', 'RuPay', 'Amex'].map(n => (
                <button key={n} className={`gc-btn-opt${params.card_network === n ? ' active' : ''}`} onClick={() => set('card_network', n)}>{n}</button>
              ))}
            </div>
          </div>
          <div className="gc-sim-field">
            <label className="gc-sim-label">Card Type</label>
            <div className="gc-btn-group">
              {['credit', 'debit'].map(t => (
                <button key={t} className={`gc-btn-opt${params.card_type === t ? ' active' : ''}`} onClick={() => set('card_type', t)} style={{ textTransform: 'capitalize' }}>{t}</button>
              ))}
            </div>
          </div>
          <div className="gc-sim-field">
            <label className="gc-sim-toggle">
              <input type="checkbox" checked={params.international} onChange={e => set('international', e.target.checked)} />
              <span>International</span>
            </label>
          </div>
        </>}

        {method === 'EMI' && <>
          <div className="gc-sim-field">
            <label className="gc-sim-label">Card Network</label>
            <div className="gc-btn-group">
              {['Visa', 'Mastercard'].map(n => (
                <button key={n} className={`gc-btn-opt${params.card_network === n ? ' active' : ''}`} onClick={() => set('card_network', n)}>{n}</button>
              ))}
            </div>
          </div>
          <div className="gc-sim-field">
            <label className="gc-sim-label">EMI Type</label>
            <div className="gc-btn-group">
              <button className={`gc-btn-opt${params.emi_type === 'no_cost' ? ' active' : ''}`} onClick={() => set('emi_type', 'no_cost')}>No-Cost</button>
              <button className={`gc-btn-opt${params.emi_type === 'standard' ? ' active' : ''}`} onClick={() => set('emi_type', 'standard')}>Standard</button>
            </div>
          </div>
        </>}

        {method === 'NB' && (
          <div className="gc-sim-field">
            <label className="gc-sim-label">Bank</label>
            <div className="gc-btn-group">
              {['Any', 'HDFC', 'SBI', 'ICICI', 'Axis', 'Kotak'].map(b => (
                <button key={b} className={`gc-btn-opt${(params.bank || 'Any') === b ? ' active' : ''}`} onClick={() => set('bank', b === 'Any' ? undefined : b)}>{b}</button>
              ))}
            </div>
          </div>
        )}

        {method === 'Wallet' && (
          <div className="gc-sim-field">
            <label className="gc-sim-label">Wallet Provider</label>
            <div className="gc-btn-group">
              {['Paytm', 'PhonePe', 'Amazon Pay', 'Any'].map(w => (
                <button key={w} className={`gc-btn-opt${(params.wallet || 'Any') === w ? ' active' : ''}`} onClick={() => set('wallet', w === 'Any' ? undefined : w)}>{w}</button>
              ))}
            </div>
          </div>
        )}

        <button className="gc-submit-btn" style={{ marginTop: 8 }} onClick={runSim}>
          Run Simulation →
        </button>
      </div>

      {result && (
        <div className="gc-sim-result">
          <div className="gc-sim-divider" />
          <PipelineTrace result={result} txn={params} />
        </div>
      )}
    </div>
  )
}

// ── Method Rules Panel ──
function MethodRulesPanel({ method, methodLabel, merchant, rules, addRule }) {
  const [showCreate, setShowCreate] = useState(false)

  const methodRules = useMemo(() =>
    rules.filter(r => !r.isDefault && !r.isMethodDefault && r.conditions?.some(c => c.field === 'payment_method' && c.value === method))
  , [rules, method])

  const allForTable = useMemo(() =>
    rules.filter(r => r.conditions?.some(c => c.field === 'payment_method' && c.value === method))
  , [rules, method])

  return (
    <div className="gc-panel-body">
      <div className="gc-panel-hdr">
        <span className="gc-panel-title">{methodLabel} Rules</span>
        {methodRules.length > 0 && (
          <span className="gc-badge gc-badge-blue" style={{ fontSize: 12, marginLeft: 8 }}>{methodRules.length}</span>
        )}
        <button className="gc-panel-create-btn" onClick={() => setShowCreate(s => !s)}>
          {showCreate ? '✕ Cancel' : '+ Create Rule'}
        </button>
      </div>

      {showCreate && (
        <div className="gc-create-rule-wrap">
          <RuleForm
            merchant={merchant}
            rules={rules}
            onRuleCreated={rule => { addRule?.(rule); setShowCreate(false) }}
            prefill={{ method }}
          />
        </div>
      )}

      {!showCreate && allForTable.length === 0 && (
        <div className="gc-empty-state">
          <div className="gc-empty-icon">📋</div>
          <div className="gc-empty-title">No {methodLabel} rules</div>
          <div className="gc-empty-desc">Create a rule to customise routing for {methodLabel} payments.</div>
          <button className="gc-submit-btn" style={{ maxWidth: 200, marginTop: 16 }} onClick={() => setShowCreate(true)}>
            + Create Rule
          </button>
        </div>
      )}

      {!showCreate && allForTable.length > 0 && (
        <RuleTable rules={allForTable} merchant={merchant} />
      )}
    </div>
  )
}

// ════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════
export default function RoutingCopilot({ merchant, rules, addRule, simOverrides }) {
  const [selectedMethod, setSelectedMethod] = useState('Cards')
  const [selectedView,   setSelectedView]   = useState('rules')
  const [expanded,       setExpanded]       = useState(() => new Set(['Cards']))

  const ruleCount = useMemo(() => {
    const counts = {}
    ALL_PAYMENT_METHODS.forEach(({ key }) => {
      counts[key] = rules.filter(r =>
        !r.isDefault && !r.isMethodDefault &&
        r.conditions?.some(c => c.field === 'payment_method' && c.value === key)
      ).length
    })
    return counts
  }, [rules])

  const selectItem = (method, view) => {
    setSelectedMethod(method)
    setSelectedView(view)
    setExpanded(prev => new Set([...prev, method]))
  }

  const toggleExpand = key => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }

  const activeMethodDef = ALL_PAYMENT_METHODS.find(m => m.key === selectedMethod)

  return (
    <div className="gc-copilot">
      {/* ── Left Sidebar ── */}
      <nav className="gc-sidebar">
        {ALL_PAYMENT_METHODS.map(({ key, label, Icon }) => {
          const isActive = selectedMethod === key
          const isOpen   = expanded.has(key)
          const cnt      = ruleCount[key] || 0

          return (
            <div key={key} className="gc-nav-group">
              <button
                className={`gc-nav-item${isActive ? ' gc-nav-item--active' : ''}`}
                onClick={() => { toggleExpand(key); selectItem(key, selectedView) }}
              >
                <span className="gc-nav-icon"><Icon /></span>
                <span className="gc-nav-label">{label}</span>
                {cnt > 0 && <span className="gc-nav-count">{cnt}</span>}
                <svg
                  className={`gc-nav-caret${isOpen ? ' open' : ''}`}
                  viewBox="0 0 24 24" width="12" height="12"
                  fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isOpen && (
                <div className="gc-nav-children">
                  <button
                    className={`gc-nav-child${isActive && selectedView === 'rules' ? ' gc-nav-child--active' : ''}`}
                    onClick={() => selectItem(key, 'rules')}
                  >
                    <span>Rules</span>
                    {cnt > 0 && <span className="gc-nav-child-cnt">{cnt}</span>}
                  </button>
                  <button
                    className={`gc-nav-child${isActive && selectedView === 'simulate' ? ' gc-nav-child--active' : ''}`}
                    onClick={() => selectItem(key, 'simulate')}
                  >
                    <span>Simulate</span>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* ── Right Content Panel ── */}
      <div className="gc-panel">
        {selectedView === 'rules' && (
          <MethodRulesPanel
            key={`${selectedMethod}-rules`}
            method={selectedMethod}
            methodLabel={activeMethodDef?.label || selectedMethod}
            merchant={merchant}
            rules={rules}
            addRule={addRule}
          />
        )}
        {selectedView === 'simulate' && (
          <SimulatePanel
            key={`${selectedMethod}-sim`}
            method={selectedMethod}
            merchant={merchant}
            rules={rules}
            simOverrides={simOverrides}
          />
        )}
      </div>
    </div>
  )
}
