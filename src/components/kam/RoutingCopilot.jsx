import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { gateways, simulateRoutingPipeline } from '../../data/kamMockData'
import CreateRuleWizard from './RuleWizard'

// ════════════════════════════════════════════
// RoutingCopilot — Method sidebar + scoped chat
// ════════════════════════════════════════════

// ── Payment Method Definitions ──────────────
const ALL_PAYMENT_METHODS = [
  { key: 'Cards',        label: 'Cards',         Icon: IconCards        },
  { key: 'UPIOnetime',   label: 'UPI Onetime',   Icon: IconUPI          },
  { key: 'UPIRecurring', label: 'UPI Recurring',  Icon: IconUPIRecurring },
  { key: 'EMI',          label: 'EMI',            Icon: IconEMI          },
]

// Map wizard method key → data key used in supportedMethods / terminal filtering
function methodToDataKey(method) {
  return (method === 'UPIOnetime' || method === 'UPIRecurring') ? 'UPI' : method
}

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
  UPIOnetime: [
    'List all available terminals',
    'Cost of all available terminals',
    'What is the priority order of terminals for UPI intent up to ₹2,000',
    'Show NTF risk for UPI collect',
    'Which UPI terminal has the highest SR?',
    'Create a rule for UPI payments',
  ],
  UPIRecurring: [
    'List all available terminals',
    'Which terminals support recurring mandates?',
    'Priority order for UPI auto-debit',
    'Show NTF risk for recurring payments',
    'Cost of all available terminals',
    'Create a rule for UPI recurring',
  ],
  EMI: [
    'List all available terminals',
    'Cost comparison across EMI terminals',
    'Which terminals support no-cost EMI?',
    'Show NTF risk for EMI above ₹10,000',
    'Priority order for Visa EMI',
    'Create a rule for no-cost EMI',
  ],
}

// ── Icons ────────────────────────────────────
function IconCards()        { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> }
function IconUPI()          { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> }
function IconUPIRecurring() { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> }
function IconEMI()          { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }

// ── Card icons ───────────────────────────────
function IconRoute()   { return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg> }
function IconPlay()    { return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg> }
function IconClock()   { return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> }
function IconSRIcon()  { return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg> }
function IconCostIcon(){ return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }

// ── Intent Classifier ──────────────────────
function classifyIntent(input) {
  const q = input.toLowerCase().trim()
  if (/create|add|new|write|make|set up|setup/.test(q) && /rule|routing|route/.test(q)) return { type: 'create_rule', raw: input }
  if (/route\s+(all|every)?\s*(cards?|upi|nb|net\s*banking|emi)/i.test(q)) return { type: 'create_rule', raw: input }
  if (/list|available.*terminal|terminal.*available|all terminal/i.test(q)) return { type: 'terminal_info', raw: input }
  if (/cost.*terminal|terminal.*cost|cost comparison|cheapest|pricing/i.test(q)) return { type: 'terminal_info', raw: input }
  if (/sr.*highest|highest.*sr|best.*sr|which.*bank|which.*terminal.*sr|which.*provider/i.test(q)) return { type: 'terminal_info', raw: input }
  if (/priority.*order|routing.*order|order.*terminal|which.*first|how.*routed|cascade|terminal.*priority/i.test(q)) return { type: 'priority_cascade', raw: input }
  if (/what happens|simulate|send|trace|if i send|payment of/i.test(q)) return { type: 'simulate', raw: input }
  if (/ntf|no terminal|why.*(fail|ntf|block)|failure|failing|ntf risk|routing health/i.test(q)) return { type: 'routing_health', raw: input }
  if (/what if|if i disable|if i remove|if.*drops?|if.*down/i.test(q)) return { type: 'what_if', raw: input }
  if (/coverage|gap|uncovered|missing|blind spot/i.test(q)) return { type: 'coverage', raw: input }
  if (/help|what can you|how do i|guide/i.test(q)) return { type: 'help', raw: input }
  if (/terminal|gateway|hdfc|icici|axis|rbl|yes bank/i.test(q)) return { type: 'terminal_info', raw: input }
  return { type: 'simulate', raw: input }
}

// ── Parse transaction from natural language ──
function parseTxnFromInput(input, defaultMethod = 'Cards') {
  const q = input.toLowerCase()
  const dk = methodToDataKey(defaultMethod)
  const txn = { payment_method: dk, amount: 5000, card_network: 'Visa', card_type: 'credit', international: false }
  if (/upi/i.test(q)) txn.payment_method = 'UPI'
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
function parseRuleIntent(input, defaultMethod = null) {
  const q = input.toLowerCase()
  const intent = { method: defaultMethod, network: null, gatewayShort: null }
  if (/recurring|mandate|auto.?debit/i.test(q)) intent.method = 'UPIRecurring'
  else if (/upi/i.test(q)) intent.method = 'UPIOnetime'
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


function TerminalInfo({ merchant, method }) {
  const dk = methodToDataKey(method)
  const terminals = merchant.gatewayMetrics
    .filter(gm => !method || (gm.supportedMethods || []).includes(dk))
    .map(gm => {
      const gw   = gateways.find(g => g.id === gm.gatewayId)
      const term = gw?.terminals.find(t => t.id === gm.terminalId)
      return { ...gm, gatewayShort: gw?.shortName, displayId: term?.terminalId || gm.terminalId }
    })
  return (
    <div className="gc-rules">
      <div className="gc-rules-title">{terminals.length} terminal{terminals.length !== 1 ? 's' : ''} supporting {method === 'UPIOnetime' ? 'UPI Onetime' : method === 'UPIRecurring' ? 'UPI Recurring' : method || 'all methods'}</div>
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

function RoutingCascadeCard({ merchant, method, terminals, srThreshold = 90 }) {
  if (!terminals || terminals.length === 0) return null
  const methodLabel = method === 'UPIOnetime' ? 'UPI Onetime' : method === 'UPIRecurring' ? 'UPI Recurring' : method
  const sorted = [...terminals].sort((a, b) => b.successRate - a.successRate)
  const dailyVol = Math.round((merchant?.txnVolumeHistory?.currentMonth || 30000) / 30)
  const maxCost = Math.max(...sorted.map(t => t.costPerTxn))
  const zeroCostTerms = sorted.filter(t => t.costPerTxn === 0)
  const paidTerms = sorted.filter(t => t.costPerTxn > 0)

  const narrative = (() => {
    if (sorted.length === 0) return ''
    const primary = sorted[0]
    const parts = []
    const costNote = primary.costPerTxn === 0 ? ' at zero cost' : ` at ₹${primary.costPerTxn}/txn`
    parts.push(`Payments first try ${primary.displayId} — ${primary.gatewayShort}'s terminal — with a ${primary.successRate}% success rate${costNote}.`)
    for (let i = 1; i < sorted.length; i++) {
      const t = sorted[i]
      const condition = srThreshold > 0 ? `If SR drops below ${srThreshold}%` : 'On failure'
      const tNote = t.costPerTxn === 0 ? '₹0' : `₹${t.costPerTxn}/txn`
      if (i === sorted.length - 1 && sorted.length > 2) {
        parts.push(`${condition}, remaining payments fall back to ${t.displayId} (SR ${t.successRate}%, ${tNote}) as the final safety net.`)
      } else {
        parts.push(`${condition}, traffic shifts to ${t.displayId} (SR ${t.successRate}%, ${tNote}).`)
      }
    }
    return parts.join(' ')
  })()

  const costNarrative = (() => {
    if (zeroCostTerms.length > 0 && paidTerms.length > 0) {
      const saving = Math.round(paidTerms[0].costPerTxn * dailyVol)
      const names = zeroCostTerms.map(t => t.displayId).join(', ')
      return `${names} ${zeroCostTerms.length > 1 ? 'are' : 'is a'} zero-cost terminal${zeroCostTerms.length > 1 ? 's' : ''} under a bulk deal. Routing here first saves ₹${paidTerms[0].costPerTxn}/txn vs ${paidTerms[0].displayId}. At ~${dailyVol.toLocaleString()} daily ${methodLabel} transactions, this can save up to ₹${saving.toLocaleString()}/day.`
    }
    if (zeroCostTerms.length === sorted.length) {
      return `All ${sorted.length} terminals are zero-cost deal terminals. Priority order is determined purely by success rate — highest SR goes first.`
    }
    const best = sorted[0]
    const last = sorted[sorted.length - 1]
    const delta = best.costPerTxn - last.costPerTxn
    if (delta !== 0) {
      const saving = Math.round(Math.abs(delta) * dailyVol)
      return `Priority order balances SR and cost. ${best.displayId} leads on SR (${best.successRate}%) — the fallback chain shifts cost exposure only when primary SR degrades. Net: best success rate with up to ₹${saving.toLocaleString()}/day in cost delta.`
    }
    return `Terminals are ranked by success rate. Higher SR = fewer failed payments = lower recovery cost for ${merchant?.name || 'this merchant'}.`
  })()

  return (
    <div className="gc-cascade-card">
      <div className="gc-cascade-section">
        <div className="gc-cascade-title">Priority Order — {methodLabel}</div>
        <div className="gc-cascade-chain">
          {sorted.map((t, i) => (
            <React.Fragment key={t.id || t.terminalId || i}>
              <div className={`gc-cascade-row${i === 0 ? ' gc-cascade-row--primary' : ''}`}>
                <span className="gc-cascade-rank">#{i + 1}</span>
                <div className="gc-cascade-term">
                  <span className="gc-cascade-term-id">{t.displayId}</span>
                  <span className="gc-cascade-term-gw">{t.gatewayShort}</span>
                </div>
                <div className="gc-cascade-metrics">
                  <span style={{ color: t.successRate >= 90 ? '#059669' : t.successRate >= 80 ? '#d97706' : '#dc2626', fontWeight: 600, fontSize: 13 }}>SR {t.successRate}%</span>
                  <span style={{ color: t.costPerTxn === 0 ? '#059669' : '#64748b', fontSize: 12 }}>{t.costPerTxn === 0 ? '₹0 zero-cost' : `₹${t.costPerTxn}/txn`}</span>
                </div>
                <span className={`gc-badge ${i === 0 ? 'gc-badge-blue' : 'gc-badge-gray'}`} style={{ fontSize: 10, whiteSpace: 'nowrap' }}>
                  {i === 0 ? 'Primary' : `Fallback ${i}`}
                </span>
              </div>
              {i < sorted.length - 1 && (
                <div className="gc-cascade-connector">↓ {srThreshold > 0 ? `if SR < ${srThreshold}%` : 'on failure'}</div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="gc-cascade-narrative">{narrative}</div>
      </div>
      <div className="gc-cascade-section gc-cascade-cost-section">
        <div className="gc-cascade-subtitle">Why this order</div>
        <div className="gc-cascade-cost-text">{costNarrative}</div>
        {maxCost > 0 && (
          <div className="gc-cascade-cost-bars">
            {sorted.map((t, i) => (
              <div key={i} className="gc-cascade-cost-bar-row">
                <span className="gc-cascade-cost-name">{t.displayId}</span>
                <div className="gc-cascade-cost-bar-wrap">
                  <div className="gc-cascade-cost-bar-fill" style={{ width: maxCost > 0 ? `${Math.max(4, (t.costPerTxn / maxCost) * 100)}%` : '4%', background: t.costPerTxn === 0 ? '#059669' : '#94a3b8' }} />
                </div>
                <span className="gc-cascade-cost-val">{t.costPerTxn === 0 ? '₹0' : `₹${t.costPerTxn}`}</span>
              </div>
            ))}
          </div>
        )}
      </div>
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
    }).filter(t => t.supportedMethods.includes(methodToDataKey(method)))
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
            <RoutingCascadeCard
              merchant={merchant}
              method={selections.method || 'Cards'}
              terminals={selectedTerminals.map(tid => merchantTerminals.find(t => t.id === tid)).filter(Boolean)}
              srThreshold={srThreshold}
            />
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
function MethodChat({ method, merchant, rules, addRule, simOverrides, triggerMsg }) {
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const chatEndRef              = useRef(null)
  const methodLabel = method === 'UPIOnetime' ? 'UPI Onetime' : method === 'UPIRecurring' ? 'UPI Recurring' : method

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
        case 'create_rule': {
          const prefill = parseRuleIntent(userMsg, method)
          response = { type: 'bot', content: 'rule_form', data: { merchant, rules, prefill }, ts: Date.now() }
          break
        }
        case 'terminal_info': {
          response = { type: 'bot', content: 'terminal_info', data: { merchant, method }, ts: Date.now() }
          break
        }
        case 'routing_health': {
          const testCases = {
            Cards:       [
              { payment_method: 'Cards', card_network: 'Visa',       card_type: 'credit', amount: 5000,  international: false },
              { payment_method: 'Cards', card_network: 'Mastercard', card_type: 'credit', amount: 5000,  international: false },
              { payment_method: 'Cards', card_network: 'RuPay',      card_type: 'debit',  amount: 2000,  international: false },
              { payment_method: 'Cards', card_network: 'Visa',       card_type: 'credit', amount: 5000,  international: true  },
            ],
            UPIOnetime:  [
              { payment_method: 'UPI', amount: 500,  international: false },
              { payment_method: 'UPI', amount: 2000, international: false },
              { payment_method: 'UPI', amount: 5000, international: false },
            ],
            UPIRecurring:[
              { payment_method: 'UPI', amount: 2000, international: false },
              { payment_method: 'UPI', amount: 5000, international: false },
            ],
            EMI:         [
              { payment_method: 'EMI', card_network: 'Visa', emi_type: 'no_cost', amount: 15000 },
              { payment_method: 'EMI', card_network: 'Visa', emi_type: 'standard', amount: 10000 },
            ],
          }
          const cases   = testCases[method] || testCases.Cards
          const results = cases.map(txn => ({ txn, result: simulateRoutingPipeline(merchant, txn, rules, simOverrides) }))
          const ntfs    = results.filter(r => r.result.isNTF)
          const passing = results.filter(r => !r.result.isNTF)
          response = { type: 'bot', content: 'routing_health', data: { ntfs, passing, method: methodLabel }, ts: Date.now() }
          break
        }
        case 'priority_cascade': {
          const methodTerminals = merchant.gatewayMetrics
            .filter(gm => (gm.supportedMethods || []).includes(methodToDataKey(method)))
            .map(gm => {
              const gw   = gateways.find(g => g.id === gm.gatewayId)
              const term = gw?.terminals.find(t => t.id === gm.terminalId)
              return { id: gm.terminalId, displayId: term?.terminalId || gm.terminalId, gatewayShort: gw?.shortName || '??', successRate: gm.successRate, costPerTxn: gm.costPerTxn }
            })
          response = { type: 'bot', content: 'priority_cascade', data: { merchant, method, terminals: methodTerminals }, ts: Date.now() }
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

  // Fire when an L2 nav item is clicked
  useEffect(() => {
    if (triggerMsg?.id) dispatch(triggerMsg.text)
  }, [triggerMsg?.id]) // eslint-disable-line react-hooks/exhaustive-deps

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
          {msg.content === 'terminal_info' && <TerminalInfo merchant={msg.data.merchant} method={msg.data.method} />}
          {msg.content === 'priority_cascade' && (
            <RoutingCascadeCard merchant={msg.data.merchant} method={msg.data.method} terminals={msg.data.terminals} srThreshold={90} />
          )}
          {msg.content === 'routing_health'  && (
            <div className="gc-routing-health">
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

  return (
    <div className="gc-method-chat">
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
// Simulate View — rich form + animated pipeline
// ════════════════════════════════════════════

const METHOD_RULE_RATIOS = { Cards: 0.49, UPIOnetime: 0.20, UPIRecurring: 0.12, EMI: 0.19 }
const AMOUNT_PRESETS_MAP = { Cards: [500, 2000, 5000, 10000, 50000], UPIOnetime: [200, 500, 2000, 5000], UPIRecurring: [500, 2000, 5000, 10000], EMI: [10000, 25000, 50000, 100000] }

const defaultForm = (method) => ({
  cardNetwork: 'Visa', cardType: 'Credit', issuerBank: 'Any', international: 'Domestic',
  upiType: 'Intent', upiApp: 'GPay',
  emiNetwork: 'Visa', emiType: 'No-cost', tenure: '6m',
  recurring: 'One-time',
  amount: { Cards: 5000, UPIOnetime: 2000, UPIRecurring: 2000, EMI: 25000 }[method] || 5000,
})

function buildSimTxn(form, method) {
  const dk = methodToDataKey(method)
  const txn = { payment_method: dk, amount: form.amount, international: form.international === 'International' }
  if (method === 'Cards') { txn.card_network = form.cardNetwork || 'Visa'; txn.card_type = (form.cardType || 'Credit').toLowerCase() }
  if (method === 'EMI')   { txn.card_network = form.emiNetwork || 'Visa'; txn.card_type = 'credit'; txn.emi_type = form.emiType === 'No-cost' ? 'no_cost' : 'standard' }
  return txn
}

function buildPipelineData(form, method, merchant, rules) {
  const TOTAL = 418
  const methodLabel = method === 'UPIOnetime' ? 'UPI Onetime' : method === 'UPIRecurring' ? 'UPI Recurring' : method
  const afterMethod = Math.round(TOTAL * (METHOD_RULE_RATIOS[method] || 0.3))
  const network = method === 'Cards' ? form.cardNetwork : method === 'EMI' ? form.emiNetwork : null
  const intl = form.international === 'International'
  const isAmex = network === 'Amex'

  const methodTerminals = merchant.gatewayMetrics
    .filter(gm => (gm.supportedMethods || []).includes(methodToDataKey(method)))
    .map(gm => {
      const gw = gateways.find(g => g.id === gm.gatewayId)
      const term = gw?.terminals.find(t => t.id === gm.terminalId)
      return { id: gm.terminalId, displayId: term?.terminalId || gm.terminalId, gatewayShort: gw?.shortName || '?', successRate: gm.successRate, costPerTxn: gm.costPerTxn, txnShare: gm.txnShare || 0 }
    })

  const rejectRules = [
    { name: 'Block International Transactions',    condition: 'international = true',               status: intl ? 'hit' : 'pass', eliminated: intl ? methodTerminals.slice(-2).map(t => t.displayId) : [], note: intl ? `${Math.min(2, methodTerminals.length)} terminals removed (domestic-only)` : 'No match — domestic transaction' },
    ...(network ? [{ name: `${network} Network Compatibility`, condition: `card_network = ${network}`, status: isAmex ? 'hit' : 'pass', eliminated: isAmex ? methodTerminals.filter(t => t.gatewayShort === 'RBL').map(t => t.displayId) : [], note: isAmex ? 'RBL_T1 removed (Amex not supported)' : `All terminals support ${network}` }] : []),
    { name: 'SR Safety Floor (SR < 70%)',          condition: 'terminal.successRate < 70',          status: 'pass', eliminated: [], note: 'No match — all active terminals above 70% SR' },
    { name: 'Recurring Mandate Eligibility',       condition: 'recurring = true AND mandate != enabled', status: 'pass', eliminated: [], note: form.recurring === 'Recurring' ? 'Checked — mandate flag validated on active terminals' : 'No match — one-time transaction' },
  ]
  const totalEliminated = rejectRules.reduce((s, r) => s + r.eliminated.length, 0)
  const terminalsAfterReject = Math.max(1, methodTerminals.length - totalEliminated)

  const topTerminals = [...methodTerminals].sort((a, b) => b.successRate - a.successRate).slice(0, 2)
  const labelParts = [network && network !== 'Any' ? network : null, form.cardType && method === 'Cards' ? form.cardType : null, form.amount >= 10000 ? 'High Value' : null].filter(Boolean)
  const selectRule = {
    name: `${labelParts.length ? labelParts.join(' ') : methodLabel} → ${topTerminals[0]?.gatewayShort || 'HDFC'} Priority`,
    condition: [network ? `card_network = ${network}` : null, form.cardType && method === 'Cards' ? `card_type = ${form.cardType.toLowerCase()}` : null, form.amount > 1000 ? `amount > ₹1,000` : null].filter(Boolean).join(' AND ') || `payment_method = ${method}`,
    matchedAt: 12,
    totalEvaluated: Math.round(afterMethod * 0.06),
    action: topTerminals.length >= 2 ? `Route to ${topTerminals[0].displayId} (70%), ${topTerminals[1].displayId} (30%)` : `Route to ${topTerminals[0]?.displayId || 'HDFC_T1'}`,
    terminals: topTerminals,
  }

  const simResult = simulateRoutingPipeline(merchant, buildSimTxn(form, method), rules)
  const rejectMatchCount = rejectRules.filter(r => r.status === 'hit').length
  return { TOTAL, afterMethod, methodLabel, rejectRules, terminalsAfterReject, selectRule, simResult, methodTerminals, topTerminals, totalEliminated, rejectMatchCount }
}

function SimulateForm({ method, form, onFormChange, onRun }) {
  const methodLabel = method === 'UPIOnetime' ? 'UPI Onetime' : method === 'UPIRecurring' ? 'UPI Recurring' : method
  const presets = AMOUNT_PRESETS_MAP[method] || AMOUNT_PRESETS_MAP.Cards
  const set = (k, v) => onFormChange({ ...form, [k]: v })
  const Opt = ({ field, val, label }) => <button className={`gc-sim-opt${form[field] === val ? ' active' : ''}`} onClick={() => set(field, val)}>{label || val}</button>
  return (
    <div className="gc-sim-form">
      <div className="gc-sim-hdr"><div className="gc-sim-title">Configure {methodLabel} Transaction</div><div className="gc-sim-subtitle">Fill in payment parameters to trace routing</div></div>

      <div className="gc-sim-section">
        <div className="gc-sim-label">Amount</div>
        <div className="gc-sim-presets">
          {presets.map(p => <button key={p} className={`gc-sim-preset${form.amount === p ? ' active' : ''}`} onClick={() => set('amount', p)}>₹{p.toLocaleString()}</button>)}
          <input className="gc-sim-amount-input" type="number" min="1" placeholder="Custom…" value={presets.includes(form.amount) ? '' : (form.amount || '')} onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v > 0) set('amount', v) }} />
        </div>
      </div>

      {method === 'Cards' && <>
        <div className="gc-sim-row2">
          <div className="gc-sim-section"><div className="gc-sim-label">Network</div><div className="gc-sim-opts">{['Visa','Mastercard','Amex','RuPay'].map(n => <Opt key={n} field="cardNetwork" val={n} />)}</div></div>
          <div className="gc-sim-section"><div className="gc-sim-label">Type</div><div className="gc-sim-opts">{['Credit','Debit'].map(t => <Opt key={t} field="cardType" val={t} />)}</div></div>
        </div>
        <div className="gc-sim-row2">
          <div className="gc-sim-section"><div className="gc-sim-label">Issuer Bank</div><select className="gc-sim-select" value={form.issuerBank} onChange={e => set('issuerBank', e.target.value)}>{['Any','HDFC','ICICI','SBI','Axis','Kotak','Yes Bank','RBL'].map(b => <option key={b}>{b}</option>)}</select></div>
          <div className="gc-sim-section"><div className="gc-sim-label">Geography</div><div className="gc-sim-opts">{['Domestic','International'].map(g => <Opt key={g} field="international" val={g} />)}</div></div>
        </div>
      </>}

      {(method === 'UPIOnetime' || method === 'UPIRecurring') && <div className="gc-sim-row2">
        <div className="gc-sim-section"><div className="gc-sim-label">UPI Type</div><div className="gc-sim-opts">{['Intent','Collect','QR'].map(t => <Opt key={t} field="upiType" val={t} />)}</div></div>
        <div className="gc-sim-section"><div className="gc-sim-label">App</div><div className="gc-sim-opts">{['GPay','PhonePe','Paytm','BHIM'].map(a => <Opt key={a} field="upiApp" val={a} />)}</div></div>
      </div>}

      {method === 'EMI' && <>
        <div className="gc-sim-row2">
          <div className="gc-sim-section"><div className="gc-sim-label">Network</div><div className="gc-sim-opts">{['Visa','Mastercard','Amex'].map(n => <Opt key={n} field="emiNetwork" val={n} />)}</div></div>
          <div className="gc-sim-section"><div className="gc-sim-label">EMI Type</div><div className="gc-sim-opts">{['No-cost','Standard'].map(t => <Opt key={t} field="emiType" val={t} />)}</div></div>
        </div>
        <div className="gc-sim-section"><div className="gc-sim-label">Tenure</div><div className="gc-sim-opts">{['3m','6m','9m','12m','18m','24m'].map(t => <Opt key={t} field="tenure" val={t} />)}</div></div>
      </>}

      <div className="gc-sim-section">
        <div className="gc-sim-label">Transaction Type</div>
        <div className="gc-sim-opts"><Opt field="recurring" val="One-time" /><Opt field="recurring" val="Recurring" /></div>
      </div>

      <button className="gc-sim-run-btn" onClick={onRun} disabled={!form.amount || form.amount <= 0}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style={{ marginRight: 6 }}><polygon points="5 3 19 12 5 21 5 3"/></svg>Run Simulation
      </button>
    </div>
  )
}

function SimulatePipeline({ steps, phase }) {
  const endRef = useRef(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [steps.length])
  return (
    <div className="gc-pipeline-viz">
      {steps.map((s, i) => (
        <div key={i} className="gc-step-card">
          {s.type === 'fetch' && <>
            <div className="gc-step-hdr"><span className="gc-step-num">1</span><span className="gc-step-title">Rules Loaded</span><span className="gc-badge gc-badge-blue">{s.total.toLocaleString()} rules</span></div>
            <div className="gc-step-body">
              <div className="gc-step-stat-row">
                <div className="gc-step-stat"><div className="gc-step-stat-val">{s.total}</div><div className="gc-step-stat-lbl">Total</div></div>
                <div className="gc-step-stat"><div className="gc-step-stat-val">{s.merchantSpecific}</div><div className="gc-step-stat-lbl">Merchant-specific</div></div>
                <div className="gc-step-stat"><div className="gc-step-stat-val">{s.platform}</div><div className="gc-step-stat-lbl">Platform defaults</div></div>
              </div>
              <div className="gc-step-note">Range: 1–5,627 across all merchants. Includes REJECT rules, SELECT rules, volume splits, fallback chains, and offer-linked rules.</div>
            </div>
          </>}

          {s.type === 'filter' && <>
            <div className="gc-step-hdr"><span className="gc-step-num">2</span><span className="gc-step-title">Filtered by Method — {s.methodLabel}</span><span className="gc-badge gc-badge-warning">{s.before} → {s.after}</span></div>
            <div className="gc-step-body">
              <div className="gc-step-filter-track"><div className="gc-step-filter-fill" style={{ width: `${Math.round((s.after / s.before) * 100)}%` }} /></div>
              <div className="gc-step-filter-labels"><span><strong>{s.after}</strong> rules remaining ({Math.round((s.after / s.before) * 100)}%)</span><span style={{ color: '#94a3b8' }}>{s.before - s.after} filtered out</span></div>
              <div className="gc-step-note">Excluded: {s.others.join(' · ')}</div>
              <div className="gc-step-insight">⚡ 49.9% of rules don't filter on payment method — they apply to <strong>ALL</strong> payments regardless of method.</div>
            </div>
          </>}

          {s.type === 'reject' && <>
            <div className="gc-step-hdr"><span className="gc-step-num">3</span><span className="gc-step-title">REJECT Rules Evaluated</span><span className={`gc-badge ${s.eliminated > 0 ? 'gc-badge-danger' : 'gc-badge-success'}`}>{s.eliminated > 0 ? `${s.eliminated} terminal${s.eliminated > 1 ? 's' : ''} eliminated` : 'No terminals eliminated'}</span></div>
            <div className="gc-step-body">
              <div className="gc-step-term-count">{s.terminalsBefore} terminals in → <strong>{s.terminalsAfter}</strong> terminals out</div>
              {s.rules.map((r, ri) => (
                <div key={ri} className={`gc-reject-rule${r.eliminated.length > 0 ? ' gc-reject-rule--hit' : ''}`}>
                  <span className="gc-reject-icon">{r.eliminated.length > 0 ? '🔴' : '⚪'}</span>
                  <div className="gc-reject-body">
                    <div className="gc-reject-name">{r.name}</div>
                    <div className="gc-reject-note">{r.note}</div>
                    {r.eliminated.length > 0 && <div className="gc-chips" style={{ marginTop: 3 }}>{r.eliminated.map(t => <span key={t} className="gc-chip gc-chip-fail">{t}</span>)}</div>}
                  </div>
                </div>
              ))}
            </div>
          </>}

          {s.type === 'select' && <>
            <div className="gc-step-hdr"><span className="gc-step-num">4</span><span className="gc-step-title">SELECT Rule Matched</span><span className="gc-badge gc-badge-success">Match at priority #{s.rule.matchedAt}</span></div>
            <div className="gc-step-body">
              <div className="gc-step-note" style={{ marginBottom: 8 }}>Evaluated {s.rule.totalEvaluated} SELECT rules in order — first match wins.</div>
              <div className="gc-select-rule">
                <div className="gc-select-rule-name">{s.rule.name}</div>
                <div className="gc-select-rule-row"><span className="gc-select-rule-lbl">When</span><span>{s.rule.condition}</span></div>
                <div className="gc-select-rule-row"><span className="gc-select-rule-lbl">Action</span><span>{s.rule.action}</span></div>
              </div>
            </div>
          </>}

          {s.type === 'final' && <>
            <div className="gc-step-hdr"><span className="gc-step-num">5</span><span className="gc-step-title">Routing Decision</span>{s.isNTF ? <span className="gc-badge gc-badge-danger">NTF — No Terminal</span> : <span className="gc-badge gc-badge-success">→ {s.selected?.displayId}</span>}</div>
            <div className="gc-step-body">
              <div className="gc-step-summary">
                <span>{s.total} fetched</span><span className="gc-step-arr">→</span>
                <span>{s.afterFilter} evaluated</span><span className="gc-step-arr">→</span>
                <span><strong>{s.rulesApplied}</strong> applied ({s.rejectMatchCount} REJECT + 1 SELECT)</span>
              </div>
              <div className="gc-step-insight" style={{ marginTop: 8 }}>💡 <strong>Critical Insight:</strong> Rules Fetched ≠ Rules Applied. {s.total} fetched → ~{s.afterFilter} evaluated → {s.rulesApplied} actually applied to this payment.</div>
              {!s.isNTF && <>
                <div className="gc-final-terminals">
                  {s.terminals.map((t, ti) => (
                    <div key={ti} className={`gc-final-terminal${ti === 0 ? ' gc-final-terminal--primary' : ''}`}>
                      <div className="gc-final-left">
                        <span className="gc-final-rank">#{ti + 1}</span>
                        <div><div className="gc-final-term-id">{t.displayId}</div><div className="gc-final-term-gw">{t.gatewayShort}</div></div>
                      </div>
                      <div className="gc-final-metrics">
                        <span style={{ color: t.successRate >= 90 ? '#059669' : '#d97706', fontWeight: 600 }}>SR {t.successRate}%</span>
                        <span style={{ color: t.costPerTxn === 0 ? '#059669' : '#64748b', fontSize: 12 }}>{t.costPerTxn === 0 ? '₹0 zero-cost' : `₹${t.costPerTxn}/txn`}</span>
                      </div>
                      <div className="gc-final-dist">
                        <div className="gc-final-bar-wrap"><div className="gc-final-bar" style={{ width: `${s.shares[ti] || 0}%`, background: ti === 0 ? '#528FF0' : '#94a3b8' }} /></div>
                        <span className="gc-final-share">{s.shares[ti] || 0}%</span>
                      </div>
                      {ti === 0 && <span className="gc-badge gc-badge-success" style={{ fontSize: 10 }}>Selected</span>}
                      {ti > 0 && <span className="gc-badge gc-badge-gray" style={{ fontSize: 10 }}>Fallback</span>}
                    </div>
                  ))}
                </div>
                {s.terminals.length > 1 && <div className="gc-step-note" style={{ marginTop: 8 }}>If {s.terminals[0].displayId} SR drops below {s.srThreshold}%, traffic falls back to {s.terminals[1].displayId}.</div>}
              </>}
              {s.isNTF && <div className="gc-warning-box" style={{ marginTop: 8 }}>No terminal matched this payment. Consider adding a SELECT rule to cover this scenario.</div>}
            </div>
          </>}
        </div>
      ))}
      {phase === 'running' && <div className="gc-step-loading"><div className="gc-sim-spinner" /><span>Running routing pipeline…</span></div>}
      <div ref={endRef} />
    </div>
  )
}

function SimulateView({ method, merchant, rules }) {
  const [phase, setPhase] = useState('form')
  const [form, setForm]   = useState(() => defaultForm(method))
  const [steps, setSteps] = useState([])

  const runSimulation = useCallback(() => {
    setPhase('running')
    setSteps([])
    const d = buildPipelineData(form, method, merchant, rules)
    const methodOthers = Object.keys(METHOD_RULE_RATIOS).filter(m => m !== method).map(m => m === 'UPIOnetime' ? 'UPI Onetime' : m === 'UPIRecurring' ? 'UPI Recurring' : m)
    const shares = d.topTerminals.length >= 2 ? [70, 30] : [100]

    const allSteps = [
      { type: 'fetch',  total: d.TOTAL, merchantSpecific: Math.round(d.TOTAL * 0.34), platform: Math.round(d.TOTAL * 0.66) },
      { type: 'filter', before: d.TOTAL, after: d.afterMethod, methodLabel: d.methodLabel, others: methodOthers },
      { type: 'reject', rules: d.rejectRules, eliminated: d.totalEliminated, terminalsBefore: d.methodTerminals.length, terminalsAfter: d.terminalsAfterReject },
      { type: 'select', rule: d.selectRule },
      { type: 'final',  isNTF: d.simResult.isNTF, selected: d.simResult.selectedTerminal, total: d.TOTAL, afterFilter: d.afterMethod, rejectMatchCount: d.rejectMatchCount, rulesApplied: d.rejectMatchCount + 1, terminals: d.topTerminals.slice(0, 2), shares, srThreshold: 90 },
    ]
    allSteps.forEach((step, i) => setTimeout(() => {
      setSteps(prev => [...prev, step])
      if (i === allSteps.length - 1) setPhase('done')
    }, i * 650 + 200))
  }, [form, method, merchant, rules])

  const methodLabel = method === 'UPIOnetime' ? 'UPI Onetime' : method === 'UPIRecurring' ? 'UPI Recurring' : method
  return (
    <div className="gc-sim-view">
      {phase === 'form'
        ? <SimulateForm method={method} form={form} onFormChange={setForm} onRun={runSimulation} />
        : <>
            <div className="gc-sim-params-bar">
              <span>{methodLabel} · ₹{form.amount.toLocaleString()}{form.cardNetwork && method === 'Cards' ? ` · ${form.cardNetwork} ${form.cardType}` : ''}{form.international === 'International' ? ' · Intl' : ' · Domestic'} · {form.recurring}</span>
              <button className="gc-sim-reset-btn" onClick={() => { setPhase('form'); setSteps([]) }}>← Edit</button>
            </div>
            <SimulatePipeline steps={steps} phase={phase} />
          </>
      }
    </div>
  )
}

// ════════════════════════════════════════════
// Historic Routing — payment ID tracer
// ════════════════════════════════════════════

const MOCK_HISTORIC_PAYMENTS = [
  { id: 'pay_9x8y7z', amount: 15000, method: 'Cards', card_network: 'Visa',       card_type: 'credit', international: false, timestamp: '2026-03-22 14:32:07', label: 'Visa Credit · ₹15,000 · Domestic'       },
  { id: 'pay_4a5b6c', amount: 2500,  method: 'UPI',   card_network: null,         card_type: null,     international: false, timestamp: '2026-03-22 11:18:43', label: 'UPI Intent · ₹2,500'                    },
  { id: 'pay_1m2n3o', amount: 5000,  method: 'Cards', card_network: 'Mastercard', card_type: 'debit',  international: false, timestamp: '2026-03-21 09:55:21', label: 'Mastercard Debit · ₹5,000 · Domestic'  },
]

function buildHistoricSteps(mock, method, merchant, rules) {
  const txnMethod = mock?.method || method
  const form = {
    ...defaultForm(txnMethod),
    amount: mock?.amount || 5000,
    cardNetwork: mock?.card_network || 'Visa',
    cardType: mock?.card_type === 'debit' ? 'Debit' : 'Credit',
    international: mock?.international ? 'International' : 'Domestic',
  }
  const d = buildPipelineData(form, txnMethod, merchant, rules)
  const txn = { payment_method: txnMethod, amount: form.amount, card_network: form.cardNetwork, card_type: form.cardType.toLowerCase(), international: mock?.international || false }
  const simResult = simulateRoutingPipeline(merchant, txn, rules)
  const shares = d.topTerminals.length >= 2 ? [70, 30] : [100]
  const methodOthers = Object.keys(METHOD_RULE_RATIOS).filter(m => m !== txnMethod).map(m => m === 'UPIOnetime' ? 'UPI Onetime' : m === 'UPIRecurring' ? 'UPI Recurring' : m)
  const steps = [
    { type: 'fetch',  total: d.TOTAL, merchantSpecific: Math.round(d.TOTAL * 0.34), platform: Math.round(d.TOTAL * 0.66) },
    { type: 'filter', before: d.TOTAL, after: d.afterMethod, methodLabel: d.methodLabel, others: methodOthers },
    { type: 'reject', rules: d.rejectRules, eliminated: d.totalEliminated, terminalsBefore: d.methodTerminals.length, terminalsAfter: d.terminalsAfterReject },
    { type: 'select', rule: d.selectRule },
    { type: 'final',  isNTF: simResult.isNTF, selected: simResult.selectedTerminal, total: d.TOTAL, afterFilter: d.afterMethod, rejectMatchCount: d.rejectMatchCount, rulesApplied: d.rejectMatchCount + 1, terminals: d.topTerminals.slice(0, 2), shares, srThreshold: 90 },
  ]
  return { steps, simResult, txn }
}

function HistoricView({ method, merchant, rules }) {
  const [inputIds, setInputIds] = useState('')
  const [results,  setResults]  = useState(null)
  const [tracing,  setTracing]  = useState(false)
  const [expanded, setExpanded] = useState({})

  const addChip = (id) => {
    setInputIds(prev => {
      const existing = prev.split(/[\s,]+/).filter(Boolean)
      if (existing.includes(id)) return prev
      return prev ? `${prev}, ${id}` : id
    })
  }

  const trace = () => {
    const ids = inputIds.split(/[\s,]+/).filter(Boolean)
    if (ids.length === 0) return
    setTracing(true)
    setTimeout(() => {
      const traced = ids.map(id => {
        const mock = MOCK_HISTORIC_PAYMENTS.find(p => p.id === id)
        const { steps, simResult, txn } = buildHistoricSteps(mock, method, merchant, rules)
        return { id, mock, txn, simResult, steps }
      })
      const exp = {}
      traced.forEach(r => { exp[r.id] = true })
      setResults(traced)
      setExpanded(exp)
      setTracing(false)
    }, 700)
  }

  return (
    <div className="gc-historic-view">
      {!results
        ? (
          <div className="gc-historic-form">
            <div className="gc-historic-hdr">
              <div className="gc-historic-title">Trace Payment Routing</div>
              <div className="gc-historic-sub">Enter one or more Payment IDs to see exactly how each payment was routed through the pipeline — which rules fired, which terminal was chosen, and why.</div>
            </div>

            <div className="gc-historic-input-wrap">
              <textarea
                className="gc-historic-input"
                placeholder="pay_abc123, pay_def456"
                value={inputIds}
                onChange={e => setInputIds(e.target.value)}
                rows={2}
              />
            </div>

            <div className="gc-historic-chips-label">Try a demo payment:</div>
            <div className="gc-historic-chips">
              {MOCK_HISTORIC_PAYMENTS.map(p => (
                <button key={p.id} className="gc-historic-chip" onClick={() => addChip(p.id)}>
                  <span className="gc-historic-chip-id">{p.id}</span>
                  <span className="gc-historic-chip-meta">{p.label} · {p.timestamp}</span>
                </button>
              ))}
            </div>

            <button className="gc-historic-trace-btn" onClick={trace} disabled={!inputIds.trim() || tracing}>
              {tracing
                ? <><div className="gc-sim-spinner" style={{ width: 14, height: 14, borderWidth: 2, marginRight: 6 }} />Tracing…</>
                : '→ Trace Routing'
              }
            </button>
          </div>
        )
        : (
          <div className="gc-historic-results">
            <div className="gc-historic-results-hdr">
              <span>{results.length} payment{results.length !== 1 ? 's' : ''} traced</span>
              <button className="gc-sim-reset-btn" onClick={() => { setResults(null); setInputIds('') }}>← New Trace</button>
            </div>
            {results.map(r => (
              <div key={r.id} className="gc-historic-accordion">
                <button className="gc-historic-acc-hdr" onClick={() => setExpanded(e => ({ ...e, [r.id]: !e[r.id] }))}>
                  <div className="gc-historic-acc-left">
                    <span className="gc-historic-acc-id">{r.id}</span>
                    {r.mock && <span className="gc-historic-acc-meta">{r.mock.label} · {r.mock.timestamp}</span>}
                    {!r.mock && <span className="gc-historic-acc-meta">{r.txn.payment_method} · ₹{r.txn.amount?.toLocaleString()}</span>}
                  </div>
                  <div className="gc-historic-acc-right">
                    {r.simResult.isNTF
                      ? <span className="gc-badge gc-badge-danger">NTF — No Terminal</span>
                      : <span className="gc-badge gc-badge-success">→ {r.simResult.selectedTerminal?.displayId}</span>
                    }
                    <span className="gc-historic-chevron">{expanded[r.id] ? '▲' : '▼'}</span>
                  </div>
                </button>
                {expanded[r.id] && (
                  <div className="gc-historic-acc-body">
                    <SimulatePipeline steps={r.steps} phase="done" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}

// ════════════════════════════════════════════
// SR Ranking View — read-only terminal ranking
// ════════════════════════════════════════════
function SRRankingView({ method, merchant, strategy }) {
  const methodLabel = method === 'UPIOnetime' ? 'UPI Onetime' : method === 'UPIRecurring' ? 'UPI Recurring' : method

  const terminals = useMemo(() =>
    merchant.gatewayMetrics
      .filter(gm => (gm.supportedMethods || []).includes(methodToDataKey(method)))
      .map(gm => {
        const gw = gateways.find(g => g.id === gm.gatewayId)
        const term = gw?.terminals.find(t => t.id === gm.terminalId)
        return { id: gm.terminalId, displayId: term?.terminalId || gm.terminalId, gatewayShort: gw?.shortName || '?', successRate: gm.successRate, costPerTxn: gm.costPerTxn, txnShare: gm.txnShare || 0 }
      })
      .sort((a, b) => b.successRate - a.successRate),
    [merchant, method]
  )

  const maxSR = terminals[0]?.successRate || 100
  const srColor = (sr) => sr >= 90 ? '#059669' : sr >= 78 ? '#d97706' : '#dc2626'

  return (
    <div className="gc-sr-view">
      <div className="gc-sr-hdr">
        <div>
          <div className="gc-sr-title">Terminal Ranking by Success Rate</div>
          <div className="gc-sr-subtitle">Optimized for SR — highest success rate terminals take priority</div>
        </div>
        <span className="gc-badge gc-badge-blue">{methodLabel}</span>
      </div>

      <div className="gc-sr-list">
        <div className="gc-sr-list-header">
          <span className="gc-sr-col-rank" />
          <span className="gc-sr-col-terminal">Terminal</span>
          <span className="gc-sr-col-bar">Success Rate</span>
          <span className="gc-sr-col-cost">Cost/txn</span>
          <span className="gc-sr-col-share">Traffic</span>
        </div>
        {terminals.map((t, i) => (
          <div key={t.id} className={`gc-sr-row${i === 0 ? ' gc-sr-row--top' : ''}`}>
            <span className="gc-sr-col-rank">
              <span className={`gc-sr-rank-badge${i === 0 ? ' top' : ''}`}>#{i + 1}</span>
            </span>
            <div className="gc-sr-col-terminal">
              <div className="gc-sr-term-id">{t.displayId}</div>
              <div className="gc-sr-gw">{t.gatewayShort}</div>
            </div>
            <div className="gc-sr-col-bar">
              <div className="gc-sr-bar-track">
                <div className="gc-sr-bar-fill" style={{ width: `${(t.successRate / maxSR) * 100}%`, background: srColor(t.successRate) }} />
              </div>
              <span className="gc-sr-pct" style={{ color: srColor(t.successRate) }}>{t.successRate}%</span>
            </div>
            <div className="gc-sr-col-cost">
              {t.costPerTxn === 0
                ? <span className="gc-badge gc-badge-success" style={{ fontSize: 11, padding: '1px 6px' }}>₹0</span>
                : <span>₹{t.costPerTxn}</span>}
            </div>
            <div className="gc-sr-col-share">
              <div className="gc-sr-share-bar-track">
                <div className="gc-sr-share-bar-fill" style={{ width: `${Math.min(100, t.txnShare * 2)}%` }} />
              </div>
              <span>{t.txnShare}%</span>
            </div>
          </div>
        ))}
      </div>

      {strategy !== 'cost' && (
        <div className="gc-sr-note">
          Terminals are ranked by success rate. To customize priority or optimize for cost, select <strong>Save Cost / Custom Routing</strong>.
        </div>
      )}
    </div>
  )
}

// CreateRuleWizard is imported from ./RuleWizard

// Legacy wizard placeholder (kept for RuleForm inline chat usage)
function _OldCreateRuleWizard({ method, merchant, rules, addRule, onClose }) {
  const [step, setStep]               = useState(1)
  const [selectedFlow, setSelectedFlow] = useState(null)
  const [amountRange, setAmountRange] = useState('any')
  const [terminalOrder, setTerminalOrder] = useState([])
  const [srThresholds, setSrThresholds]   = useState({})
  const [dragIdx, setDragIdx]         = useState(null)
  const [confirmed, setConfirmed]     = useState(false)
  const methodLabel = method === 'UPIOnetime' ? 'UPI Onetime' : method === 'UPIRecurring' ? 'UPI Recurring' : method

  const methodTerminals = useMemo(() =>
    merchant.gatewayMetrics
      .filter(gm => (gm.supportedMethods || []).includes(methodToDataKey(method)))
      .map(gm => {
        const gw = gateways.find(g => g.id === gm.gatewayId)
        const term = gw?.terminals.find(t => t.id === gm.terminalId)
        return { id: gm.terminalId, displayId: term?.terminalId || gm.terminalId, gatewayShort: gw?.shortName || '?', successRate: gm.successRate, costPerTxn: gm.costPerTxn }
      }),
    [merchant, method]
  )

  useEffect(() => {
    const sorted = [...methodTerminals].sort((a, b) => b.successRate - a.successRate)
    setTerminalOrder(sorted)
    const defaults = {}
    sorted.forEach(t => { defaults[t.id] = Math.max(70, Math.floor(t.successRate - 3)) })
    setSrThresholds(defaults)
  }, [methodTerminals])

  const getThreshold = (id) => srThresholds[id] ?? 90
  const setThreshold = (id, val) => setSrThresholds(prev => ({ ...prev, [id]: val }))
  const dailyVol = Math.round((merchant?.txnVolumeHistory?.currentMonth || 30000) / 30)
  const flows = PAYMENT_FLOWS[method] || []

  // Drag & drop
  const handleDragStart = (e, idx) => { setDragIdx(idx); e.dataTransfer.effectAllowed = 'move' }
  const handleDragOver  = (e, idx) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) return
    const next = [...terminalOrder]; const [moved] = next.splice(dragIdx, 1); next.splice(idx, 0, moved)
    setTerminalOrder(next); setDragIdx(idx)
  }
  const handleDragEnd = () => setDragIdx(null)

  const handleConfirm = () => {
    const amtRange = AMOUNT_RANGES.find(r => r.id === amountRange) || AMOUNT_RANGES[0]
    const fp = selectedFlow?.params || {}
    const conditions = [
      { field: 'payment_method', operator: 'equals', value: method },
      ...(fp.card_network ? [{ field: 'card_network', operator: 'equals', value: fp.card_network }] : []),
      ...(fp.card_type    ? [{ field: 'card_type',    operator: 'equals', value: fp.card_type    }] : []),
      ...(fp.international !== undefined ? [{ field: 'international', operator: 'equals', value: fp.international }] : []),
      ...amtRange.conditions,
    ]
    const newRule = {
      id: `rule-${merchant.id}-wiz-${Date.now()}`,
      name: `${selectedFlow.label} ${selectedFlow.sub} → ${terminalOrder[0]?.displayId}`,
      type: 'conditional', enabled: true,
      priority: rules.filter(r => !r.isDefault && !r.isMethodDefault).length + 1,
      conditions, conditionLogic: 'AND',
      action: { type: 'route', terminals: terminalOrder.map(t => t.id), splits: [], srThreshold: getThreshold(terminalOrder[0]?.id), minPaymentCount: 100 },
      isDefault: false, createdAt: new Date().toISOString(), createdBy: 'anugrah.sharma@razorpay.com',
    }
    addRule?.(newRule)
    setConfirmed(true)
  }

  return (
    <div className="gc-wizard">
      {/* ── Stepper ── */}
      <div className="gc-wizard-stepper">
        {WIZARD_STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <div className={`gc-wz-step${step > i + 1 ? ' done' : step === i + 1 ? ' active' : ''}`}>
              <div className="gc-wz-dot">{step > i + 1 ? '✓' : i + 1}</div>
              <div className="gc-wz-label">{s}</div>
            </div>
            {i < WIZARD_STEPS.length - 1 && <div className={`gc-wz-connector${step > i + 1 ? ' done' : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="gc-wizard-body">
        {/* ── Step 1: Select Flow ── */}
        {step === 1 && (
          <div>
            <div className="gc-wz-hdr"><div className="gc-wz-title">Select a payment flow to configure</div><div className="gc-wz-sub">Pick a specific payment type — you'll set terminal priority for this exact scenario.</div></div>
            <div className="gc-flow-grid">
              {flows.map(f => (
                <button key={f.id} className={`gc-flow-card${selectedFlow?.id === f.id ? ' active' : ''}`} onClick={() => setSelectedFlow(f)}>
                  <div className="gc-flow-label">{f.label}</div>
                  <div className="gc-flow-sub">{f.sub}</div>
                </button>
              ))}
            </div>
            <div className="gc-wz-footer">
              <button className="gc-wz-btn gc-wz-btn--ghost" onClick={onClose}>Cancel</button>
              <button className="gc-wz-btn gc-wz-btn--primary" disabled={!selectedFlow} onClick={() => setStep(2)}>Next: Configure →</button>
            </div>
          </div>
        )}

        {/* ── Step 2: Configure ── */}
        {step === 2 && (
          <div>
            <div className="gc-wz-hdr"><div className="gc-wz-title">{selectedFlow?.label} · {selectedFlow?.sub}</div><div className="gc-wz-sub">Set additional filters for when this rule applies.</div></div>
            <div className="gc-sim-section" style={{ marginBottom: 14 }}>
              <div className="gc-sim-label">Amount Range</div>
              <div className="gc-sim-opts">
                {AMOUNT_RANGES.map(r => <button key={r.id} className={`gc-sim-opt${amountRange === r.id ? ' active' : ''}`} onClick={() => setAmountRange(r.id)}>{r.label}</button>)}
              </div>
            </div>
            {method === 'Cards' && <div className="gc-info-box">Network, card type, and geography are pre-set from your flow selection: <strong>{selectedFlow?.label} · {selectedFlow?.sub}</strong>.</div>}
            <div className="gc-wz-footer">
              <button className="gc-wz-btn gc-wz-btn--ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="gc-wz-btn gc-wz-btn--primary" onClick={() => setStep(3)}>Next: Set Priority →</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Terminal Priority ── */}
        {step === 3 && (
          <div>
            <div className="gc-wz-hdr"><div className="gc-wz-title">Set Terminal Priority</div><div className="gc-wz-sub">Drag terminals to reorder. Set an SR threshold — traffic falls back to the next terminal when SR drops below it.</div></div>
            <div className="gc-priority-list">
              {terminalOrder.map((t, i) => (
                <div key={t.id} className={`gc-priority-row${dragIdx === i ? ' dragging' : ''}`} draggable onDragStart={e => handleDragStart(e, i)} onDragOver={e => handleDragOver(e, i)} onDragEnd={handleDragEnd}>
                  <span className="gc-priority-handle">⠿</span>
                  <span className="gc-priority-rank">#{i + 1}</span>
                  <div className="gc-priority-info">
                    <div className="gc-priority-term">{t.displayId}</div>
                    <div className="gc-priority-gw">{t.gatewayShort}</div>
                  </div>
                  <div className="gc-priority-metrics">
                    <span style={{ color: t.successRate >= 90 ? '#059669' : '#d97706', fontWeight: 600, fontSize: 13 }}>SR {t.successRate}%</span>
                    <span style={{ fontSize: 12, color: t.costPerTxn === 0 ? '#059669' : '#64748b' }}>{t.costPerTxn === 0 ? '₹0 zero-cost' : `₹${t.costPerTxn}/txn`}</span>
                  </div>
                  {i < terminalOrder.length - 1
                    ? <div className="gc-priority-thresh"><span className="gc-priority-thresh-lbl">Fallback if SR &lt;</span><input type="number" min="50" max="99" className="gc-priority-sr-input" value={getThreshold(t.id)} onChange={e => setThreshold(t.id, +e.target.value)} /><span>%</span></div>
                    : <span className="gc-badge gc-badge-gray" style={{ fontSize: 10 }}>Final fallback</span>}
                </div>
              ))}
            </div>
            <div className="gc-wz-footer">
              <button className="gc-wz-btn gc-wz-btn--ghost" onClick={() => setStep(2)}>← Back</button>
              <button className="gc-wz-btn gc-wz-btn--primary" onClick={() => setStep(4)}>Preview Rule →</button>
            </div>
          </div>
        )}

        {/* ── Step 4: Rule Preview ── */}
        {step === 4 && (
          <div>
            <div className="gc-wz-hdr"><div className="gc-wz-title">Rule Preview</div><div className="gc-wz-sub">Review the routing cascade and cost impact before saving.</div></div>
            <div className="gc-preview-cascade">
              <div className="gc-preview-cascade-title">Routing Cascade</div>
              {terminalOrder.map((t, i) => (
                <React.Fragment key={t.id}>
                  <div className={`gc-preview-terminal${i === 0 ? ' primary' : ''}`}>
                    <span className="gc-preview-rank">#{i + 1}</span>
                    <div className="gc-preview-info">
                      <span className="gc-preview-term-id">{t.displayId}</span>
                      <span className="gc-preview-gw">{t.gatewayShort}</span>
                    </div>
                    <div className="gc-preview-metrics">
                      <span style={{ color: t.successRate >= 90 ? '#059669' : '#d97706', fontWeight: 600 }}>SR {t.successRate}%</span>
                      <span style={{ color: t.costPerTxn === 0 ? '#059669' : '#64748b', fontSize: 12 }}>{t.costPerTxn === 0 ? '₹0' : `₹${t.costPerTxn}/txn`}</span>
                    </div>
                    <span className={`gc-badge ${i === 0 ? 'gc-badge-blue' : 'gc-badge-gray'}`} style={{ fontSize: 10, whiteSpace: 'nowrap' }}>{i === 0 ? 'Primary' : `Fallback ${i}`}</span>
                  </div>
                  {i < terminalOrder.length - 1 && <div className="gc-preview-connector">↓ if SR drops below {getThreshold(t.id)}%</div>}
                </React.Fragment>
              ))}
            </div>
            <div className="gc-preview-narrative">
              {terminalOrder.map((t, i) => {
                const prev = terminalOrder[i - 1]
                const costNote = t.costPerTxn === 0 ? '₹0/txn — zero-cost deal' : `₹${t.costPerTxn}/txn`
                if (i === 0) return <span key={t.id}><strong>{t.displayId}</strong> handles payments first (SR {t.successRate}%, {costNote}). </span>
                const thresh = getThreshold(prev.id)
                const suffix = i === terminalOrder.length - 1 ? ' as the final fallback.' : '. '
                return <span key={t.id}>If SR drops below {thresh}%, traffic shifts to <strong>{t.displayId}</strong> (SR {t.successRate}%, {costNote}){suffix}</span>
              })}
            </div>
            {terminalOrder.length >= 2 && (() => {
              const [p1, p2] = terminalOrder
              const delta = p2.costPerTxn - p1.costPerTxn
              if (delta <= 0) return null
              const saving = Math.round(delta * dailyVol)
              return (
                <div className="gc-preview-saving">
                  <div className="gc-preview-saving-title">Cost Impact</div>
                  <div className="gc-preview-saving-text">Routing via <strong>{p1.displayId}</strong> costs <strong>{p1.costPerTxn === 0 ? '₹0' : `₹${p1.costPerTxn}`}/txn</strong> vs <strong>₹{p2.costPerTxn}/txn</strong> on {p2.displayId}. At ~{dailyVol.toLocaleString()} daily {methodLabel} transactions, that's <span className="gc-preview-saving-badge">₹{saving.toLocaleString()}/day</span> saved by routing here first.</div>
                </div>
              )
            })()}
            <div className="gc-preview-meta">
              <span className="gc-badge gc-badge-blue">{selectedFlow?.label} · {selectedFlow?.sub}</span>
              {amountRange !== 'any' && <span className="gc-badge gc-badge-gray">{AMOUNT_RANGES.find(r => r.id === amountRange)?.label}</span>}
              <span className="gc-badge gc-badge-gray">{terminalOrder.length} terminals</span>
            </div>
            <div className="gc-wz-footer">
              <button className="gc-wz-btn gc-wz-btn--ghost" onClick={() => setStep(3)}>← Back</button>
              <button className="gc-wz-btn gc-wz-btn--primary" onClick={() => setStep(5)}>Confirm & Create →</button>
            </div>
          </div>
        )}

        {/* ── Step 5: Confirm ── */}
        {step === 5 && !confirmed && (
          <div>
            <div className="gc-wz-hdr"><div className="gc-wz-title">Confirm Rule Creation</div><div className="gc-wz-sub">This rule will be added to the active routing configuration for {merchant?.name}.</div></div>
            <div className="gc-confirm-table">
              <div className="gc-confirm-row"><span className="gc-confirm-lbl">Flow</span><span>{selectedFlow?.label} · {selectedFlow?.sub}</span></div>
              <div className="gc-confirm-row"><span className="gc-confirm-lbl">Amount</span><span>{AMOUNT_RANGES.find(r => r.id === amountRange)?.label}</span></div>
              <div className="gc-confirm-row"><span className="gc-confirm-lbl">Priority</span><span>{terminalOrder.map(t => t.displayId).join(' → ')}</span></div>
              <div className="gc-confirm-row"><span className="gc-confirm-lbl">Fallback</span><span>SR threshold per terminal (configured in Step 3)</span></div>
            </div>
            <div className="gc-wz-footer">
              <button className="gc-wz-btn gc-wz-btn--ghost" onClick={() => setStep(4)}>← Back</button>
              <button className="gc-wz-btn gc-wz-btn--primary" onClick={handleConfirm}>✓ Create Rule</button>
            </div>
          </div>
        )}

        {step === 5 && confirmed && (
          <div className="gc-wizard-success">
            <div className="gc-success-icon">✓</div>
            <div className="gc-success-title">Rule Created Successfully</div>
            <div className="gc-success-sub"><strong>{selectedFlow?.label} · {selectedFlow?.sub}</strong> routing rule is now active for {merchant?.name}. Priority: {terminalOrder.map(t => t.displayId).join(' → ')}.</div>
            <button className="gc-wz-btn gc-wz-btn--primary" style={{ marginTop: 20 }} onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════
// Cost Rules View — rules table + create button
// ════════════════════════════════════════════
function CostRulesView({ method, merchant, rules, onCreateRule }) {
  const dk = methodToDataKey(method)
  const methodLabel = method === 'UPIOnetime' ? 'UPI Onetime' : method === 'UPIRecurring' ? 'UPI Recurring' : method

  // Filter rules that apply to this method
  const methodRules = (rules || []).filter(rule => {
    if (!rule.conditions || rule.conditions.length === 0) return true
    const pmCond = rule.conditions.find(c => c.field === 'payment_method')
    if (!pmCond) return true
    const val = pmCond.value
    if (Array.isArray(val)) return val.includes(dk)
    return val === dk
  })

  const formatConditions = (conditions) => {
    if (!conditions || conditions.length === 0) return <span className="gc-rules-cond-all">All transactions</span>
    return conditions
      .filter(c => c.field !== 'payment_method')
      .map((c, i) => {
        const fieldLabel = {
          card_network: 'Network', card_type: 'Card type', issuer_bank: 'Issuer',
          upi_flow: 'UPI flow', amount: 'Amount', international: 'Intl', emi_type: 'EMI type',
        }[c.field] || c.field
        const opLabel = { equals: '=', in: 'in', greater_than: '>', less_than: '<', between: 'btw' }[c.operator] || c.operator
        const val = Array.isArray(c.value) ? c.value.join(', ') : String(c.value)
        return <span key={i} className="gc-rules-cond-chip">{fieldLabel} {opLabel} {val}</span>
      })
  }

  const formatTerminals = (action) => {
    if (!action) return '—'
    const terms = action.terminals || []
    if (action.type === 'split' && action.splits?.length > 0) {
      return action.splits.map((s, i) => (
        <span key={i} className="gc-rules-term-chip">{s.terminalId?.replace('term-', '').toUpperCase()} {s.percentage}%</span>
      ))
    }
    return terms.slice(0, 3).map((t, i) => (
      <span key={i} className="gc-rules-term-chip">{t.replace('term-', '').toUpperCase()}</span>
    ))
  }

  return (
    <div className="gc-cost-rules-view">
      <div className="gc-cost-rules-header">
        <div>
          <div className="gc-cost-rules-title">Custom Routing Rules — {methodLabel}</div>
          <div className="gc-cost-rules-sub">{methodRules.length} rule{methodRules.length !== 1 ? 's' : ''} active for this method</div>
        </div>
        <button className="gc-create-rule-btn" onClick={onCreateRule}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Rule
        </button>
      </div>

      {methodRules.length === 0 ? (
        <div className="gc-cost-rules-empty">
          <div className="gc-cost-rules-empty-icon">📋</div>
          <div className="gc-cost-rules-empty-title">No custom rules yet</div>
          <div className="gc-cost-rules-empty-sub">Create a rule to define how {methodLabel} payments are routed for cost savings or specific terminal preferences.</div>
          <button className="gc-create-rule-btn" style={{ marginTop: 12 }} onClick={onCreateRule}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create First Rule
          </button>
        </div>
      ) : (
        <div className="gc-cost-rules-table-wrap">
          <table className="gc-cost-rules-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Rule Name</th>
                <th>Filters</th>
                <th>Terminals</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {methodRules.map((rule, i) => (
                <tr key={rule.id || i}>
                  <td className="gc-rules-priority">{rule.priority || i + 1}</td>
                  <td className="gc-rules-name">{rule.name}</td>
                  <td className="gc-rules-conds">{formatConditions(rule.conditions)}</td>
                  <td className="gc-rules-terms">{formatTerminals(rule.action)}</td>
                  <td>
                    <span className={`gc-rules-type-badge gc-rules-type-${rule.type || 'conditional'}`}>
                      {rule.type === 'volume_split' ? 'Split' : 'Route'}
                    </span>
                  </td>
                  <td>
                    <span className={`gc-rules-status ${rule.enabled !== false ? 'active' : 'disabled'}`}>
                      {rule.enabled !== false ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════
// Method Panel — cards + chat/simulate
// ════════════════════════════════════════════
// Cost-switch discouragement modal
// ════════════════════════════════════════════
function CostSwitchModal({ merchant, onCancel, onConfirm }) {
  const mccLabel  = merchant?.mccLabel  || merchant?.category || 'this MCC category'
  const category  = merchant?.category  || mccLabel

  return (
    <div className="gc-modal-overlay" onClick={onCancel}>
      <div className="gc-modal" onClick={e => e.stopPropagation()}>
        <div className="gc-modal-icon">⚠️</div>
        <div className="gc-modal-title">Switching to Cost-optimized Routing</div>

        <div className="gc-modal-body">
          <p className="gc-modal-stat">
            Merchants in the same MCC category (<strong>{mccLabel}</strong>
            {category !== mccLabel ? ` · ${category}` : ''}) using cost-optimized
            routing show <strong>~2.1% lower success rates</strong> on average.
          </p>
          <p className="gc-modal-impact">
            Lower SR gives <strong>{merchant?.name || 'this merchant'}</strong> reason
            to route more volume through competing payment gateways, reducing
            Razorpay's wallet share with this merchant.
          </p>
          <p className="gc-modal-reassure">
            You can switch back to SR-optimized at any time.
          </p>
        </div>

        <div className="gc-modal-actions">
          <button className="gc-modal-btn-cancel" onClick={onCancel}>
            Stay on SR-optimized
          </button>
          <button className="gc-modal-btn-switch" onClick={onConfirm}>
            Switch anyway
          </button>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════
function MethodPanel({ method, merchant, rules, addRule, simOverrides }) {
  const [routingStrategy, setRoutingStrategy] = useState('sr')       // 'sr' | 'cost'
  const [activeView, setActiveView]           = useState('sr_ranking') // default: show terminal ranking
  const [triggerMsg, setTriggerMsg]           = useState(null)
  const [chatKey, setChatKey]                 = useState(0)
  const [showCostModal, setShowCostModal]     = useState(false)
  const methodLabel = method === 'UPIOnetime' ? 'UPI Onetime' : method === 'UPIRecurring' ? 'UPI Recurring' : method

  const fireChat = (text) => {
    setActiveView('chat')
    setChatKey(k => k + 1)
    setTriggerMsg({ text, id: Date.now() })
  }

  const handleStrategy = (s) => {
    if (s === 'cost' && routingStrategy === 'sr') {
      setShowCostModal(true)
      return
    }
    setRoutingStrategy(s)
    setActiveView('sr_ranking')
  }

  const confirmCostSwitch = () => {
    setShowCostModal(false)
    setRoutingStrategy('cost')
    setActiveView('rules_table')
  }

  return (
    <div className="gc-method-panel">
      {showCostModal && (
        <CostSwitchModal
          merchant={merchant}
          onCancel={() => setShowCostModal(false)}
          onConfirm={confirmCostSwitch}
        />
      )}

      {/* ── L2: action nav panel ── */}
      <div className="gc-l2-panel">
        {/* Card 1: Routing Strategy */}
        <div className="gc-l2-card">
          <div className="gc-l2-card-hdr">
            <span className="gc-l2-card-icon"><IconRoute /></span>
            <span className="gc-l2-card-title">Routing Strategy</span>
          </div>
          <div className="gc-strategy-opts">
            <button className={`gc-strategy-btn gc-strategy-btn--sr${routingStrategy === 'sr' ? ' active' : ''}`} onClick={() => handleStrategy('sr')}>
              <div className="gc-strategy-btn-top">
                <span className="gc-strategy-btn-label"><IconSRIcon /> Optimize for Success Rate</span>
                <span className="gc-strategy-badge-rec">Recommended</span>
              </div>
            </button>
            <button className={`gc-strategy-btn gc-strategy-btn--cost${routingStrategy === 'cost' ? ' active' : ''}`} onClick={() => handleStrategy('cost')}>
              <div className="gc-strategy-btn-top">
                <span className="gc-strategy-btn-label"><IconCostIcon /> Save Cost / Custom Routing</span>
              </div>
            </button>
          </div>
        </div>

        {/* Card 2: Simulate Payments */}
        <div className={`gc-l2-card gc-l2-card--clickable${activeView === 'simulate' ? ' active' : ''}`} onClick={() => setActiveView('simulate')}>
          <div className="gc-l2-card-hdr">
            <span className="gc-l2-card-icon" style={{ color: '#059669' }}><IconPlay /></span>
            <span className="gc-l2-card-title">Simulate Payments</span>
          </div>
          <div className="gc-l2-card-desc">Trace a transaction through the routing pipeline</div>
          <div className="gc-l2-card-cta">Run Simulation →</div>
        </div>

        {/* Card 3: Historic Routing */}
        <div className={`gc-l2-card gc-l2-card--clickable${activeView === 'historic' ? ' active' : ''}`} onClick={() => setActiveView('historic')}>
          <div className="gc-l2-card-hdr">
            <span className="gc-l2-card-icon" style={{ color: '#7c3aed' }}><IconClock /></span>
            <span className="gc-l2-card-title">Historic Routing</span>
          </div>
          <div className="gc-l2-card-desc">Replay past payments — see which rules fired and why</div>
          <div className="gc-l2-card-cta">Trace Payment →</div>
        </div>

      </div>

      {/* ── Content area ── */}
      <div className="gc-content-area">
        {activeView === 'simulate'
          ? <SimulateView key={method} method={method} merchant={merchant} rules={rules} />
          : activeView === 'historic'
          ? <HistoricView key={method} method={method} merchant={merchant} rules={rules} />
          : activeView === 'create_rule'
          ? <CreateRuleWizard method={method} merchant={merchant} rules={rules} addRule={addRule} onClose={() => setActiveView(routingStrategy === 'cost' ? 'rules_table' : 'sr_ranking')} />
          : activeView === 'rules_table'
          ? <CostRulesView method={method} merchant={merchant} rules={rules} onCreateRule={() => setActiveView('create_rule')} />
          : activeView === 'sr_ranking'
          ? <SRRankingView method={method} merchant={merchant} strategy={routingStrategy} />
          : <MethodChat key={chatKey} method={method} merchant={merchant} rules={rules} addRule={addRule} simOverrides={simOverrides} triggerMsg={triggerMsg} />
        }
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
      const dk = methodToDataKey(key)
      counts[key] = rules.filter(r =>
        !r.isDefault && !r.isMethodDefault &&
        r.conditions?.some(c => c.field === 'payment_method' && c.value === dk)
      ).length
    })
    return counts
  }, [rules])

  return (
    <div className="gc-copilot">
      {/* ── L1: Method list ── */}
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

      {/* ── Right: Cards + scoped chat ── */}
      <div className="gc-panel">
        <MethodPanel
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
