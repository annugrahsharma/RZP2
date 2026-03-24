import React, { useState, useMemo, useCallback } from 'react'
import { gateways, simulateRoutingPipeline, toCompassDocument, buildCompassESQuery, buildCompassRuntimeAnnotation, compassMethodKey, flattenConditions } from '../../data/kamMockData'

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

// ════════════════════════════════════════════
// RULE IMPACT ANALYSIS HELPERS
// ════════════════════════════════════════════

function generateImpactedFlows(method, filters, monthlyTxns) {
  const dailyTxns = Math.round(monthlyTxns / 30)
  const flows = []

  if (method === 'Cards') {
    const nets  = filters.networks?.length   ? filters.networks   : ['Visa', 'Mastercard', 'RuPay']
    const types = filters.cardTypes?.length  ? filters.cardTypes  : ['credit', 'debit']
    const intls = filters.international === 'Domestic'      ? [false]
                : filters.international === 'International' ? [true]
                : [false, true]

    let count = 0
    for (const net of nets) {
      for (const ct of types) {
        for (const intl of intls) {
          if (count >= 6) break
          if (net === 'RuPay' && intl) continue
          const netShare  = net === 'Visa' ? 0.34 : net === 'Mastercard' ? 0.34 : net === 'RuPay' ? 0.21 : 0.05
          const typeShare = ct === 'credit' ? 0.39 : ct === 'debit' ? 0.37 : 0.04
          const intlShare = intl ? 0.23 : 0.77
          const volEst = Math.round(dailyTxns * netShare * typeShare * intlShare)
          flows.push({
            id: `flow-${flows.length}`,
            label: `${net} ${ct.charAt(0).toUpperCase() + ct.slice(1)} ${intl ? 'International' : 'Domestic'}`,
            txn: {
              payment_method: 'Cards',
              card_network: net,
              card_type: ct,
              international: intl,
              amount: intl ? 25000 : 5000,
              issuer_bank: filters.issuerBanks?.[0] || null,
            },
            dailyVol: Math.max(volEst, 1),
          })
          count++
        }
      }
    }
  } else if (method === 'UPIOnetime' || method === 'UPIRecurring') {
    const subtype = method === 'UPIRecurring' ? 'recurring' : 'onetime'
    const upiTypes = filters.upiType && filters.upiType !== 'Any' ? [filters.upiType] : ['Collect', 'Intent', 'QR']
    for (const ut of upiTypes.slice(0, 4)) {
      const share = ut === 'Collect' ? 0.36 : ut === 'Intent' ? 0.27 : ut === 'QR' ? 0.22 : 0.15
      flows.push({
        id: `flow-${flows.length}`,
        label: `UPI ${ut} (${subtype})`,
        txn: { payment_method: 'UPI', upi_subtype: subtype, upi_type: ut, amount: 2500 },
        dailyVol: Math.max(Math.round(dailyTxns * share), 1),
      })
    }
  } else if (method === 'EMI') {
    const nets = filters.emiNetworks?.length ? filters.emiNetworks : ['Visa', 'Mastercard']
    for (const net of nets.slice(0, 3)) {
      flows.push({
        id: `flow-${flows.length}`,
        label: `EMI ${net} Credit`,
        txn: { payment_method: 'EMI', card_network: net, card_type: 'credit', international: false, amount: 25000 },
        dailyVol: Math.max(Math.round(dailyTxns * 0.08), 1),
      })
    }
  } else {
    flows.push({
      id: 'flow-0',
      label: `${method} (all)`,
      txn: { payment_method: method, amount: 5000 },
      dailyVol: dailyTxns,
    })
  }

  return flows.length ? flows : [{
    id: 'flow-0',
    label: `${method} (all)`,
    txn: { payment_method: dataKey(method), amount: 5000 },
    dailyVol: dailyTxns,
  }]
}

// ── Mini pipeline renderer (before/after traces) ────────────────
function ImpactPipelineTrace({ result, label }) {
  if (!result) return null
  const stages = result.stages || []
  return (
    <div className="rw-impact-pipeline">
      <div className="rw-impact-pipeline-hdr">
        <span className="rw-impact-pipeline-label">{label}</span>
        {result.isNTF
          ? <span className="rw-impact-pip-badge ntf">NTF — payment fails</span>
          : <span className="rw-impact-pip-badge ok">→ {result.selectedTerminal?.displayId} · SR {result.selectedTerminal?.successRate}%</span>
        }
      </div>
      {stages.map((stage, i) => {
        const isNTF    = stage.type === 'ntf' || stage.type === 'rule_ntf'
        const isFilter = stage.type === 'rule_filter'
        const isSorter = stage.type === 'sorter'
        const isPass   = stage.type === 'rule_pass'
        return (
          <div key={i} className={`rw-impact-pip-stage${isNTF ? ' ntf' : isFilter ? ' filter' : isSorter ? ' sorter' : isPass ? ' pass' : ''}`}>
            <div className="rw-impact-pip-num">{i + 1}</div>
            <div className="rw-impact-pip-body">
              <div className="rw-impact-pip-stage-label">{stage.label}</div>
              <div className="rw-impact-pip-desc">{stage.description}</div>
              {(stage.terminalsRemaining || []).length > 0 && (
                <div className="rw-impact-pip-chips">
                  {stage.terminalsRemaining.map(t => (
                    <span key={t.terminalId} className="rw-impact-pip-chip pass">{t.displayId} <span className="rw-impact-pip-chip-sr">{t.successRate}%</span></span>
                  ))}
                </div>
              )}
              {(stage.terminalsEliminated || []).length > 0 && (
                <div className="rw-impact-pip-chips">
                  {stage.terminalsEliminated.map(t => (
                    <span key={t.terminalId} className="rw-impact-pip-chip fail">{t.displayId} <em className="rw-impact-pip-chip-sr">{t.reason}</em></span>
                  ))}
                </div>
              )}
              {isSorter && stage.scored && (
                <div className="rw-impact-pip-scores">
                  {stage.scored.map((t, si) => (
                    <div key={t.terminalId} className={`rw-impact-pip-score-row${t.isSelected ? ' selected' : ''}`}>
                      <span className="rw-impact-pip-rank">#{si + 1}</span>
                      <span className="rw-impact-pip-name">{t.displayId}</span>
                      <div className="rw-impact-pip-bar-wrap"><div className="rw-impact-pip-bar" style={{ width: `${Math.min(t.finalScore, 100)}%` }} /></div>
                      <span className="rw-impact-pip-score-val">{Math.round(t.finalScore)}</span>
                      {t.isSelected && <span className="rw-impact-pip-sel-badge">Selected</span>}
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

function RuleImpactAnalysis({ rule, savedTerminals, merchant, filters, method, monthlyTxns, avgTxnValue, allTerminals, rules, srThresh, onDone, onEditRule, onDisableRule }) {
  const flows = useMemo(() => generateImpactedFlows(method, filters, monthlyTxns), [method, filters, monthlyTxns])
  const [simulated, setSimulated] = useState({})   // flowId → { before, after }
  const [simulating, setSimulating] = useState(null)
  const [expanded, setExpanded]   = useState({})   // flowId → bool

  const runSim = useCallback((flow) => {
    setSimulating(flow.id)
    setTimeout(() => {
      const rulesWithout = (rules || []).filter(r => r.id !== rule.id)
      const rulesWith    = [rule, ...rulesWithout].sort((a, b) => (a.priority || 99) - (b.priority || 99))
      const before = simulateRoutingPipeline(merchant, flow.txn, rulesWithout)
      const after  = simulateRoutingPipeline(merchant, flow.txn, rulesWith)
      setSimulated(p => ({ ...p, [flow.id]: { before, after } }))
      setExpanded(p => ({ ...p, [flow.id]: true }))  // auto-expand after sim
      setSimulating(null)
    }, 140)
  }, [rules, rule, merchant])

  const toggleExpand = (flowId) => setExpanded(p => ({ ...p, [flowId]: !p[flowId] }))

  const formatRev = (amt) => {
    const abs = Math.abs(amt)
    if (abs >= 100000) return `₹${(abs / 100000).toFixed(1)}L`
    if (abs >= 1000)   return `₹${(abs / 1000).toFixed(1)}K`
    return `₹${abs}`
  }

  // Derive per-flow impact metrics
  const flowMetrics = useMemo(() => {
    const m = {}
    flows.forEach(flow => {
      const sim = simulated[flow.id]
      if (!sim) return
      const beforeTerm = sim.before.isNTF ? null : sim.before.selectedTerminal
      const afterTerm  = sim.after.isNTF  ? null : sim.after.selectedTerminal
      const beforeSR   = beforeTerm?.successRate || 0
      const afterSR    = afterTerm?.successRate  || 0
      const srDelta    = afterSR - beforeSR
      const ntfRisk    = sim.after.isNTF && !sim.before.isNTF
      const revDelta   = Math.round((srDelta / 100) * flow.dailyVol * avgTxnValue)
      m[flow.id] = { beforeTerm, afterTerm, beforeSR, afterSR, srDelta, ntfRisk, revDelta }
    })
    return m
  }, [simulated, flows, avgTxnValue])

  const aggregateSummary = useMemo(() => {
    const keys = Object.keys(flowMetrics)
    if (!keys.length) return null
    let ntfRisks = 0, totalSRDelta = 0, totalRevDelta = 0
    keys.forEach(flowId => {
      const m = flowMetrics[flowId]
      if (m.ntfRisk) ntfRisks++
      totalSRDelta  += m.srDelta
      totalRevDelta += m.revDelta
    })
    const simCount = keys.length
    return {
      ntfRisks,
      avgSRDelta: simCount ? Math.round(totalSRDelta / simCount * 10) / 10 : 0,
      totalRevDelta: Math.round(totalRevDelta),
      simCount,
    }
  }, [flowMetrics])

  return (
    <div className="rw-impact">
      {/* ── Success banner ── */}
      <div className="rw-impact-banner">
        <span className="rw-impact-check">✓</span>
        <div>
          <div className="rw-impact-title">Rule Created</div>
          <div className="rw-impact-name">{rule.name}</div>
        </div>
        <span className="rw-impact-enabled-badge">Active</span>
      </div>

      {/* ── Impacted flows ── */}
      <div className="rw-impact-section-label">Impacted Payment Flows ({flows.length})</div>
      <div className="rw-impact-flows">
        {flows.map(flow => {
          const sim      = simulated[flow.id]
          const isSimming = simulating === flow.id
          const isOpen   = !!expanded[flow.id]
          const m        = flowMetrics[flow.id]

          return (
            <div key={flow.id} className={`rw-impact-flow-card${sim ? (isOpen ? ' open' : ' collapsed') : ''}`}>

              {/* ── Header row (always visible) ── */}
              <div className="rw-impact-flow-header" onClick={sim ? () => toggleExpand(flow.id) : undefined} style={sim ? { cursor: 'pointer' } : {}}>
                <div className="rw-impact-flow-meta">
                  <span className="rw-impact-flow-label">{flow.label}</span>
                  <span className="rw-impact-flow-vol">~{flow.dailyVol.toLocaleString()} txns/day</span>
                </div>

                {/* Inline badges when collapsed (post-sim) */}
                {sim && !isOpen && m && (
                  <div className="rw-impact-flow-inline-badges">
                    {m.ntfRisk && <span className="rw-impact-badge ntf compact">⚠️ NTF Risk</span>}
                    {!m.ntfRisk && Math.abs(m.srDelta) >= 0.1 && (
                      <span className={`rw-impact-badge compact ${m.srDelta > 0 ? 'sr-up' : 'sr-down'}`}>
                        {m.srDelta > 0 ? '↑' : '↓'} SR {Math.abs(m.srDelta).toFixed(1)}%
                      </span>
                    )}
                    {!m.ntfRisk && Math.abs(m.revDelta) >= 100 && (
                      <span className={`rw-impact-badge compact ${m.revDelta >= 0 ? 'rev-up' : 'rev-down'}`}>
                        {m.revDelta >= 0 ? '↑' : '↓'} {formatRev(m.revDelta)}/day
                      </span>
                    )}
                    {!m.ntfRisk && Math.abs(m.srDelta) < 0.1 && (
                      <span className="rw-impact-badge compact neutral">No change</span>
                    )}
                  </div>
                )}

                {/* Simulate / Re-simulate button (only when not collapsed) */}
                {(!sim || isOpen) && (
                  <button
                    className="rw-impact-sim-btn"
                    onClick={e => { e.stopPropagation(); runSim(flow) }}
                    disabled={isSimming}
                  >
                    {isSimming ? 'Simulating…' : sim ? '↺ Re-simulate' : '▷ Simulate'}
                  </button>
                )}

                {/* Chevron toggle (post-sim) */}
                {sim && (
                  <span className={`rw-impact-chevron${isOpen ? ' open' : ''}`}>▼</span>
                )}
              </div>

              {/* Pre-sim hint */}
              {!sim && !isSimming && (
                <div className="rw-impact-flow-hint">Click Simulate to trace routing impact</div>
              )}
              {isSimming && (
                <div className="rw-impact-flow-hint simming">⏳ Running pipeline simulation…</div>
              )}

              {/* ── Expandable detail ── */}
              <div className={`rw-impact-flow-expand${isOpen ? ' open' : ''}`}>
                {sim && (
                  <div className="rw-impact-sim-results">
                    {/* Impact badges */}
                    {m && (
                      <div className="rw-impact-badges">
                        {m.ntfRisk && (
                          <span className="rw-impact-badge ntf">
                            ⚠️ NTF Risk — rule routes to {savedTerminals.map(t => t.displayId).join(', ')} with no fallback terminal
                          </span>
                        )}
                        {!m.ntfRisk && Math.abs(m.srDelta) >= 0.1 && (
                          <span className={`rw-impact-badge ${m.srDelta > 0 ? 'sr-up' : 'sr-down'}`}>
                            {m.srDelta > 0 ? '↑' : '↓'} SR {m.srDelta > 0 ? 'improves' : 'drops'} {Math.abs(m.srDelta).toFixed(1)}%  ({m.beforeSR}% → {m.afterSR}%)
                          </span>
                        )}
                        {!m.ntfRisk && Math.abs(m.revDelta) >= 100 && (
                          <span className={`rw-impact-badge ${m.revDelta >= 0 ? 'rev-up' : 'rev-down'}`}>
                            {m.revDelta >= 0 ? '↑' : '↓'} Est. {formatRev(m.revDelta)}/day revenue {m.revDelta >= 0 ? 'gain' : 'reduction'}
                          </span>
                        )}
                        {!m.ntfRisk && Math.abs(m.srDelta) < 0.1 && (
                          <span className="rw-impact-badge neutral">No routing change for this flow</span>
                        )}
                      </div>
                    )}

                    {/* Full pipeline traces — side by side (stacked on narrow) */}
                    <div className="rw-impact-pipelines">
                      <ImpactPipelineTrace result={sim.before} label="Without this rule" />
                      <ImpactPipelineTrace result={sim.after}  label="With this rule" />
                    </div>
                  </div>
                )}
              </div>

            </div>
          )
        })}
      </div>

      {/* ── Aggregate summary ── */}
      {aggregateSummary && (
        <div className={`rw-impact-summary ${aggregateSummary.ntfRisks > 0 ? 'danger' : aggregateSummary.avgSRDelta < -0.5 ? 'warn' : 'ok'}`}>
          <div className="rw-impact-summary-title">Impact Summary ({aggregateSummary.simCount} flow{aggregateSummary.simCount > 1 ? 's' : ''} simulated)</div>
          <div className="rw-impact-summary-rows">
            {aggregateSummary.ntfRisks > 0 && (
              <div className="rw-impact-summary-row red">⚠️ {aggregateSummary.ntfRisks} flow{aggregateSummary.ntfRisks > 1 ? 's' : ''} at NTF risk — no fallback terminal</div>
            )}
            <div className={`rw-impact-summary-row ${aggregateSummary.avgSRDelta >= 0 ? 'green' : 'amber'}`}>
              {aggregateSummary.avgSRDelta >= 0 ? '↑' : '↓'} Avg SR change: {aggregateSummary.avgSRDelta >= 0 ? '+' : ''}{aggregateSummary.avgSRDelta}% across simulated flows
            </div>
            {Math.abs(aggregateSummary.totalRevDelta) >= 100 && (
              <div className={`rw-impact-summary-row ${aggregateSummary.totalRevDelta >= 0 ? 'green' : 'amber'}`}>
                {aggregateSummary.totalRevDelta >= 0 ? '↑' : '↓'} Net est. revenue impact: {aggregateSummary.totalRevDelta >= 0 ? '+' : ''}{formatRev(aggregateSummary.totalRevDelta)}/day
              </div>
            )}
          </div>
          <div className="rw-impact-summary-note">Review each flow's simulation above before enabling this rule in production.</div>
        </div>
      )}

      {/* ── Action buttons ── */}
      <div className="rw-impact-actions">
        <button className="rw-btn ghost" onClick={onEditRule}>← Edit Rule</button>
        <button className="rw-btn secondary" onClick={onDisableRule}>⏸ Disable Rule</button>
        <button className="rw-btn primary" onClick={onDone}>Done ✓</button>
      </div>
    </div>
  )
}

function TerminalStep({ merchant, method, filters, rules, addRule, onBack, onClose }) {
  // Get ALL terminals for the merchant (for showing ineligible ones)
  const allMerchantTerminals = useMemo(() =>
    merchant.gatewayMetrics.map(gm => {
      const gw = gateways.find(g => g.id === gm.gatewayId)
      const term = gw?.terminals.find(t => t.id === gm.terminalId)
      const supportsMethod = (gm.supportedMethods || []).includes(dataKey(method))
      const bankDisabled = term?.bankStatus === 'disabled'
      let ineligibleReason = null

      // Check in order: method -> bank disabled -> network -> issuer -> card type
      if (!supportsMethod) {
        ineligibleReason = `Does not support ${method}`
      } else if (bankDisabled) {
        ineligibleReason = term.bankStatusReason || 'Terminal disabled by bank'
      } else if (method === 'Cards' && filters?.networks?.length > 0) {
        // Check network support
        const terminalNetworks = gm.supportedNetworks || []
        if (terminalNetworks.length > 0) {
          const hasMatchingNetwork = filters.networks.some(n => terminalNetworks.includes(n))
          if (!hasMatchingNetwork) {
            ineligibleReason = `Does not support ${filters.networks.join(', ')}`
          }
        }
      }

      if (!ineligibleReason && method === 'Cards' && filters?.issuerBanks?.length > 0) {
        // Check issuer support
        const terminalIssuers = gm.supportedIssuers || []
        if (terminalIssuers.length > 0 && !terminalIssuers.includes('ALL')) {
          const hasMatchingIssuer = filters.issuerBanks.some(i => terminalIssuers.includes(i))
          if (!hasMatchingIssuer) {
            ineligibleReason = `Issuer ${filters.issuerBanks.join(', ')} not supported`
          }
        }
      }

      if (!ineligibleReason && method === 'Cards' && filters?.cardTypes?.length > 0) {
        // Check card type support
        const terminalCardTypes = gm.supportedCardTypes || []
        if (terminalCardTypes.length > 0) {
          const hasMatchingCardType = filters.cardTypes.some(ct => terminalCardTypes.includes(ct))
          if (!hasMatchingCardType) {
            ineligibleReason = `${filters.cardTypes.join(', ')} cards not supported`
          }
        }
      }

      return {
        id: gm.terminalId,
        displayId: term?.terminalId || gm.terminalId,
        gatewayShort: gw?.shortName || '?',
        successRate: gm.successRate,
        costPerTxn: gm.costPerTxn,
        txnShare: gm.txnShare || 0,
        eligible: !ineligibleReason,
        ineligibleReason,
      }
    }), [merchant, method, filters])

  const eligibleTerminals = allMerchantTerminals.filter(t => t.eligible)
  const ineligibleTerminals = allMerchantTerminals.filter(t => !t.eligible)

  // Monthly transactions + assumed avg transaction value
  const monthlyTxns = merchant?.txnVolumeHistory?.currentMonth || 30000
  const avgTxnValue = 850 // ₹850 default avg order value

  // State
  const [order, setOrder] = useState(() => [...eligibleTerminals].sort((a, b) => b.successRate - a.successRate))
  const [avoidedIds, setAvoidedIds] = useState(new Set())
  const [compassExpiry, setCompassExpiry] = useState('')
  const [showCompassPreview, setShowCompassPreview] = useState(false)
  const [dragIdx, setDragIdx] = useState(null)
  const [saved, setSaved] = useState(null)

  const activeTerminals = order.filter(t => !avoidedIds.has(t.id))
  const priorityTerminal = activeTerminals[0] || null

  const toggleAvoid = (id) => {
    setAvoidedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) }
      else {
        // Block if it would leave zero active
        if (activeTerminals.length <= 1) return prev
        next.add(id)
      }
      return next
    })
  }

  // Drag handlers
  const handleDragStart = (e, i) => { setDragIdx(i); e.dataTransfer.effectAllowed = 'move' }
  const handleDragOver = (e, i) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === i) return
    const next = [...order]; const [m] = next.splice(dragIdx, 1); next.splice(i, 0, m)
    setOrder(next); setDragIdx(i)
  }

  // Generate COMPASS documents
  const generateCompassDocs = () => {
    const docs = []
    const conditions = buildConditions(method, filters)

    // Doc 1: Priority terminal (#1 active)
    if (priorityTerminal) {
      let gwId = ''
      for (const gw of gateways) {
        if (gw.terminals?.find(t => t.id === priorityTerminal.id)) {
          gwId = gw.shortName?.toLowerCase() || gw.id.replace('gw-', '')
          break
        }
      }
      docs.push({
        namespace: 'merchant_routing',
        scope_merchant_id: merchant.id,
        scope: { merchant_id: merchant.id },
        target: { gateway: gwId, method: compassMethodKey(method) },
        action: 'include',
        priority: 2000,
        conditions: flattenConditions(conditions),
        enabled: true,
        expires_at: null,
      })
    }

    // Docs for avoided terminals (deduplicated by gateway)
    const avoidedGws = new Map()
    order.filter(t => avoidedIds.has(t.id)).forEach(t => {
      let gwId = ''
      for (const gw of gateways) {
        if (gw.terminals?.find(tm => tm.id === t.id)) {
          gwId = gw.shortName?.toLowerCase() || gw.id.replace('gw-', '')
          break
        }
      }
      if (gwId && !avoidedGws.has(gwId)) avoidedGws.set(gwId, t)
    })

    for (const [gwId, t] of avoidedGws) {
      docs.push({
        namespace: 'merchant_routing',
        scope_merchant_id: merchant.id,
        scope: { merchant_id: merchant.id },
        target: { gateway: gwId, method: compassMethodKey(method) },
        action: 'exclude',
        priority: 0,
        conditions: flattenConditions(conditions),
        enabled: true,
        expires_at: compassExpiry ? `${compassExpiry}T00:00:00Z` : null,
      })
    }

    return docs
  }

  const handleSave = () => {
    const conditions = buildConditions(method, filters)
    const compassDocs = generateCompassDocs()

    const rule = {
      id: `rule-${merchant.id}-rw-${Date.now()}`,
      name: buildRuleName(method, filters, activeTerminals),
      type: 'conditional',
      enabled: true,
      priority: (rules?.filter(r => !r.isDefault && !r.isMethodDefault).length || 0) + 1,
      conditions, conditionLogic: 'AND',
      action: {
        type: 'route',
        terminals: activeTerminals.map(t => t.id),
        splits: [],
        srThreshold: 70,
        fallbackTerminal: activeTerminals[activeTerminals.length - 1]?.id || null,
      },
      isDefault: false,
      createdAt: new Date().toISOString(),
      createdBy: 'anugrah.sharma@razorpay.com',
      // COMPASS fields
      compassAction: 'include',
      compassPriority: 2000,
      expiresAt: compassExpiry || null,
      _compassDocs: compassDocs,
      _compassDoc: compassDocs[0] || null,
      _compassNamespace: 'merchant_routing',
    }

    addRule?.(rule)
    setSaved(rule)
  }

  if (saved) {
    return (
      <RuleImpactAnalysis
        rule={saved}
        savedTerminals={activeTerminals}
        merchant={merchant}
        filters={filters}
        method={method}
        monthlyTxns={monthlyTxns}
        avgTxnValue={avgTxnValue}
        allTerminals={eligibleTerminals}
        rules={rules}
        srThresh={{}}
        onDone={onClose || (() => setSaved(null))}
        onEditRule={() => setSaved(null)}
        onDisableRule={onClose || (() => setSaved(null))}
      />
    )
  }

  return (
    <div className="rw-term-step">
      <FilterSummary method={method} f={filters} />
      <div style={{ fontSize: 12, color: '#666', marginBottom: 14 }}>
        Drag to set priority order. <strong>#1 is your priority terminal.</strong> Mark terminals you want to exclude as "Avoid."
      </div>

      {/* ── Eligible terminals: draggable with avoid ── */}
      <div className="rw-match" style={{ marginBottom: 8 }}>
        <span className="rw-match-dot" />
        <span><strong>{eligibleTerminals.length}</strong> eligible terminals</span>
      </div>

      <div className="rw-term-list">
        {order.map((t, i) => {
          const isAvoided = avoidedIds.has(t.id)
          const isPriority = !isAvoided && activeTerminals[0]?.id === t.id
          const activeRank = isAvoided ? null : activeTerminals.indexOf(t) + 1

          return (
            <div
              key={t.id}
              className={`rw-term-row${isPriority ? ' priority' : ''}${isAvoided ? ' avoided' : ' sel'}${dragIdx === i ? ' drag' : ''}`}
              draggable={!isAvoided}
              onDragStart={e => handleDragStart(e, i)}
              onDragOver={e => handleDragOver(e, i)}
              onDragEnd={() => setDragIdx(null)}
              style={{
                borderLeft: isPriority ? '4px solid #059669' : isAvoided ? '4px solid #fca5a5' : '4px solid transparent',
                background: isPriority ? '#ecfdf5' : isAvoided ? '#fef2f2' : 'white',
                opacity: isAvoided ? 0.5 : 1,
              }}
            >
              <div className="rw-term-left">
                <span className="rw-term-drag" style={{ opacity: isAvoided ? 0.3 : 1 }}>⠿</span>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: isPriority ? '#059669' : isAvoided ? '#dc2626' : '#e5e7eb',
                  color: isPriority || isAvoided ? 'white' : '#6b7280',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>
                  {isAvoided ? '✕' : isPriority ? '★' : activeRank}
                </div>
                <div>
                  <div className="rw-term-id" style={{ textDecoration: isAvoided ? 'line-through' : 'none', color: isAvoided ? '#9ca3af' : undefined }}>
                    {t.displayId}
                    {isPriority && (
                      <span style={{ fontSize: 9, fontWeight: 700, background: '#059669', color: 'white', padding: '1px 6px', borderRadius: 3, marginLeft: 6 }}>PRIORITY</span>
                    )}
                  </div>
                  <div className="rw-term-gw">{t.gatewayShort}{t.costPerTxn === 0 ? ' · zero-cost' : ''}</div>
                </div>
              </div>
              <div className="rw-term-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="rw-term-sr" style={{ color: isAvoided ? '#9ca3af' : (t.successRate >= 90 ? '#059669' : '#d97706') }}>
                  {t.successRate}%
                </span>
                <span className="rw-term-cost">{t.costPerTxn === 0 ? <span style={{ color: '#059669' }}>₹0</span> : `₹${t.costPerTxn}`}</span>
                <span style={{ fontSize: 10, color: '#9ca3af' }}>{t.txnShare}%</span>
                <button
                  onClick={() => toggleAvoid(t.id)}
                  style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    cursor: 'pointer', border: '1.5px solid',
                    background: isAvoided ? '#dc2626' : 'white',
                    color: isAvoided ? 'white' : '#6b7280',
                    borderColor: isAvoided ? '#dc2626' : '#e5e7eb',
                    transition: 'all 0.15s',
                  }}
                >
                  {isAvoided ? '↩ Undo' : '🚫 Avoid'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* NTF warnings */}
      {activeTerminals.length === 1 && avoidedIds.size > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, padding: '8px 12px', margin: '8px 0', fontSize: 12, color: '#92400e' }}>
          ⚠️ Only <strong>1</strong> active terminal remaining. If it goes down, payments will NTF.
        </div>
      )}

      {avoidedIds.size === 0 && (
        <div style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic', padding: '6px 0' }}>
          All terminals active — #1 gets priority, rest are Doppler-managed fallbacks.
        </div>
      )}

      {/* ── Ineligible terminals ── */}
      {ineligibleTerminals.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
            Ineligible Terminals ({ineligibleTerminals.length})
          </div>
          {ineligibleTerminals.map(t => (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', border: '1px dashed #e5e7eb', borderRadius: 8, marginBottom: 4,
              opacity: 0.45, background: '#f9fafb',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: '#e5e7eb', color: '#9ca3af',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
                }}>—</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af' }}>{t.displayId}</div>
                  <div style={{ fontSize: 10, color: '#d1d5db' }}>{t.gatewayShort}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, color: '#d1d5db' }}>{t.successRate}%</span>
                <span style={{
                  fontSize: 10, background: '#fef2f2', color: '#dc2626',
                  padding: '2px 8px', borderRadius: 10, fontWeight: 500,
                }}>
                  {t.ineligibleReason}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expiry — only show when something is avoided */}
      {avoidedIds.size > 0 && (
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>Auto-expire?</span>
          <input
            type="date"
            style={{ padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 11 }}
            value={compassExpiry}
            onChange={e => setCompassExpiry(e.target.value)}
          />
          <span style={{ fontSize: 10, color: '#9ca3af' }}>Avoid rules lifted after this date</span>
        </div>
      )}

      {/* COMPASS document preview */}
      <div style={{ marginTop: 14 }}>
        <button
          className="rw-btn ghost"
          style={{ fontSize: 10, padding: '4px 10px' }}
          onClick={() => setShowCompassPreview(p => !p)}
        >
          {showCompassPreview ? '▾ Hide' : '▸ Show'} COMPASS Documents ({generateCompassDocs().length} docs)
        </button>
        {showCompassPreview && (() => {
          const docs = generateCompassDocs()
          if (docs.length === 0) return (
            <div style={{ background: '#1a1a2e', borderRadius: 8, padding: 12, marginTop: 8 }}>
              <pre style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 10, color: '#818cf8', fontStyle: 'italic' }}>
                // No COMPASS documents. Pure Doppler ML routing.
              </pre>
            </div>
          )
          return (
            <div style={{ background: '#1a1a2e', borderRadius: 8, padding: 12, marginTop: 8, maxHeight: 350, overflowY: 'auto' }}>
              <pre style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 10, lineHeight: 1.5, color: '#e0e0e0', whiteSpace: 'pre-wrap' }}>
                {docs.map((doc, i) => {
                  const label = doc.action === 'include'
                    ? `DOC ${i + 1} — PRIORITY (${doc.target.gateway?.toUpperCase()})`
                    : `DOC ${i + 1} — EXCLUDE (${doc.target.gateway?.toUpperCase()})`
                  return (
                    <span key={i}>
                      <span style={{ color: '#fbbf24', fontSize: 9, fontWeight: 600, display: 'block', marginTop: i > 0 ? 12 : 0, marginBottom: 4 }}>{label}</span>
                      {JSON.stringify(doc, null, 2)}
                      {'\n'}
                    </span>
                  )
                })}
                {activeTerminals.length > 1 && (
                  <span style={{ color: '#818cf8', fontStyle: 'italic' }}>
                    {'\n'}// Fallbacks: {activeTerminals.slice(1).map(t => t.displayId).join(', ')}
                    {'\n'}// No docs needed — Doppler ML manages these.
                  </span>
                )}
              </pre>
            </div>
          )
        })()}
      </div>

      {/* Footer */}
      <div className="rw-footer" style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="rw-btn ghost" onClick={onBack}>← Back</button>
        <span style={{ fontSize: 11, color: '#6b7280' }}>
          {generateCompassDocs().length > 0
            ? `Generates ${generateCompassDocs().length} COMPASS doc${generateCompassDocs().length > 1 ? 's' : ''}`
            : 'No COMPASS docs — Doppler ML routing'}
        </span>
        <button
          className="rw-btn primary"
          disabled={activeTerminals.length === 0}
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
          <TerminalStep merchant={merchant} method={method} filters={f} rules={rules} addRule={addRule} onBack={() => setStep(step - 1)} onClose={onClose} />
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
          <TerminalStep merchant={merchant} method={method} filters={f} rules={rules} addRule={addRule} onBack={() => setStep(step - 1)} onClose={onClose} />
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
          <TerminalStep merchant={merchant} method={method} filters={f} rules={rules} addRule={addRule} onBack={() => setStep(step - 1)} onClose={onClose} />
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
          <TerminalStep merchant={merchant} method={method} filters={f} rules={rules} addRule={addRule} onBack={() => setStep(step - 1)} onClose={onClose} />
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
