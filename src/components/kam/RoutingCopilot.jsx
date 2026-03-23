import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { gateways, simulateRoutingPipeline } from '../../data/kamMockData'

// ════════════════════════════════════════════
// RoutingCopilot — Method sidebar + scoped chat
// ════════════════════════════════════════════

// ── Payment Method Definitions ──────────────
const ALL_PAYMENT_METHODS = [
  { key: 'Cards',  label: 'Cards',       Icon: IconCards  },
  { key: 'UPI',    label: 'UPI',         Icon: IconUPI    },
  { key: 'NB',     label: 'Net Banking', Icon: IconNB     },
  { key: 'EMI',    label: 'EMI',         Icon: IconEMI    },
  { key: 'Wallet', label: 'Wallet',      Icon: IconWallet },
]

// ── Smart Suggest Chips per Method ──────────
const SMART_SUGGESTS = {
  Cards: [
    'List all available terminals',
    'Cost of all available terminals',
    'What is the priority order of terminals for Visa credit above ₹5,000',
    'Show NTF risk for international cards',
    'Which terminal has the best SR for Mastercard?',
    'Create a rule for RuPay debit cards',
  ],
  UPI: [
    'List all available terminals',
    'Cost of all available terminals',
    'What is the priority order of terminals for UPI intent up to ₹2,000',
    'Show NTF risk for UPI collect',
    'Which UPI terminal has the highest SR?',
    'Create a rule for UPI payments',
  ],
  NB: [
    'List all available terminals',
    'Which banks have the highest SR?',
    'Priority order for SBI net banking',
    'Show NTF risk for net banking',
    'Cost of all available terminals',
    'Create a rule for net banking',
  ],
  EMI: [
    'List all available terminals',
    'Cost comparison across EMI terminals',
    'Which terminals support no-cost EMI?',
    'Show NTF risk for EMI above ₹10,000',
    'Priority order for Visa EMI',
    'Create a rule for no-cost EMI',
  ],
  Wallet: [
    'List all available terminals',
    'Which wallet providers are supported?',
    'Show routing rules for wallets',
    'What happens to wallet payments currently?',
    'Create a routing rule for wallets',
  ],
}

// ── Icons ────────────────────────────────────
function IconCards()  { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> }
function IconUPI()    { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> }
function IconNB()     { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg> }
function IconEMI()    { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function IconWallet() { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 12V22H4a2 2 0 0 1-2-2V6a2 2 0 0 0 2 2h16v4z"/><path d="M22 12H4"/><path d="M6 6V4a2 2 0 0 1 2-2h12"/><circle cx="17" cy="17" r="1" fill="currentColor"/></svg> }

// ── Intent Classifier ──────────────────────
function classifyIntent(input) {
  const q = input.toLowerCase().trim()
  if (/create|add|new|write|make|set up|setup/.test(q) && /rule|routing|route/.test(q)) return { type: 'create_rule', raw: input }
  if (/route\s+(all|every)?\s*(cards?|upi|nb|net\s*banking|emi)/i.test(q)) return { type: 'create_rule', raw: input }
  if (/list|available.*terminal|terminal.*available|all terminal/i.test(q)) return { type: 'terminal_info', raw: input }
  if (/cost.*terminal|terminal.*cost|cost comparison|cheapest|pricing/i.test(q)) return { type: 'terminal_info', raw: input }
  if (/sr.*highest|highest.*sr|best.*sr|which.*bank|which.*terminal.*sr|which.*provider/i.test(q)) return { type: 'terminal_info', raw: input }
  if (/what happens|simulate|send|trace|if i send|payment of|priority.*order|order.*terminal/i.test(q)) return { type: 'simulate', raw: input }
  if (/ntf|no terminal|why.*(fail|ntf|block)|failure|failing|ntf risk/i.test(q)) return { type: 'ntf_analysis', raw: input }
  if (/show|list|display|view|current|existing|what are/.test(q) && /rule|routing|config/i.test(q)) return { type: 'show_rules', raw: input }
  if (/what if|if i disable|if i remove|if.*drops?|if.*down/i.test(q)) return { type: 'what_if', raw: input }
  if (/coverage|gap|uncovered|missing|blind spot/i.test(q)) return { type: 'coverage', raw: input }
  if (/help|what can you|how do i|guide/i.test(q)) return { type: 'help', raw: input }
  if (/terminal|gateway|hdfc|icici|axis|rbl|yes bank/i.test(q)) return { type: 'terminal_info', raw: input }
  return { type: 'simulate', raw: input }
}

// ── Parse transaction from natural language ──
function parseTxnFromInput(input, defaultMethod = 'Cards') {
  const q = input.toLowerCase()
  const txn = { payment_method: defaultMethod, amount: 5000, card_network: 'Visa', card_type: 'credit', international: false }
  if (/upi/i.test(q)) txn.payment_method = 'UPI'
  else if (/net\s*banking|nb/i.test(q)) txn.payment_method = 'NB'
  else if (/emi/i.test(q)) txn.payment_method = 'EMI'
  else if (/wallet/i.test(q)) txn.payment_method = 'Wallet'
  if (/master/i.test(q)) txn.card_network = 'Mastercard'
  else if (/rupay/i.test(q)) txn.card_network = 'RuPay'
  if (/debit/i.test(q)) txn.card_type = 'debit'
  if (/international|intl/i.test(q)) txn.international = true
  const amtMatch = q.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/i) || q.match(/([\d,]+)\s*(?:₹|rs|rupee)/i)
  if (amtMatch) txn.amount = parseInt(amtMatch[1].replace(/,/g, ''))
  return txn
}

// ── Parse rule creation intent ──
function parseRuleIntent(input, defaultMethod = null) {
  const q = input.toLowerCase()
  const intent = { method: defaultMethod, network: null, gatewayShort: null }
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
  }
  return null
}

// ════════════════════════════════════════════
// GenUI Response Components
// ════════════════════════════════════════════

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
                    <span key={t.terminalId} className="gc-chip gc-chip-pass">{t.displayId} <span className="gc-chip-sr">{t.successRate}%</span></span>
                  ))}
                </div>
              )}
              {(stage.terminalsEliminated || []).length > 0 && (
                <div className="gc-chips">
                  {stage.terminalsEliminated.map(t => (
                    <span key={t.terminalId} className="gc-chip gc-chip-fail">{t.displayId} <span className="gc-chip-reason">{t.reason}</span></span>
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

function RuleTable({ rules, merchant }) {
  const activeRules = rules.filter(r => r.enabled && !r.isDefault && !r.isMethodDefault)
  const defaults    = rules.filter(r => r.isDefault || r.isMethodDefault)
  const formatConditions = r => {
    if (!r.conditions || r.conditions.length === 0) return 'All transactions'
    return r.conditions.map(c => {
      const field = c.field.replace(/_/g, ' ')
      const val   = Array.isArray(c.value) ? c.value.join(', ') : c.value
      return `${field} ${c.operator.replace(/_/g, ' ')} ${val}`
    }).join(' AND ')
  }
  const getTermLabel = termId => {
    for (const gw of gateways) {
      const t = gw.terminals.find(t => t.id === termId)
      if (t) return `${t.terminalId} (${gw.shortName})`
    }
    return termId
  }
  if (activeRules.length === 0 && defaults.length === 0) return <div className="gc-info-box">No rules configured for this method.</div>
  return (
    <div className="gc-rules">
      <div className="gc-rules-title">{activeRules.length} active rule{activeRules.length !== 1 ? 's' : ''}, {defaults.length} default{defaults.length !== 1 ? 's' : ''}</div>
      <table className="gc-table">
        <thead><tr><th>#</th><th>Name</th><th>Conditions</th><th>Routes To</th><th>Type</th></tr></thead>
        <tbody>
          {activeRules.map((r, i) => (
            <tr key={r.id}>
              <td><span className="gc-badge gc-badge-blue">{i + 1}</span></td>
              <td><strong>{r.name}</strong></td>
              <td style={{ fontSize: 12 }}>{formatConditions(r)}</td>
              <td>
                <div className="gc-chips" style={{ flexWrap: 'wrap' }}>
                  {r.action.type === 'split'
                    ? r.action.splits.map(s => <span key={s.terminalId} className="gc-chip gc-chip-pass">{getTermLabel(s.terminalId)} ({s.percentage}%)</span>)
                    : (r.action.terminals || []).map(tid => <span key={tid} className="gc-chip gc-chip-pass">{getTermLabel(tid)}</span>)
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
              <td><div className="gc-chips" style={{ flexWrap: 'wrap' }}>{(r.action.terminals || []).map(tid => <span key={tid} className="gc-chip gc-chip-pass">{getTermLabel(tid)}</span>)}</div></td>
              <td><span className="gc-badge gc-badge-gray">Default</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TerminalInfo({ merchant, method }) {
  const terminals = merchant.gatewayMetrics
    .filter(gm => !method || (gm.supportedMethods || []).includes(method))
    .map(gm => {
      const gw   = gateways.find(g => g.id === gm.gatewayId)
      const term = gw?.terminals.find(t => t.id === gm.terminalId)
      return { ...gm, gatewayShort: gw?.shortName, displayId: term?.terminalId || gm.terminalId }
    })
  return (
    <div className="gc-rules">
      <div className="gc-rules-title">{terminals.length} terminal{terminals.length !== 1 ? 's' : ''} supporting {method || 'all methods'}</div>
      <table className="gc-table">
        <thead><tr><th>Terminal</th><th>Gateway</th><th>SR</th><th>Cost/Txn</th><th>Methods</th><th>Traffic</th></tr></thead>
        <tbody>
          {terminals.map(t => (
            <tr key={t.terminalId}>
              <td><strong style={{ fontFamily: 'monospace' }}>{t.displayId}</strong></td>
              <td>{t.gatewayShort}</td>
              <td><span style={{ color: t.successRate >= 72 ? 'var(--rzp-success)' : 'var(--rzp-warning)', fontWeight: 600 }}>{t.successRate}%</span></td>
              <td>{t.costPerTxn === 0 ? <span className="gc-badge gc-badge-success">₹0</span> : `₹${t.costPerTxn}`}</td>
              <td style={{ fontSize: 12 }}>{(t.supportedMethods || []).join(', ')}</td>
              <td>{t.txnShare}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const RULE_STEPS = [
  { id: 'method',      q: 'What payment method should this rule apply to?',    options: ['Cards', 'UPI', 'NB', 'EMI'] },
  { id: 'network',     q: 'Which card network?',                               options: ['Any', 'Visa', 'Mastercard', 'RuPay'], showIf: s => s.method === 'Cards' || s.method === 'EMI' },
  { id: 'cardType',    q: 'Credit or Debit?',                                  options: ['Any', 'Credit', 'Debit'],             showIf: s => s.method === 'Cards' },
  { id: 'issuer',      q: 'Any specific issuer bank?',                         options: ['Any', 'HDFC', 'ICICI', 'Axis', 'SBI', 'Kotak'] },
  { id: 'amount',      q: 'Filter by amount range?',                           options: ['Any', '>₹5K', '>₹1L', '<₹100'] },
  { id: 'intl',        q: 'Domestic or International?',                        options: ['Domestic', 'International', 'Both'] },
  { id: 'terminals',   q: 'Route to which terminal(s)?',                       type: 'terminals' },
  { id: 'srThreshold', q: 'SR Safety Net — below what SR% should it fallback?', type: 'slider' },
]

function RuleForm({ merchant, rules, onRuleCreated, prefill }) {
  const [selections, setSelections]               = useState({})
  const [currentStep, setCurrentStep]             = useState(0)
  const [selectedTerminals, setSelectedTerminals] = useState([])
  const [srThreshold, setSrThreshold]             = useState(90)
  const [submitted, setSubmitted]                 = useState(false)
  const [simResult, setSimResult]                 = useState(null)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.closest('.gc-chat-area')?.scrollTo({ top: 99999, behavior: 'smooth' })
  }, [currentStep, submitted])

  useEffect(() => {
    if (prefill?.method) {
      const initial = { method: prefill.method }
      setSelections(initial)
      let ni = 1
      while (ni < RULE_STEPS.length && RULE_STEPS[ni].showIf && !RULE_STEPS[ni].showIf(initial)) ni++
      setCurrentStep(ni)
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
      const match = merchantTerminals.filter(t => t.gatewayShort === prefill.gatewayShort)
      if (match.length) setSelectedTerminals(match.map(t => t.id))
    }
  }, [prefill, merchantTerminals])

  const handleSelect = (stepId, value) => {
    const next = { ...selections, [stepId]: value }
    setSelections(next)
    let ni = currentStep + 1
    while (ni < RULE_STEPS.length && RULE_STEPS[ni].showIf && !RULE_STEPS[ni].showIf(next)) ni++
    setCurrentStep(ni)
  }

  const toggleTerminal = id => setSelectedTerminals(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const doSubmit = useCallback(() => {
    const s = { ...selections, terminals: selectedTerminals, srThreshold }
    const conditions = []
    if (s.method) conditions.push({ field: 'payment_method', operator: 'equals', value: s.method })
    if (s.network && s.network !== 'Any') conditions.push({ field: 'card_network', operator: 'equals', value: s.network })
    if (s.cardType && s.cardType !== 'Any') conditions.push({ field: 'card_type', operator: 'equals', value: s.cardType.toLowerCase() })
    if (s.issuer && s.issuer !== 'Any') conditions.push({ field: 'issuer_bank', operator: 'equals', value: s.issuer })
    if (s.amount === '>₹5K')  conditions.push({ field: 'amount', operator: 'greater_than', value: 5000 })
    if (s.amount === '>₹1L')  conditions.push({ field: 'amount', operator: 'greater_than', value: 100000 })
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
    const txn         = { payment_method: s.method || 'Cards', amount: 5000, card_network: s.network === 'Any' ? 'Visa' : (s.network || 'Visa'), card_type: (s.cardType === 'Any' ? 'credit' : (s.cardType || 'credit')).toLowerCase(), international: s.intl === 'International' }
    const withRule    = simulateRoutingPipeline(merchant, txn, [...rules, newRule])
    const withoutRule = simulateRoutingPipeline(merchant, txn, rules)
    setSimResult({ newRule, withRule, withoutRule, txn })
    setSubmitted(true)
    onRuleCreated?.(newRule)
  }, [selections, selectedTerminals, srThreshold, merchant, rules, merchantTerminals, onRuleCreated])

  const visibleSteps = []
  for (let i = 0; i < RULE_STEPS.length && i <= currentStep; i++) {
    const step = RULE_STEPS[i]
    if (step.showIf && !step.showIf(selections)) continue
    visibleSteps.push({ ...step, idx: i })
  }

  const getAnswerText = id => {
    if (id === 'terminals') return selectedTerminals.map(tid => merchantTerminals.find(t => t.id === tid)?.displayId || tid).join(', ')
    if (id === 'srThreshold') return srThreshold === 0 ? 'Off' : `${srThreshold}%`
    return selections[id] || ''
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
                  <button className="gc-btn-opt active" style={{ marginTop: 8 }} onClick={() => handleSelect('terminals', selectedTerminals)}>
                    Confirm {selectedTerminals.length} terminal{selectedTerminals.length > 1 ? 's' : ''} →
                  </button>
                )}
              </div>
            )}
            {isCurrent && step.type === 'slider' && (
              <div className="gc-pq-options">
                <input type="range" min="0" max="99" value={srThreshold} onChange={e => setSrThreshold(+e.target.value)} style={{ width: '100%' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>
                  <span>0% (no fallback)</span>
                  <span style={{ fontWeight: 700, color: srThreshold > 0 ? '#528FF0' : '#dc2626', fontSize: 14 }}>{srThreshold}%</span>
                  <span>99%</span>
                </div>
                <button className="gc-btn-opt active" onClick={() => { handleSelect('srThreshold', srThreshold); setTimeout(doSubmit, 100) }}>Create Rule & Preview Impact →</button>
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
                  <div className="gc-impact-val">{simResult.withoutRule.isNTF ? <span style={{ color: 'var(--rzp-danger)' }}>NTF ❌</span> : <span>→ {simResult.withoutRule.selectedTerminal?.displayId}</span>}</div>
                </div>
                <div className="gc-impact-arrow">→</div>
                <div className="gc-impact-card">
                  <div className="gc-impact-label">After</div>
                  <div className="gc-impact-val">{simResult.withRule.isNTF ? <span style={{ color: 'var(--rzp-danger)' }}>NTF ❌</span> : <span style={{ color: 'var(--rzp-success)' }}>→ {simResult.withRule.selectedTerminal?.displayId}</span>}</div>
                </div>
              </div>
              {!simResult.withRule.isNTF && !simResult.withoutRule.isNTF && (
                <div className="gc-info-box" style={{ marginTop: 8 }}>Routing changes from <strong>{simResult.withoutRule.selectedTerminal?.displayId}</strong> to <strong>{simResult.withRule.selectedTerminal?.displayId}</strong>.</div>
              )}
            </div>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  )
}

// ════════════════════════════════════════════
// Method-scoped Chat
// ════════════════════════════════════════════
function MethodChat({ method, merchant, rules, addRule, simOverrides }) {
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const chatEndRef              = useRef(null)
  const methodLabel = method === 'NB' ? 'Net Banking' : method

  // Reset chat when method changes
  useEffect(() => {
    setMessages([{
      type: 'bot', content: 'greeting',
      data: { merchantName: merchant?.name, method, methodLabel },
      ts: Date.now(),
    }])
    setInput('')
  }, [method, merchant?.id])

  // Auto-scroll inside chat area only
  useEffect(() => {
    const el = chatEndRef.current
    if (el) {
      const container = el.closest('.gc-chat-area')
      if (container) container.scrollTop = container.scrollHeight
    }
  }, [messages])

  const dispatch = useCallback((userMsg) => {
    if (!userMsg.trim() || !merchant) return
    setMessages(prev => [...prev, { type: 'user', text: userMsg, ts: Date.now() }])

    setTimeout(() => {
      const intent = classifyIntent(userMsg)
      let response

      switch (intent.type) {
        case 'simulate': {
          const txn = parseTxnFromInput(userMsg, method)
          const result = simulateRoutingPipeline(merchant, txn, rules, simOverrides)
          response = { type: 'bot', content: 'pipeline', data: { result, txn }, ts: Date.now() }
          break
        }
        case 'show_rules': {
          const methodRules = rules.filter(r => r.conditions?.some(c => c.field === 'payment_method' && c.value === method))
          response = { type: 'bot', content: 'rule_table', data: { rules: methodRules, merchant }, ts: Date.now() }
          break
        }
        case 'create_rule': {
          const prefill = parseRuleIntent(userMsg, method)
          response = { type: 'bot', content: 'rule_form', data: { merchant, rules, prefill }, ts: Date.now() }
          break
        }
        case 'terminal_info': {
          response = { type: 'bot', content: 'terminal_info', data: { merchant, method }, ts: Date.now() }
          break
        }
        case 'ntf_analysis': {
          const testCases = {
            Cards:  [
              { payment_method: 'Cards', card_network: 'Visa',       card_type: 'credit', amount: 5000,  international: false },
              { payment_method: 'Cards', card_network: 'Mastercard', card_type: 'credit', amount: 5000,  international: false },
              { payment_method: 'Cards', card_network: 'RuPay',      card_type: 'debit',  amount: 2000,  international: false },
              { payment_method: 'Cards', card_network: 'Visa',       card_type: 'credit', amount: 5000,  international: true  },
            ],
            UPI:    [
              { payment_method: 'UPI', amount: 500,  international: false },
              { payment_method: 'UPI', amount: 2000, international: false },
              { payment_method: 'UPI', amount: 5000, international: false },
            ],
            NB:     [{ payment_method: 'NB', amount: 5000, international: false }],
            EMI:    [
              { payment_method: 'EMI', card_network: 'Visa', emi_type: 'no_cost', amount: 15000 },
              { payment_method: 'EMI', card_network: 'Visa', emi_type: 'standard', amount: 10000 },
            ],
            Wallet: [{ payment_method: 'Wallet', amount: 500 }],
          }
          const cases   = testCases[method] || testCases.Cards
          const results = cases.map(txn => ({ txn, result: simulateRoutingPipeline(merchant, txn, rules, simOverrides) }))
          const ntfs    = results.filter(r => r.result.isNTF)
          const passing = results.filter(r => !r.result.isNTF)
          response = { type: 'bot', content: 'ntf_analysis', data: { ntfs, passing, method: methodLabel }, ts: Date.now() }
          break
        }
        case 'what_if': {
          const parsed = parseWhatIf(userMsg)
          if (parsed?.type === 'disable_terminal') {
            const overrides = { ...simOverrides, disabledTerminals: new Set([...(simOverrides?.disabledTerminals || []), parsed.terminalId]) }
            const testTxn   = { payment_method: method, amount: 5000, card_network: 'Visa', card_type: 'credit', international: false }
            const before    = [{ txn: testTxn, result: simulateRoutingPipeline(merchant, testTxn, rules, simOverrides) }]
            const after     = [{ txn: testTxn, result: simulateRoutingPipeline(merchant, testTxn, rules, overrides) }]
            response = { type: 'bot', content: 'what_if', data: { label: parsed.label, before, after }, ts: Date.now() }
          } else {
            response = { type: 'bot', content: 'text', text: 'Try: "What if I disable HDFC_T1?"', ts: Date.now() }
          }
          break
        }
        default:
          response = { type: 'bot', content: 'text', text: `I can help with ${methodLabel} routing. Try asking about terminals, NTF risk, priority order, or creating a rule.`, ts: Date.now() }
      }

      setMessages(prev => [...prev, response])
    }, 280)
  }, [method, merchant, rules, simOverrides, methodLabel])

  const handleSend = useCallback(() => {
    if (!input.trim()) return
    const msg = input.trim()
    setInput('')
    dispatch(msg)
  }, [input, dispatch])

  const renderMessage = (msg, i) => {
    if (msg.type === 'user') {
      return (
        <div key={i} className="gc-msg gc-msg-user">
          <div className="gc-msg-bubble gc-msg-bubble-user">{msg.text}</div>
        </div>
      )
    }
    if (msg.content === 'rule_form') {
      return (
        <div key={i} className="gc-msg-full">
          <RuleForm merchant={msg.data.merchant} rules={msg.data.rules} onRuleCreated={addRule} prefill={msg.data.prefill} />
        </div>
      )
    }
    return (
      <div key={i} className="gc-msg gc-msg-bot">
        <div className="gc-msg-avatar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#528FF0" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div className="gc-msg-bubble gc-msg-bubble-bot">
          {msg.content === 'greeting' && (
            <div>
              <div style={{ marginBottom: 6 }}>
                Routing Copilot for <strong>{msg.data?.merchantName}</strong> — scoped to <strong>{msg.data?.methodLabel}</strong>.
                Ask me about terminals, NTF risk, priority order, or create a routing rule.
              </div>
            </div>
          )}
          {msg.content === 'text'          && <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>}
          {msg.content === 'pipeline'      && <PipelineTrace result={msg.data.result} txn={msg.data.txn} />}
          {msg.content === 'rule_table'    && <RuleTable rules={msg.data.rules} merchant={msg.data.merchant} />}
          {msg.content === 'terminal_info' && <TerminalInfo merchant={msg.data.merchant} method={msg.data.method} />}
          {msg.content === 'ntf_analysis'  && (
            <div className="gc-ntf-analysis">
              <div className="gc-ntf-summary">
                {msg.data.ntfs.length === 0
                  ? <div className="gc-info-box">✅ No NTF risk detected for {msg.data.method}. All tested payment types route successfully.</div>
                  : <div className="gc-warning-box">⚠️ {msg.data.ntfs.length} payment type{msg.data.ntfs.length > 1 ? 's' : ''} will result in NTF for {msg.data.method}</div>
                }
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
                      <span>{p.txn.payment_method} {p.txn.card_network || ''} {p.txn.international ? '(Intl)' : ''} ₹{p.txn.amount?.toLocaleString()}</span>
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
                    const a      = msg.data.after[bi]
                    const nowNTF = a.result.isNTF && !b.result.isNTF
                    const changed = b.result.selectedTerminal?.terminalId !== a.result.selectedTerminal?.terminalId
                    return (
                      <tr key={bi}>
                        <td>{b.txn.payment_method} {b.txn.card_network || ''}</td>
                        <td>{b.result.isNTF ? '❌ NTF' : b.result.selectedTerminal?.displayId}</td>
                        <td style={{ color: nowNTF ? 'var(--rzp-danger)' : changed ? 'var(--rzp-warning)' : 'inherit' }}>
                          {a.result.isNTF ? '❌ NTF' : a.result.selectedTerminal?.displayId}
                        </td>
                        <td>
                          {nowNTF ? <span className="gc-badge gc-badge-danger">⚠️ NTF Risk</span>
                           : changed ? <span className="gc-badge gc-badge-warning">Rerouted</span>
                           : <span className="gc-badge gc-badge-gray">No change</span>}
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

  const suggests = SMART_SUGGESTS[method] || []

  return (
    <div className="gc-method-chat">
      {/* Smart Suggest chips */}
      {suggests.length > 0 && (
        <div className="gc-suggest-bar">
          {suggests.map((s, i) => (
            <button key={i} className="gc-suggest-chip" onClick={() => dispatch(s)}>{s}</button>
          ))}
        </div>
      )}

      {/* Chat messages */}
      <div className="gc-chat-area">
        {messages.map((msg, i) => renderMessage(msg, i))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="gc-input-area">
        <input
          className="gc-input-main"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder={`Ask about ${methodLabel} routing, terminals, NTF risk…`}
        />
        <button className="gc-send-btn" onClick={handleSend} disabled={!input.trim()}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════
export default function RoutingCopilot({ merchant, rules, addRule, simOverrides }) {
  const [selectedMethod, setSelectedMethod] = useState('Cards')

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

  return (
    <div className="gc-copilot">
      {/* ── Left Sidebar ── */}
      <nav className="gc-sidebar">
        {ALL_PAYMENT_METHODS.map(({ key, label, Icon }) => {
          const isActive = selectedMethod === key
          const cnt      = ruleCount[key] || 0
          return (
            <button
              key={key}
              className={`gc-nav-item${isActive ? ' gc-nav-item--active' : ''}`}
              onClick={() => setSelectedMethod(key)}
            >
              <span className="gc-nav-icon"><Icon /></span>
              <span className="gc-nav-label">{label}</span>
              {cnt > 0 && <span className="gc-nav-count">{cnt}</span>}
            </button>
          )
        })}
      </nav>

      {/* ── Right: Method-scoped Chat ── */}
      <div className="gc-panel">
        <MethodChat
          key={selectedMethod}
          method={selectedMethod}
          merchant={merchant}
          rules={rules}
          addRule={addRule}
          simOverrides={simOverrides}
        />
      </div>
    </div>
  )
}
