import { createContext, useContext, useState, useCallback } from 'react'

const ApprovalContext = createContext(null)

// Mock managers list
const MANAGERS = [
  { id: 'mgr-001', name: 'Rahul Mehta', role: 'Engineering Manager', email: 'rahul.mehta@razorpay.com' },
  { id: 'mgr-002', name: 'Priya Iyer', role: 'Product Head - Payments', email: 'priya.iyer@razorpay.com' },
  { id: 'mgr-003', name: 'Vikram Singh', role: 'VP Engineering', email: 'vikram.singh@razorpay.com' },
]

// NTF risk classification
function classifyNTFRisk(action) {
  if (action.type === 'disable_terminal') return 'critical'
  if (action.type === 'avoid_terminal') return 'high'
  if (action.type === 'remove_network' || action.type === 'remove_issuer') return 'medium'
  return 'low'
}

function generateApprovalId() {
  return 'APR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
}

export function ApprovalProvider({ children }) {
  const [pendingApprovals, setPendingApprovals] = useState([
    // Seed with one example so the queue isn't empty
    {
      id: 'APR-SEED01',
      type: 'disable_terminal',
      riskLevel: 'critical',
      status: 'pending',
      terminalId: 'PAYU_T1',
      terminalDisplayId: 'PAYU_T1',
      gatewayName: 'PayU',
      method: 'Cards',
      reason: 'Terminal showing consistently high failure rates (>40%). Migrating traffic to HDFC_T2.',
      impactSummary: {
        merchantCount: 4,
        merchantNames: ['QuickBazaar', 'UrbanMart', 'FoodExpress', 'TechGadgets'],
        estimatedTxnVolume: '~1,200 txn/day',
        estimatedRevenue: 'â‚¹18.5L/day',
      },
      requestedBy: { name: 'Anugrah Sharma', email: 'anugrah.sharma@razorpay.com', role: 'Key Account Manager' },
      assignedTo: MANAGERS[0],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      updatedAt: null,
      comments: [],
    },
  ])

  // Modal state
  const [approvalModal, setApprovalModal] = useState(null) // null or { action, onConfirm, onCancel }

  const requestApproval = useCallback((action, impactData) => {
    return new Promise((resolve) => {
      setApprovalModal({
        action,
        impact: impactData,
        onConfirm: (reason, managerId) => {
          const manager = MANAGERS.find(m => m.id === managerId) || MANAGERS[0]
          const approval = {
            id: generateApprovalId(),
            type: action.type,
            riskLevel: classifyNTFRisk(action),
            status: 'pending',
            terminalId: action.terminalId,
            terminalDisplayId: action.terminalDisplayId || action.terminalId,
            gatewayName: action.gatewayName || '',
            method: action.method || '',
            reason,
            impactSummary: impactData,
            requestedBy: { name: 'Anugrah Sharma', email: 'anugrah.sharma@razorpay.com', role: 'Key Account Manager' },
            assignedTo: manager,
            createdAt: new Date().toISOString(),
            updatedAt: null,
            comments: [],
            // Store the original action payload for execution after approval
            actionPayload: action,
          }
          setPendingApprovals(prev => [approval, ...prev])
          setApprovalModal(null)
          resolve({ submitted: true, approvalId: approval.id })
        },
        onCancel: () => {
          setApprovalModal(null)
          resolve({ submitted: false })
        },
      })
    })
  }, [])

  const approveRequest = useCallback((approvalId, comment) => {
    setPendingApprovals(prev => prev.map(a =>
      a.id === approvalId
        ? {
            ...a,
            status: 'approved',
            updatedAt: new Date().toISOString(),
            comments: comment ? [...a.comments, { by: 'Manager', text: comment, at: new Date().toISOString() }] : a.comments,
          }
        : a
   "))
  }, [])

  const rejectRequest = useCallback((approvalId, comment) => {
    setPendingApprovals(prev => prev.map(a =>
      a.id === approvalId
        ? {
            ...a,
            status: 'rejected',
            updatedAt: new Date().toISOString(),
            comments: comment ? [...a.comments, { by: 'Manager', text: comment, at: new Date().toISOString() }] : a.comments,
          }
        : a
    ))
  }, [])

  const getApprovalForTerminal = useCallback((terminalId, actionType) => {
    return pendingApprovals.find(a =>
      a.terminalId === terminalId && a.type === actionType && a.status === 'pending'
    )
  }, [pendingApprovals])

  const pendingCount = pendingApprovals.filter(a => a.status === 'pending').length

  return (
    <ApprovalContext.Provider value={{
      pendingApprovals,
      pendingCount,
      approvalModal,
      managers: MANAGERS,
      requestApproval,
      approveRequest,
      rejectRequest,
      getApprovalForTerminal,
    }}>
      {children}
    </ApprovalContext.Provider>
  
 "‡ecturn (
    <ApprovalContext.Provider value={{
      pendingApprovals,
      pendingCount,
      approvalModal,
      managers: MANAGERS,
      requestApproval,
      approveRequest,
      rejectRequest,
      getApprovalForTerminal,
    }}>
      {children}
    </ApprovalContext.Provider>
  )
}

export function useApprovals() {
  const ctx = useContext(ApprovalContext)
  if (!ctx) throw new Error('useApprovals must be inside ApprovalProvider')
  return ctx
}
