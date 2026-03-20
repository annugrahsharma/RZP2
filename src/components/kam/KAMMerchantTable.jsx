import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKAM } from '../../context/KAMContext'
import { formatINR, formatNumber, computeMerchantRevenue, gateways, isTerminalZeroCost } from '../../data/kamMockData'

// ─── Sort Icon ────────────────────────────────────────────────────────────────

function SortIcon({ direction, active }) {
  if (!active) {
    return (
      <span className="sort-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 9l4-4 4 4" />
          <path d="M8 15l4 4 4 4" />
        </svg>
      </span>
    )
  }
  return (
    <span className="sort-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {direction === 'asc' ? (
          <path d="M8 15l4-4 4 4" />
        ) : (
          <path d="M8 9l4 4 4-4" />
        )}
      </svg>
    </span>
  )
}

// ─── Success Rate Color Helper ────────────────────────────────────────────────

function getSRColor(rate) {
  if (rate >= 95) return '#38A169'
  if (rate >= 90) return '#D69E2E'
  return '#E53E3E'
}

// ─── Routing Modal ────────────────────────────────────────────────────────────

function RoutingModal({ merchantId, merchants, onClose, onApplySingle, onApplyBulk, selectedIds }) {
  const isBulk = merchantId === null
  const merchant = isBulk ? null : merchants.find((m) => m.id === merchantId)
  const [strategy, setStrategy] = useState(() => {
    if (merchant) return merchant.routingStrategy
    return 'success_rate'
  })
  const [reason, setReason] = useState('')

  const handleApply = () => {
    if (isBulk) {
      onApplyBulk(selectedIds, strategy, reason)
    } else {
      onApplySingle(merchantId, strategy, reason)
    }
    onClose()
  }

  return (
    <div className="kam-modal-overlay" onClick={onClose}>
      <div className="kam-modal" onClick={(e) => e.stopPropagation()}>
        <div className="kam-modal-header">
          <div>
            <h3>Change Routing Strategy</h3>
            <p>
              {isBulk
                ? `${selectedIds.length} merchants selected`
                : merchant?.name}
            </p>
          </div>
          <button className="kam-modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="kam-modal-body">
          <div className="kam-radio-group">
            <div
              className={`kam-radio-card${strategy === 'success_rate' ? ' selected' : ''}`}
              onClick={() => setStrategy('success_rate')}
            >
              <div className="radio-dot" />
              <div className="radio-content">
                <div className="radio-label">Success Rate Based</div>
                <div className="radio-desc">
                  Routes to gateway with highest success rate. Higher cost, better conversion.
                </div>
              </div>
            </div>
            <div
              className={`kam-radio-card${strategy === 'cost_based' ? ' selected' : ''}`}
              onClick={() => setStrategy('cost_based')}
            >
              <div className="radio-dot" />
              <div className="radio-content">
                <div className="radio-label">Cost Based</div>
                <div className="radio-desc">
                  Routes to cheapest gateway. Lower cost, may have slightly lower success rate.
                </div>
              </div>
            </div>
          </div>
          <textarea
            className="kam-reason-input"
            placeholder="Reason for change (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>
        <div className="kam-modal-footer">
          <button className="kam-btn kam-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="kam-btn kam-btn-primary" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Gateway Modal ────────────────────────────────────────────────────────────

function GatewayModal({ merchantId, merchants, onClose, onApplySingle, onApplyBulk, selectedIds }) {
  const isBulk = merchantId === null
  const merchant = isBulk ? null : merchants.find((m) => m.id === merchantId)
  const [selectedGatewayId, setSelectedGatewayId] = useState('')
  const [selectedTerminalId, setSelectedTerminalId] = useState('')
  const [reason, setReason] = useState('')

  const selectedGateway = useMemo(
    () => gateways.find((g) => g.id === selectedGatewayId) || null,
    [selectedGatewayId]
  )

  const handleGatewayChange = (e) => {
    setSelectedGatewayId(e.target.value)
    setSelectedTerminalId('')
  }

  const handleApply = () => {
    if (!selectedGatewayId || !selectedTerminalId) return
    if (isBulk) {
      onApplyBulk(selectedIds, selectedGatewayId, selectedTerminalId, reason)
    } else {
      onApplySingle(merchantId, selectedGatewayId, selectedTerminalId, reason)
    }
    onClose()
  }

  return (
    <div className="kam-modal-overlay" onClick={onClose}>
      <div className="kam-modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="kam-modal-header">
          <div>
            <h3>Change Gateway</h3>
            <p>
              {isBulk
                ? `${selectedIds.length} merchants selected`
                : merchant?.name}
            </p>
          </div>
          <button className="kam-modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="kam-modal-body">
          <div className="kam-form-group">
            <label>Select Gateway</label>
            <select
              className="kam-select"
              value={selectedGatewayId}
              onChange={handleGatewayChange}
              style={{ width: '100%', height: '40px' }}
            >
              <option value="">Choose a gateway...</option>
              {gateways.map((gw) => (
                <option key={gw.id} value={gw.id}>
                  {gw.name}
                </option>
              ))}
            </select>
          </div>

          {selectedGateway && (
            <div className="kam-form-group">
              <label>Select Terminal</label>
              {selectedGateway.terminals.map((term) => (
                <div
                  key={term.id}
                  className="kam-gateway-option"
                  onClick={() => setSelectedTerminalId(term.id)}
                  style={{
                    border: selectedTerminalId === term.id
                      ? '2px solid var(--rzp-blue)'
                      : '2px solid transparent',
                    background: selectedTerminalId === term.id
                      ? 'var(--rzp-blue-light)'
                      : undefined,
                  }}
                >
                  <div className="gw-info">
                    <div>
                      <div className="gw-name">{term.terminalId}</div>
                      <div className="gw-desc">{selectedGateway.name}</div>
                    </div>
                  </div>
                  <div className="gw-stats">
                    <div>
                      SR: <strong>{term.successRate}%</strong>
                    </div>
                    <div>
                      Cost: <strong>{'\u20B9'}{term.costPerTxn}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <textarea
            className="kam-reason-input"
            placeholder="Reason for change (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>
        <div className="kam-modal-footer">
          <button className="kam-btn kam-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="kam-btn kam-btn-primary"
            onClick={handleApply}
            disabled={!selectedGatewayId || !selectedTerminalId}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({ title, message, onClose, onConfirm }) {
  return (
    <div className="kam-modal-overlay" onClick={onClose}>
      <div className="kam-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="kam-modal-header">
          <div>
            <h3>{title || 'Confirm Action'}</h3>
          </div>
          <button className="kam-modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="kam-modal-body">
          <p style={{ fontSize: 14, color: 'var(--rzp-text-secondary)', lineHeight: 1.5 }}>
            {message || 'Are you sure you want to proceed?'}
          </p>
        </div>
        <div className="kam-modal-footer">
          <button className="kam-btn kam-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="kam-btn kam-btn-primary" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Row Actions Dropdown ─────────────────────────────────────────────────────

function RowActions({ merchantId, onViewDetails, onChangeRouting, onChangeGateway }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [open])

  return (
    <div className="kam-actions-cell" ref={ref}>
      <button
        className="kam-actions-btn"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((prev) => !prev)
        }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="kam-actions-menu">
          <button
            className="kam-actions-menu-item"
            onClick={() => {
              setOpen(false)
              onViewDetails(merchantId)
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            View Details
          </button>
          <button
            className="kam-actions-menu-item"
            onClick={() => {
              setOpen(false)
              onChangeRouting(merchantId)
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8" />
              <line x1="4" y1="20" x2="21" y2="3" />
              <polyline points="21 16 21 21 16 21" />
              <line x1="15" y1="15" x2="21" y2="21" />
              <line x1="4" y1="4" x2="9" y2="9" />
            </svg>
            Change Routing
          </button>
          <button
            className="kam-actions-menu-item"
            onClick={() => {
              setOpen(false)
              onChangeGateway(merchantId)
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
            Change Gateway
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function KAMMerchantTable() {
  const {
    merchants,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    toggleSort,
    filterRouting,
    setFilterRouting,
    filterDealType,
    setFilterDealType,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    openModal,
    activeModal,
    modalMerchantId,
    closeModal,
    changeRouting,
    changeGateway,
    bulkChangeRouting,
    bulkChangeGateway,
  } = useKAM()

  const navigate = useNavigate()
  const selectAllRef = useRef(null)

  // Determine select-all checkbox state
  const allSelected = merchants.length > 0 && selectedIds.length === merchants.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < merchants.length

  // Set indeterminate property via ref
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected
    }
  }, [someSelected])

  const handleSelectAllChange = useCallback(() => {
    if (allSelected || someSelected) {
      clearSelection()
    } else {
      selectAll(merchants.map((m) => m.id))
    }
  }, [allSelected, someSelected, merchants, selectAll, clearSelection])

  const handleViewDetails = useCallback(
    (id) => navigate(`/kam/merchant/${id}`),
    [navigate]
  )

  const handleChangeRouting = useCallback(
    (id) => openModal('routing', id),
    [openModal]
  )

  const handleChangeGateway = useCallback(
    (id) => openModal('gateway', id),
    [openModal]
  )

  // Resolve gateway shortName for a merchant
  const getGatewayShortName = useCallback((gatewayId) => {
    const gw = gateways.find((g) => g.id === gatewayId)
    return gw ? gw.shortName : '-'
  }, [])

  // Column header click handler
  const renderSortableHeader = (label, field, extraClass) => {
    const isActive = sortField === field
    return (
      <th
        className={`${isActive ? 'sorted' : ''}${extraClass ? ' ' + extraClass : ''}`}
        onClick={() => toggleSort(field)}
      >
        {label}
        <SortIcon direction={sortDirection} active={isActive} />
      </th>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="kam-page-header">
        <h2>Merchant Management</h2>
        <p>Manage routing strategies, gateways, and monitor performance across your merchant portfolio.</p>
      </div>

      {/* Table Controls */}
      <div className="kam-table-controls">
        <div className="kam-table-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search merchants by name, MID, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="kam-table-filters">
          <select
            className="kam-select"
            value={filterRouting}
            onChange={(e) => setFilterRouting(e.target.value)}
          >
            <option value="all">All Routing</option>
            <option value="success_rate">Success Rate Based</option>
            <option value="cost_based">Cost Based</option>
          </select>
          <select
            className="kam-select"
            value={filterDealType}
            onChange={(e) => setFilterDealType(e.target.value)}
          >
            <option value="all">All Deals</option>
            <option value="tsp">TSP Deals</option>
            <option value="offer_linked">Offer-Linked</option>
            <option value="standard">Standard</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="kam-table-wrapper">
        <table className="kam-table">
          <thead>
            <tr>
              <th style={{ width: 44 }}>
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  className="kam-table-checkbox"
                  checked={allSelected}
                  onChange={handleSelectAllChange}
                />
              </th>
              {renderSortableHeader('Merchant', 'name')}
              <th>Category</th>
              <th>Deal</th>
              {renderSortableHeader('Success Rate', 'successRate')}
              {renderSortableHeader('Txn Volume', 'txnVolume')}
              {renderSortableHeader('Forward Pricing', 'forwardPricing')}
              {renderSortableHeader('Cost/Txn', 'costPerTxn')}
              {renderSortableHeader('Net Revenue', 'netRevenue')}
              {renderSortableHeader('Routing', 'routingStrategy')}
              <th>Gateway</th>
              <th style={{ width: 48 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {merchants.length === 0 ? (
              <tr>
                <td colSpan={12}>
                  <div className="kam-empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <h4>No merchants found</h4>
                    <p>Try adjusting your search or filter criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              merchants.map((merchant) => {
                const isSelected = selectedIds.includes(merchant.id)
                const revenue = computeMerchantRevenue(merchant)
                const srColor = getSRColor(merchant.avgPaymentSuccessRate)

                return (
                  <tr
                    key={merchant.id}
                    className={`kam-table-row${isSelected ? ' selected' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      // Don't navigate when clicking checkbox, action button, or dropdown
                      if (
                        e.target.closest('.kam-table-checkbox') ||
                        e.target.closest('.kam-actions-cell') ||
                        e.target.closest('input')
                      ) return
                      navigate(`/kam/merchant/${merchant.id}`)
                    }}
                  >
                    {/* Checkbox */}
                    <td>
                      <input
                        type="checkbox"
                        className="kam-table-checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(merchant.id)}
                      />
                    </td>

                    {/* Merchant Name + MID */}
                    <td>
                      <div className="kam-merchant-info">
                        <span className="name">
                          {merchant.name}
                          {merchant.srSensitive && (
                            <span className="kam-badge-sr">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                              </svg>
                              SR
                            </span>
                          )}
                        </span>
                        <span className="mid">{merchant.mid}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="kam-badge neutral">{merchant.category}</span>
                    </td>

                    {/* Deal Type */}
                    <td>
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
                    </td>

                    {/* Success Rate */}
                    <td>
                      <div className="kam-sr-indicator">
                        <span style={{ fontWeight: 600, color: srColor }}>
                          {merchant.avgPaymentSuccessRate}%
                        </span>
                        <div className="kam-sr-bar">
                          <div
                            className="kam-sr-fill"
                            style={{
                              width: `${merchant.avgPaymentSuccessRate}%`,
                              background: srColor,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Txn Volume */}
                    <td>{formatNumber(merchant.monthlyTxnVolume)}</td>

                    {/* Forward Pricing */}
                    <td>{merchant.forwardPricing}%</td>

                    {/* Cost/Txn */}
                    <td>
                      <span>{'\u20B9'}{revenue.costPerTxn.toFixed(2)}</span>
                      {isTerminalZeroCost(merchant.currentTerminalId) && (
                        <span className="kam-zero-cost-tag">{'\u20B9'}0</span>
                      )}
                    </td>

                    {/* Net Revenue */}
                    <td style={{ fontWeight: 600 }}>{formatINR(revenue.netRevenue)}</td>

                    {/* Routing Strategy */}
                    <td>
                      <span
                        className={`kam-badge ${merchant.routingStrategy === 'success_rate' ? 'warning' : 'info'}`}
                      >
                        {merchant.routingStrategy === 'success_rate'
                          ? 'Success Rate'
                          : 'Cost Based'}
                      </span>
                    </td>

                    {/* Gateway */}
                    <td>{getGatewayShortName(merchant.currentGatewayId)}</td>

                    {/* Actions */}
                    <td>
                      <RowActions
                        merchantId={merchant.id}
                        onViewDetails={handleViewDetails}
                        onChangeRouting={handleChangeRouting}
                        onChangeGateway={handleChangeGateway}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="kam-bulk-bar">
            <div className="bulk-info">
              <span>{selectedIds.length}</span> merchant{selectedIds.length !== 1 ? 's' : ''} selected
            </div>
            <div className="bulk-actions">
              <button
                className="kam-btn kam-btn-secondary kam-btn-sm"
                onClick={() => openModal('routing', null)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                  <polyline points="16 3 21 3 21 8" />
                  <line x1="4" y1="20" x2="21" y2="3" />
                  <polyline points="21 16 21 21 16 21" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                  <line x1="4" y1="4" x2="9" y2="9" />
                </svg>
                Change Routing
              </button>
              <button
                className="kam-btn kam-btn-secondary kam-btn-sm"
                onClick={() => openModal('gateway', null)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                  <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                  <line x1="6" y1="6" x2="6.01" y2="6" />
                  <line x1="6" y1="18" x2="6.01" y2="18" />
                </svg>
                Change Gateway
              </button>
              <button
                className="kam-btn kam-btn-ghost kam-btn-sm"
                onClick={clearSelection}
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Modals ──────────────────────────────────────────────────────────── */}

      {activeModal === 'routing' && (
        <RoutingModal
          merchantId={modalMerchantId}
          merchants={merchants}
          onClose={closeModal}
          onApplySingle={changeRouting}
          onApplyBulk={bulkChangeRouting}
          selectedIds={selectedIds}
        />
      )}

      {activeModal === 'gateway' && (
        <GatewayModal
          merchantId={modalMerchantId}
          merchants={merchants}
          onClose={closeModal}
          onApplySingle={changeGateway}
          onApplyBulk={bulkChangeGateway}
          selectedIds={selectedIds}
        />
      )}

      {activeModal === 'confirm' && (
        <ConfirmModal
          title="Confirm Action"
          message="Are you sure you want to proceed with this action?"
          onClose={closeModal}
          onConfirm={closeModal}
        />
      )}
    </div>
  )
}
