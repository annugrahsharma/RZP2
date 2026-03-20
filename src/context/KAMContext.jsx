import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import {
  merchants as initialMerchants,
  gateways,
  computeMerchantRevenue,
  computeAggregateStats,
  getMonthlyTargetData,
  generateMonthlyHistory,
  computeZeroCostShare,
  computeTSPCompliance,
  computeNTFRisk,
  detectRoutingConflicts,
  computeRetentionRisk,
  computeNROpportunity,
  generateSeedRules,
} from '../data/kamMockData'

const KAMContext = createContext(null)

export function KAMProvider({ children }) {
  const [merchants, setMerchants] = useState(() =>
    initialMerchants.map((m) => ({
      ...m,
      gatewayMetrics: [...m.gatewayMetrics],
      routingRulesV2: generateSeedRules(m),
    }))
  )

  // Table state
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [filterRouting, setFilterRouting] = useState('all')
  const [filterDealType, setFilterDealType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Selection
  const [selectedIds, setSelectedIds] = useState([])

  // Modal state
  const [activeModal, setActiveModal] = useState(null)
  const [modalMerchantId, setModalMerchantId] = useState(null)

  // Toast
  const [toast, setToast] = useState(null)

  // Audit log
  const [auditLog, setAuditLog] = useState([
    {
      id: 'log-001',
      timestamp: '09 Mar, 10:30 am',
      user: 'anugrah.sharma@razorpay.com',
      action: 'Reviewed Zomato gateway performance metrics',
      reason: 'Monthly review of top merchants',
      merchantId: 'merch-001',
    },
    {
      id: 'log-002',
      timestamp: '08 Mar, 03:15 pm',
      user: 'admin@razorpay.com',
      action: 'Adjusted Cost Threshold to -4.5% for CRED',
      reason: 'Optimizing for Q4 cost reduction targets',
      merchantId: 'merch-004',
    },
    {
      id: 'log-003',
      timestamp: '07 Mar, 11:30 am',
      user: 'ops@razorpay.com',
      action: 'Disabled terminal ICICI_T1 for Zomato',
      reason: 'High failure rate during peak hours',
      merchantId: 'merch-001',
    },
    {
      id: 'log-004',
      timestamp: '06 Mar, 09:15 am',
      user: 'admin@razorpay.com',
      action: 'Switched Swiggy to Cost Optimised mode',
      reason: 'Monthly cost optimization cycle',
      merchantId: 'merch-002',
    },
    {
      id: 'log-005',
      timestamp: '05 Mar, 04:45 pm',
      user: 'system@razorpay.com',
      action: 'Auto-enabled terminal HDFC_T1 for Zomato',
      reason: 'SR threshold recovery detected',
      merchantId: 'merch-001',
    },
    {
      id: 'log-006',
      timestamp: '04 Mar, 02:00 pm',
      user: 'anugrah.sharma@razorpay.com',
      action: 'Bulk changed 5 merchants to Cost Based routing',
      reason: 'Q1 cost optimization initiative',
      merchantId: null,
    },
    {
      id: 'log-007',
      timestamp: '03 Mar, 11:00 am',
      user: 'ops@razorpay.com',
      action: 'Changed Flipkart gateway to HDFC Bank',
      reason: 'Better success rates on HDFC for e-commerce',
      merchantId: 'merch-005',
    },
    {
      id: 'log-008',
      timestamp: '01 Mar, 09:00 am',
      user: 'system@razorpay.com',
      action: 'Monthly revenue targets reset for March 2026',
      reason: 'Automated monthly cycle',
      merchantId: null,
    },
  ])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const addAuditEntry = useCallback((action, reason, merchantId) => {
    const now = new Date()
    const timeStr = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    }) + ', ' + now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    setAuditLog((prev) => [
      {
        id: 'log-' + Date.now(),
        timestamp: timeStr,
        user: 'anugrah.sharma@razorpay.com',
        action,
        reason: reason || 'No reason provided',
        merchantId,
      },
      ...prev,
    ])
  }, [])

  // Selection actions
  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }, [])

  const selectAll = useCallback(
    (filteredIds) => {
      setSelectedIds(filteredIds)
    },
    []
  )

  const clearSelection = useCallback(() => setSelectedIds([]), [])

  // Modal actions
  const openModal = useCallback((type, merchantId = null) => {
    setActiveModal(type)
    setModalMerchantId(merchantId)
  }, [])

  const closeModal = useCallback(() => {
    setActiveModal(null)
    setModalMerchantId(null)
  }, [])

  // Data mutations
  const changeRouting = useCallback(
    (merchantId, newStrategy, reason) => {
      setMerchants((prev) =>
        prev.map((m) =>
          m.id === merchantId ? { ...m, routingStrategy: newStrategy } : m
        )
      )
      const merchant = merchants.find((m) => m.id === merchantId)
      addAuditEntry(
        `Changed ${merchant?.name || merchantId} routing to ${newStrategy === 'cost_based' ? 'Cost Based' : 'Success Rate Based'}`,
        reason,
        merchantId
      )
      showToast(`Routing updated for ${merchant?.name}`)
    },
    [merchants, addAuditEntry, showToast]
  )

  const changeGateway = useCallback(
    (merchantId, newGatewayId, newTerminalId, reason) => {
      setMerchants((prev) =>
        prev.map((m) =>
          m.id === merchantId
            ? { ...m, currentGatewayId: newGatewayId, currentTerminalId: newTerminalId }
            : m
        )
      )
      const merchant = merchants.find((m) => m.id === merchantId)
      const gw = gateways.find((g) => g.id === newGatewayId)
      addAuditEntry(
        `Changed ${merchant?.name || merchantId} gateway to ${gw?.name} (${newTerminalId})`,
        reason,
        merchantId
      )
      showToast(`Gateway updated for ${merchant?.name}`)
    },
    [merchants, addAuditEntry, showToast]
  )

  const bulkChangeRouting = useCallback(
    (ids, newStrategy, reason) => {
      setMerchants((prev) =>
        prev.map((m) =>
          ids.includes(m.id) ? { ...m, routingStrategy: newStrategy } : m
        )
      )
      addAuditEntry(
        `Bulk changed ${ids.length} merchants to ${newStrategy === 'cost_based' ? 'Cost Based' : 'Success Rate Based'}`,
        reason,
        null
      )
      showToast(`Routing updated for ${ids.length} merchants`)
      setSelectedIds([])
    },
    [addAuditEntry, showToast]
  )

  const bulkChangeGateway = useCallback(
    (ids, newGatewayId, newTerminalId, reason) => {
      setMerchants((prev) =>
        prev.map((m) =>
          ids.includes(m.id)
            ? { ...m, currentGatewayId: newGatewayId, currentTerminalId: newTerminalId }
            : m
        )
      )
      const gw = gateways.find((g) => g.id === newGatewayId)
      addAuditEntry(
        `Bulk changed ${ids.length} merchants gateway to ${gw?.name}`,
        reason,
        null
      )
      showToast(`Gateway updated for ${ids.length} merchants`)
      setSelectedIds([])
    },
    [addAuditEntry, showToast]
  )

  // Computed: filtered + sorted merchants
  const getFilteredSortedMerchants = useMemo(() => {
    let list = [...merchants]

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.mid.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      )
    }

    // Filter routing
    if (filterRouting !== 'all') {
      list = list.filter((m) => m.routingStrategy === filterRouting)
    }

    // Filter deal type
    if (filterDealType !== 'all') {
      list = list.filter((m) => m.dealType === filterDealType)
    }

    // Filter status
    if (filterStatus !== 'all') {
      list = list.filter((m) => m.status === filterStatus)
    }

    // Sort
    list.sort((a, b) => {
      let aVal, bVal
      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'successRate':
          aVal = a.avgPaymentSuccessRate
          bVal = b.avgPaymentSuccessRate
          break
        case 'txnVolume':
          aVal = a.monthlyTxnVolume
          bVal = b.monthlyTxnVolume
          break
        case 'netRevenue':
          aVal = computeMerchantRevenue(a).netRevenue
          bVal = computeMerchantRevenue(b).netRevenue
          break
        case 'costPerTxn':
          aVal = computeMerchantRevenue(a).costPerTxn
          bVal = computeMerchantRevenue(b).costPerTxn
          break
        case 'forwardPricing':
          aVal = a.forwardPricing
          bVal = b.forwardPricing
          break
        case 'routingStrategy':
          aVal = a.routingStrategy
          bVal = b.routingStrategy
          break
        default:
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [merchants, searchQuery, sortField, sortDirection, filterRouting, filterDealType, filterStatus])

  const getMerchantById = useCallback(
    (id) => merchants.find((m) => m.id === id),
    [merchants]
  )

  const stats = useMemo(() => computeAggregateStats(merchants), [merchants])
  const zeroCostShare = useMemo(() => computeZeroCostShare(merchants), [merchants])

  const tspComplianceMap = useMemo(() => {
    const map = {}
    merchants.forEach((m) => {
      const compliance = computeTSPCompliance(m)
      if (compliance) map[m.id] = compliance
    })
    return map
  }, [merchants])

  const ntfRiskMap = useMemo(() => {
    const map = {}
    merchants.forEach((m) => {
      map[m.id] = computeNTFRisk(m)
    })
    return map
  }, [merchants])

  const ntfStats = useMemo(() => {
    const risks = Object.values(ntfRiskMap)
    return {
      critical: risks.filter((r) => r.level === 'critical').length,
      high: risks.filter((r) => r.level === 'high').length,
      medium: risks.filter((r) => r.level === 'medium').length,
      low: risks.filter((r) => r.level === 'low').length,
    }
  }, [ntfRiskMap])

  const routingConflictsMap = useMemo(() => {
    const map = {}
    merchants.forEach((m) => {
      const conflicts = detectRoutingConflicts(m)
      if (conflicts.length > 0) map[m.id] = conflicts
    })
    return map
  }, [merchants])

  const totalConflicts = useMemo(() => {
    return Object.values(routingConflictsMap).reduce((sum, arr) => sum + arr.length, 0)
  }, [routingConflictsMap])

  const targetData = useMemo(() => getMonthlyTargetData(merchants), [merchants])
  const monthlyHistory = useMemo(() => generateMonthlyHistory(merchants), [merchants])
  const [selectedMonth, setSelectedMonth] = useState(null)

  // Retention Risk + NR Opportunity computed values
  const retentionRisks = useMemo(() => computeRetentionRisk(merchants), [merchants])
  const nrOpportunities = useMemo(() => computeNROpportunity(merchants, targetData), [merchants, targetData])

  // SR Sensitivity mutations
  const toggleSRSensitive = useCallback(
    (merchantId) => {
      setMerchants((prev) =>
        prev.map((m) => {
          if (m.id !== merchantId) return m
          const newSensitive = !m.srSensitive
          return {
            ...m,
            srSensitive: newSensitive,
            srThresholdLow: newSensitive ? null : (m.srThresholdLow ?? 85),
          }
        })
      )
      const merchant = merchants.find((m) => m.id === merchantId)
      const newState = !merchant?.srSensitive
      addAuditEntry(
        `${newState ? 'Flagged' : 'Unflagged'} ${merchant?.name || merchantId} as SR Sensitive`,
        newState ? 'Routing locked to highest SR terminal' : 'Threshold-based routing enabled',
        merchantId
      )
      showToast(`${merchant?.name} ${newState ? 'marked as' : 'removed from'} SR Sensitive`)
    },
    [merchants, addAuditEntry, showToast]
  )

  const updateSRThreshold = useCallback(
    (merchantId, value) => {
      setMerchants((prev) =>
        prev.map((m) =>
          m.id === merchantId ? { ...m, srThresholdLow: value } : m
        )
      )
      const merchant = merchants.find((m) => m.id === merchantId)
      addAuditEntry(
        `Updated SR threshold for ${merchant?.name || merchantId} to ${value}%`,
        `Terminals below ${value}% SR will be de-prioritized`,
        merchantId
      )
      showToast(`SR threshold updated to ${value}% for ${merchant?.name}`)
    },
    [merchants, addAuditEntry, showToast]
  )

  // ── Rule CRUD Mutations ──────────────────

  const addRule = useCallback(
    (merchantId, rule) => {
      setMerchants((prev) =>
        prev.map((m) => {
          if (m.id !== merchantId) return m
          const existingRules = m.routingRulesV2 || []
          // Assign priority: one before default (999)
          const nonDefault = existingRules.filter((r) => !r.isDefault && !r.isMethodDefault)
          const newPriority = nonDefault.length + 1
          const newRule = { ...rule, priority: newPriority }
          return { ...m, routingRulesV2: [...existingRules, newRule] }
        })
      )
      const merchant = merchants.find((m) => m.id === merchantId)
      addAuditEntry(
        `Added routing rule "${rule.name}" for ${merchant?.name || merchantId}`,
        `Type: ${rule.type === 'volume_split' ? 'Volume Split' : 'Conditional'}`,
        merchantId
      )
      showToast(`Rule "${rule.name}" added`)
    },
    [merchants, addAuditEntry, showToast]
  )

  const updateRule = useCallback(
    (merchantId, ruleId, updates) => {
      setMerchants((prev) =>
        prev.map((m) => {
          if (m.id !== merchantId) return m
          return {
            ...m,
            routingRulesV2: (m.routingRulesV2 || []).map((r) =>
              r.id === ruleId ? { ...r, ...updates } : r
            ),
          }
        })
      )
      const merchant = merchants.find((m) => m.id === merchantId)
      const rule = merchant?.routingRulesV2?.find((r) => r.id === ruleId)
      addAuditEntry(
        `Updated routing rule "${rule?.name || ruleId}" for ${merchant?.name || merchantId}`,
        'Rule configuration modified',
        merchantId
      )
      showToast(`Rule "${rule?.name || 'rule'}" updated`)
    },
    [merchants, addAuditEntry, showToast]
  )

  const deleteRule = useCallback(
    (merchantId, ruleId) => {
      let deletedName = ''
      setMerchants((prev) =>
        prev.map((m) => {
          if (m.id !== merchantId) return m
          const rules = m.routingRulesV2 || []
          const target = rules.find((r) => r.id === ruleId)
          if (target?.isDefault || target?.isMethodDefault) return m // cannot delete default or method default
          deletedName = target?.name || ruleId
          const remaining = rules.filter((r) => r.id !== ruleId)
          // Re-index priorities (keep default at 999, method defaults at 900+)
          let priority = 1
          const reindexed = remaining.map((r) => {
            if (r.isDefault || r.isMethodDefault) return r
            return { ...r, priority: priority++ }
          })
          return { ...m, routingRulesV2: reindexed }
        })
      )
      const merchant = merchants.find((m) => m.id === merchantId)
      addAuditEntry(
        `Deleted routing rule "${deletedName}" from ${merchant?.name || merchantId}`,
        'Rule removed from active set',
        merchantId
      )
      showToast(`Rule "${deletedName}" deleted`)
    },
    [merchants, addAuditEntry, showToast]
  )

  const toggleRuleEnabled = useCallback(
    (merchantId, ruleId) => {
      let newState = false
      setMerchants((prev) =>
        prev.map((m) => {
          if (m.id !== merchantId) return m
          return {
            ...m,
            routingRulesV2: (m.routingRulesV2 || []).map((r) => {
              if (r.id !== ruleId) return r
              newState = !r.enabled
              return { ...r, enabled: newState }
            }),
          }
        })
      )
      const merchant = merchants.find((m) => m.id === merchantId)
      const rule = merchant?.routingRulesV2?.find((r) => r.id === ruleId)
      addAuditEntry(
        `${newState ? 'Enabled' : 'Disabled'} routing rule "${rule?.name || ruleId}" for ${merchant?.name || merchantId}`,
        newState ? 'Rule is now active' : 'Rule is now inactive',
        merchantId
      )
      showToast(`Rule "${rule?.name || 'rule'}" ${newState ? 'enabled' : 'disabled'}`)
    },
    [merchants, addAuditEntry, showToast]
  )

  const reorderRules = useCallback(
    (merchantId, orderedIds) => {
      setMerchants((prev) =>
        prev.map((m) => {
          if (m.id !== merchantId) return m
          const rules = m.routingRulesV2 || []
          const reordered = orderedIds.map((id, idx) => {
            const rule = rules.find((r) => r.id === id)
            if (!rule) return null
            return { ...rule, priority: rule.isDefault ? 999 : rule.isMethodDefault ? rule.priority : idx + 1 }
          }).filter(Boolean)
          // Add any rules not in orderedIds (shouldn't happen, but safety)
          rules.forEach((r) => {
            if (!orderedIds.includes(r.id)) reordered.push(r)
          })
          return { ...m, routingRulesV2: reordered }
        })
      )
      const merchant = merchants.find((m) => m.id === merchantId)
      addAuditEntry(
        `Reordered routing rules for ${merchant?.name || merchantId}`,
        'Rule priorities updated',
        merchantId
      )
      showToast('Rule priorities updated')
    },
    [merchants, addAuditEntry, showToast]
  )

  const toggleSort = useCallback(
    (field) => {
      if (sortField === field) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortField(field)
        setSortDirection('asc')
      }
    },
    [sortField]
  )

  const value = {
    merchants: getFilteredSortedMerchants,
    allMerchants: merchants,
    stats,
    zeroCostShare,
    tspComplianceMap,
    ntfRiskMap,
    ntfStats,
    routingConflictsMap,
    totalConflicts,
    targetData,
    monthlyHistory,
    selectedMonth,
    setSelectedMonth,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    toggleSort,
    filterRouting,
    setFilterRouting,
    filterDealType,
    setFilterDealType,
    filterStatus,
    setFilterStatus,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    activeModal,
    modalMerchantId,
    openModal,
    closeModal,
    changeRouting,
    changeGateway,
    bulkChangeRouting,
    bulkChangeGateway,
    getMerchantById,
    toast,
    showToast,
    auditLog,
    addAuditEntry,
    gateways,
    retentionRisks,
    nrOpportunities,
    toggleSRSensitive,
    updateSRThreshold,
    addRule,
    updateRule,
    deleteRule,
    toggleRuleEnabled,
    reorderRules,
  }

  return <KAMContext.Provider value={value}>{children}</KAMContext.Provider>
}

export function useKAM() {
  const ctx = useContext(KAMContext)
  if (!ctx) throw new Error('useKAM must be used within KAMProvider')
  return ctx
}
