import React, { useState, useMemo } from 'react'
import { gateways } from '../../data/kamMockData'

// ════════════════════════════════════════════
// DATA CONSTANTS
// ════════════════════════════════════════════

const CARDS_NETWORKS = [
  { id: 'Visa',       label: 'Visa',       count: 1847, pct: 34.0 },
  { id: 'Mastercard', label: 'Mastercard', count: 1823, pct: 33.5 },
  { id: 'RuPay',      label: 'RuPay',      count: 1156, pct: 21.3 },
  { id: 'Amex',       label: 'Amex',       count: 287,  pct: 5.3  },
  { id: 'Maestro',    label: 'Maestro',    count: 89,   pct: 1.6  },
  { id: 'Diners',     label: 'Diners',     count: 12,   pct: 0.2  },
]

const ISSUER_BANKS = [
  { id: 'HDFC',     label: 'HDFC',     count: 892, pct: 16.4 },
  { id: 'ICICI',    label: 'ICICI',    count: 834, pct: 15.3 },
  { id: 'SBI',      label: 'SBI',      count: 756, pct: 13.9 },
  { id: 'Axis',     label: 'Axis',     count: 623, pct: 11.5 },
  { id: 'YesBank',  label: 'Yes Bank', count: 287, pct: 5.3  },
  { id: 'Kotak',    label: 'Kotak',    count: 245, pct: 4.5  },
  { id: 'IDFC',     label: 'IDFC',     count: 198, pct: 3.6  },
  { id: 'IndusInd', label: 'IndusInd', count: 156, pct: 2.9  },
  { id: 'RBL',      label: 'RBL',      count: 134, pct: 2.5  },
  { id: 'Federal',  label: 'Federal',  count: 112, pct: 2.1  },
]

const CARD_TYPES = [
  { id: 'credit',  label: 'Credit',  pct: 39.3 },
  { id: 'debit',   label: 'Debit',   pct: 36.6 },
  { id: 'prepaid', label: 'Prepaid', pct: 4.3  },
]

const TOKENIZATIONS = [
  { id: 'googlepay', label: 'Google Pay',     pct: 1.6 },
  { id: 'applepay',  label: 'Apple Pay',      pct: 1.2 },
  { id: 'rzpvault',  label: 'Razorpay Vault', pct: 0.8 },
]

const CARD_SUBTYPES = [
  { id: 'consumer', label: 'Consumer', pct: 4.3 },
  { id: 'business', label: 'Business', pct: 3.3 },
  { id: 'premium',  label: 'Premium',  pct: 2.3 },
]

const AMOUNT_PRESETS_CARDS = [
  { id: 'lt1l',  label: '<₹1L',  max: 100000 },
  { id: 'lt2l',  label: '<₹2L',  max: 200000 },
  { id: 'lt5l',  label: '<₹5L',  max: 500000 },
  { id: 'gt1l',  label: '>₹1L',  min: 100000 },
  { id: 'gt2l',  label: '>₹2L',  min: 200000 },
]

const UPI_TYPES = [
  { id: 'Collect', label: 'Collect', pct: 36.5, tooltip: 'Customer enters VPA; merchant pulls payment' },
  { id: 'Intent',  label: 'Intent',  pct: 26.7, tooltip: 'Deep-link opens UPI app directly'            },
  { id: 'QR',      label: 'QR',      pct: 21.7, tooltip: 'QR code scan at checkout'                    },
  { id: 'Any',     label: 'Any',     pct: 15.1, tooltip: 'Match all UPI types'                          },
]

const UPI_FLOWS = [
  { id: 'Collect', label: 'Collect' },
  { id: 'Intent',  label: 'Intent'  },
  { id: 'QR',      label: 'QR'      },
  { id: 'In-App',  label: 'In-App'  },
]

const VPA_HANDLES = [
  { id: '@icici',    label: '@icici',    pct: 12.5 },
  { id: '@axisbank', label: '@axisbank', pct: 10.9 },
  { id: '@hdfc',     label: '@hdfc',     pct: 10.0 },
  { id: '@paytm',    label: '@paytm',    pct: 9.2  },
  { id: '@ybl',      label: '@ybl',      pct: 8.4  },
  { id: '@oksbi',    label: '@oksbi',    pct: 7.3  },
  { id: '@razorpay', label: '@razorpay', pct: 6.5  },
]

const UPI_AMT_PRESETS = [
  { id: 'lt50k', label: '<₹50K', max: 50000  },
  { id: 'lt1l',  label: '<₹1L',  max: 100000 },
  { id: 'lt2l',  label: '<₹2L',  max: 200000 },
  { id: 'gt50k', label: '>₹50K', min: 50000  },
  { id: 'gt1l',  label: '>₹1L',  min: 100000 },
]

const RECURRING_TYPES = [
  { id: 'Initial',    label: 'Initial Payment', pct: 29.2, tooltip: 'First charge that sets up the mandate' },
  { id: 'Auto-debit', label: 'Auto-debit',       pct: 23.4, tooltip: 'Subsequent automatic debits'          },
  { id: 'Both',       label: 'Both',             pct: 20.0, tooltip: 'Match both initial and auto-debit'    },
]

const MANDATE_FREQS = [
  { id: 'Daily',        label: 'Daily'              },
  { id: 'Weekly',       label: 'Weekly'             },
  { id: 'Monthly',      label: 'Monthly', pct: 17.5 },
  { id: 'Quarterly',    label: 'Quarterly'          },
  { id: 'Yearly',       label: 'Yearly'             },
  { id: 'As Presented', label: 'As Presented'       },
]

const MANDATE_AMT_PRESETS = [
  { id: 'lt5k',  label: '<₹5K',  max: 5000  },
  { id: 'lt10k', label: '<₹10K', max: 10000 },
  { id: 'lt25k', label: '<₹25K', max: 25000 },
  { id: 'lt50k', label: '<₹50K', max: 50000 },
  { id: 'gt50k', label: '>₹50K', min: 50000 },
]

const EMI_NETWORKS = [
  { id: 'Visa',       label: 'Visa',       pct: 44.5 },
  { id: 'Mastercard', label: 'Mastercard', pct: 41.6 },
  { id: 'RuPay',      label: 'RuPay',      pct: 9.4  },
  { id: 'Amex',       label: 'Amex',       pct: 3.3  },
]

const EMI_DURATIONS = [
  { id: '3',  label: '3 mo',  pct: 24.3 },
  { id: '6',  label: '6 mo',  pct: 41.1 },
  { id: '9',  label: '9 mo',  pct: 17.8 },
  { id: '12', label: '12 mo', pct: 61.6 },
  { id: '18', label: '18 mo', pct: 14.4 },
  { id: '24', label: '24 mo', pct: 28.3 },
]

const EMI_ISSUER_BANKS = [
  { id: 'HDFC',    label: 'HDFC',     count: 634 },
  { id: 'ICICI',   label: 'ICICI',    count: 587 },
  { id: 'SBI',     label: 'SBI',      count: 412 },
  { id: 'Axis',    label: 'Axis',     count: 389 },
  { id: 'Kotak',   label: 'Kotak',    count: 198 },
  { id: 'YesBank', label: 'Yes Bank', count: 134 },
]

const SUBVENTION_TYPES = [
  { id: 'merchant', label: 'Merchant / No-cost', pct: 26.7, tooltip: 'Merchant bears the interest cost; customer pays 0%' },
  { id: 'customer', label: 'Customer',           pct: 19.9, tooltip: 'Customer pays interest at applicable rate'           },
  { id: 'mixed',    label: 'Mixed',              pct: 8.9,  tooltip: 'Partial subvention — shared between merchant & bank' },
]

const EMI_AMT_PRESETS = [
  { id: '5k-50k',  label: '₹5K – 50K', min: 5000,  max: 50000  },
  { id: '10k-1l',  label: '₹10K – 1L', min: 10000, max: 100000 },
  { id: '5k-2l',   label: '₹5K – 2L',  min: 5000,  max: 200000 },
  { id: 'nolimit', label: 'No Limit',   min: null,  max: null   },
]

// ════════════════════════════════════════════
// Step definitions per method
// ════════════════════════════════════════════

function getSteps(method) {
  switch (method) {
    case 'Cards':       return ['Network', 'Issuer', 'Card Type', 'Geography', 'Advanced', 'Terminals']
    case 'UPIOnetime':  return ['UPI Type', 'Flow', 'VPA Handle', 'Advanced', 'Terminals']
    case 'UPIRecurring':return ['Recur Type', 'Frequency', 'VPA Handle', 'Advanced', 'Terminals']
    case 'EMI':         return ['Network', 'Duration', 'Issuer', 'Subvention', 'Advanced', 'Terminals']
    default:            return ['Configure', 'Terminals']
  }
}

// Map wizard method to data key (for terminal filtering against supportedMethods)
function dataKey(method) {
  return (method === 'UPIOnetime' || method === 'UPIRecurring') ? 'UPI' : method
}

// ════════════════════════════════════════════
// UI PRIMITIVES
// ════════════════════════════════════════════

function WizardStepper({ steps, currentStep }) {
  return (
    <div className="rw-stepper">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className={`rw-step-node${i < currentStep ? ' done' : i === currentStep ? ' active' : ''}`}>
            <div className="rw-step-dot">{i < currentStep ? '✓' : i + 1}</div>
            <div className="rw-step-lbl">{s}</div>
          </div>
          {i < steps.length - 1 && <div className={`rw-step-line${i < currentStep ? ' done' : ''}`} />}
        </React.Fragment>
      ))}
    </div>
  )
}

function UsageStat({ count, pct }) {
  if (count == null && pct == null) return null
  return (
    <span className="rw-usage">
      {count != null ? `${count.toLocaleString()} rules` : ''}
      {count != null && pct != null ? ' · ' : ''}
      {pct != null ? `${pct}%` : ''}
    </span>
  )
}

function TooltipWrap({ text, children }) {
  const [show, setShow] = useState(false)
  if (!text) return <>{children}</>
  return (
    <span className="rw-tip-wrap" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && <span className="rw-tip">{text}</span>}
    </span>
  )
}

function StepHdr({ title, required, optional, sub }) {
  return (
    <div className="rw-step-hdr">
      <div className="rw-step-title">
        {title}
        {required && <span className="rw-req"> *</span>}
        {optional && <span className="rw-opt"> (optional)</span>}
      </div>
      {sub && <div className="rw-step-sub">{sub}</div>}
    </div>
  )
}

function MatchCount({ count }) {
  return (
    <div className="rw-match">
      <span className="rw-match-dot" />
      <span><strong>{count}</strong> terminal{count !== 1 ? 's' : ''} will match</span>
    </div>
  )
}

function WzFooter({ onBack, onNext, onSkip, nextLabel = 'Next →', nextDisabled = false, onCancel }) {
  return (
    <div className="rw-footer">
      {onCancel && <button className="rw-btn ghost" onClick={onCancel}>Cancel</button>}
      {onBack   && <button className="rw-btn ghost" onClick={onBack}>← Back</button>}
      {onSkip   && <button className="rw-btn skip"  onClick={onSkip}>Skip →</button>}
      {onNext   && <button className="rw-btn primary" onClick={onNext} disabled={nextDisabled}>{nextLabel}</button>}
    </div>
  )
}

function CheckboxGrid({ options, selected, onToggle, anyLabel = 'Any', anySelected }) {
  return (
    <div className="rw-cb-grid">
      {options.map(o => (
        <label key={o.id} className={`rw-cb-opt${selected.includes(o.id) ? ' on' : ''}`}>
          <input type="checkbox" checked={selected.includes(o.id)} onChange={() => onToggle(o.id)} />
          <TooltipWrap text={o.tooltip}><span className="rw-cb-lbl">{o.label}</span></TooltipWrap>
          <UsageStat count={o.count} pct={o.pct} />
        </label>
      ))}
      <label className={`rw-cb-opt${anySelected ? ' on' : ''}`}>
        <input type="checkbox" checked={!!anySelected} onChange={() => {}} readOnly />
        <span className="rw-cb-lbl">{anyLabel}</span>
      </label>
    </div>
  )
}

function RadioList({ options, selected, onSelect }) {
  return (
    <div className="rw-radio-list">
      {options.map(o => (
        <label key={o.id} className={`rw-radio-opt${selected === o.id ? ' on' : ''}`} onClick={() => onSelect(o.id)}>
          <div className="rw-radio-circle">{selected === o.id && <div className="rw-radio-fill" />}</div>
          <TooltipWrap text={o.tooltip}><span className="rw-radio-lbl">{o.label}</span></TooltipWrap>
          {o.pct != null && <UsageStat pct={o.pct} />}
        </label>
      ))}
    </div>
  )
}

function SearchableMS({ options, selected, onChange, placeholder = 'Search…' }) {
  const [q, setQ] = useState('')
  const list = q ? options.filter(o => o.label.toLowerCase().includes(q.toLowerCase())) : options
  const toggle = id => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  return (
    <div className="rw-sms">
      <input className="rw-sms-input" value={q} onChange={e => setQ(e.target.value)} placeholder={placeholder} />
      <div className="rw-sms-list">
        {list.map(o => (
          <label key={o.id} className={`rw-sms-item${selected.includes(o.id) ? ' on' : ''}`}>
            <input type="checkbox" checked={selected.includes(o.id)} onChange={() => toggle(o.id)} />
            <span className="rw-sms-lbl">{o.label}</span>
            <UsageStat count={o.count} pct={o.pct} />
          </label>
        ))}
      </div>
    </div>
  )
}

function AdvCollapse({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rw-adv">
      <button className="rw-adv-toggle" onClick={() => setOpen(o => !o)}>
        <span className="rw-adv-arrow">{open ? '▾' : '▸'}</span>
        <span>{title}</span>
        <span className="rw-adv-badge">Advanced</span>
      </button>
      {open && <div className="rw-adv-body">{children}</div>}
    </div>
  )
}

function PresetGroup({ presets, selected, onSelect }) {
  return (
    <div className="rw-presets">
      {presets.map(p => (
        <button key={p.id} className={`rw-preset${selected === p.id ? ' on' : ''}`} onClick={() => onSelect(selected === p.id ? null : p.id)}>
          {p.label}
        </button>
      ))}
    </div>
  )
}

function WarnBox({ text }) {
  return <div className="rw-warn">{text}</div>
}

// ════════════════════════════════════════════
// TERMINAL SELECTION — shared final step
// ════════════════════════════════════════════

function buildRuleName(method, f, terminals) {
  const t0 = terminals[0]?.displayId || 'Terminal'
  if (method === 'Cards') {
    const net = f.networks?.length > 0 ? f.networks.join('+') : 'Any Network'
    return `Cards ${net} → ${t0}`
  }
  if (method === 'UPIOnetime')  return `UPI Onetime ${f.upiType || 'Any'} → ${t0}`
  if (method === 'UPIRecurring') return `UPI Recurring ${f.recurringType || 'Both'} → ${t0}`
  if (method === 'EMI') {
    const net = f.emiNetworks?.length > 0 ? f.emiNetworks.join('+') : 'Any'
    return `EMI ${net} → ${t0}`
  }
  return `${method} → ${t0}`
}

function buildConditions(method, f) {
  const conds = []
  const mkey = dataKey(method)
  conds.push({ field: 'payment_method', operator: 'equals', value: mkey })
  if (method === 'UPIOnetime')  conds.push({ field: 'upi_subtype', operator: 'equals', value: 'onetime' })
  if (method === 'UPIRecurring') conds.push({ field: 'upi_subtype', operator: 'equals', value: 'recurring' })

  if (method === 'Cards') {
    if (f.networks?.length)     conds.push({ field: 'card_network', operator: 'in', value: f.networks })
    if (f.issuerBanks?.length)  conds.push({ field: 'issuer_bank', operator: 'in', value: f.issuerBanks })
    if (f.cardTypes?.length)    conds.push({ field: 'card_type', operator: 'in', value: f.cardTypes })
    if (f.international === 'Domestic')      conds.push({ field: 'international', operator: 'equals', value: false })
    if (f.international === 'International') conds.push({ field: 'international', operator: 'equals', value: true })
    if (f.tokenizations?.length) conds.push({ field: 'tokenization', operator: 'in', value: f.tokenizations })
    if (f.cardSubtypes?.length)  conds.push({ field: 'card_subtype', operator: 'in', value: f.cardSubtypes })
    const ap = AMOUNT_PRESETS_CARDS.find(x => x.id === f.amountPreset)
    if (ap?.min) conds.push({ field: 'amount', operator: 'greater_than', value: ap.min })
    if (ap?.max) conds.push({ field: 'amount', operator: 'less_than',    value: ap.max })
    if (!ap && f.amountMin) conds.push({ field: 'amount', operator: 'greater_than', value: +f.amountMin })
    if (!ap && f.amountMax) conds.push({ field: 'amount', operator: 'less_than',    value: +f.amountMax })
  }
  if (method === 'UPIOnetime') {
    if (f.upiType && f.upiType !== 'Any') conds.push({ field: 'upi_type', operator: 'equals', value: f.upiType })
    if (f.upiFlows?.length)  conds.push({ field: 'upi_flow', operator: 'in', value: f.upiFlows })
    if (f.vpaHandle && f.vpaHandle !== 'Any') conds.push({ field: 'vpa_handle', operator: 'equals', value: f.vpaHandle })
    const ap = UPI_AMT_PRESETS.find(x => x.id === f.upiAmtPreset)
    if (ap?.min) conds.push({ field: 'amount', operator: 'greater_than', value: ap.min })
    if (ap?.max) conds.push({ field: 'amount', operator: 'less_than',    value: ap.max })
  }
  if (method === 'UPIRecurring') {
    if (f.recurringType && f.recurringType !== 'Both') conds.push({ field: 'recurring_type', operator: 'equals', value: f.recurringType })
    if (f.mandateFreqs?.length) conds.push({ field: 'mandate_frequency', operator: 'in', value: f.mandateFreqs })
    if (f.vpaHandle && f.vpaHandle !== 'Any') conds.push({ field: 'vpa_handle', operator: 'equals', value: f.vpaHandle })
    const ap = MANDATE_AMT_PRESETS.find(x => x.id === f.mandateAmtPreset)
    if (ap?.min) conds.push({ field: 'mandate_amount', operator: 'greater_than', value: ap.min })
    if (ap?.max) conds.push({ field: 'mandate_amount', operator: 'less_than',    value: ap.max })
  }
  if (method === 'EMI') {
    if (f.emiNetworks?.length)   conds.push({ field: 'card_network', operator: 'in', value: f.emiNetworks })
    if (f.emiDurations?.length)  conds.push({ field: 'emi_tenure', operator: 'in', value: f.emiDurations })
    if (f.emiIssuers?.length)    conds.push({ field: 'issuer_bank', operator: 'in', value: f.emiIssuers })
    if (f.subventionType)        conds.push({ field: 'subvention_type', operator: 'equals', value: f.subventionType })
    if (f.emiCardTypes?.length)  conds.push({ field: 'card_type', operator: 'in', value: f.emiCardTypes })
    const ap = EMI_AMT_PRESETS.find(x => x.id === f.emiAmtPreset)
    if (ap?.min) conds.push({ field: 'amount', operator: 'greater_than', value: ap.min })
    if (ap?.max) conds.push({ field: 'amount', operator: 'less_than',    value: ap.max })
  }
  return conds
}

function FilterSummary({ method, f }) {
  const badges = []
  if (method === 'Cards') {
    if (f.networks?.length)    f.networks.forEach(n => badges.push({ label: n, v: 'blue' }))
    else                       badges.push({ label: 'Any Network', v: 'gray' })
    if (f.issuerBanks?.length) badges.push({ label: `${f.issuerBanks.length} issuers`, v: 'blue' })
    if (f.cardTypes?.length)   f.cardTypes.forEach(t => badges.push({ label: t, v: 'blue' }))
    if (f.international !== 'Both') badges.push({ label: f.international, v: 'warn' })
    if (f.amountPreset)        badges.push({ label: AMOUNT_PRESETS_CARDS.find(x => x.id === f.amountPreset)?.label, v: 'gray' })
  }
  if (method === 'UPIOnetime') {
    badges.push({ label: f.upiType || 'Any Type', v: 'blue' })
    if (f.upiFlows?.length)  badges.push({ label: f.upiFlows.join(', '), v: 'blue' })
    if (f.vpaHandle && f.vpaHandle !== 'Any') badges.push({ label: f.vpaHandle, v: 'blue' })
  }
  if (method === 'UPIRecurring') {
    badges.push({ label: f.recurringType || 'Both', v: 'blue' })
    if (f.mandateFreqs?.length) badges.push({ label: f.mandateFreqs.join(', '), v: 'blue' })
    if (f.vpaHandle && f.vpaHandle !== 'Any') badges.push({ label: f.vpaHandle, v: 'blue' })
  }
  if (method === 'EMI') {
    if (f.emiNetworks?.length)  f.emiNetworks.forEach(n => badges.push({ label: n, v: 'blue' }))
    else                        badges.push({ label: 'Any Network', v: 'gray' })
    if (f.emiDurations?.length) badges.push({ label: f.emiDurations.map(d => `${d}mo`).join(', '), v: 'blue' })
    if (f.subventionType)       badges.push({ label: f.subventionType, v: 'blue' })
    if (f.emiAmtPreset)         badges.push({ label: EMI_AMT_PRESETS.find(x => x.id === f.emiAmtPreset)?.label, v: 'gray' })
  }
  return (
    <div className="rw-filter-summary">
      <span className="rw-filter-title">Applies to:</span>
      {badges.filter(b => b.label).map((b, i) => <span key={i} className={`rw-filter-badge ${b.v}`}>{b.label}</span>)}
    </div>
  )
}

function TerminalStep({ merchant, method, filters, rules, addRule, onBack }) {
  const allTerminals = useMemo(() =>
    merchant.gatewayMetrics
      .filter(gm => (gm.supportedMethods || []).includes(dataKey(method)))
      .map(gm => {
        const gw   = gateways.find(g => g.id === gm.gatewayId)
        const term = gw?.terminals.find(t => t.id === gm.terminalId)
        return { id: gm.terminalId, displayId: term?.terminalId || gm.terminalId, gatewayShort: gw?.shortName || '?', successRate: gm.successRate, costPerTxn: gm.costPerTxn }
      }), [merchant, method])

  const [mode, setMode]           = useState('priority')
  const [order, setOrder]         = useState(() => [...allTerminals].sort((a, b) => b.successRate - a.successRate))
  const [selectedIds, setSelected] = useState(() => allTerminals.map(t => t.id))
  const [loads, setLoads]         = useState(() => {
    const m = {}; allTerminals.forEach((t, i) => { m[t.id] = i === 0 ? 100 : 0 }); return m
  })
  const [srThresh, setSrThresh]   = useState(() => {
    const m = {}; allTerminals.forEach(t => { m[t.id] = Math.max(70, Math.floor(t.successRate - 3)) }); return m
  })
  const [fallbackId, setFallback] = useState(() => {
    const sorted = [...allTerminals].sort((a, b) => b.successRate - a.successRate)
    return sorted[sorted.length - 1]?.id || null
  })
  const [dragIdx, setDragIdx]     = useState(null)
  const [saved, setSaved]         = useState(null)

  const selectedTerminals = order.filter(t => selectedIds.includes(t.id))
  const loadTotal = selectedIds.reduce((s, id) => s + (loads[id] || 0), 0)
  const loadValid = Math.abs(loadTotal - 100) < 1

  const handleDragStart = (e, i) => { setDragIdx(i); e.dataTransfer.effectAllowed = 'move' }
  const handleDragOver  = (e, i) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === i) return
    const next = [...order]; const [m] = next.splice(dragIdx, 1); next.splice(i, 0, m)
    setOrder(next); setDragIdx(i)
  }

  const handleSave = () => {
    const conditions = buildConditions(method, filters)
    const rule = {
      id: `rule-${merchant.id}-rw-${Date.now()}`,
      name: buildRuleName(method, filters, selectedTerminals),
      type: mode === 'load' ? 'volume_split' : 'conditional',
      enabled: true,
      priority: (rules?.filter(r => !r.isDefault && !r.isMethodDefault).length || 0) + 1,
      conditions, conditionLogic: 'AND',
      action: {
        type: mode === 'load' ? 'split' : 'route',
        terminals: selectedTerminals.map(t => t.id),
        splits: mode === 'load' ? selectedTerminals.map(t => ({ terminalId: t.id, percentage: loads[t.id] || 0 })) : [],
        srThreshold: srThresh[selectedTerminals[0]?.id] || 90,
        fallbackTerminal: fallbackId,
      },
      isDefault: false,
      createdAt: new Date().toISOString(),
      createdBy: 'anugrah.sharma@razorpay.com',
    }
    addRule?.(rule)
    setSaved(rule)
  }

  if (saved) {
    const dailyVol = Math.round((merchant?.txnVolumeHistory?.currentMonth || 30000) / 30)
    const zeroCost = selectedTerminals.filter(t => t.costPerTxn === 0)
    const paid     = selectedTerminals.filter(t => t.costPerTxn > 0)
    const savings  = zeroCost.length && paid.length
      ? `Routing to ${zeroCost[0].displayId} first saves ₹${paid[0].costPerTxn}/txn vs ${paid[0].displayId} — ~₹${(paid[0].costPerTxn * dailyVol).toLocaleString()}/day at current volume.`
      : null
    return (
      <div className="rw-success">
        <div className="rw-success-icon">✓</div>
        <div className="rw-success-title">Rule Saved</div>
        <div className="rw-success-name">{saved.name}</div>
        <div className="rw-cascade-preview">
          {selectedTerminals.map((t, i) => (
            <React.Fragment key={t.id}>
              <div className={`rw-cascade-row${i === 0 ? ' primary' : ''}`}>
                <span className="rw-cascade-rank">#{i + 1}</span>
                <span className="rw-cascade-term">{t.displayId}</span>
                <span className="rw-cascade-gw">{t.gatewayShort}</span>
                <span style={{ color: t.successRate >= 90 ? '#059669' : '#d97706', fontWeight: 600, fontSize: 12 }}>SR {t.successRate}%</span>
                <span style={{ fontSize: 11, color: t.costPerTxn === 0 ? '#059669' : '#64748b' }}>{t.costPerTxn === 0 ? '₹0' : `₹${t.costPerTxn}/txn`}</span>
              </div>
              {i < selectedTerminals.length - 1 && (
                <div className="rw-cascade-arrow">↓ fallback if SR &lt; {srThresh[t.id] || 90}%</div>
              )}
            </React.Fragment>
          ))}
        </div>
        {savings && <div className="rw-savings-note">💰 {savings}</div>}
      </div>
    )
  }

  return (
    <div className="rw-term-step">
      <FilterSummary method={method} f={filters} />
      <div className="rw-match" style={{ marginBottom: 10 }}>
        <span className="rw-match-dot" />
        <span><strong>{allTerminals.length}</strong> matching terminals</span>
      </div>

      <div className="rw-mode-row">
        <button className={`rw-mode-btn${mode === 'priority' ? ' on' : ''}`} onClick={() => setMode('priority')}>Priority-based</button>
        <button className={`rw-mode-btn${mode === 'load' ? ' on' : ''}`} onClick={() => setMode('load')}>Load-balanced</button>
      </div>

      <div className="rw-term-list">
        {order.map((t, i) => (
          <div
            key={t.id}
            className={`rw-term-row${selectedIds.includes(t.id) ? ' sel' : ' unsel'}${dragIdx === i ? ' drag' : ''}`}
            draggable={mode === 'priority'}
            onDragStart={e => handleDragStart(e, i)}
            onDragOver={e => handleDragOver(e, i)}
            onDragEnd={() => setDragIdx(null)}
          >
            <div className="rw-term-left">
              <input type="checkbox" checked={selectedIds.includes(t.id)} onChange={() => setSelected(p => p.includes(t.id) ? p.filter(x => x !== t.id) : [...p, t.id])} />
              {mode === 'priority' && <span className="rw-term-drag">⠿</span>}
              <div>
                <div className="rw-term-id">{t.displayId}</div>
                <div className="rw-term-gw">{t.gatewayShort}</div>
              </div>
            </div>
            <div className="rw-term-right">
              <span className="rw-term-sr" style={{ color: t.successRate >= 90 ? '#059669' : '#d97706' }}>SR {t.successRate}%</span>
              <span className="rw-term-cost">{t.costPerTxn === 0 ? <span style={{ color: '#059669' }}>₹0</span> : `₹${t.costPerTxn}`}</span>
              {mode === 'load' && selectedIds.includes(t.id) && (
                <div className="rw-load-wrap">
                  <input type="number" min="0" max="100" className="rw-load-inp" value={loads[t.id] || 0} onChange={e => setLoads(p => ({ ...p, [t.id]: Math.max(0, Math.min(100, +e.target.value)) }))} />
                  <span>%</span>
                </div>
              )}
              {mode === 'priority' && selectedIds.includes(t.id) && i < order.length - 1 && (
                <div className="rw-sr-wrap">
                  <span className="rw-sr-lbl">Fallback if SR &lt;</span>
                  <input type="number" min="50" max="99" className="rw-sr-inp" value={srThresh[t.id] || 90} onChange={e => setSrThresh(p => ({ ...p, [t.id]: +e.target.value }))} />
                  <span>%</span>
                </div>
              )}
              {mode === 'priority' && i === order.length - 1 && <span className="rw-final-badge">Final fallback</span>}
            </div>
          </div>
        ))}
      </div>

      {mode === 'load' && (
        <div className={`rw-load-total${loadValid ? ' ok' : ' err'}`}>
          Load total: <strong>{loadTotal}%</strong>
          {loadValid ? ' ✓' : ' — must equal 100%'}
        </div>
      )}

      {mode === 'priority' && selectedTerminals.length > 1 && (
        <div className="rw-fallback-row">
          <span className="rw-fallback-lbl">Final fallback:</span>
          <select className="rw-fallback-sel" value={fallbackId || ''} onChange={e => setFallback(e.target.value)}>
            {selectedTerminals.map(t => <option key={t.id} value={t.id}>{t.displayId} ({t.gatewayShort})</option>)}
          </select>
        </div>
      )}

      <div className="rw-footer" style={{ marginTop: 14 }}>
        <button className="rw-btn ghost" onClick={onBack}>← Back</button>
        <button
          className="rw-btn primary"
          disabled={selectedIds.length === 0 || (mode === 'load' && !loadValid)}
          onClick={handleSave}
        >
          ✓ Save Rule
        </button>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════
// CARDS WIZARD
// ════════════════════════════════════════════

function CardsWizard({ merchant, method, rules, addRule, onClose }) {
  const steps = getSteps(method)
  const [step, setStep] = useState(0)
  const [f, setF] = useState({
    networks: [], issuerBanks: [], cardTypes: [],
    international: 'Both', tokenizations: [], cardSubtypes: [],
    amountPreset: null, amountMin: '', amountMax: '',
  })
  const upd = (k, v) => setF(p => ({ ...p, [k]: v }))
  const tog = (k, id) => setF(p => ({ ...p, [k]: p[k].includes(id) ? p[k].filter(x => x !== id) : [...p[k], id] }))

  const termCount = useMemo(() =>
    merchant.gatewayMetrics.filter(gm => (gm.supportedMethods || []).includes('Cards')).length,
    [merchant])

  const rupayIntlWarn = f.networks.includes('RuPay') && f.international === 'International'

  if (step === steps.length - 1) {
    return (
      <div className="rw-wizard">
        <WizardStepper steps={steps} currentStep={step} />
        <div className="rw-wz-body">
          <TerminalStep merchant={merchant} method={method} filters={f} rules={rules} addRule={addRule} onBack={() => setStep(step - 1)} />
        </div>
      </div>
    )
  }

  return (
    <div className="rw-wizard">
      <WizardStepper steps={steps} currentStep={step} />
      <div className="rw-wz-body">

        {/* Step 0 — Card Network (REQUIRED) */}
        {step === 0 && (
          <>
            <StepHdr title="Card Network" required sub="Select one or more networks this rule applies to." />
            <CheckboxGrid
              options={CARDS_NETWORKS}
              selected={f.networks}
              onToggle={id => tog('networks', id)}
              anyLabel="Any Network"
              anySelected={f.networks.length === 0}
            />
            {rupayIntlWarn && <WarnBox text="⚠ RuPay does not support International — this combination will match no payments." />}
            <MatchCount count={termCount} />
            <WzFooter onCancel={onClose} onNext={() => setStep(1)} nextLabel={f.networks.length === 0 ? 'Any Network — Next →' : `${f.networks.length} selected — Next →`} />
          </>
        )}

        {/* Step 1 — Issuer Bank (OPTIONAL) */}
        {step === 1 && (
          <>
            <StepHdr title="Issuer Bank" optional sub="Filter by card-issuing bank. Empty = any issuer." />
            <SearchableMS options={ISSUER_BANKS} selected={f.issuerBanks} onChange={v => upd('issuerBanks', v)} placeholder="Search bank…" />
            <MatchCount count={termCount} />
            <WzFooter onBack={() => setStep(0)} onSkip={() => setStep(2)} onNext={() => setStep(2)} nextLabel={f.issuerBanks.length ? `${f.issuerBanks.length} selected — Next →` : 'Any Issuer — Next →'} />
          </>
        )}

        {/* Step 2 — Card Type (OPTIONAL) */}
        {step === 2 && (
          <>
            <StepHdr title="Card Type" optional sub="Credit, Debit, or Prepaid. Empty = any type." />
            <CheckboxGrid
              options={CARD_TYPES}
              selected={f.cardTypes}
              onToggle={id => tog('cardTypes', id)}
              anyLabel="Any Type"
              anySelected={f.cardTypes.length === 0}
            />
            <MatchCount count={termCount} />
            <WzFooter onBack={() => setStep(1)} onSkip={() => setStep(3)} onNext={() => setStep(3)} nextLabel="Next →" />
          </>
        )}

        {/* Step 3 — Geography (OPTIONAL) */}
        {step === 3 && (
          <>
            <StepHdr title="Geography" optional sub="Domestic Only, International Only, or Both." />
            <RadioList
              options={[
                { id: 'Domestic',      label: 'Domestic Only',     pct: 22.7 },
                { id: 'International', label: 'International Only', pct: 8.4  },
                { id: 'Both',          label: 'Both (default)',     pct: null  },
              ]}
              selected={f.international}
              onSelect={v => upd('international', v)}
            />
            {rupayIntlWarn && <WarnBox text="⚠ RuPay + International = no payments matched." />}
            <MatchCount count={f.international === 'International' && f.networks.includes('RuPay') ? 0 : termCount} />
            <WzFooter onBack={() => setStep(2)} onSkip={() => setStep(4)} onNext={() => setStep(4)} nextLabel="Next →" />
          </>
        )}

        {/* Step 4 — Advanced (collapsed) */}
        {step === 4 && (
          <>
            <StepHdr title="Advanced Options" sub="Optional fine-grained filters — all collapsed by default." />
            <AdvCollapse title="Tokenization">
              <CheckboxGrid
                options={TOKENIZATIONS}
                selected={f.tokenizations}
                onToggle={id => tog('tokenizations', id)}
                anyLabel="Any Vault"
                anySelected={f.tokenizations.length === 0}
              />
            </AdvCollapse>
            <AdvCollapse title="Card Sub-type">
              <CheckboxGrid
                options={CARD_SUBTYPES}
                selected={f.cardSubtypes}
                onToggle={id => tog('cardSubtypes', id)}
                anyLabel="Any Sub-type"
                anySelected={f.cardSubtypes.length === 0}
              />
            </AdvCollapse>
            <AdvCollapse title="Amount Range">
              <PresetGroup presets={AMOUNT_PRESETS_CARDS} selected={f.amountPreset} onSelect={v => upd('amountPreset', v)} />
              {!f.amountPreset && (
                <div className="rw-amt-custom">
                  <span>Min ₹</span><input type="number" className="rw-amt-inp" placeholder="0" value={f.amountMin} onChange={e => upd('amountMin', e.target.value)} />
                  <span>Max ₹</span><input type="number" className="rw-amt-inp" placeholder="∞" value={f.amountMax} onChange={e => upd('amountMax', e.target.value)} />
                </div>
              )}
            </AdvCollapse>
            <MatchCount count={termCount} />
            <WzFooter onBack={() => setStep(3)} onNext={() => setStep(5)} nextLabel="Select Terminals →" />
          </>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════
// UPI ONETIME WIZARD
// ════════════════════════════════════════════

function UPIOnetimeWizard({ merchant, method, rules, addRule, onClose }) {
  const steps = getSteps(method)
  const [step, setStep] = useState(0)
  const [f, setF] = useState({ upiType: 'Any', upiFlows: [], vpaHandle: 'Any', upiAmtPreset: null })
  const upd = (k, v) => setF(p => ({ ...p, [k]: v }))
  const tog = (k, id) => setF(p => ({ ...p, [k]: p[k].includes(id) ? p[k].filter(x => x !== id) : [...p[k], id] }))
  const termCount = useMemo(() => merchant.gatewayMetrics.filter(gm => (gm.supportedMethods || []).includes('UPI')).length, [merchant])

  if (step === steps.length - 1) {
    return (
      <div className="rw-wizard">
        <WizardStepper steps={steps} currentStep={step} />
        <div className="rw-wz-body">
          <TerminalStep merchant={merchant} method={method} filters={f} rules={rules} addRule={addRule} onBack={() => setStep(step - 1)} />
        </div>
      </div>
    )
  }

  return (
    <div className="rw-wizard">
      <WizardStepper steps={steps} currentStep={step} />
      <div className="rw-wz-body">

        {/* Step 0 — UPI Type (REQUIRED) */}
        {step === 0 && (
          <>
            <StepHdr title="UPI Type" required sub="Select the UPI payment type for this rule." />
            <RadioList options={UPI_TYPES} selected={f.upiType} onSelect={v => upd('upiType', v)} />
            <MatchCount count={termCount} />
            <WzFooter onCancel={onClose} onNext={() => setStep(1)} nextLabel="Next →" />
          </>
        )}

        {/* Step 1 — UPI Flow (OPTIONAL) */}
        {step === 1 && (
          <>
            <StepHdr title="UPI Flow" optional sub="Multi-select specific flows. Empty = any flow." />
            <CheckboxGrid
              options={UPI_FLOWS}
              selected={f.upiFlows}
              onToggle={id => tog('upiFlows', id)}
              anyLabel="Any Flow"
              anySelected={f.upiFlows.length === 0}
            />
            <MatchCount count={termCount} />
            <WzFooter onBack={() => setStep(0)} onSkip={() => setStep(2)} onNext={() => setStep(2)} nextLabel="Next →" />
          </>
        )}

        {/* Step 2 — VPA Handle (OPTIONAL) */}
        {step === 2 && (
          <>
            <StepHdr title="VPA Handle" optional sub="Filter by UPI VPA suffix. Select one or leave as Any." />
            <div className="rw-vpa-grid">
              {VPA_HANDLES.map(h => (
                <button key={h.id} className={`rw-vpa-opt${f.vpaHandle === h.id ? ' on' : ''}`} onClick={() => upd('vpaHandle', f.vpaHandle === h.id ? 'Any' : h.id)}>
                  <span className="rw-vpa-label">{h.label}</span>
                  <UsageStat pct={h.pct} />
                </button>
              ))}
              <button className={`rw-vpa-opt${f.vpaHandle === 'Any' ? ' on' : ''}`} onClick={() => upd('vpaHandle', 'Any')}>
                <span className="rw-vpa-label">Any Handle</span>
              </button>
            </div>
            <MatchCount count={termCount} />
            <WzFooter onBack={() => setStep(1)} onSkip={() => setStep(3)} onNext={() => setStep(3)} nextLabel="Next →" />
          </>
        )}

        {/* Step 3 — Amount (ADVANCED) */}
        {step === 3 && (
          <>
            <StepHdr title="Advanced Options" sub="Optional amount filter." />
            <AdvCollapse title="Amount Range">
              <PresetGroup presets={UPI_AMT_PRESETS} selected={f.upiAmtPreset} onSelect={v => upd('upiAmtPreset', v)} />
            </AdvCollapse>
            <MatchCount count={termCount} />
            <WzFooter onBack={() => setStep(2)} onNext={() => setStep(4)} nextLabel="Select Terminals →" />
          </>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════
// UPI RECURRING WIZARD
// ════════════════════════════════════════════

function UPIRecurringWizard({ merchant, method, rules, addRule, onClose }) {
  const steps = getSteps(method)
  const [step, setStep] = useState(0)
  const [f, setF] = useState({ recurringType: 'Both', mandateFreqs: [], vpaHandle: 'Any', mandateAmtPreset: null })
  const upd = (k, v) => setF(p => ({ ...p, [k]: v }))
  const tog = (k, id) => setF(p => ({ ...p, [k]: p[k].includes(id) ? p[k].filter(x => x !== id) : [...p[k], id] }))
  const termCount = useMemo(() => merchant.gatewayMetrics.filter(gm => (gm.supportedMethods || []).includes('UPI')).length, [merchant])

  const freqApplies = f.recurringType === 'Auto-debit' || f.recurringType === 'Both'

  if (step === steps.length - 1) {
    return (
      <div className="rw-wizard">
        <WizardStepper steps={steps} currentStep={step} />
        <div className="rw-wz-body">
          <TerminalStep merchant={merchant} method={method} filters={f} rules={rules} addRule={addRule} onBack={() => setStep(step - 1)} />
        </div>
      </div>
    )
  }

  return (
    <div className="rw-wizard">
      <WizardStepper steps={steps} currentStep={step} />
      <div className="rw-wz-body">

        {/* Step 0 — Recurring Type (REQUIRED) */}
        {step === 0 && (
          <>
            <StepHdr title="Recurring Type" required sub="Select which part of the recurring payment lifecycle this rule covers." />
            <RadioList options={RECURRING_TYPES} selected={f.recurringType} onSelect={v => upd('recurringType', v)} />
            <MatchCount count={termCount} />
            <WzFooter onCancel={onClose} onNext={() => setStep(1)} nextLabel="Next →" />
          </>
        )}

        {/* Step 1 — Mandate Frequency (OPTIONAL, conditional) */}
        {step === 1 && (
          <>
            <StepHdr title="Mandate Frequency" optional sub={freqApplies ? 'Filter by recurring frequency.' : 'Not applicable for Initial Payment type.'} />
            {freqApplies ? (
              <CheckboxGrid
                options={MANDATE_FREQS}
                selected={f.mandateFreqs}
                onToggle={id => tog('mandateFreqs', id)}
                anyLabel="Any Frequency"
                anySelected={f.mandateFreqs.length === 0}
              />
            ) : (
              <div className="rw-na-box">Mandate frequency filters apply only to Auto-debit and Both. <button className="rw-link" onClick={() => setStep(0)}>← Change type</button></div>
            )}
            <MatchCount count={termCount} />
            <WzFooter onBack={() => setStep(0)} onSkip={() => setStep(2)} onNext={() => setStep(2)} nextLabel="Next →" />
          </>
        )}

        {/* Step 2 — VPA Handle (OPTIONAL) */}
        {step === 2 && (
          <>
            <StepHdr title="VPA Handle" optional sub="Filter by VPA suffix (optional)." />
            <div className="rw-vpa-grid">
              {VPA_HANDLES.map(h => (
                <button key={h.id} className={`rw-vpa-opt${f.vpaHandle === h.id ? ' on' : ''}`} onClick={() => upd('vpaHandle', f.vpaHandle === h.id ? 'Any' : h.id)}>
                  <span className="rw-vpa-label">{h.label}</span>
                  <UsageStat pct={h.pct} />
                </button>
              ))}
              <button className={`rw-vpa-opt${f.vpaHandle === 'Any' ? ' on' : ''}`} onClick={() => upd('vpaHandle', 'Any')}>
                <span className="rw-vpa-label">Any Handle</span>
              </button>
            </div>
            <MatchCount count={termCount} />
            <WzFooter onBack={() => setStep(1)} onSkip={() => setStep(3)} onNext={() => setStep(3)} nextLabel="Next →" />
          </>
        )}

        {/* Step 3 — Advanced (Max Mandate Amount) */}
        {step === 3 && (
          <>
            <StepHdr title="Advanced Options" sub="Optional max mandate amount filter." />
            <AdvCollapse title="Max Mandate Amount">
              <PresetGroup presets={MANDATE_AMT_PRESETS} selected={f.mandateAmtPreset} onSelect={v => upd('mandateAmtPreset', v)} />
            </AdvCollapse>
            <MatchCount count={termCount} />
            <WzFooter onBack={() => setStep(2)} onNext={() => setStep(4)} nextLabel="Select Terminals →" />
          </>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════
// EMI WIZARD
// ════════════════════════════════════════════

function EMIWizard({ merchant, method, rules, addRule, onClose }) {
  const steps = getSteps(method)
  const [step, setStep] = useState(0)
  const [f, setF] = useState({
    emiNetworks: [], emiDurations: [], emiIssuers: [],
    subventionType: null, emiCardTypes: [], emiAmtPreset: null,
  })
  const upd = (k, v) => setF(p => ({ ...p, [k]: v }))
  const tog = (k, id) => setF(p => ({ ...p, [k]: p[k].includes(id) ? p[k].filter(x => x !== id) : [...p[k], id] }))
  const termCount = useMemo(() => merchant.gatewayMetrics.filter(gm => (gm.supportedMethods || []).includes('EMI')).length, [merchant])

  const debitEmiWarn = f.emiCardTypes.includes('debit')

  if (step === steps.length - 1) {
    return (
      <div className="rw-wizard">
        <WizardStepper steps={steps} currentStep={step} />
        <div className="rw-wz-body">
          <TerminalStep merchant={merchant} method={method} filters={f} rules={rules} addRule={addRule} onBack={() => setStep(step - 1)} />
        </div>
      </div>
    )
  }

  return (
    <div className="rw-wizard">
      <WizardStepper steps={steps} currentStep={step} />
      <div className="rw-wz-body">

        {/* Step 0 — Card Network (REQUIRED) */}
        {step === 0 && (
          <>
            <StepHdr title="Card Network" required sub="Select which networks this EMI rule covers." />
            <CheckboxGrid
              options={EMI_NETWORKS}
              selected={f.emiNetworks}
              onToggle={id => tog('emiNetworks', id)}
              anyLabel="Any Network"
              anySelected={f.emiNetworks.length === 0}
            />
            <MatchCount count={termCount} />
            <WzFooter onCancel={onClose} onNext={() => setStep(1)} nextLabel={f.emiNetworks.length === 0 ? 'Any Network — Next →' : `${f.emiNetworks.length} selected — Next →`} />
          </>
        )}

        {/* Step 1 — EMI Duration (REQUIRED) */}
        {step === 1 && (
          <>
            <StepHdr title="EMI Duration" required sub="Select one or more tenure options." />
            <CheckboxGrid
              options={EMI_DURATIONS}
              selected={f.emiDurations}
              onToggle={id => tog('emiDurations', id)}
              anyLabel="Any Duration"
              anySelected={f.emiDurations.length === 0}
            />
            <MatchCount count={termCount} />
            <WzFooter onBack={() => setStep(0)} onNext={() => setStep(2)} nextLabel={f.emiDurations.length === 0 ? 'Any Duration — Next →' : `${f.emiDurations.length} selected — Next →`} />
          </>
        )}

        {/* Step 2 — Issuer Bank (OPTIONAL) */}
        {step === 2 && (
          <>
            <StepHdr title="Issuer Bank" optional sub="Filter by card-issuing bank." />
            <SearchableMS options={EMI_ISSUER_BANKS} selected={f.emiIssuers} onChange={v => upd('emiIssuers', v)} placeholder="Search bank…" />
            <MatchCount count={termCount} />
            <WzFooter onBack={() => setStep(1)} onSkip={() => setStep(3)} onNext={() => setStep(3)} nextLabel={f.emiIssuers.length ? `${f.emiIssuers.length} selected — Next →` : 'Any Issuer — Next →'} />
          </>
        )}

        {/* Step 3 — Subvention Type (OPTIONAL) */}
        {step === 3 && (
          <>
            <StepHdr title="Subvention Type" optional sub="Who bears the EMI interest cost?" />
            <RadioList
              options={[...SUBVENTION_TYPES, { id: null, label: 'Any Subvention', pct: null }]}
              selected={f.subventionType}
              onSelect={v => upd('subventionType', v)}
            />
            <MatchCount count={termCount} />
            <WzFooter onBack={() => setStep(2)} onSkip={() => setStep(4)} onNext={() => setStep(4)} nextLabel="Next →" />
          </>
        )}

        {/* Step 4 — Advanced */}
        {step === 4 && (
          <>
            <StepHdr title="Advanced Options" sub="Optional card type and amount filters." />
            <AdvCollapse title="Card Type">
              <CheckboxGrid
                options={[
                  { id: 'credit', label: 'Credit', pct: 72.7 },
                  { id: 'debit',  label: 'Debit',  pct: 14.3 },
                ]}
                selected={f.emiCardTypes}
                onToggle={id => tog('emiCardTypes', id)}
                anyLabel="Any Card Type"
                anySelected={f.emiCardTypes.length === 0}
              />
              {debitEmiWarn && <WarnBox text="⚠ Debit card EMI has very limited bank support — ensure terminal specifically supports debit EMI." />}
            </AdvCollapse>
            <AdvCollapse title="Amount Range">
              <PresetGroup presets={EMI_AMT_PRESETS} selected={f.emiAmtPreset} onSelect={v => upd('emiAmtPreset', v)} />
            </AdvCollapse>
            <MatchCount count={termCount} />
            <WzFooter onBack={() => setStep(3)} onNext={() => setStep(5)} nextLabel="Select Terminals →" />
          </>
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════
// MAIN EXPORT — picks the right wizard
// ════════════════════════════════════════════

export default function CreateRuleWizard({ merchant, method, rules, addRule, onClose }) {
  if (method === 'Cards')       return <CardsWizard       merchant={merchant} method={method} rules={rules} addRule={addRule} onClose={onClose} />
  if (method === 'UPIOnetime')  return <UPIOnetimeWizard  merchant={merchant} method={method} rules={rules} addRule={addRule} onClose={onClose} />
  if (method === 'UPIRecurring')return <UPIRecurringWizard merchant={merchant} method={method} rules={rules} addRule={addRule} onClose={onClose} />
  if (method === 'EMI')         return <EMIWizard          merchant={merchant} method={method} rules={rules} addRule={addRule} onClose={onClose} />
  return <div className="gc-info-box">Wizard not available for this method.</div>
}
