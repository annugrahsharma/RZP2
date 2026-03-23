import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { gateways, simulateRoutingPipeline } from '../../data/kamMockData'
import RuleWizard from './RuleWizard'

// ════════════════════════════════════════════
// RoutingCopilot — Method sidebar + scoped chat
// ════════════════════════════════════════════

// ── Payment Method Definitions ──────────────
// key = wizard method key; paymentMethod = actual routing method string
const METHOD_TO_PAYMENT = {
  Cards:        'Cards',
  UPIOnetime:   'UPI',
  UPIRecurring: 'UPI',
  EMI:          'EMI',
}

const ALL_PAYMENT_METHODS = [
  { key: 'Cards',        label: 'Cards',         Icon: IconCards },
  { key: 'UPIOnetime',   label: 'UPI Onetime',   Icon: IconUPI   },
  { key: 'UPIRecurring', label: 'UPI Recurring',  Icon: IconUPI   },
  { key: 'EMI',          label: 'EMI',            Icon: IconEMI   },
]

// ── Smart Suggest Chips per Method ──────────
const SMART_SUGGESTS = {
  Cards: [
    'List all available terminals',
    'Cost of all available terminals',
    'What is the priority order of terminals for Visa credit above ₹5,000',
    'Show NTF risk for international cards',
    'Which terminal has the best SR for Mastercard?',
  ],
  UPIOnetime: [
    'List all available terminals',
    'Cost of all available terminals',
    'What is the priority order of terminals for UPI intent up to ₹2,000',
    'Show NTF risk for UPI collect',
    'Which UPI terminal has the highest SR?',
  ],
  UPIRecurring: [
    'List all available terminals',
    'Show NTF risk for UPI recurring',
    'Which terminal handles recurring mandates best?',
    'What is the priority order for recurring payments?',
    'Cost of all available terminals',
  ],
  EMI: [
    'List all available terminals',
    'Cost comparison across EMI terminals',
    'Which terminals support no-cost EMI?',
    'Show NTF risk for EMI above ₹10,000',
    'Priority order for Visa EMI',
  ],
}

// ── Icons ────────────────────────────────────
function IconCards()  { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> }
function IconUPI()    { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> }
function IconNB()     { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg> }
function IconEMI()    { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function IconWallet() { return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 12V22H4a2 2 0 0 1-2-2V6a2 2 0 0 0 2 2h16v4z"/><path d="M22 12H4"/><path d="M6 6V4a2 2 0 0 1 2-2h12"/><circle cx="17" cy="17" r="1" fill="currentColor"/></svg> }

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
  const pm = METHOD_TO_PAYMENT[method] || method
  const terminals = merchant.gatewayMetrics
    .filter(gm => !method || (gm.supportedMethods || []).includes(pm))
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

function RoutingCascadeCard({ merchant, method, terminals, srThreshold = 90 }) {
  if (!terminals || terminals.length === 0) return null
  const methodLabel = METHOD_LABELS[method] || method
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
  const methodLabel = METHOD_LABELS[method] || method

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
    const pm = METHOD_TO_PAYMENT[method] || method
    setMessages(prev => [...prev, { type: 'user', text: userMsg, ts: Date.now() }])

    setTimeout(() => {
      const intent = classifyIntent(userMsg)
      let response

      switch (intent.type) {
        case 'simulate': {
          const txn = parseTxnFromInput(userMsg, pm)
          const result = simulateRoutingPipeline(merchant, txn, rules, simOverrides)
          response = { type: 'bot', content: 'pipeline', data: { result, txn }, ts: Date.now() }
          break
        }
        case 'show_rules': {
          const methodRules = rules.filter(r => r.conditions?.some(c => c.field === 'payment_method' && c.value === pm))
          response = { type: 'bot', content: 'rule_table', data: { rules: methodRules, merchant }, ts: Date.now() }
          break
        }
        case 'create_rule': {
          const prefill = parseRuleIntent(userMsg, pm)
          response = { type: 'bot', content: 'rule_form', data: { merchant, rules, prefill }, ts: Date.now() }
          break
        }
        case 'terminal_info': {
          response = { type: 'bot', content: 'terminal_info', data: { merchant, method: pm }, ts: Date.now() }
          break
        }
        case 'ntf_analysis': {
          const testCases = {
            Cards: [
              { payment_method: 'Cards', card_network: 'Visa',       card_type: 'credit', amount: 5000,  international: false },
              { payment_method: 'Cards', card_network: 'Mastercard', card_type: 'credit', amount: 5000,  international: false },
              { payment_method: 'Cards', card_network: 'RuPay',      card_type: 'debit',  amount: 2000,  international: false },
              { payment_method: 'Cards', card_network: 'Visa',       card_type: 'credit', amount: 5000,  international: true  },
            ],
            UPI: [
              { payment_method: 'UPI', amount: 500,  international: false },
              { payment_method: 'UPI', amount: 2000, international: false },
              { payment_method: 'UPI', amount: 5000, international: false },
            ],
            EMI: [
              { payment_method: 'EMI', card_network: 'Visa', emi_type: 'no_cost',  amount: 15000 },
              { payment_method: 'EMI', card_network: 'Visa', emi_type: 'standard', amount: 10000 },
            ],
          }
          const cases   = testCases[pm] || testCases.Cards
          const results = cases.map(txn => ({ txn, result: simulateRoutingPipeline(merchant, txn, rules, simOverrides) }))
          const ntfs    = results.filter(r => r.result.isNTF)
          const passing = results.filter(r => !r.result.isNTF)
          response = { type: 'bot', content: 'ntf_analysis', data: { ntfs, passing, method: methodLabel }, ts: Date.now() }
          break
        }
        case 'priority_cascade': {
          const methodTerminals = merchant.gatewayMetrics
            .filter(gm => (gm.supportedMethods || []).includes(pm))
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
          {msg.content === 'rule_table'    && <RuleTable rules={msg.data.rules} merchant={msg.data.merchant} />}
          {msg.content === 'terminal_info' && <TerminalInfo merchant={msg.data.merchant} method={msg.data.method} />}
          {msg.content === 'priority_cascade' && (
            <RoutingCascadeCard merchant={msg.data.merchant} method={msg.data.method} terminals={msg.data.terminals} srThreshold={90} />
          )}
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

const METHOD_RULE_RATIOS = { Cards: 0.49, UPIOnetime: 0.16, UPIRecurring: 0.12, EMI: 0.23 }
const AMOUNT_PRESETS_MAP = { Cards: [500, 2000, 5000, 10000, 50000], UPIOnetime: [200, 500, 2000, 5000], UPIRecurring: [500, 1000, 2000, 5000], EMI: [10000, 25000, 50000, 100000] }
const METHOD_LABELS = { Cards: 'Cards', UPIOnetime: 'UPI (One-time)', UPIRecurring: 'UPI (Recurring)', EMI: 'EMI' }

const defaultForm = (method) => ({
  cardNetwork: 'Visa', cardType: 'Credit', issuerBank: 'Any', international: 'Domestic',
  upiType: 'Intent', upiApp: 'GPay',
  emiNetwork: 'Visa', emiType: 'No-cost', tenure: '6m',
  recurring: 'One-time',
  amount: { Cards: 5000, UPIOnetime: 2000, UPIRecurring: 1000, EMI: 25000 }[method] || 5000,
})

function buildSimTxn(form, method) {
  const paymentMethod = METHOD_TO_PAYMENT[method] || method
  const txn = { payment_method: paymentMethod, amount: form.amount, international: form.international === 'International' }
  if (method === 'Cards')                       { txn.card_network = form.cardNetwork || 'Visa'; txn.card_type = (form.cardType || 'Credit').toLowerCase() }
  if (method === 'EMI')                         { txn.card_network = form.emiNetwork || 'Visa'; txn.card_type = 'credit'; txn.emi_type = form.emiType === 'No-cost' ? 'no_cost' : 'standard' }
  if (method === 'UPIRecurring')                { txn.recurring = true }
  return txn
}

function buildPipelineData(form, method, merchant, rules) {
  const TOTAL = 418
  const paymentMethod = METHOD_TO_PAYMENT[method] || method
  const methodLabel = METHOD_LABELS[method] || method
  const afterMethod = Math.round(TOTAL * (METHOD_RULE_RATIOS[method] || 0.3))
  const network = method === 'Cards' ? form.cardNetwork : method === 'EMI' ? form.emiNetwork : null
  const intl = form.international === 'International'
  const isAmex = network === 'Amex'

  const methodTerminals = merchant.gatewayMetrics
    .filter(gm => (gm.supportedMethods || []).includes(paymentMethod))
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
  const methodLabel = METHOD_LABELS[method] || method
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
    const methodOthers = Object.keys(METHOD_RULE_RATIOS).filter(m => m !== method).map(m => METHOD_LABELS[m] || m)
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

  const methodLabel = METHOD_LABELS[method] || method
  return (
    <div className="gc-sim-view">
      {phase === 'form'
        ? <SimulateForm method={method} form={form} onFormChange={setForm} onRun={runSimulation} />
        : <>
            <div className="gc-sim-params-bar">
              <span>{methodLabel} · ₹{form.amount.toLocaleString()}{form.cardNetwork && method === 'Cards' ? ` · ${form.cardNetwork} ${form.cardType}` : ''}{form.international === 'International' ? ' · Intl' : ' · Dom'} · {form.recurring}</span>
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

// Map raw payment method string → wizard key (for use in buildPipelineData)
const PAYMENT_TO_METHOD_KEY = { Cards: 'Cards', UPI: 'UPIOnetime', EMI: 'EMI' }

function buildHistoricSteps(mock, method, merchant, rules) {
  // mock.method is a raw payment method string ('Cards', 'UPI')
  // method is the L1 wizard key ('UPIOnetime', 'UPIRecurring', etc.)
  const rawMethod = mock?.method || (METHOD_TO_PAYMENT[method] || method)
  const methodKey = PAYMENT_TO_METHOD_KEY[rawMethod] || method
  const form = {
    ...defaultForm(methodKey),
    amount: mock?.amount || 5000,
    cardNetwork: mock?.card_network || 'Visa',
    cardType: mock?.card_type === 'debit' ? 'Debit' : 'Credit',
    international: mock?.international ? 'International' : 'Domestic',
  }
  const d = buildPipelineData(form, methodKey, merchant, rules)
  const txn = { payment_method: rawMethod, amount: form.amount, card_network: form.cardNetwork, card_type: form.cardType.toLowerCase(), international: mock?.international || false }
  const simResult = simulateRoutingPipeline(merchant, txn, rules)
  const shares = d.topTerminals.length >= 2 ? [70, 30] : [100]
  const methodOthers = Object.keys(METHOD_RULE_RATIOS).filter(m => m !== methodKey).map(m => METHOD_LABELS[m] || m)
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
  const methodLabel = METHOD_LABELS[method] || method
  const paymentMethod = METHOD_TO_PAYMENT[method] || method

  const terminals = useMemo(() =>
    merchant.gatewayMetrics
      .filter(gm => (gm.supportedMethods || []).includes(paymentMethod))
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
          Terminals are ranked by success rate. To customize priority or optimize for cost, select <strong>Save Cost / Custom Rules</strong>.
        </div>
      )}
    </div>
  )
}


// ════════════════════════════════════════════
// Method Panel — cards + chat/simulate
// ════════════════════════════════════════════
function MethodPanel({ method, merchant, rules, addRule, simOverrides }) {
  const [routingStrategy, setRoutingStrategy] = useState(null) // 'sr' | 'cost'
  const [activeView, setActiveView]           = useState(null) // null | 'chat' | 'simulate'
  const [triggerMsg, setTriggerMsg]           = useState(null)
  const [chatKey, setChatKey]                 = useState(0)
  const methodLabel = METHOD_LABELS[method] || method

  const fireChat = (text) => {
    setActiveView('chat')
    setChatKey(k => k + 1)
    setTriggerMsg({ text, id: Date.now() })
  }

  const handleStrategy = (s) => {
    setRoutingStrategy(s)
    setActiveView('sr_ranking') // always show terminal ranking when a strategy is selected
  }

  return (
    <div className="gc-method-panel">
      {/* ── Top: action cards ── */}
      <div className="gc-panel-top">
        <div className="gc-panel-cards">
          {/* Card 1: Routing Strategy */}
          <div className="gc-card">
            <div className="gc-card-icon"><IconRoute /></div>
            <div className="gc-card-title">Routing Strategy</div>
            <div className="gc-card-desc">Set the optimization goal for {methodLabel}</div>
            <div className="gc-strategy-opts">
              <button className={`gc-strategy-btn${routingStrategy === 'sr' ? ' active' : ''}`} onClick={() => handleStrategy('sr')}>
                <IconSRIcon /> Optimize for Success Rate
              </button>
              <button className={`gc-strategy-btn${routingStrategy === 'cost' ? ' active' : ''}`} onClick={() => handleStrategy('cost')}>
                <IconCostIcon /> Save Cost / Custom Rules
              </button>
            </div>
          </div>

          {/* Card 2: Simulate Payments */}
          <div className={`gc-card gc-card-clickable${activeView === 'simulate' ? ' gc-card--active' : ''}`} onClick={() => setActiveView('simulate')}>
            <div className="gc-card-icon" style={{ color: '#059669' }}><IconPlay /></div>
            <div className="gc-card-title">Simulate Payments</div>
            <div className="gc-card-desc">Trace a transaction through the routing pipeline end-to-end</div>
            <div className="gc-card-cta">Run Simulation →</div>
          </div>

          {/* Card 3: Historic Routing Logic */}
          <div className={`gc-card gc-card-clickable${activeView === 'historic' ? ' gc-card--active' : ''}`} onClick={() => setActiveView('historic')}>
            <div className="gc-card-icon" style={{ color: '#7c3aed' }}><IconClock /></div>
            <div className="gc-card-title">Historic Routing Logic</div>
            <div className="gc-card-desc">Trace a past payment — see exactly which rules fired and why it routed there</div>
            <div className="gc-card-cta">Trace Payment →</div>
          </div>
        </div>

        {/* Card 4: Create Rule — conditional on cost strategy */}
        {routingStrategy === 'cost' && (
          <div className="gc-rules-card">
            <div className="gc-rules-card-info">
              <div className="gc-rules-card-title">Create Rule</div>
              <div className="gc-rules-card-desc">Build a custom routing rule for {methodLabel} payments with terminal priority and SR fallback thresholds.</div>
            </div>
            <div className="gc-rules-card-actions">
              <button className="gc-rules-card-btn gc-rules-card-btn--primary" onClick={() => setActiveView('create_rule')}>+ Create Rule</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Content area ── */}
      {activeView === 'simulate'
        ? <SimulateView key={method} method={method} merchant={merchant} rules={rules} />
        : activeView === 'historic'
        ? <HistoricView key={method} method={method} merchant={merchant} rules={rules} />
        : activeView === 'create_rule'
        ? <RuleWizard method={method} merchant={merchant} addRule={addRule} onClose={() => setActiveView(null)} />
        : activeView === 'sr_ranking'
        ? <SRRankingView method={method} merchant={merchant} strategy={routingStrategy} />
        : <MethodChat key={chatKey} method={method} merchant={merchant} rules={rules} addRule={addRule} simOverrides={simOverrides} triggerMsg={triggerMsg} />
      }
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
      const pm = METHOD_TO_PAYMENT[key] || key
      counts[key] = rules.filter(r =>
        !r.isDefault && !r.isMethodDefault &&
        r.conditions?.some(c => c.field === 'payment_method' && c.value === pm)
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
