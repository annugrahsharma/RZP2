import React, { useState, useMemo, useRef } from 'react'
import { gateways } from '../../data/kamMockData'
import '../../styles/rule-wizard.css'

// ════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════

const CARD_NETWORKS = [
  { id: 'Visa',       label: 'Visa',       pct: 34.0, rules: 1847 },
  { id: 'Mastercard', label: 'Mastercard', pct: 33.5, rules: 1820 },
  { id: 'RuPay',      label: 'RuPay',      pct: 21.3, rules: 1158 },
  { id: 'Amex',       label: 'Amex',       pct: 5.3,  rules: 288  },
  { id: 'Maestro',    label: 'Maestro',    pct: 1.6,  rules: 87   },
  { id: 'Diners',     label: 'Diners',     pct: 0.2,  rules: 11   },
]

const EMI_NETWORKS = [
  { id: 'Visa',       label: 'Visa',       pct: 44.5, rules: 892 },
  { id: 'Mastercard', label: 'Mastercard', pct: 41.6, rules: 834 },
  { id: 'RuPay',      label: 'RuPay',      pct: 9.4,  rules: 188 },
  { id: 'Amex',       label: 'Amex',       pct: 3.3,  rules: 66  },
]

const TOP_ISSUERS = [
  { id: 'HDFC',     label: 'HDFC Bank',    pct: 16.4 },
  { id: 'ICICI',    label: 'ICICI Bank',   pct: 15.3 },
  { id: 'SBI',      label: 'SBI',          pct: 13.9 },
  { id: 'Axis',     label: 'Axis Bank',    pct: 11.5 },
  { id: 'YesBank',  label: 'Yes Bank',     pct: 5.3  },
  { id: 'Kotak',    label: 'Kotak Bank',   pct: 4.5  },
  { id: 'IDFC',     label: 'IDFC First',   pct: 3.6  },
  { id: 'IndusInd', label: 'IndusInd',     pct: 2.9  },
  { id: 'RBL',      label: 'RBL Bank',     pct: 2.5  },
  { id: 'Federal',  label: 'Federal Bank', pct: 2.1  },
]

const EMI_ISSUERS = [
  { id: 'HDFC',     label: 'HDFC Bank',    pct: 22.4 },
  { id: 'ICICI',    label: 'ICICI Bank',   pct: 19.1 },
  { id: 'Axis',     label: 'Axis Bank',    pct: 14.2 },
  { id: 'SBI',      label: 'SBI',          pct: 11.3 },
  { id: 'Kotak',    label: 'Kotak Bank',   pct: 8.1  },
  { id: 'YesBank',  label: 'Yes Bank',     pct: 6.8  },
  { id: 'IndusInd', label: 'IndusInd',     pct: 5.3  },
  { id: 'IDFC',     label: 'IDFC First',   pct: 4.2  },
  { id: 'RBL',      label: 'RBL Bank',     pct: 3.1  },
  { id: 'Federal',  label: 'Federal Bank', pct: 2.7  },
]

const CARD_TYPES = [
  { id: 'credit',  label: 'Credit',  pct: 39.3 },
  { id: 'debit',   label: 'Debit',   pct: 36.6 },
  { id: 'prepaid', label: 'Prepaid', pct: 4.3  },
]

const TOKENIZATION_OPTS = [
  { id: 'googlepay', label: 'Google Pay',     pct: 1.6 },
  { id: 'applepay',  label: 'Apple Pay',      pct: 1.2 },
  { id: 'rzpvault',  label: 'Razorpay Vault', pct: 0.8 },
]

const CARD_SUBTYPES = [
  { id: 'consumer', label: 'Consumer', pct: 4.3 },
  { id: 'business', label: 'Business', pct: 3.3 },
  { id: 'premium',  label: 'Premium',  pct: 2.3 },
]

const UPI_TXN_TYPES = [
  { id: 'collect', label: 'Collect', pct: 36.5, tooltip: 'Pull payment — customer approves in their UPI app' },
  { id: 'intent',  label: 'Intent',  pct: 26.7, tooltip: 'Push payment — customer scans/taps to pay'         },
  { id: 'qr',      label: 'QR',      pct: 21.7, tooltip: 'Customer scans a QR code to pay'                   },
]

const UPI_FLOWS = [
  { id: 'collect', label: 'Collect', pct: 17.5 },
  { id: 'intent',  label: 'Intent',  pct: 14.8 },
  { id: 'qr',      label: 'QR',      pct: 11.7 },
  { id: 'inapp',   label: 'In-App',  pct: 6.7  },
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

const VPA_HANDLES_RECURRING = [
  { id: '@icici',    label: '@icici',    pct: 9.4  },
  { id: '@axisbank', label: '@axisbank', pct: 8.1  },
  { id: '@hdfc',     label: '@hdfc',     pct: 7.5  },
  { id: '@ybl',      label: '@ybl',      pct: 6.8  },
  { id: '@oksbi',    label: '@oksbi',    pct: 5.9  },
  { id: '@paytm',    label: '@paytm',    pct: 5.3  },
  { id: '@razorpay', label: '@razorpay', pct: 4.7  },
]

const RECURRING_TYPES = [
  { id: 'initial',   label: 'Initial Payment', pct: 29.2, tooltip: 'First payment when setting up a mandate'     },
  { id: 'autodebit', label: 'Auto-debit',      pct: 23.4, tooltip: 'Subsequent auto-debit on an active mandate'  },
]

const MANDATE_FREQS = [
  { id: 'daily',       label: 'Daily',        pct: 5.0  },
  { id: 'weekly',      label: 'Weekly',       pct: 6.7  },
  { id: 'monthly',     label: 'Monthly',      pct: 17.5 },
  { id: 'quarterly',   label: 'Quarterly',    pct: 3.4  },
  { id: 'yearly',      label: 'Yearly',       pct: 2.5  },
  { id: 'aspresented', label: 'As Presented', pct: 1.7  },
]

const EMI_DURATIONS = [
  { id: '3',  label: '3 months',  pct: 24.3 },
  { id: '6',  label: '6 months',  pct: 41.1 },
  { id: '9',  label: '9 months',  pct: 17.8 },
  { id: '12', label: '12 months', pct: 61.6 },
  { id: '18', label: '18 months', pct: 14.4 },
  { id: '24', label: '24 months', pct: 28.3 },
]

const EMI_SUBVENTIONS = [
  { id: 'nocost',   label: 'No-cost / Merchant Subvention', pct: 26.7, tooltip: 'Merchant pays the interest — customer pays 0% EMI'        },
  { id: 'customer', label: 'Customer Subvention',           pct: 19.9, tooltip: 'Customer pays standard interest on EMI'                   },
  { id: 'mixed',    label: 'Mixed',                         pct: 8.9,  tooltip: 'Split subvention between merchant and customer'           },
]

const EMI_CARD_TYPES = [
  { id: 'credit', label: 'Credit', pct: 72.7 },
  { id: 'debit',  label: 'Debit',  pct: 14.3 },
]

// ════════════════════════════════════════════
// WIZARD CONFIGS — step definitions per method key
// ════════════════════════════════════════════

const WIZARD_CONFIGS = {
  Cards: {
    paymentMethod: 'Cards',
    steps: [
      { id: 'network',   label: 'Network',   required: true  },
      { id: 'issuer',    label: 'Issuer',    required: false },
      { id: 'cardtype',  label: 'Card Type', required: false },
      { id: 'intl',      label: 'Geography', required: false },
      { id: 'advanced',  label: 'Advanced',  required: false },
      { id: 'summary',   label: 'Summary',   required: true  },
      { id: 'terminal',  label: 'Terminal',  required: true  },
    ],
  },
  UPIOnetime: {
    paymentMethod: 'UPI',
    steps: [
      { id: 'upitype',    label: 'Txn Type', required: true  },
      { id: 'upiflow',    label: 'UPI Flow', required: false },
      { id: 'vpahandle',  label: 'VPA',      required: false },
      { id: 'advanced',   label: 'Advanced', required: false },
      { id: 'summary',    label: 'Summary',  required: true  },
      { id: 'terminal',   label: 'Terminal', required: true  },
    ],
  },
  UPIRecurring: {
    paymentMethod: 'UPI',
    steps: [
      { id: 'recurtype',   label: 'Recur Type', required: true  },
      { id: 'mandatefreq', label: 'Frequency',  required: false },
      { id: 'vpahandle',   label: 'VPA',        required: false },
      { id: 'advanced',    label: 'Advanced',   required: false },
      { id: 'summary',     label: 'Summary',    required: true  },
      { id: 'terminal',    label: 'Terminal',   required: true  },
    ],
  },
  EMI: {
    paymentMethod: 'EMI',
    steps: [
      { id: 'network',    label: 'Network',     required: true  },
      { id: 'duration',   label: 'Duration',    required: true  },
      { id: 'issuer',     label: 'Issuer',      required: false },
      { id: 'subvention', label: 'Subvention',  required: false },
      { id: 'advanced',   label: 'Advanced',    required: false },
      { id: 'summary',    label: 'Summary',     required: true  },
      { id: 'terminal',   label: 'Terminal',    required: true  },
    ],
  },
}

// ════════════════════════════════════════════
// REUSABLE UI COMPONENTS
// ════════════════════════════════════════════

function CheckboxGroup({ options, selected, onChange, anyLabel = 'Any' }) {
  const isAny = selected.length === 0
  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter(x => x !== id))
    else onChange([...selected, id])
  }
  return (
    <div className="rw-checkbox-group">
      <label className={`rw-checkbox-item rw-any-item${isAny ? ' checked' : ''}`}>
        <input type="checkbox" checked={isAny} onChange={() => onChange([])} />
        <span className="rw-checkbox-label">{anyLabel}</span>
        <span className="rw-checkbox-badge rw-badge-default">Default</span>
      </label>
      {options.map(opt => (
        <label key={opt.id} className={`rw-checkbox-item${selected.includes(opt.id) ? ' checked' : ''}`}>
          <input type="checkbox" checked={selected.includes(opt.id)} onChange={() => toggle(opt.id)} />
          <span className="rw-checkbox-label">
            {opt.label}
            {opt.tooltip && <span className="rw-tooltip" title={opt.tooltip}> ⓘ</span>}
          </span>
          <span className="rw-checkbox-meta">
            {opt.rules ? <span className="rw-rules-count">{opt.rules.toLocaleString()} rules · </span> : null}{opt.pct}%
          </span>
        </label>
      ))}
    </div>
  )
}

function RadioGroup({ options, selected, onChange, anyLabel, anyId = 'any', anyPct }) {
  return (
    <div className="rw-radio-group">
      {anyLabel && (
        <label className={`rw-radio-item${selected === anyId ? ' checked' : ''}`}>
          <input type="radio" checked={selected === anyId} onChange={() => onChange(anyId)} />
          <div className="rw-radio-body">
            <span className="rw-radio-label">{anyLabel}</span>
          </div>
          <span className="rw-checkbox-badge rw-badge-default">{anyPct ?? 'Default'}</span>
        </label>
      )}
      {options.map(opt => (
        <label key={opt.id} className={`rw-radio-item${selected === opt.id ? ' checked' : ''}`}>
          <input type="radio" checked={selected === opt.id} onChange={() => onChange(opt.id)} />
          <div className="rw-radio-body">
            <span className="rw-radio-label">{opt.label}</span>
            {opt.tooltip && <span className="rw-tooltip" title={opt.tooltip}> ⓘ</span>}
          </div>
          <span className="rw-checkbox-meta">{opt.pct}%</span>
        </label>
      ))}
    </div>
  )
}

function IssuerSelect({ issuers, selected, onChange }) {
  const [search, setSearch] = useState('')
  const isAny = selected.length === 0
  const filtered = search ? issuers.filter(i => i.label.toLowerCase().includes(search.toLowerCase())) : issuers
  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter(x => x !== id))
    else onChange([...selected, id])
  }
  return (
    <div className="rw-issuer-wrap">
      <label className={`rw-checkbox-item rw-any-item${isAny ? ' checked' : ''}`} style={{ marginBottom: 8 }}>
        <input type="checkbox" checked={isAny} onChange={() => { onChange([]); setSearch('') }} />
        <span className="rw-checkbox-label">Any Issuer</span>
        <span className="rw-checkbox-badge rw-badge-default">Default · all banks</span>
      </label>
      <div className="rw-issuer-search-wrap">
        <input className="rw-issuer-search" placeholder="Search banks…" value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button className="rw-issuer-clear" onClick={() => setSearch('')}>×</button>}
      </div>
      <div className="rw-issuer-list">
        {!search && <div className="rw-issuer-section-hdr">Top 10 Banks by Volume</div>}
        {filtered.map(iss => (
          <label key={iss.id} className={`rw-checkbox-item${selected.includes(iss.id) ? ' checked' : ''}`}>
            <input type="checkbox" checked={selected.includes(iss.id)} onChange={() => toggle(iss.id)} />
            <span className="rw-checkbox-label">{iss.label}</span>
            <span className="rw-checkbox-meta">{iss.pct}%</span>
          </label>
        ))}
        {!search && (
          <div className="rw-issuer-more">Type to search all 150+ banks</div>
        )}
      </div>
    </div>
  )
}

function AmountRange({ enabled, onToggle, minVal, maxVal, onMinChange, onMaxChange, presets }) {
  return (
    <div className="rw-amount-wrap">
      <label className="rw-amount-toggle-row">
        <input type="checkbox" checked={enabled} onChange={e => onToggle(e.target.checked)} />
        <span>Enable amount filter</span>
      </label>
      {enabled && (
        <>
          <div className="rw-amount-presets">
            {presets.map(p => (
              <button key={p.label} className="rw-amount-preset" onClick={() => { onMinChange(p.min ?? ''); onMaxChange(p.max ?? '') }}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="rw-amount-fields">
            <div className="rw-amount-field">
              <span className="rw-amount-lbl">Min (₹)</span>
              <input className="rw-amount-input" type="number" placeholder="0" value={minVal} onChange={e => onMinChange(e.target.value)} />
            </div>
            <span className="rw-amount-dash">—</span>
            <div className="rw-amount-field">
              <span className="rw-amount-lbl">Max (₹)</span>
              <input className="rw-amount-input" type="number" placeholder="No limit" value={maxVal} onChange={e => onMaxChange(e.target.value)} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StepHeader({ label, required, subtitle }) {
  return (
    <div className="rw-step-hdr">
      <div className="rw-step-title">
        {label}
        {required
          ? <span className="rw-required"> *</span>
          : <span className="rw-optional"> (optional)</span>}
      </div>
      {subtitle && <div className="rw-step-sub">{subtitle}</div>}
    </div>
  )
}

function TerminalWarning({ count }) {
  if (count === 0) return <div className="rw-val-error">⚠️ No terminals match this configuration. Adjust your filters.</div>
  if (count < 3)  return <div className="rw-val-warn">⚠️ Only {count} terminal{count > 1 ? 's' : ''} match. Consider broadening filters for better fallback coverage.</div>
  return <div className="rw-val-ok">✓ {count} terminals match this configuration</div>
}

// ════════════════════════════════════════════
// STEP COMPONENTS
// ════════════════════════════════════════════

function NetworkStep({ method, state, onChange }) {
  const networks = method === 'EMI' ? EMI_NETWORKS : CARD_NETWORKS
  const hasRuPayIntl = state.networks.includes('RuPay') && state.intl === 'intl'
  return (
    <>
      <StepHeader label="Card Network" required subtitle="Select which card networks this rule applies to." />
      <CheckboxGroup options={networks} selected={state.networks} onChange={v => onChange({ ...state, networks: v })} anyLabel="Any Network" />
      {hasRuPayIntl && <div className="rw-cross-warn">⚠️ RuPay does not support International transactions — this combination will match 0 payments.</div>}
    </>
  )
}

function IssuerStep({ method, state, onChange }) {
  const issuers = method === 'EMI' ? EMI_ISSUERS : TOP_ISSUERS
  return (
    <>
      <StepHeader label="Issuer Bank" required={false} subtitle="Filter by the bank that issued the card. Leave blank to match any bank." />
      <IssuerSelect issuers={issuers} selected={state.issuers} onChange={v => onChange({ ...state, issuers: v })} />
    </>
  )
}

function CardTypeStep({ state, onChange }) {
  return (
    <>
      <StepHeader label="Card Type" required={false} subtitle="Filter by card type." />
      <CheckboxGroup options={CARD_TYPES} selected={state.cardTypes} onChange={v => onChange({ ...state, cardTypes: v })} anyLabel="Any Card Type" />
    </>
  )
}

function IntlStep({ state, onChange }) {
  const opts = [
    { id: 'domestic', label: 'Domestic Only',       pct: 22.7 },
    { id: 'intl',     label: 'International Only',  pct: 8.4  },
  ]
  return (
    <>
      <StepHeader label="Geographic Scope" required={false} subtitle="Filter by transaction geography." />
      <RadioGroup options={opts} selected={state.intl} onChange={v => onChange({ ...state, intl: v })} anyLabel="Both Domestic & International" anyId="both" anyPct="Default" />
    </>
  )
}

function CardsAdvancedStep({ state, onChange }) {
  const amountPresets = [
    { label: '< ₹1L',  min: '',       max: '100000' },
    { label: '< ₹2L',  min: '',       max: '200000' },
    { label: '< ₹5L',  min: '',       max: '500000' },
    { label: '> ₹1L',  min: '100000', max: ''       },
    { label: '> ₹2L',  min: '200000', max: ''       },
  ]
  return (
    <>
      <StepHeader label="Advanced Filters" required={false} subtitle="Fine-grained optional controls — skip if not needed." />
      <div className="rw-adv-block">
        <div className="rw-adv-block-label">Tokenization</div>
        <CheckboxGroup options={TOKENIZATION_OPTS} selected={state.tokenization} onChange={v => onChange({ ...state, tokenization: v })} anyLabel="Any Vault" />
      </div>
      <div className="rw-adv-block">
        <div className="rw-adv-block-label">Card Sub-type</div>
        <CheckboxGroup options={CARD_SUBTYPES} selected={state.cardSubtypes} onChange={v => onChange({ ...state, cardSubtypes: v })} anyLabel="Any Sub-type" />
      </div>
      <div className="rw-adv-block">
        <div className="rw-adv-block-label">Amount Range</div>
        <AmountRange enabled={state.amountEnabled} onToggle={v => onChange({ ...state, amountEnabled: v })} minVal={state.amountMin} maxVal={state.amountMax} onMinChange={v => onChange({ ...state, amountMin: v })} onMaxChange={v => onChange({ ...state, amountMax: v })} presets={amountPresets} />
      </div>
    </>
  )
}

function UPITypeStep({ state, onChange }) {
  return (
    <>
      <StepHeader label="UPI Transaction Type" required subtitle="Choose the UPI payment mechanism this rule targets." />
      <RadioGroup options={UPI_TXN_TYPES} selected={state.upiType} onChange={v => onChange({ ...state, upiType: v })} anyLabel="Any Type" anyId="any" anyPct="15.1%" />
    </>
  )
}

function UPIFlowStep({ state, onChange }) {
  return (
    <>
      <StepHeader label="UPI Flow" required={false} subtitle="Filter by the specific UPI payment flow." />
      <CheckboxGroup options={UPI_FLOWS} selected={state.upiFlows} onChange={v => onChange({ ...state, upiFlows: v })} anyLabel="Any Flow" />
    </>
  )
}

function VPAHandleStep({ method, state, onChange }) {
  const handles = method === 'UPIRecurring' ? VPA_HANDLES_RECURRING : VPA_HANDLES
  return (
    <>
      <StepHeader label="VPA Handle" required={false} subtitle="Filter by the customer's UPI VPA handle. Leave blank to match all handles." />
      <CheckboxGroup options={handles} selected={state.vpaHandles} onChange={v => onChange({ ...state, vpaHandles: v })} anyLabel="Any Handle" />
    </>
  )
}

function UPIOnetimeAdvancedStep({ state, onChange }) {
  const presets = [
    { label: '< ₹50K', min: '', max: '50000'  },
    { label: '< ₹1L',  min: '', max: '100000' },
    { label: '< ₹2L',  min: '', max: '200000' },
    { label: '> ₹50K', min: '50000',  max: '' },
    { label: '> ₹1L',  min: '100000', max: '' },
  ]
  return (
    <>
      <StepHeader label="Advanced Filters" required={false} />
      <div className="rw-adv-block">
        <div className="rw-adv-block-label">Amount Range</div>
        <AmountRange enabled={state.amountEnabled} onToggle={v => onChange({ ...state, amountEnabled: v })} minVal={state.amountMin} maxVal={state.amountMax} onMinChange={v => onChange({ ...state, amountMin: v })} onMaxChange={v => onChange({ ...state, amountMax: v })} presets={presets} />
      </div>
    </>
  )
}

function RecurringTypeStep({ state, onChange }) {
  return (
    <>
      <StepHeader label="Recurring Payment Type" required subtitle="What phase of the recurring payment does this rule apply to?" />
      <RadioGroup options={RECURRING_TYPES} selected={state.recurType} onChange={v => onChange({ ...state, recurType: v })} anyLabel="Both (Initial + Auto-debit)" anyId="both" anyPct="20% · Default" />
    </>
  )
}

function MandateFreqStep({ state, onChange }) {
  const disabled = state.recurType === 'initial'
  return (
    <>
      <StepHeader label="Mandate Frequency" required={false} subtitle={disabled ? "N/A — Initial payments don't have a mandate frequency." : "Filter by how often the auto-debit fires."} />
      {disabled
        ? <div className="rw-info-box">Mandate Frequency only applies to Auto-debit or Both. Go back to change Recurring Type.</div>
        : <CheckboxGroup options={MANDATE_FREQS} selected={state.mandateFreqs} onChange={v => onChange({ ...state, mandateFreqs: v })} anyLabel="Any Frequency" />
      }
    </>
  )
}

function UPIRecurringAdvancedStep({ state, onChange }) {
  const presets = [
    { label: '< ₹5K',  min: '', max: '5000'  },
    { label: '< ₹10K', min: '', max: '10000' },
    { label: '< ₹25K', min: '', max: '25000' },
    { label: '< ₹50K', min: '', max: '50000' },
    { label: '> ₹50K', min: '50000', max: '' },
  ]
  return (
    <>
      <StepHeader label="Advanced Filters" required={false} />
      <div className="rw-adv-block">
        <div className="rw-adv-block-label">Max Mandate Amount</div>
        <AmountRange enabled={state.amountEnabled} onToggle={v => onChange({ ...state, amountEnabled: v })} minVal={state.amountMin} maxVal={state.amountMax} onMinChange={v => onChange({ ...state, amountMin: v })} onMaxChange={v => onChange({ ...state, amountMax: v })} presets={presets} />
      </div>
    </>
  )
}

function EMIDurationStep({ state, onChange }) {
  return (
    <>
      <StepHeader label="EMI Duration" required subtitle="Select which EMI tenures this rule applies to." />
      <CheckboxGroup options={EMI_DURATIONS} selected={state.emiDurations} onChange={v => onChange({ ...state, emiDurations: v })} anyLabel="Any Duration" />
    </>
  )
}

function SubventionStep({ state, onChange }) {
  return (
    <>
      <StepHeader label="Subvention Type" required={false} subtitle="Who pays the interest on this EMI?" />
      <CheckboxGroup options={EMI_SUBVENTIONS} selected={state.subventions} onChange={v => onChange({ ...state, subventions: v })} anyLabel="Any Subvention" />
    </>
  )
}

function EMIAdvancedStep({ state, onChange }) {
  const presets = [
    { label: '₹5K–₹50K', min: '5000',  max: '50000'  },
    { label: '₹10K–₹1L', min: '10000', max: '100000' },
    { label: '₹5K–₹2L',  min: '5000',  max: '200000' },
    { label: 'No Limit',  min: '',      max: ''       },
  ]
  return (
    <>
      <StepHeader label="Advanced Filters" required={false} />
      <div className="rw-adv-block">
        <div className="rw-adv-block-label">Card Type <span className="rw-optional">(debit EMI is rare)</span></div>
        <CheckboxGroup options={EMI_CARD_TYPES} selected={state.emiCardTypes} onChange={v => onChange({ ...state, emiCardTypes: v })} anyLabel="Any Type" />
        {state.emiCardTypes.includes('debit') && <div className="rw-cross-warn">⚠️ Debit EMI is rare and may significantly reduce terminal availability.</div>}
      </div>
      <div className="rw-adv-block">
        <div className="rw-adv-block-label">Amount Range</div>
        <AmountRange enabled={state.amountEnabled} onToggle={v => onChange({ ...state, amountEnabled: v })} minVal={state.amountMin} maxVal={state.amountMax} onMinChange={v => onChange({ ...state, amountMin: v })} onMaxChange={v => onChange({ ...state, amountMax: v })} presets={presets} />
      </div>
    </>
  )
}

// ── Helpers ────────────────────────────────

function getMethodTerminals(paymentMethod, merchant) {
  return merchant.gatewayMetrics
    .filter(gm => (gm.supportedMethods || []).includes(paymentMethod))
    .map(gm => {
      const gw   = gateways.find(g => g.id === gm.gatewayId)
      const term = gw?.terminals.find(t => t.id === gm.terminalId)
      return { id: gm.terminalId, displayId: term?.terminalId || gm.terminalId, gatewayShort: gw?.shortName || '?', successRate: gm.successRate, costPerTxn: gm.costPerTxn, txnShare: gm.txnShare || 0 }
    })
}

function buildSummaryRows(method, state, config) {
  const any = (arr, items) => {
    if (arr.length === 0) return 'Any'
    return arr.map(id => items.find(i => i.id === id)?.label || id).join(', ')
  }
  const rows = [{ label: 'Method', value: config.paymentMethod + (method === 'UPIRecurring' ? ' (Recurring)' : method === 'UPIOnetime' ? ' (One-time)' : '') }]

  if (method === 'Cards' || method === 'EMI') {
    rows.push({ label: 'Network', value: any(state.networks, method === 'EMI' ? EMI_NETWORKS : CARD_NETWORKS) })
    if (method === 'EMI') rows.push({ label: 'Duration', value: any(state.emiDurations, EMI_DURATIONS) })
    rows.push({ label: 'Issuer', value: any(state.issuers, method === 'EMI' ? EMI_ISSUERS : TOP_ISSUERS) })
    if (method === 'Cards') {
      rows.push({ label: 'Card Type', value: any(state.cardTypes, CARD_TYPES) })
      rows.push({ label: 'Geography', value: state.intl === 'domestic' ? 'Domestic Only' : state.intl === 'intl' ? 'International Only' : 'Both' })
    }
    if (method === 'EMI') {
      rows.push({ label: 'Subvention', value: any(state.subventions, EMI_SUBVENTIONS) })
      if (state.emiCardTypes.length > 0) rows.push({ label: 'Card Type', value: any(state.emiCardTypes, EMI_CARD_TYPES) })
    }
    if (state.tokenization?.length > 0) rows.push({ label: 'Tokenization', value: any(state.tokenization, TOKENIZATION_OPTS) })
    if (state.cardSubtypes?.length > 0) rows.push({ label: 'Card Sub-type', value: any(state.cardSubtypes, CARD_SUBTYPES) })
  }

  if (method === 'UPIOnetime') {
    const upiTypeLabel = state.upiType === 'any' ? 'Any Type' : (UPI_TXN_TYPES.find(t => t.id === state.upiType)?.label || state.upiType)
    rows.push({ label: 'Transaction Type', value: upiTypeLabel })
    if (state.upiFlows.length > 0) rows.push({ label: 'UPI Flow', value: any(state.upiFlows, UPI_FLOWS) })
    if (state.vpaHandles.length > 0) rows.push({ label: 'VPA Handles', value: state.vpaHandles.join(', ') })
  }

  if (method === 'UPIRecurring') {
    const recurLabel = state.recurType === 'both' ? 'Both (Initial + Auto-debit)' : (RECURRING_TYPES.find(t => t.id === state.recurType)?.label || state.recurType)
    rows.push({ label: 'Recurring Type', value: recurLabel })
    if (state.mandateFreqs.length > 0) rows.push({ label: 'Mandate Frequency', value: any(state.mandateFreqs, MANDATE_FREQS) })
    if (state.vpaHandles.length > 0) rows.push({ label: 'VPA Handles', value: state.vpaHandles.join(', ') })
  }

  if (state.amountEnabled) {
    const min = state.amountMin ? `₹${Number(state.amountMin).toLocaleString()}` : '₹0'
    const max = state.amountMax ? `₹${Number(state.amountMax).toLocaleString()}` : 'No limit'
    rows.push({ label: 'Amount Range', value: `${min} – ${max}` })
  }
  return rows
}

// ── Summary Step ─────────────────────────

function SummaryStep({ method, state, merchant, config }) {
  const rows     = useMemo(() => buildSummaryRows(method, state, config), [method, state, config])
  const terminals = useMemo(() => getMethodTerminals(config.paymentMethod, merchant), [config.paymentMethod, merchant])
  return (
    <>
      <StepHeader label="Rule Summary" required subtitle="Review your configuration before terminal setup." />
      <div className="rw-summary-table">
        {rows.map((row, i) => (
          <div key={i} className="rw-summary-row">
            <span className="rw-summary-lbl">{row.label}</span>
            <span className="rw-summary-val">{row.value}</span>
          </div>
        ))}
      </div>
      <TerminalWarning count={terminals.length} />
    </>
  )
}

// ── Terminal Setup Step ────────────────────

function TerminalSetupStep({ config, merchant, onConfigChange }) {
  const terminals = useMemo(() => getMethodTerminals(config.paymentMethod, merchant), [config.paymentMethod, merchant])

  const [distType, setDistType]           = useState('priority')
  const [fallbackId, setFallbackId]       = useState(terminals.length > 1 ? terminals[terminals.length - 1]?.id : '')
  const [termSel, setTermSel]             = useState(() => {
    const sorted = [...terminals].sort((a, b) => b.successRate - a.successRate)
    const sel = {}
    sorted.forEach(t => { sel[t.id] = { enabled: true, load: 0, srThreshold: Math.max(70, Math.floor(t.successRate - 5)) } })
    if (sorted.length > 0) sel[sorted[0].id].load = 100
    return sel
  })

  const update = (next) => {
    const enabled = terminals.filter(t => next[t.id]?.enabled)
    onConfigChange({ distType, fallbackId, terminalSelection: next, enabledTerminals: enabled.map(t => t.id) })
  }
  const handleDistType = (dt) => {
    setDistType(dt)
    onConfigChange({ distType: dt, fallbackId, terminalSelection: termSel, enabledTerminals: terminals.filter(t => termSel[t.id]?.enabled).map(t => t.id) })
  }
  const handleFallback = (fid) => {
    setFallbackId(fid)
    onConfigChange({ distType, fallbackId: fid, terminalSelection: termSel, enabledTerminals: terminals.filter(t => termSel[t.id]?.enabled).map(t => t.id) })
  }
  const toggleTerm = (id) => {
    const next = { ...termSel, [id]: { ...termSel[id], enabled: !termSel[id]?.enabled } }
    setTermSel(next); update(next)
  }
  const setLoad = (id, val) => {
    const next = { ...termSel, [id]: { ...termSel[id], load: val } }
    setTermSel(next); update(next)
  }
  const setSRThreshold = (id, val) => {
    const next = { ...termSel, [id]: { ...termSel[id], srThreshold: val } }
    setTermSel(next); update(next)
  }

  const enabledList   = terminals.filter(t => termSel[t.id]?.enabled)
  const totalLoad     = enabledList.reduce((s, t) => s + (Number(termSel[t.id]?.load) || 0), 0)
  const loadValid     = distType === 'priority' || totalLoad === 100
  const loadRemaining = 100 - totalLoad

  return (
    <>
      <StepHeader label="Terminal Setup" required subtitle={`Configure how ${config.paymentMethod} traffic is distributed across available terminals.`} />

      <div className="rw-terminal-count-row">
        <span className={`rw-term-count-badge ${terminals.length === 0 ? 'error' : terminals.length < 3 ? 'warn' : 'ok'}`}>
          {terminals.length} terminal{terminals.length !== 1 ? 's' : ''} available
        </span>
      </div>

      <div className="rw-dist-toggle">
        <button className={`rw-dist-btn${distType === 'priority' ? ' active' : ''}`} onClick={() => handleDistType('priority')}>
          <span className="rw-dist-btn-label">Priority-based</span>
          <span className="rw-dist-btn-sub">Try first, fallback when SR drops</span>
        </button>
        <button className={`rw-dist-btn${distType === 'loadbalanced' ? ' active' : ''}`} onClick={() => handleDistType('loadbalanced')}>
          <span className="rw-dist-btn-label">Load-balanced</span>
          <span className="rw-dist-btn-sub">Split traffic by percentage</span>
        </button>
      </div>

      <div className="rw-terminal-list">
        {terminals.map((t, i) => {
          const sel = termSel[t.id] || { enabled: true, load: 0, srThreshold: 85 }
          return (
            <div key={t.id} className={`rw-term-row${!sel.enabled ? ' rw-term-row--off' : ''}`}>
              <label className="rw-term-check">
                <input type="checkbox" checked={sel.enabled} onChange={() => toggleTerm(t.id)} />
              </label>
              <div className="rw-term-info">
                <span className="rw-term-id">{t.displayId}</span>
                <span className="rw-term-gw">{t.gatewayShort}</span>
              </div>
              <div className="rw-term-metrics">
                <span style={{ color: t.successRate >= 90 ? '#059669' : '#d97706', fontWeight: 600, fontSize: 12 }}>SR {t.successRate}%</span>
                <span style={{ color: t.costPerTxn === 0 ? '#059669' : '#64748b', fontSize: 11 }}>{t.costPerTxn === 0 ? '₹0 zero-cost' : `₹${t.costPerTxn}/txn`}</span>
              </div>
              {sel.enabled && distType === 'loadbalanced' && (
                <div className="rw-term-load">
                  <input type="number" min="0" max="100" className="rw-load-input" value={sel.load} onChange={e => setLoad(t.id, e.target.value)} />
                  <span className="rw-load-pct">%</span>
                </div>
              )}
              {sel.enabled && distType === 'priority' && i < terminals.length - 1 && (
                <div className="rw-term-threshold">
                  <span className="rw-threshold-lbl">Fallback if SR &lt;</span>
                  <input type="number" min="50" max="99" className="rw-threshold-input" value={sel.srThreshold} onChange={e => setSRThreshold(t.id, +e.target.value)} />
                  <span>%</span>
                </div>
              )}
              {sel.enabled && distType === 'priority' && i === terminals.length - 1 && (
                <span className="rw-term-final">Final fallback</span>
              )}
            </div>
          )
        })}
      </div>

      {distType === 'loadbalanced' && (
        <div className={`rw-load-total${loadValid ? ' valid' : ' invalid'}`}>
          Total: <strong>{totalLoad}%</strong>{' '}
          {loadValid ? '✓ balanced' : `— ${loadRemaining > 0 ? `+${loadRemaining}% remaining` : `${-loadRemaining}% over limit`}`}
        </div>
      )}

      {terminals.length > 1 && (
        <div className="rw-fallback-wrap">
          <div className="rw-fallback-label">Last-resort fallback terminal</div>
          <select className="rw-fallback-select" value={fallbackId} onChange={e => handleFallback(e.target.value)}>
            <option value="">None</option>
            {terminals.map(t => <option key={t.id} value={t.id}>{t.displayId} ({t.gatewayShort}) — SR {t.successRate}%</option>)}
          </select>
        </div>
      )}
    </>
  )
}

// ════════════════════════════════════════════
// WIZARD STATE & ROUTING
// ════════════════════════════════════════════

function getInitialState(method) {
  const base = { amountEnabled: false, amountMin: '', amountMax: '' }
  switch (method) {
    case 'Cards':        return { ...base, networks: [], issuers: [], cardTypes: [], intl: 'both', tokenization: [], cardSubtypes: [] }
    case 'UPIOnetime':   return { ...base, upiType: 'any', upiFlows: [], vpaHandles: [] }
    case 'UPIRecurring': return { ...base, recurType: 'both', mandateFreqs: [], vpaHandles: [] }
    case 'EMI':          return { ...base, networks: [], emiDurations: [], issuers: [], subventions: [], emiCardTypes: [] }
    default:             return base
  }
}

function isStepValid(stepId, method, state) {
  if (stepId === 'network')    return state.networks.length > 0
  if (stepId === 'upitype')    return !!state.upiType
  if (stepId === 'recurtype')  return !!state.recurType
  if (stepId === 'duration')   return state.emiDurations.length > 0
  return true
}

function renderStep(stepId, method, state, onChange, merchant, config, termConfigRef) {
  switch (stepId) {
    case 'network':     return <NetworkStep method={method} state={state} onChange={onChange} />
    case 'issuer':      return <IssuerStep method={method} state={state} onChange={onChange} />
    case 'cardtype':    return <CardTypeStep state={state} onChange={onChange} />
    case 'intl':        return <IntlStep state={state} onChange={onChange} />
    case 'advanced':
      if (method === 'Cards')        return <CardsAdvancedStep state={state} onChange={onChange} />
      if (method === 'UPIOnetime')   return <UPIOnetimeAdvancedStep state={state} onChange={onChange} />
      if (method === 'UPIRecurring') return <UPIRecurringAdvancedStep state={state} onChange={onChange} />
      return <EMIAdvancedStep state={state} onChange={onChange} />
    case 'upitype':     return <UPITypeStep state={state} onChange={onChange} />
    case 'upiflow':     return <UPIFlowStep state={state} onChange={onChange} />
    case 'vpahandle':   return <VPAHandleStep method={method} state={state} onChange={onChange} />
    case 'recurtype':   return <RecurringTypeStep state={state} onChange={onChange} />
    case 'mandatefreq': return <MandateFreqStep state={state} onChange={onChange} />
    case 'duration':    return <EMIDurationStep state={state} onChange={onChange} />
    case 'subvention':  return <SubventionStep state={state} onChange={onChange} />
    case 'summary':     return <SummaryStep method={method} state={state} merchant={merchant} config={config} />
    case 'terminal':    return <TerminalSetupStep config={config} merchant={merchant} onConfigChange={cfg => { termConfigRef.current = cfg }} />
    default:            return null
  }
}

function buildConditions(method, state, config) {
  const conds = [{ field: 'payment_method', operator: 'equals', value: config.paymentMethod }]
  if (method === 'UPIRecurring') conds.push({ field: 'recurring', operator: 'equals', value: true })

  if ((method === 'Cards' || method === 'EMI') && state.networks.length > 0)
    conds.push({ field: 'card_network', operator: 'in', value: state.networks })
  if ((method === 'Cards' || method === 'EMI') && state.issuers.length > 0)
    conds.push({ field: 'issuer_bank', operator: 'in', value: state.issuers })
  if (method === 'Cards' && state.cardTypes.length > 0)
    conds.push({ field: 'card_type', operator: 'in', value: state.cardTypes })
  if (method === 'Cards' && state.intl !== 'both')
    conds.push({ field: 'international', operator: 'equals', value: state.intl === 'intl' })
  if (method === 'Cards' && state.tokenization?.length > 0)
    conds.push({ field: 'tokenization', operator: 'in', value: state.tokenization })
  if (method === 'Cards' && state.cardSubtypes?.length > 0)
    conds.push({ field: 'card_subtype', operator: 'in', value: state.cardSubtypes })

  if (method === 'UPIOnetime' && state.upiType !== 'any')
    conds.push({ field: 'upi_type', operator: 'equals', value: state.upiType })
  if (method === 'UPIOnetime' && state.upiFlows.length > 0)
    conds.push({ field: 'upi_flow', operator: 'in', value: state.upiFlows })
  if ((method === 'UPIOnetime' || method === 'UPIRecurring') && state.vpaHandles.length > 0)
    conds.push({ field: 'vpa_handle', operator: 'in', value: state.vpaHandles })
  if (method === 'UPIRecurring' && state.recurType !== 'both')
    conds.push({ field: 'recurring_type', operator: 'equals', value: state.recurType })
  if (method === 'UPIRecurring' && state.mandateFreqs.length > 0)
    conds.push({ field: 'mandate_frequency', operator: 'in', value: state.mandateFreqs })

  if (method === 'EMI' && state.emiDurations.length > 0)
    conds.push({ field: 'emi_duration', operator: 'in', value: state.emiDurations })
  if (method === 'EMI' && state.subventions.length > 0)
    conds.push({ field: 'subvention_type', operator: 'in', value: state.subventions })
  if (method === 'EMI' && state.emiCardTypes.length > 0)
    conds.push({ field: 'card_type', operator: 'in', value: state.emiCardTypes })

  if (state.amountEnabled) {
    if (state.amountMin) conds.push({ field: 'amount', operator: 'greater_than', value: Number(state.amountMin) })
    if (state.amountMax) conds.push({ field: 'amount', operator: 'less_than',    value: Number(state.amountMax) })
  }
  return conds
}

function buildRuleName(method, state, config, termCfg) {
  const parts = [config.paymentMethod]
  if (method === 'UPIRecurring') parts.push('Recurring')
  if (method === 'UPIOnetime')   parts.push('One-time')
  if ((method === 'Cards' || method === 'EMI') && state.networks.length > 0) parts.push(state.networks.slice(0, 2).join('/'))
  if (method === 'EMI' && state.emiDurations.length > 0) parts.push(`${state.emiDurations.slice(0, 2).join('/')}mo`)
  const firstEnabled = termCfg?.enabledTerminals?.[0]
  if (firstEnabled) {
    const gw = gateways.flatMap(g => g.terminals).find(t => t.id === firstEnabled)
    if (gw) parts.push(`→ ${gw.terminalId}`)
  }
  return parts.join(' · ')
}

// ════════════════════════════════════════════
// PROGRESS STEPPER
// ════════════════════════════════════════════

function WizardStepper({ steps, currentStep }) {
  return (
    <div className="rw-stepper">
      {steps.map((step, i) => {
        const isDone   = i + 1 < currentStep
        const isActive = i + 1 === currentStep
        return (
          <React.Fragment key={step.id}>
            <div className={`rw-dot-wrap${isActive ? ' active' : isDone ? ' done' : ''}`}>
              <div className="rw-dot">{isDone ? '✓' : i + 1}</div>
              <div className="rw-dot-label">{step.label}{!step.required && <span className="rw-dot-opt"> opt</span>}</div>
            </div>
            {i < steps.length - 1 && <div className={`rw-connector${isDone ? ' done' : ''}`} />}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ════════════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════════════

export default function RuleWizard({ method, merchant, addRule, onClose }) {
  const config   = WIZARD_CONFIGS[method]
  const steps    = config?.steps || []

  const [currentStep, setCurrentStep] = useState(1)
  const [state,       setState]       = useState(() => getInitialState(method))
  const [confirmed,   setConfirmed]   = useState(false)
  const termConfigRef = useRef(null)

  const step      = steps[currentStep - 1]
  const isFirst   = currentStep === 1
  const isLast    = currentStep === steps.length
  const valid     = step ? isStepValid(step.id, method, state) : true
  const skippable = step && !step.required && !isLast

  const handleNext = () => { if (currentStep < steps.length) setCurrentStep(s => s + 1) }
  const handleBack = () => { if (currentStep > 1) setCurrentStep(s => s - 1) }

  const handleSave = () => {
    const termCfg    = termConfigRef.current
    const conditions = buildConditions(method, state, config)
    const terminals  = termCfg?.enabledTerminals || []
    const isLB       = termCfg?.distType === 'loadbalanced'
    const newRule = {
      id:        `rule-${merchant.id}-wiz-${Date.now()}`,
      name:      buildRuleName(method, state, config, termCfg),
      type:      isLB ? 'volume_split' : 'conditional',
      enabled:   true,
      priority:  1,
      conditions,
      conditionLogic: 'AND',
      action: {
        type:      isLB ? 'split' : 'route',
        terminals,
        splits:    isLB ? terminals.map(tid => ({ terminalId: tid, percentage: Number(termCfg.terminalSelection?.[tid]?.load) || 0 })) : [],
        srThreshold: 90,
        minPaymentCount: 100,
      },
      isDefault:  false,
      createdAt:  new Date().toISOString(),
      createdBy:  'anugrah.sharma@razorpay.com',
    }
    addRule?.(newRule)
    setConfirmed(true)
  }

  if (!config) return <div className="rw-wizard"><div style={{ padding: 24, color: '#ef4444' }}>Unknown method: {method}</div></div>

  if (confirmed) {
    return (
      <div className="rw-wizard">
        <div className="gc-wizard-success">
          <div className="gc-success-icon">✓</div>
          <div className="gc-success-title">Rule Created Successfully</div>
          <div className="gc-success-sub">
            Your <strong>{config.paymentMethod}</strong> routing rule is now active for {merchant?.name}.
          </div>
          <button className="rw-btn rw-btn--primary" style={{ marginTop: 20 }} onClick={onClose}>Done</button>
        </div>
      </div>
    )
  }

  return (
    <div className="rw-wizard">
      <WizardStepper steps={steps} currentStep={currentStep} />

      <div className="rw-wizard-body">
        <div className="rw-step-content">
          {step && renderStep(step.id, method, state, setState, merchant, config, termConfigRef)}
        </div>
      </div>

      <div className="rw-wizard-footer">
        <button className="rw-btn rw-btn--ghost" onClick={isFirst ? onClose : handleBack}>
          {isFirst ? 'Cancel' : '← Back'}
        </button>
        <div className="rw-footer-right">
          {skippable && (
            <button className="rw-btn rw-btn--skip" onClick={handleNext}>Skip</button>
          )}
          {isLast
            ? <button className="rw-btn rw-btn--primary" onClick={handleSave} disabled={!termConfigRef.current}>Save Rule</button>
            : <button className="rw-btn rw-btn--primary" onClick={handleNext} disabled={step?.required && !valid}>
                {currentStep === steps.length - 1 ? 'Terminal Setup →' : 'Next →'}
              </button>
          }
        </div>
      </div>
    </div>
  )
}
