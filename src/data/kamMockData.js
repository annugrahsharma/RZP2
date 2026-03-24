// ========================================
// Razorpay KAM Dashboard - Mock Data
// ========================================

// ── Gateways ────────────────────────────
export const gateways = [
  {
    id: 'gw-hdfc',
    name: 'HDFC Bank',
    shortName: 'HDFC',
    terminals: [
      { id: 'term-hdfc-001', terminalId: 'HDFC_T1', successRate: 73.5, costPerTxn: 1.80, isZeroCost: false },
      { id: 'term-hdfc-002', terminalId: 'HDFC_T2', successRate: 72.1, costPerTxn: 0, isZeroCost: true },
    ],
  },
  {
    id: 'gw-icici',
    name: 'ICICI Bank',
    shortName: 'ICICI',
    terminals: [
      { id: 'term-icici-001', terminalId: 'ICICI_T1', successRate: 72.8, costPerTxn: 1.70, isZeroCost: false },
      { id: 'term-icici-002', terminalId: 'ICICI_T2', successRate: 71.2, costPerTxn: 1.45, isZeroCost: false },
    ],
  },
  {
    id: 'gw-axis',
    name: 'Axis Bank',
    shortName: 'Axis',
    terminals: [
      { id: 'term-axis-001', terminalId: 'AXIS_T1', successRate: 71.4, costPerTxn: 1.50, isZeroCost: false },
      { id: 'term-axis-002', terminalId: 'AXIS_T2', successRate: 69.6, costPerTxn: 0, isZeroCost: true },
    ],
  },
  {
    id: 'gw-rbl',
    name: 'RBL Bank',
    shortName: 'RBL',
    terminals: [
      { id: 'term-rbl-001', terminalId: 'RBL_T1', successRate: 68.8, costPerTxn: 1.10, isZeroCost: false },
      { id: 'term-rbl-002', terminalId: 'RBL_T2', successRate: 67.5, costPerTxn: 0.95, isZeroCost: false, bankStatus: 'disabled', bankStatusReason: 'Bank maintenance — scheduled downtime', bankStatusSince: '2026-03-15T00:00:00Z' },
    ],
  },
  {
    id: 'gw-yes',
    name: 'Yes Bank',
    shortName: 'Yes',
    terminals: [
      { id: 'term-yes-001', terminalId: 'YES_T1', successRate: 69.1, costPerTxn: 0, isZeroCost: true },
      { id: 'term-yes-002', terminalId: 'YES_T2', successRate: 67.8, costPerTxn: 0.85, isZeroCost: false, bankStatus: 'disabled', bankStatusReason: 'Compliance review — terminal suspended by bank', bankStatusSince: '2026-03-10T00:00:00Z' },
    ],
  },
]

// ── Merchants (15 enterprise accounts) ──
export const merchants = [
  {
    id: 'merch-001',
    name: 'Zomato',
    mid: 'MID_ZOM_001',
    category: 'Food & Delivery',
    mcc: '5812',
    mccLabel: 'Restaurants',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 1250000,
    monthlyGMV: 437500000,
    avgPaymentSuccessRate: 72.9,
    forwardPricing: 2.0,
    currentGatewayId: 'gw-hdfc',
    currentTerminalId: 'term-hdfc-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 73.5, costPerTxn: 1.80, txnShare: 45, supportedMethods: ['Cards', 'UPI', 'NB'] },
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-002', successRate: 72.1, costPerTxn: 0, txnShare: 20, supportedMethods: ['Cards'] },
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 72.8, costPerTxn: 1.70, txnShare: 25, supportedMethods: ['Cards', 'NB'] },
      { gatewayId: 'gw-axis', terminalId: 'term-axis-001', successRate: 71.4, costPerTxn: 1.50, txnShare: 10, supportedMethods: ['UPI', 'NB'] },
    ],
    status: 'active',
    routingRules: { selectRules: 3, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
    srSensitive: true,
    srThresholdLow: null,
    txnVolumeHistory: { currentMonth: 1250000, lastYearSameMonth: 1180000 },
    contactName: 'Deepinder Goyal',
    contactEmail: 'payments@zomato.com',
  },
  {
    id: 'merch-002',
    name: 'Swiggy',
    mid: 'MID_SWG_002',
    category: 'Food & Delivery',
    mcc: '5812',
    mccLabel: 'Restaurants',
    dealType: 'tsp',
    dealDetails: {
      description: 'HDFC has given special CC rates for Swiggy based on combined CC+UPI acquiring volume.',
      constraint: 'Annual GMV commitment of ₹300Cr via HDFC terminals',
      expiresAt: 'Sep 2026',
      contact: 'pranavn.rattan@razorpay.com',
      lockedGatewayId: 'gw-hdfc',
      tspCompliance: { gmvCommitment: 3000000000, commitmentPeriod: 'annual' },
    },
    monthlyTxnVolume: 1100000,
    monthlyGMV: 385000000,
    avgPaymentSuccessRate: 71.8,
    forwardPricing: 1.9,
    currentGatewayId: 'gw-hdfc',
    currentTerminalId: 'term-hdfc-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 73.5, costPerTxn: 1.80, txnShare: 70, supportedMethods: ['Cards', 'UPI', 'NB'] },
      { gatewayId: 'gw-icici', terminalId: 'term-icici-002', successRate: 71.2, costPerTxn: 1.45, txnShare: 30, supportedMethods: ['Cards', 'NB'] },
    ],
    status: 'active',
    routingRules: { selectRules: 2, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: true },
    srSensitive: true,
    srThresholdLow: null,
    txnVolumeHistory: { currentMonth: 1100000, lastYearSameMonth: 1050000 },
    contactName: 'Sriharsha Majety',
    contactEmail: 'finance@swiggy.in',
  },
  {
    id: 'merch-003',
    name: 'CRED',
    mid: 'MID_CRD_003',
    category: 'Fintech',
    mcc: '6012',
    mccLabel: 'Financial Institutions',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 850000,
    monthlyGMV: 620000000,
    avgPaymentSuccessRate: 73.8,
    forwardPricing: 1.8,
    currentGatewayId: 'gw-hdfc',
    currentTerminalId: 'term-hdfc-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 73.5, costPerTxn: 1.80, txnShare: 60, supportedMethods: ['Cards', 'UPI'] },
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-002', successRate: 72.1, costPerTxn: 0, txnShare: 20, supportedMethods: ['Cards'] },
      { gatewayId: 'gw-axis', terminalId: 'term-axis-001', successRate: 71.4, costPerTxn: 1.50, txnShare: 20, supportedMethods: ['UPI', 'NB'] },
    ],
    status: 'active',
    routingRules: { selectRules: 3, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
    srSensitive: false,
    srThresholdLow: 68,
    txnVolumeHistory: { currentMonth: 650000, lastYearSameMonth: 820000 },
    contactName: 'Kunal Shah',
    contactEmail: 'payments@cred.club',
  },
  {
    id: 'merch-004',
    name: 'Flipkart',
    mid: 'MID_FLK_004',
    category: 'E-commerce',
    mcc: '5311',
    mccLabel: 'Department Stores',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 2200000,
    monthlyGMV: 1320000000,
    avgPaymentSuccessRate: 71.5,
    forwardPricing: 1.6,
    currentGatewayId: 'gw-icici',
    currentTerminalId: 'term-icici-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 72.8, costPerTxn: 1.70, txnShare: 50, supportedMethods: ['Cards', 'NB'] },
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-002', successRate: 72.1, costPerTxn: 0, txnShare: 30, supportedMethods: ['Cards', 'UPI'] },
      { gatewayId: 'gw-axis', terminalId: 'term-axis-001', successRate: 71.4, costPerTxn: 1.50, txnShare: 20, supportedMethods: ['UPI', 'NB'] },
    ],
    status: 'active',
    routingRules: { selectRules: 3, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
    srSensitive: false,
    srThresholdLow: 64,
    txnVolumeHistory: { currentMonth: 980000, lastYearSameMonth: 950000 },
    contactName: 'Kalyan Krishnamurthy',
    contactEmail: 'payments@flipkart.com',
  },
  {
    id: 'merch-005',
    name: 'Blinkit',
    mid: 'MID_BBK_005',
    category: 'Grocery',
    mcc: '5411',
    mccLabel: 'Grocery Stores',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 680000,
    monthlyGMV: 238000000,
    avgPaymentSuccessRate: 70.7,
    forwardPricing: 2.1,
    currentGatewayId: 'gw-icici',
    currentTerminalId: 'term-icici-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 73.5, costPerTxn: 1.80, txnShare: 35, supportedMethods: ['Cards'] },
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-002', successRate: 72.1, costPerTxn: 0, txnShare: 20, supportedMethods: ['UPI'] },
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 72.8, costPerTxn: 1.70, txnShare: 30, supportedMethods: ['Cards', 'NB'] },
      { gatewayId: 'gw-yes', terminalId: 'term-yes-001', successRate: 69.1, costPerTxn: 0, txnShare: 15, supportedMethods: ['UPI'] },
    ],
    status: 'active',
    routingRules: { selectRules: 2, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
    srSensitive: false,
    srThresholdLow: 87,
    txnVolumeHistory: { currentMonth: 720000, lastYearSameMonth: 880000 },
    contactName: 'Hari Menon',
    contactEmail: 'finance@bigbasket.com',
  },
  {
    id: 'merch-006',
    name: 'Myntra',
    mid: 'MID_MYN_006',
    category: 'Fashion',
    mcc: '5651',
    mccLabel: 'Clothing Stores',
    dealType: 'tsp',
    dealDetails: {
      description: 'HDFC has given special CC+DC rates for Myntra based on acquiring volume commitment via Midsign.',
      constraint: 'Annual GMV commitment of ₹250Cr via HDFC Midsign',
      expiresAt: 'Jun 2026',
      contact: 'pranavn.rattan@razorpay.com',
      lockedGatewayId: 'gw-hdfc',
      tspCompliance: { gmvCommitment: 2500000000, commitmentPeriod: 'annual' },
    },
    monthlyTxnVolume: 920000,
    monthlyGMV: 350000000,
    avgPaymentSuccessRate: 70.4,
    forwardPricing: 2.2,
    currentGatewayId: 'gw-axis',
    currentTerminalId: 'term-axis-001',
    routingStrategy: 'cost_based',
    gatewayMetrics: [
      { gatewayId: 'gw-axis', terminalId: 'term-axis-001', successRate: 71.4, costPerTxn: 1.50, txnShare: 55, supportedMethods: ['Cards', 'UPI', 'NB'] },
      { gatewayId: 'gw-rbl', terminalId: 'term-rbl-001', successRate: 68.8, costPerTxn: 1.10, txnShare: 45, supportedMethods: ['Cards'] },
    ],
    status: 'active',
    routingRules: { selectRules: 1, rejectRules: 2, hasFallback: false, hasCardRestrictions: false, hasNetworkRestrictions: true },
    srSensitive: false,
    srThresholdLow: 86,
    txnVolumeHistory: { currentMonth: 920000, lastYearSameMonth: 890000 },
    contactName: 'Nandita Sinha',
    contactEmail: 'payments@myntra.com',
  },
  {
    id: 'merch-007',
    name: 'BookMyShow',
    mid: 'MID_BMS_007',
    category: 'Entertainment',
    mcc: '7922',
    mccLabel: 'Entertainment',
    dealType: 'offer_linked',
    dealDetails: {
      description: 'HDFC 10% cashback offer on CC for BookMyShow movie tickets. Requires routing via HDFC terminal.',
      constraint: 'Offer traffic must route via HDFC_T1',
      expiresAt: 'Apr 2026',
      contact: 'simran.ranka@razorpay.com',
      lockedGatewayId: 'gw-hdfc',
    },
    monthlyTxnVolume: 450000,
    monthlyGMV: 180000000,
    avgPaymentSuccessRate: 73.2,
    forwardPricing: 2.5,
    currentGatewayId: 'gw-hdfc',
    currentTerminalId: 'term-hdfc-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 73.5, costPerTxn: 1.80, txnShare: 75, supportedMethods: ['Cards', 'UPI', 'NB'] },
      { gatewayId: 'gw-yes', terminalId: 'term-yes-001', successRate: 69.1, costPerTxn: 0, txnShare: 25, supportedMethods: ['UPI'] },
    ],
    status: 'active',
    routingRules: { selectRules: 2, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
    srSensitive: true,
    srThresholdLow: null,
    txnVolumeHistory: { currentMonth: 450000, lastYearSameMonth: 470000 },
    contactName: 'Ashish Hemrajani',
    contactEmail: 'finance@bookmyshow.com',
  },
  {
    id: 'merch-008',
    name: 'MakeMyTrip',
    mid: 'MID_MMT_008',
    category: 'Travel',
    mcc: '4722',
    mccLabel: 'Travel Agencies',
    dealType: 'offer_linked',
    dealDetails: {
      description: 'Axis Bank EMI offer for travel bookings above 10K. Transaction must route via Axis terminal.',
      constraint: 'EMI bookings must route via AXIS_T1',
      expiresAt: 'May 2026',
      contact: 'simran.ranka@razorpay.com',
      lockedGatewayId: 'gw-axis',
    },
    monthlyTxnVolume: 380000,
    monthlyGMV: 850000000,
    avgPaymentSuccessRate: 72.6,
    forwardPricing: 1.5,
    currentGatewayId: 'gw-hdfc',
    currentTerminalId: 'term-hdfc-002',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-002', successRate: 72.1, costPerTxn: 0, txnShare: 60, supportedMethods: ['Cards', 'UPI'] },
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 72.8, costPerTxn: 1.70, txnShare: 40, supportedMethods: ['Cards', 'NB'] },
    ],
    status: 'active',
    routingRules: { selectRules: 2, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: true },
    srSensitive: false,
    srThresholdLow: 88,
    txnVolumeHistory: { currentMonth: 380000, lastYearSameMonth: 520000 },
    contactName: 'Rajesh Magow',
    contactEmail: 'payments@makemytrip.com',
  },
  {
    id: 'merch-009',
    name: 'Nykaa',
    mid: 'MID_NYK_009',
    category: 'Beauty',
    mcc: '5977',
    mccLabel: 'Cosmetic Stores',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 520000,
    monthlyGMV: 150000000,
    avgPaymentSuccessRate: 69.5,
    forwardPricing: 2.3,
    currentGatewayId: 'gw-icici',
    currentTerminalId: 'term-icici-002',
    routingStrategy: 'cost_based',
    gatewayMetrics: [
      { gatewayId: 'gw-icici', terminalId: 'term-icici-002', successRate: 71.2, costPerTxn: 1.45, txnShare: 50, supportedMethods: ['Cards', 'NB'] },
      { gatewayId: 'gw-rbl', terminalId: 'term-rbl-001', successRate: 68.8, costPerTxn: 1.10, txnShare: 50, supportedMethods: ['Cards', 'UPI'] },
    ],
    status: 'active',
    routingRules: { selectRules: 1, rejectRules: 2, hasFallback: false, hasCardRestrictions: true, hasNetworkRestrictions: false },
    srSensitive: false,
    srThresholdLow: 85,
    txnVolumeHistory: { currentMonth: 510000, lastYearSameMonth: 490000 },
    contactName: 'Falguni Nayar',
    contactEmail: 'finance@nykaa.com',
  },
  {
    id: 'merch-010',
    name: 'Urban Company',
    mid: 'MID_URC_010',
    category: 'Services',
    mcc: '7299',
    mccLabel: 'Miscellaneous Services',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 310000,
    monthlyGMV: 85000000,
    avgPaymentSuccessRate: 68.6,
    forwardPricing: 2.4,
    currentGatewayId: 'gw-axis',
    currentTerminalId: 'term-axis-002',
    routingStrategy: 'cost_based',
    gatewayMetrics: [
      { gatewayId: 'gw-axis', terminalId: 'term-axis-002', successRate: 69.6, costPerTxn: 0, txnShare: 60, supportedMethods: ['Cards', 'UPI', 'NB'] },
      { gatewayId: 'gw-yes', terminalId: 'term-yes-001', successRate: 69.1, costPerTxn: 0, txnShare: 40, supportedMethods: ['UPI'] },
    ],
    status: 'active',
    routingRules: { selectRules: 0, rejectRules: 1, hasFallback: false, hasCardRestrictions: false, hasNetworkRestrictions: false },
    srSensitive: false,
    srThresholdLow: 84,
    txnVolumeHistory: { currentMonth: 290000, lastYearSameMonth: 410000 },
    contactName: 'Abhiraj Bhal',
    contactEmail: 'payments@urbancompany.com',
  },
  {
    id: 'merch-011',
    name: 'Zepto',
    mid: 'MID_ZPT_011',
    category: 'Quick Commerce',
    mcc: '5411',
    mccLabel: 'Grocery Stores',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 780000,
    monthlyGMV: 195000000,
    avgPaymentSuccessRate: 73.8,
    forwardPricing: 2.0,
    currentGatewayId: 'gw-hdfc',
    currentTerminalId: 'term-hdfc-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 73.5, costPerTxn: 1.80, txnShare: 40, supportedMethods: ['Cards', 'UPI', 'NB'] },
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-002', successRate: 72.1, costPerTxn: 0, txnShare: 15, supportedMethods: ['Cards'] },
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 72.8, costPerTxn: 1.70, txnShare: 20, supportedMethods: ['Cards', 'NB'] },
      { gatewayId: 'gw-axis', terminalId: 'term-axis-001', successRate: 74.2, costPerTxn: 1.50, txnShare: 10, supportedMethods: ['Cards', 'UPI'] },
      { gatewayId: 'gw-yes', terminalId: 'term-yes-001', successRate: 69.1, costPerTxn: 0, txnShare: 15, supportedMethods: ['UPI'] },
    ],
    status: 'active',
    routingRules: { selectRules: 3, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
    srSensitive: true,
    srThresholdLow: null,
    txnVolumeHistory: { currentMonth: 1400000, lastYearSameMonth: 900000 },
    contactName: 'Aadit Palicha',
    contactEmail: 'finance@zeptonow.com',
  },
  {
    id: 'merch-012',
    name: 'Ola',
    mid: 'MID_OLA_012',
    category: 'Mobility',
    mcc: '4121',
    mccLabel: 'Taxicabs & Rideshare',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 1500000,
    monthlyGMV: 280000000,
    avgPaymentSuccessRate: 69.8,
    forwardPricing: 1.7,
    currentGatewayId: 'gw-icici',
    currentTerminalId: 'term-icici-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 72.8, costPerTxn: 1.70, txnShare: 45, supportedMethods: ['Cards', 'NB'] },
      { gatewayId: 'gw-axis', terminalId: 'term-axis-001', successRate: 71.4, costPerTxn: 1.50, txnShare: 35, supportedMethods: ['Cards', 'UPI'] },
      { gatewayId: 'gw-rbl', terminalId: 'term-rbl-001', successRate: 68.8, costPerTxn: 1.10, txnShare: 20, supportedMethods: ['UPI', 'NB'] },
    ],
    status: 'active',
    routingRules: { selectRules: 2, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
    srSensitive: false,
    srThresholdLow: 87,
    txnVolumeHistory: { currentMonth: 600000, lastYearSameMonth: 580000 },
    contactName: 'Bhavish Aggarwal',
    contactEmail: 'payments@olacabs.com',
  },
  {
    id: 'merch-013',
    name: 'PhonePe',
    mid: 'MID_PPE_013',
    category: 'Fintech',
    mcc: '6012',
    mccLabel: 'Financial Institutions',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 3200000,
    monthlyGMV: 960000000,
    avgPaymentSuccessRate: 73.5,
    forwardPricing: 1.4,
    currentGatewayId: 'gw-hdfc',
    currentTerminalId: 'term-hdfc-001',
    routingStrategy: 'success_rate',
    gatewayMetrics: [
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-001', successRate: 73.5, costPerTxn: 1.80, txnShare: 35, supportedMethods: ['Cards', 'UPI', 'NB'] },
      { gatewayId: 'gw-hdfc', terminalId: 'term-hdfc-002', successRate: 72.1, costPerTxn: 0, txnShare: 15, supportedMethods: ['Cards'] },
      { gatewayId: 'gw-icici', terminalId: 'term-icici-001', successRate: 72.8, costPerTxn: 1.70, txnShare: 35, supportedMethods: ['Cards', 'NB'] },
      { gatewayId: 'gw-axis', terminalId: 'term-axis-002', successRate: 69.6, costPerTxn: 0, txnShare: 15, supportedMethods: ['UPI'] },
    ],
    status: 'active',
    routingRules: { selectRules: 3, rejectRules: 1, hasFallback: true, hasCardRestrictions: false, hasNetworkRestrictions: false },
    srSensitive: true,
    srThresholdLow: null,
    txnVolumeHistory: { currentMonth: 2200000, lastYearSameMonth: 2100000 },
    contactName: 'Sameer Nigam',
    contactEmail: 'finance@phonepe.com',
  },
  {
    id: 'merch-014',
    name: 'Paytm Mall',
    mid: 'MID_PTM_014',
    category: 'E-commerce',
    mcc: '5311',
    mccLabel: 'Department Stores',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 420000,
    monthlyGMV: 120000000,
    avgPaymentSuccessRate: 68.1,
    forwardPricing: 2.1,
    currentGatewayId: 'gw-rbl',
    currentTerminalId: 'term-rbl-001',
    routingStrategy: 'cost_based',
    gatewayMetrics: [
      { gatewayId: 'gw-rbl', terminalId: 'term-rbl-001', successRate: 68.8, costPerTxn: 1.10, txnShare: 70, supportedMethods: ['Cards', 'NB'] },
      { gatewayId: 'gw-yes', terminalId: 'term-yes-001', successRate: 69.1, costPerTxn: 0, txnShare: 30, supportedMethods: ['UPI'] },
    ],
    status: 'active',
    routingRules: { selectRules: 1, rejectRules: 2, hasFallback: false, hasCardRestrictions: true, hasNetworkRestrictions: false },
    srSensitive: false,
    srThresholdLow: 83,
    txnVolumeHistory: { currentMonth: 180000, lastYearSameMonth: 310000 },
    contactName: 'Vijay Shekhar',
    contactEmail: 'payments@paytmmall.com',
  },
  {
    id: 'merch-015',
    name: '1mg',
    mid: 'MID_1MG_015',
    category: 'Healthcare',
    mcc: '5912',
    mccLabel: 'Drug Stores & Pharmacies',
    dealType: 'standard',
    dealDetails: null,
    monthlyTxnVolume: 290000,
    monthlyGMV: 75000000,
    avgPaymentSuccessRate: 69.2,
    forwardPricing: 2.2,
    currentGatewayId: 'gw-yes',
    currentTerminalId: 'term-yes-001',
    routingStrategy: 'cost_based',
    gatewayMetrics: [
      { gatewayId: 'gw-yes', terminalId: 'term-yes-001', successRate: 69.1, costPerTxn: 0, txnShare: 60, supportedMethods: ['UPI', 'NB'] },
      { gatewayId: 'gw-rbl', terminalId: 'term-rbl-002', successRate: 67.5, costPerTxn: 0.95, txnShare: 40, supportedMethods: ['Cards'] },
    ],
    status: 'active',
    routingRules: { selectRules: 1, rejectRules: 1, hasFallback: false, hasCardRestrictions: false, hasNetworkRestrictions: false },
    srSensitive: false,
    srThresholdLow: 85,
    txnVolumeHistory: { currentMonth: 220000, lastYearSameMonth: 260000 },
    contactName: 'Prashant Tandon',
    contactEmail: 'finance@1mg.com',
  },
]

// ── KAM Profile ─────────────────────────
export const kamProfile = {
  id: 'kam-001',
  name: 'Anugrah Sharma',
  email: 'anugrah.sharma@razorpay.com',
  role: 'Key Account Manager',
  team: 'Enterprise Payments',
  avatarInitials: 'AS',
}

// ── Routing Strategies ──────────────────
export const routingStrategies = [
  {
    id: 'success_rate',
    label: 'Success Rate Based',
    description: 'Routes to gateway with highest success rate. Higher cost, better conversion.',
  },
  {
    id: 'cost_based',
    label: 'Cost Based',
    description: 'Routes to cheapest gateway. Lower cost, may have slightly lower success rate.',
  },
]

// ── Rule Engine Schema ─────────────────
export const RULE_CONDITIONS = {
  payment_method: { label: 'Payment Method', type: 'select', options: ['Cards', 'UPI', 'EMI'], operators: ['equals', 'in'] },
  card_network:   { label: 'Card Network',   type: 'select', options: ['Visa', 'Mastercard', 'RuPay', 'Amex', 'Diners'], operators: ['equals', 'in'] },
  card_type:      { label: 'Card Type',      type: 'select', options: ['credit', 'debit'], operators: ['equals'] },
  issuer_bank:    { label: 'Issuer Bank',    type: 'select', options: ['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak'], operators: ['equals'] },
  upi_flow:       { label: 'UPI Flow',       type: 'select', options: ['one_time', 'autopay'], operators: ['equals'] },
  amount:         { label: 'Amount',         type: 'number', operators: ['greater_than', 'less_than', 'between'] },
  international:  { label: 'International',  type: 'boolean', operators: ['equals'] },
  emi_type:       { label: 'EMI Type',       type: 'select', options: ['no_cost', 'standard'], operators: ['equals'] },
}

export const RULE_OPERATOR_LABELS = {
  equals: '=',
  in: 'in',
  greater_than: '>',
  less_than: '<',
  between: 'between',
}

// ── Platform-Level Rules (read-only for KAMs) ──
export const PLATFORM_RULES = [
  {
    id: 'platform-001',
    name: 'Block RBL for Gambling MCC',
    scope: { type: 'mcc', values: ['7995', '7993'] },
    conditions: [{ field: 'payment_method', operator: 'equals', value: 'Cards' }],
    action: { type: 'reject', terminals: ['term-rbl-001', 'term-rbl-002'] },
    reason: 'Compliance: RBL Bank does not process gambling/lottery transactions',
    createdBy: 'platform-ops',
    createdAt: '2025-11-01T00:00:00Z',
  },
  {
    id: 'platform-002',
    name: 'International → HDFC/ICICI Only',
    scope: { type: 'all' },
    conditions: [{ field: 'international', operator: 'equals', value: true }],
    action: { type: 'route', terminals: ['term-hdfc-001', 'term-icici-001'] },
    reason: 'Only HDFC and ICICI have international acquiring licenses',
    createdBy: 'platform-ops',
    createdAt: '2025-10-15T00:00:00Z',
  },
  {
    id: 'platform-003',
    name: 'High-Value Cards → Tier-1 Banks',
    scope: { type: 'all' },
    conditions: [
      { field: 'payment_method', operator: 'equals', value: 'Cards' },
      { field: 'amount', operator: 'greater_than', value: 50000 },
    ],
    action: { type: 'route', terminals: ['term-hdfc-001', 'term-icici-001'] },
    reason: 'Risk management: High-value transactions restricted to Tier-1 bank terminals',
    createdBy: 'platform-risk',
    createdAt: '2025-12-20T00:00:00Z',
  },
]

export function getPlatformRulesForMerchant(merchant) {
  return PLATFORM_RULES.filter(rule => {
    if (rule.scope.type === 'all') return true
    if (rule.scope.type === 'mcc') return rule.scope.values.includes(merchant.mcc)
    return false
  })
}

export const AMOUNT_PRESETS = [
  { label: '> ₹1L', operator: 'greater_than', value: 100000 },
  { label: '> ₹2L', operator: 'greater_than', value: 200000 },
  { label: '> ₹10L', operator: 'greater_than', value: 1000000 },
  { label: '< ₹100', operator: 'less_than', value: 100 },
]

export const PAYMENT_METHOD_GROUPS = [
  { key: 'all_txn', label: 'All Transactions', icon: 'layers',
    methodValues: null, subMethodField: null, subMethods: [], alwaysExpanded: true },
  { key: 'UPI_onetime', label: 'UPI One-time', icon: 'smartphone',
    methodValues: ['UPI'], subMethodField: null, subMethods: [],
    upiFlowFilter: 'one_time' },
  { key: 'UPI_autopay', label: 'UPI Autopay', icon: 'smartphone',
    methodValues: ['UPI'], subMethodField: null, subMethods: [],
    upiFlowFilter: 'autopay' },
  { key: 'Cards', label: 'Cards', icon: 'credit-card',
    methodValues: ['Cards'], subMethodField: 'card_network',
    subMethods: [
      { value: 'Visa', label: 'Visa' }, { value: 'Mastercard', label: 'Mastercard' },
      { value: 'RuPay', label: 'RuPay' }, { value: 'Amex', label: 'Amex' },
      { value: 'Diners', label: 'Diners' },
    ] },
  { key: 'EMI', label: 'EMI', icon: 'calendar',
    methodValues: ['EMI'], subMethodField: 'emi_type',
    subMethods: [
      { value: 'no_cost', label: 'No-Cost EMI' },
      { value: 'standard', label: 'Standard EMI' },
    ] },
  { key: 'all_methods', label: 'All Methods', icon: 'grid',
    methodValues: 'catch_all', subMethodField: null, subMethods: [] },
]

/**
 * Groups flat routing rules into method-based groups for visual display.
 * Returns { groups: [...], defaultRule }
 */
export function groupRulesByMethod(rules) {
  const nonDefaultRules = rules.filter(r => !r.isDefault && !r.isMethodDefault)
  const methodDefaultRules = rules.filter(r => r.isMethodDefault)
  const defaultRule = rules.find(r => r.isDefault) || null

  const groups = PAYMENT_METHOD_GROUPS.map(groupDef => ({
    groupDef,
    rules: [],
    subMethodRules: new Map(groupDef.subMethods.map(sm => [sm.value, []])),
  }))
  const groupMap = Object.fromEntries(groups.map(g => [g.groupDef.key, g]))

  for (const rule of nonDefaultRules) {
    const methodCond = rule.conditions.find(c => c.field === 'payment_method')

    // Volume split with no conditions → "All Transactions"
    if (rule.conditions.length === 0 || (rule.type === 'volume_split' && !methodCond)) {
      groupMap['all_txn'].rules.push(rule)
      continue
    }

    // No payment_method condition → "All Methods"
    if (!methodCond) {
      groupMap['all_methods'].rules.push(rule)
      continue
    }

    let targetMethods = []
    if (methodCond.operator === 'equals') {
      targetMethods = [methodCond.value]
    } else if (methodCond.operator === 'in' && Array.isArray(methodCond.value)) {
      targetMethods = methodCond.value
    } else {
      targetMethods = [methodCond.value]
    }

    for (const method of targetMethods) {
      // Find all groups that match this method
      const matchingGroups = groups.filter(g => {
        if (!g.groupDef.methodValues || g.groupDef.methodValues === 'catch_all') return false
        return g.groupDef.methodValues.includes(method)
      })

      if (matchingGroups.length === 0) {
        groupMap['all_methods'].rules.push(rule)
        continue
      }

      for (const group of matchingGroups) {
        // For UPI split groups, check upi_flow filter
        if (group.groupDef.upiFlowFilter) {
          const flowCond = rule.conditions.find(c => c.field === 'upi_flow')
          if (flowCond) {
            // Rule specifies a flow — only add to the matching flow group
            const flowValue = flowCond.value
            if (flowValue !== group.groupDef.upiFlowFilter) continue
          }
          // No flow condition — rule applies to all UPI, add to both groups
        }

        group.rules.push(rule)

        if (group.groupDef.subMethodField) {
          const subCond = rule.conditions.find(c => c.field === group.groupDef.subMethodField)
          if (subCond) {
            const subValues = subCond.operator === 'in' && Array.isArray(subCond.value)
              ? subCond.value : [subCond.value]
            for (const sv of subValues) {
              if (group.subMethodRules.has(sv)) {
                group.subMethodRules.get(sv).push(rule)
              }
            }
          }
        }
      }
    }
  }

  // Add method default rules to their respective groups
  for (const rule of methodDefaultRules) {
    const methodCond = rule.conditions.find(c => c.field === 'payment_method')
    if (methodCond) {
      const method = methodCond.value
      // Find all groups matching this method (handles UPI split into two groups)
      const matchingGroups = groups.filter(g => g.groupDef.methodValues && g.groupDef.methodValues !== 'catch_all' && g.groupDef.methodValues.includes(method))
      if (matchingGroups.length > 0) {
        matchingGroups.forEach(g => g.rules.push(rule))
      } else {
        groupMap['all_methods'].rules.push(rule)
      }
    }
  }

  return {
    groups: groups.filter(g => {
      if (g.groupDef.key === 'all_txn' || g.groupDef.key === 'all_methods') return g.rules.length > 0
      return true
    }),
    defaultRule,
  }
}

// ── Helpers ─────────────────────────────

export function computeMerchantRevenue(merchant) {
  const forwardRevenue = merchant.monthlyGMV * (merchant.forwardPricing / 100)
  const gateway = gateways.find((g) => g.id === merchant.currentGatewayId)
  const terminal = gateway?.terminals.find((t) => t.id === merchant.currentTerminalId)
  const backwardCost = merchant.monthlyTxnVolume * (terminal?.costPerTxn || 0)

  return {
    forwardRevenue,
    backwardCost,
    netRevenue: forwardRevenue - backwardCost,
    costPerTxn: terminal?.costPerTxn || 0,
  }
}

export function computeAggregateStats(merchantList) {
  const totalTxnVolume = merchantList.reduce((s, m) => s + m.monthlyTxnVolume, 0)
  const avgSuccessRate =
    merchantList.reduce((s, m) => s + m.avgPaymentSuccessRate, 0) / merchantList.length
  const merchantsOnCostRouting = merchantList.filter(
    (m) => m.routingStrategy === 'cost_based'
  ).length
  const merchantsOnSuccessRouting = merchantList.filter(
    (m) => m.routingStrategy === 'success_rate'
  ).length

  let totalNetRevenue = 0
  let totalBackwardCost = 0
  let totalForwardRevenue = 0
  merchantList.forEach((m) => {
    const rev = computeMerchantRevenue(m)
    totalNetRevenue += rev.netRevenue
    totalBackwardCost += rev.backwardCost
    totalForwardRevenue += rev.forwardRevenue
  })

  const avgCostPerTxn = totalBackwardCost / totalTxnVolume

  return {
    totalTxnVolume,
    avgSuccessRate: Number(avgSuccessRate.toFixed(1)),
    merchantsOnCostRouting,
    merchantsOnSuccessRouting,
    totalMerchants: merchantList.length,
    totalNetRevenue,
    totalBackwardCost,
    totalForwardRevenue,
    avgCostPerTxn: Number(avgCostPerTxn.toFixed(2)),
  }
}

export function computeZeroCostShare(merchantList) {
  let totalTxn = 0
  let zeroCostTxn = 0
  merchantList.forEach((m) => {
    const vol = m.monthlyTxnVolume
    m.gatewayMetrics.forEach((gm) => {
      const share = vol * (gm.txnShare / 100)
      totalTxn += share
      // Find if this terminal is zero-cost
      const gw = gateways.find((g) => g.id === gm.gatewayId)
      const term = gw?.terminals.find((t) => t.id === gm.terminalId)
      if (term?.isZeroCost) {
        zeroCostTxn += share
      }
    })
  })
  return totalTxn > 0 ? Number(((zeroCostTxn / totalTxn) * 100).toFixed(1)) : 0
}

export function isTerminalZeroCost(terminalId) {
  for (const gw of gateways) {
    const term = gw.terminals.find((t) => t.id === terminalId)
    if (term) return term.isZeroCost || false
  }
  return false
}

export function formatINR(amount) {
  if (Math.abs(amount) >= 10000000) {
    return '\u20B9' + (amount / 10000000).toFixed(1) + ' Cr'
  }
  if (Math.abs(amount) >= 100000) {
    return '\u20B9' + (amount / 100000).toFixed(1) + ' L'
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-IN').format(num)
}

export function getMonthlyTargetData(merchantList) {
  const stats = computeAggregateStats(merchantList)
  const target = 120000000
  const achieved = stats.totalNetRevenue
  const daysElapsed = 10
  const daysInMonth = 31

  return {
    month: 'March 2026',
    target,
    achieved,
    percentage: Number(((achieved / target) * 100).toFixed(1)),
    daysElapsed,
    daysInMonth,
    projectedRevenue: achieved * (daysInMonth / daysElapsed),
  }
}

// ── Backward Pricing Schedule (granular per terminal) ──
export const backwardPricingSchedule = {
  'term-hdfc-001': [
    { network: 'Visa', cardType: 'Credit', amountRange: '0-2K', costPerTxn: 1.60, isInternational: false },
    { network: 'Visa', cardType: 'Credit', amountRange: '2K-10K', costPerTxn: 1.80, isInternational: false },
    { network: 'Visa', cardType: 'Credit', amountRange: '10K+', costPerTxn: 2.10, isInternational: false },
    { network: 'Visa', cardType: 'Debit', amountRange: '0-2K', costPerTxn: 0.90, isInternational: false },
    { network: 'Visa', cardType: 'Debit', amountRange: '2K+', costPerTxn: 1.20, isInternational: false },
    { network: 'Mastercard', cardType: 'Credit', amountRange: '0-2K', costPerTxn: 1.55, isInternational: false },
    { network: 'Mastercard', cardType: 'Credit', amountRange: '2K+', costPerTxn: 1.75, isInternational: false },
    { network: 'RuPay', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.50, isInternational: false },
    { network: 'Visa', cardType: 'Credit', amountRange: 'All', costPerTxn: 3.20, isInternational: true },
  ],
  'term-hdfc-002': [
    { network: 'All', cardType: 'UPI', amountRange: 'All', costPerTxn: 0, isInternational: false },
  ],
  'term-icici-001': [
    { network: 'Visa', cardType: 'Credit', amountRange: '0-2K', costPerTxn: 1.50, isInternational: false },
    { network: 'Visa', cardType: 'Credit', amountRange: '2K+', costPerTxn: 1.70, isInternational: false },
    { network: 'Mastercard', cardType: 'Credit', amountRange: 'All', costPerTxn: 1.65, isInternational: false },
    { network: 'Visa', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.85, isInternational: false },
    { network: 'RuPay', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.45, isInternational: false },
    { network: 'Visa', cardType: 'Credit', amountRange: 'All', costPerTxn: 3.00, isInternational: true },
  ],
  'term-icici-002': [
    { network: 'Visa', cardType: 'Credit', amountRange: 'All', costPerTxn: 1.45, isInternational: false },
    { network: 'Mastercard', cardType: 'Credit', amountRange: 'All', costPerTxn: 1.40, isInternational: false },
    { network: 'Visa', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.80, isInternational: false },
    { network: 'RuPay', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.40, isInternational: false },
  ],
  'term-axis-001': [
    { network: 'Visa', cardType: 'Credit', amountRange: '0-5K', costPerTxn: 1.35, isInternational: false },
    { network: 'Visa', cardType: 'Credit', amountRange: '5K+', costPerTxn: 1.50, isInternational: false },
    { network: 'Mastercard', cardType: 'Credit', amountRange: 'All', costPerTxn: 1.45, isInternational: false },
    { network: 'Visa', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.75, isInternational: false },
    { network: 'RuPay', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.35, isInternational: false },
    { network: 'Visa', cardType: 'Credit', amountRange: 'All', costPerTxn: 2.80, isInternational: true },
  ],
  'term-axis-002': [
    { network: 'All', cardType: 'UPI', amountRange: 'All', costPerTxn: 0, isInternational: false },
  ],
  'term-rbl-001': [
    { network: 'Visa', cardType: 'Credit', amountRange: 'All', costPerTxn: 1.10, isInternational: false },
    { network: 'Mastercard', cardType: 'Credit', amountRange: 'All', costPerTxn: 1.05, isInternational: false },
    { network: 'Visa', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.60, isInternational: false },
    { network: 'RuPay', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.30, isInternational: false },
  ],
  'term-rbl-002': [
    { network: 'Visa', cardType: 'Credit', amountRange: 'All', costPerTxn: 0.95, isInternational: false },
    { network: 'Mastercard', cardType: 'Credit', amountRange: 'All', costPerTxn: 0.90, isInternational: false },
    { network: 'Visa', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.55, isInternational: false },
  ],
  'term-yes-001': [
    { network: 'All', cardType: 'UPI', amountRange: 'All', costPerTxn: 0, isInternational: false },
  ],
  'term-yes-002': [
    { network: 'Visa', cardType: 'Credit', amountRange: 'All', costPerTxn: 0.85, isInternational: false },
    { network: 'Mastercard', cardType: 'Credit', amountRange: 'All', costPerTxn: 0.80, isInternational: false },
    { network: 'Visa', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.50, isInternational: false },
    { network: 'RuPay', cardType: 'Debit', amountRange: 'All', costPerTxn: 0.25, isInternational: false },
  ],
}

export function getBackwardPricingBreakdown(terminalId) {
  return backwardPricingSchedule[terminalId] || []
}

// ── TSP Compliance ────────────────────────
export function computeTSPCompliance(merchant) {
  if (merchant.dealType !== 'tsp' || !merchant.dealDetails) return null
  const gmvCommitment = merchant.dealDetails.tspCompliance?.gmvCommitment
  if (gmvCommitment == null) return null

  const lockedGwId = merchant.dealDetails.lockedGatewayId

  // Actual traffic % going through the locked gateway
  const actualTrafficPct = merchant.gatewayMetrics
    .filter((gm) => gm.gatewayId === lockedGwId)
    .reduce((sum, gm) => sum + gm.txnShare, 0)

  // Projected annual GMV via locked gateway
  const projectedAnnualGMV = merchant.monthlyGMV * (actualTrafficPct / 100) * 12

  // Gap: positive = ahead of commitment, negative = behind
  const gmvGap = projectedAnnualGMV - gmvCommitment

  // Suggested traffic % to meet commitment
  const suggestedTrafficPct = Number(
    ((gmvCommitment / 12 / merchant.monthlyGMV) * 100).toFixed(1)
  )

  // Status: advisory, not punitive
  let status
  if (projectedAnnualGMV >= gmvCommitment) {
    status = 'on_track'
  } else if (projectedAnnualGMV >= gmvCommitment * 0.8) {
    status = 'at_risk'
  } else {
    status = 'off_track'
  }

  return {
    gmvCommitment,
    projectedAnnualGMV,
    gmvGap,
    suggestedTrafficPct,
    actualTrafficPct,
    status,
    lockedGatewayName: gateways.find((g) => g.id === lockedGwId)?.shortName || 'Unknown',
  }
}

// ── CBR Terminal Ordering ──────────────────
export function computeCBROrder(merchant) {
  const thresholdLow = merchant.srThresholdLow ?? 85

  // Enrich terminal entries with gateway info
  const entries = merchant.gatewayMetrics.map((gm) => {
    const gw = gateways.find((g) => g.id === gm.gatewayId)
    const term = gw?.terminals.find((t) => t.id === gm.terminalId)
    return {
      terminalId: term?.terminalId || gm.terminalId,
      gatewayId: gm.gatewayId,
      gatewayName: gw?.name || 'Unknown',
      gatewayShort: gw?.shortName || '??',
      successRate: gm.successRate,
      costPerTxn: gm.costPerTxn,
      isZeroCost: gm.costPerTxn === 0,
      txnShare: gm.txnShare,
      hasGMVPriority: false,
    }
  })

  // Mark terminals on TSP locked gateway
  const lockedGwId =
    merchant.dealType === 'tsp' && merchant.dealDetails?.lockedGatewayId
      ? merchant.dealDetails.lockedGatewayId
      : null
  if (lockedGwId) {
    entries.forEach((e) => {
      if (e.gatewayId === lockedGwId) e.hasGMVPriority = true
    })
  }

  const maxSR = Math.max(...entries.map((e) => e.successRate))

  // Split into eligible and fallback
  const eligible = entries.filter((e) => e.successRate >= thresholdLow)
  const fallback = entries.filter((e) => e.successRate < thresholdLow)

  // Sort eligible: GMV priority first, then cost ascending, then SR descending
  eligible.sort((a, b) => {
    if (a.hasGMVPriority !== b.hasGMVPriority) return a.hasGMVPriority ? -1 : 1
    if (a.costPerTxn !== b.costPerTxn) return a.costPerTxn - b.costPerTxn
    return b.successRate - a.successRate
  })

  // Sort fallback by SR descending
  fallback.sort((a, b) => b.successRate - a.successRate)

  // Assign continuous ranks
  eligible.forEach((e, i) => { e.rank = i + 1 })
  fallback.forEach((e, i) => { e.rank = eligible.length + i + 1 })

  return { maxSR, thresholdLow, eligible, fallback }
}

// ── Sankey Data Generator ─────────────────
const SANKEY_COLORS = {
  Cards: '#E65100',
  UPI: '#2E7D32',
  NB: '#7B1FA2',
  terminal: '#528FF0',
}

const SANKEY_SUBTYPES = {
  Cards: [
    { id: 'visa-card', name: 'Visa', weight: 45 },
    { id: 'mc-card', name: 'Mastercard', weight: 30 },
    { id: 'rupay-card', name: 'RuPay', weight: 25 },
  ],
  UPI: [
    { id: 'upi-collect', name: 'UPI Collect', weight: 40 },
    { id: 'upi-intent', name: 'UPI Intent', weight: 60 },
  ],
  NB: [
    { id: 'nb-sbi', name: 'SBI NB', weight: 35 },
    { id: 'nb-hdfc', name: 'HDFC NB', weight: 30 },
    { id: 'nb-other', name: 'Others NB', weight: 35 },
  ],
}

export function generateSankeyData(merchant) {
  const totalTxn = merchant.monthlyTxnVolume

  // Determine which payment method categories are supported
  const methodSet = new Set()
  merchant.gatewayMetrics.forEach((gm) => {
    if (gm.supportedMethods) gm.supportedMethods.forEach((m) => methodSet.add(m))
  })
  const activeMethods = ['Cards', 'UPI', 'NB'].filter((m) => methodSet.has(m))

  // Seed-based payment method split (varies per merchant)
  const seed0 = hashCode(merchant.id + '-sankey')
  const rawWeights = activeMethods.map((m, i) => {
    const base = m === 'Cards' ? 45 : m === 'UPI' ? 35 : 20
    const jitter = (seededRandom(seed0 + i * 7) - 0.5) * 20
    return Math.max(5, base + jitter)
  })
  const wTotal = rawWeights.reduce((s, w) => s + w, 0)

  // Build column-0 nodes (Payment Methods)
  const nodes = []
  const links = []
  const methodVolumes = {}

  activeMethods.forEach((m, i) => {
    const vol = Math.round(totalTxn * (rawWeights[i] / wTotal))
    methodVolumes[m] = vol
    nodes.push({ id: m, name: m === 'Cards' ? 'Cards' : m === 'UPI' ? 'UPI' : 'Net Banking', column: 0, value: vol, color: SANKEY_COLORS[m] })
  })

  // Build column-1 nodes (Sub-types) + links from col-0 → col-1
  const subtypeVolumes = {}

  activeMethods.forEach((m) => {
    const subs = SANKEY_SUBTYPES[m] || []
    const mVol = methodVolumes[m]
    // Apply seeded jitter to sub-type weights
    const subSeed = hashCode(merchant.id + '-sub-' + m)
    const jittered = subs.map((s, i) => {
      const j = (seededRandom(subSeed + i * 3) - 0.5) * 15
      return { ...s, w: Math.max(3, s.weight + j) }
    })
    const subTotal = jittered.reduce((s, x) => s + x.w, 0)

    jittered.forEach((sub) => {
      const vol = Math.round(mVol * (sub.w / subTotal))
      if (vol <= 0) return
      subtypeVolumes[sub.id] = vol
      nodes.push({ id: sub.id, name: sub.name, column: 1, value: vol, color: SANKEY_COLORS[m] })
      links.push({ source: m, target: sub.id, value: vol })
    })
  })

  // Build column-2 nodes (Terminals) + links from col-1 → col-2
  // Build terminal info
  const termEntries = merchant.gatewayMetrics.map((gm) => {
    const gw = gateways.find((g) => g.id === gm.gatewayId)
    const term = gw?.terminals.find((t) => t.id === gm.terminalId)
    return {
      id: gm.terminalId,
      displayId: term?.terminalId || gm.terminalId,
      gatewayShort: gw?.shortName || '??',
      txnShare: gm.txnShare,
      supportedMethods: gm.supportedMethods || [],
    }
  })

  // Distribute each subtype's volume across terminals that support its parent method
  const terminalTotals = {}
  const subtypeIds = Object.keys(subtypeVolumes)

  subtypeIds.forEach((subId) => {
    // Determine parent method
    const parentMethod = Object.keys(SANKEY_SUBTYPES).find((m) =>
      SANKEY_SUBTYPES[m].some((s) => s.id === subId)
    )
    if (!parentMethod) return

    // Filter terminals that support this method
    const eligible = termEntries.filter((t) => t.supportedMethods.includes(parentMethod))
    if (eligible.length === 0) return

    const subVol = subtypeVolumes[subId]
    const shareTotal = eligible.reduce((s, t) => s + t.txnShare, 0)

    eligible.forEach((t) => {
      const vol = Math.round(subVol * (t.txnShare / shareTotal))
      if (vol <= 0) return
      terminalTotals[t.id] = (terminalTotals[t.id] || 0) + vol
      links.push({ source: subId, target: t.id, value: vol })
    })
  })

  // Add terminal nodes
  termEntries.forEach((t) => {
    if (terminalTotals[t.id]) {
      nodes.push({
        id: t.id,
        name: t.displayId,
        column: 2,
        value: terminalTotals[t.id],
        color: SANKEY_COLORS.terminal,
        gatewayShort: t.gatewayShort,
      })
    }
  })

  return { nodes, links, totalTxn }
}

// ── NTF Risk ──────────────────────────────
export function computeNTFRisk(merchant) {
  const rules = merchant.routingRules
  if (!rules) return { score: 0, level: 'low', factors: [] }

  let score = 0
  const factors = []

  // Cost-driven reject without fallback (40-50% of NTF)
  if (merchant.routingStrategy === 'cost_based' && rules.rejectRules > 0 && !rules.hasFallback) {
    score += 40
    factors.push('Cost-driven reject rules without fallback')
  }

  // Missing select rules (20-25%)
  if (rules.selectRules === 0) {
    score += 25
    factors.push('No SELECT rules configured')
  } else if (rules.selectRules < 2) {
    score += 10
    factors.push('Insufficient SELECT rule coverage')
  }

  // Network/card restrictions (15-20%)
  if (rules.hasNetworkRestrictions) {
    score += 15
    factors.push('Network restrictions active')
  }
  if (rules.hasCardRestrictions) {
    score += 15
    factors.push('Card type restrictions active')
  }

  // Few gateway options
  if (merchant.gatewayMetrics.length <= 2) {
    score += 10
    factors.push('Limited gateway diversity (\u22642 gateways)')
  }

  const level = score >= 50 ? 'critical' : score >= 30 ? 'high' : score >= 15 ? 'medium' : 'low'

  return { score: Math.min(score, 100), level, factors }
}

// ── Routing Conflict Detection ────────────
export function detectRoutingConflicts(merchant) {
  const conflicts = []

  // TSP deal but primary gateway doesn't match locked gateway
  if (merchant.dealType === 'tsp' && merchant.dealDetails?.lockedGatewayId) {
    if (merchant.currentGatewayId !== merchant.dealDetails.lockedGatewayId) {
      const lockedGw = gateways.find((g) => g.id === merchant.dealDetails.lockedGatewayId)
      conflicts.push({
        type: 'tsp_gateway_mismatch',
        severity: 'critical',
        message: `Primary gateway is not ${lockedGw?.shortName || 'locked gateway'}. TSP deal requires routing via ${lockedGw?.shortName}.`,
        recommendation: `Switch primary gateway to ${lockedGw?.shortName} to comply with TSP deal terms.`,
      })
    }
  }

  // Offer-linked deal but offer gateway not in active traffic
  if (merchant.dealType === 'offer_linked' && merchant.dealDetails?.lockedGatewayId) {
    const lockedGwId = merchant.dealDetails.lockedGatewayId
    const hasLockedGwInMetrics = merchant.gatewayMetrics.some((gm) => gm.gatewayId === lockedGwId)
    if (!hasLockedGwInMetrics) {
      const lockedGw = gateways.find((g) => g.id === lockedGwId)
      conflicts.push({
        type: 'offer_gateway_missing',
        severity: 'high',
        message: `Offer requires routing via ${lockedGw?.shortName}, but no traffic is routed there.`,
        recommendation: `Add ${lockedGw?.shortName} terminal to active routing to enable offer fulfillment.`,
      })
    }
  }

  // Cost-based routing on merchant with SR < 92%
  if (merchant.routingStrategy === 'cost_based' && merchant.avgPaymentSuccessRate < 92) {
    conflicts.push({
      type: 'cost_routing_low_sr',
      severity: 'medium',
      message: `Cost-based routing active but success rate is ${merchant.avgPaymentSuccessRate}% (below 92% threshold).`,
      recommendation: 'Consider switching to SR-based routing to improve payment reliability.',
    })
  }

  // All gateways have sub-93% SR
  const allSubOptimal = merchant.gatewayMetrics.every((gm) => gm.successRate < 93)
  if (allSubOptimal && merchant.gatewayMetrics.length >= 2) {
    conflicts.push({
      type: 'no_optimal_gateway',
      severity: 'medium',
      message: 'All active gateways have sub-optimal success rates (<93%).',
      recommendation: 'Request terminal procurement for a higher-SR gateway from TR team.',
    })
  }

  return conflicts
}

// ── Retention Risk ──────────────────────
export function computeRetentionRisk(merchants) {
  return merchants
    .map((m) => {
      const curr = m.txnVolumeHistory?.currentMonth || 0
      const prev = m.txnVolumeHistory?.lastYearSameMonth || 0
      if (prev === 0) return null
      const yoyChange = Number((((curr - prev) / prev) * 100).toFixed(1))
      if (yoyChange >= 0) return null
      const absChange = Math.abs(yoyChange)
      const riskLevel = absChange > 25 ? 'critical' : absChange > 15 ? 'high' : absChange > 5 ? 'medium' : null
      if (!riskLevel) return null
      return {
        merchantId: m.id,
        merchantName: m.name,
        mid: m.mid,
        currentVolume: curr,
        lastYearVolume: prev,
        yoyChange,
        riskLevel,
        srSensitive: m.srSensitive,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.yoyChange - b.yoyChange)
}

// ── NR Opportunity ──────────────────────
export function computeNROpportunity(merchants) {
  return merchants
    .filter((m) => !m.srSensitive && m.routingStrategy === 'success_rate')
    .map((m) => {
      const currentRevenue = computeMerchantRevenue(m)
      // Simulate: if switched to cost routing, find cheapest terminal
      const cheapestTerminal = m.gatewayMetrics
        .slice()
        .sort((a, b) => a.costPerTxn - b.costPerTxn)[0]
      if (!cheapestTerminal) return null
      const currentGw = gateways.find((g) => g.id === m.currentGatewayId)
      const currentTerm = currentGw?.terminals.find((t) => t.id === m.currentTerminalId)
      const currentCost = currentTerm?.costPerTxn || 0
      const saving = (currentCost - cheapestTerminal.costPerTxn) * m.monthlyTxnVolume
      if (saving <= 0) return null
      return {
        merchantId: m.id,
        merchantName: m.name,
        mid: m.mid,
        currentNR: currentRevenue.netRevenue,
        potentialSaving: saving,
        potentialNR: currentRevenue.netRevenue + saving,
        currentCostPerTxn: currentCost,
        cheapestCostPerTxn: cheapestTerminal.costPerTxn,
        cheapestTerminalId: cheapestTerminal.terminalId,
        suggestedAction: `Switch to cost routing via ${gateways.find((g) => g.id === cheapestTerminal.gatewayId)?.shortName || 'cheaper'} terminal`,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.potentialSaving - a.potentialSaving)
}

// ── Shared Helpers ──────────────────────

// Simple deterministic hash for reproducible mock data
function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + ch
    hash |= 0
  }
  return Math.abs(hash)
}

// ── SR Time-Series Generator ────────────

const METHOD_LABELS = { CC: 'Credit Cards', DC: 'Debit Cards', UPI: 'UPI', NB: 'Net Banking' }

function seededRandom(seed) {
  // Simple xorshift-style PRNG from a seed number
  let s = seed | 0
  s ^= s << 13; s ^= s >> 17; s ^= s << 5
  return ((s < 0 ? ~s + 1 : s) % 10000) / 10000
}

// ---------------------------------------------------------------------------
// AI Recommended Actions generator
// ---------------------------------------------------------------------------
export function generateRecommendations(merchant) {
  const recs = []

  // 1. Wallet share risk: txn volume dropped YoY
  const { currentMonth, lastYearSameMonth } = merchant.txnVolumeHistory || {}
  if (currentMonth && lastYearSameMonth && lastYearSameMonth > 0) {
    const yoyChange = ((currentMonth - lastYearSameMonth) / lastYearSameMonth) * 100
    if (yoyChange < -15) {
      const dropPct = Math.abs(yoyChange).toFixed(0)
      if (!merchant.srSensitive) {
        recs.push({
          id: 'enable-sr-sensitivity',
          type: 'critical',
          title: 'Enable SR Sensitivity flag',
          description: `Transaction volume has dropped ${dropPct}% compared to the same month last year, indicating potential wallet share risk. Enabling SR sensitivity locks routing to the highest success-rate terminal, improving payment reliability and merchant experience.`,
          signal: `${dropPct}% YoY transaction decline`,
          action: 'enable_sr_sensitive',
          impact: 'Improve payment success rate, reduce failed transactions',
          confidence: 88,
          affectedArea: 'Routing Strategy',
        })
      } else {
        recs.push({
          id: 'wallet-share-risk-alert',
          type: 'warning',
          title: 'Monitor wallet share risk closely',
          description: `Transaction volume has dropped ${dropPct}% compared to the same month last year. SR sensitivity is already enabled. Consider reaching out to the merchant to understand if there are integration or business issues driving the decline.`,
          signal: `${dropPct}% YoY transaction decline`,
          action: 'contact_merchant',
          impact: 'Retain merchant, prevent further volume loss',
          confidence: 82,
          affectedArea: 'Merchant Retention',
        })
      }
    }
  }

  // 2. Low SR: success rate below 93% — enrich with MCC peer terminal comparison
  if (merchant.avgPaymentSuccessRate < 93 && !merchant.srSensitive) {
    const mccPeers = merchants.filter(
      (m) => m.mcc === merchant.mcc && m.id !== merchant.id
    )
    const merchantGwIds = new Set(merchant.gatewayMetrics.map((gm) => gm.gatewayId))
    const merchantTerminalCount = merchant.gatewayMetrics.length

    // Find peers with higher SR
    const betterPeers = mccPeers
      .filter((p) => p.avgPaymentSuccessRate > merchant.avgPaymentSuccessRate)
      .sort((a, b) => b.avgPaymentSuccessRate - a.avgPaymentSuccessRate)

    // Find terminals that better peers have but this merchant doesn't
    const missingGateways = []
    const seenGw = new Set()
    betterPeers.forEach((peer) => {
      peer.gatewayMetrics.forEach((gm) => {
        if (!merchantGwIds.has(gm.gatewayId) && !seenGw.has(gm.gatewayId)) {
          seenGw.add(gm.gatewayId)
          const gwInfo = gateways.find((g) => g.id === gm.gatewayId)
          missingGateways.push({
            gatewayId: gm.gatewayId,
            gwName: gwInfo?.shortName || gm.gatewayId,
            successRate: gm.successRate,
            peerName: peer.name,
            peerSR: peer.avgPaymentSuccessRate,
            peerTerminalCount: peer.gatewayMetrics.length,
          })
        }
      })
    })
    missingGateways.sort((a, b) => b.successRate - a.successRate)

    let description, signal, title, impact
    if (betterPeers.length > 0 && missingGateways.length > 0) {
      const bestPeer = betterPeers[0]
      const srGap = (bestPeer.avgPaymentSuccessRate - merchant.avgPaymentSuccessRate).toFixed(1)
      const topMissing = missingGateways.slice(0, 2)
      const terminalNames = topMissing.map((g) => g.gwName).join(', ')
      title = `Procure ${terminalNames} terminal${topMissing.length > 1 ? 's' : ''} to close SR gap`
      description = `${merchant.name} has ${merchantTerminalCount} terminal${merchantTerminalCount !== 1 ? 's' : ''} with ${merchant.avgPaymentSuccessRate}% SR, while MCC peer ${bestPeer.name} achieves ${bestPeer.avgPaymentSuccessRate}% SR with ${bestPeer.gatewayMetrics.length} terminals — ${srGap}pp higher. ${bestPeer.name} routes via ${topMissing.map((g) => `${g.gwName} (${g.successRate}% SR)`).join(' and ')}, which ${merchant.name} currently lacks. Adding ${topMissing.length > 1 ? 'these terminals' : 'this terminal'} would expand routing options and help close the SR gap.`
      signal = `${merchantTerminalCount} terminals vs ${bestPeer.gatewayMetrics.length} at ${bestPeer.name} · SR gap ${srGap}pp`
      impact = `Close ${srGap}pp SR gap with MCC peers`
    } else if (betterPeers.length > 0) {
      const bestPeer = betterPeers[0]
      const srGap = (bestPeer.avgPaymentSuccessRate - merchant.avgPaymentSuccessRate).toFixed(1)
      title = 'Investigate low success rate'
      description = `Current SR is ${merchant.avgPaymentSuccessRate}%, trailing MCC peer ${bestPeer.name} (${bestPeer.avgPaymentSuccessRate}%) by ${srGap}pp. Both have similar terminal coverage — review terminal health and routing configuration to identify the gap.`
      signal = `SR ${merchant.avgPaymentSuccessRate}% vs ${bestPeer.name} at ${bestPeer.avgPaymentSuccessRate}%`
      impact = `Close ${srGap}pp SR gap with MCC peers`
    } else {
      title = 'Investigate low success rate'
      description = `Current success rate is ${merchant.avgPaymentSuccessRate}%, which is below the 93% threshold. Consider enabling SR sensitivity or reviewing terminal health to improve payment experience.`
      signal = `SR at ${merchant.avgPaymentSuccessRate}% (below 93% benchmark)`
      impact = 'Improve conversion rate by 2–4%'
    }

    recs.push({
      id: 'low-sr-action',
      type: 'critical',
      title,
      description,
      signal,
      action: missingGateways.length > 0 ? 'procure_terminal' : 'review_terminals',
      impact,
      confidence: 92,
      affectedArea: missingGateways.length > 0 ? 'Terminal Procurement' : 'Terminal Health',
      meta: missingGateways.length > 0 ? {
        missingGateways: missingGateways.slice(0, 2),
        peerComparison: betterPeers.slice(0, 2).map((p) => ({
          name: p.name, sr: p.avgPaymentSuccessRate, terminalCount: p.gatewayMetrics.length,
        })),
        merchantTerminalCount,
      } : undefined,
    })
  }

  // 3. Underutilised zero-cost terminal
  const zeroCostTerminals = merchant.gatewayMetrics.filter((gm) => gm.costPerTxn === 0)
  if (zeroCostTerminals.length > 0) {
    const lowShare = zeroCostTerminals.filter((t) => t.txnShare < 15)
    if (lowShare.length > 0) {
      recs.push({
        id: 'increase-zero-cost',
        type: 'opportunity',
        title: 'Increase zero-cost terminal traffic share',
        description: `${lowShare.length} zero-cost terminal(s) are processing less than 15% of transactions. Routing more traffic through these terminals can reduce backward cost without impacting success rates (current SR: ${lowShare.map(t => t.successRate + '%').join(', ')}).`,
        signal: `Zero-cost terminal(s) at ${lowShare.map(t => t.txnShare + '% share').join(', ')}`,
        action: 'optimize_routing',
        impact: `Save ₹${(lowShare.reduce((s, t) => s + (1.5 * merchant.monthlyTxnVolume * 0.15 / 100), 0) / 100000).toFixed(1)}L/month in backward cost`,
        confidence: 78,
        affectedArea: 'Cost Optimization',
      })
    }
  }

  // 4. TSP compliance risk
  if (merchant.dealType === 'tsp' && merchant.dealDetails) {
    const tspTerminal = merchant.gatewayMetrics.find(
      (gm) => gm.gatewayId === merchant.currentGatewayId
    )
    if (tspTerminal && tspTerminal.txnShare < 50) {
      recs.push({
        id: 'tsp-compliance',
        type: 'warning',
        title: 'TSP deal compliance at risk',
        description: `The TSP-locked gateway is only receiving ${tspTerminal.txnShare}% of transactions, which may not meet the commitment threshold. Consider increasing routing share to avoid contract penalties.`,
        signal: `TSP gateway at ${tspTerminal.txnShare}% share (target: >50%)`,
        action: 'adjust_routing',
        impact: 'Avoid TSP contract penalty, maintain deal terms',
        confidence: 95,
        affectedArea: 'Compliance',
      })
    }
  }

  // 5. High SR merchant not flagged as SR sensitive (opportunity)
  if (merchant.avgPaymentSuccessRate >= 96 && !merchant.srSensitive) {
    const yoyChange = currentMonth && lastYearSameMonth
      ? ((currentMonth - lastYearSameMonth) / lastYearSameMonth) * 100
      : 0
    if (yoyChange >= 10) {
      recs.push({
        id: 'cost-optimise',
        type: 'opportunity',
        title: 'Switch to cost-optimised routing',
        description: `This merchant has a strong SR of ${merchant.avgPaymentSuccessRate}% and transaction volume is growing ${yoyChange.toFixed(0)}% YoY. The high SR provides headroom to route through cheaper terminals without impacting payment reliability.`,
        signal: `${merchant.avgPaymentSuccessRate}% SR with ${yoyChange.toFixed(0)}% volume growth`,
        action: 'optimize_cost',
        impact: 'Reduce backward cost while maintaining SR above 95%',
        confidence: 74,
        affectedArea: 'Cost Optimization',
      })
    }
  }

  // 6. Terminal prioritization — cost vs SR tradeoff
  if (merchant.gatewayMetrics.length >= 2) {
    const sorted = [...merchant.gatewayMetrics].sort((a, b) => b.txnShare - a.txnShare)
    const primary = sorted[0] // highest share terminal

    const cheaperAlts = merchant.gatewayMetrics.filter(
      (t) => t.costPerTxn < primary.costPerTxn && t.terminalId !== primary.terminalId
    )

    cheaperAlts.forEach((alt) => {
      const srDiff = primary.successRate - alt.successRate
      const costDiff = primary.costPerTxn - alt.costPerTxn

      if (srDiff > 0 && srDiff <= 1.5 && costDiff >= 0.5) {
        const primaryGw = gateways.find((g) => g.id === primary.gatewayId)
        const primaryTermId = primaryGw?.terminals.find((t) => t.id === primary.terminalId)?.terminalId || primary.terminalId
        const altGw = gateways.find((g) => g.id === alt.gatewayId)
        const altTermId = altGw?.terminals.find((t) => t.id === alt.terminalId)?.terminalId || alt.terminalId

        const srBps = Math.round(srDiff * 100) // basis points
        const avgTxnValue = merchant.monthlyGMV / merchant.monthlyTxnVolume
        const costBps = Math.round((costDiff / avgTxnValue) * 10000)
        const monthlySaving = Math.round(costDiff * (primary.txnShare / 100) * merchant.monthlyTxnVolume)
        const savingLakhs = (monthlySaving / 100000).toFixed(1)

        recs.push({
          id: `terminal-prioritize-${alt.terminalId}`,
          type: 'opportunity',
          title: `Prioritise ${altTermId} over ${primaryTermId}`,
          description: `${primaryTermId} currently processes ${primary.txnShare}% of transactions at ₹${primary.costPerTxn.toFixed(2)}/txn. By shifting traffic to ${altTermId} (${alt.costPerTxn === 0 ? 'zero-cost' : '₹' + alt.costPerTxn.toFixed(2) + '/txn'}), you lose only ${srBps} bps in SR (${primary.successRate}% → ${alt.successRate}%) but save ${costBps} bps in backward cost. The SR tradeoff is minimal for a cost saving of ₹${savingLakhs}L/month.`,
          signal: `${srBps} bps SR loss vs ${costBps} bps cost saving`,
          action: 'prioritize_terminal',
          impact: `Save ₹${savingLakhs}L/month in backward cost with minimal SR impact`,
          confidence: 71,
          affectedArea: 'Terminal Routing',
          meta: {
            fromTerminal: primaryTermId,
            toTerminal: altTermId,
            srBps,
            costBps,
            savingLakhs,
          },
        })
      }
    })
  }

  // 7. Card network routing — route Visa cards to preferred gateway
  const ccTerminals = merchant.gatewayMetrics.filter(
    (t) => (t.supportedMethods || []).includes('Cards')
  )
  if (ccTerminals.length >= 2 && merchant.monthlyGMV >= 500000000) {
    const sortedCC = [...ccTerminals].sort((a, b) => a.costPerTxn - b.costPerTxn)
    const cheapestCC = sortedCC[0]
    const expensiveCC = sortedCC[sortedCC.length - 1]

    if (cheapestCC.costPerTxn < expensiveCC.costPerTxn && cheapestCC.successRate >= 93) {
      const ccGw = gateways.find((g) => g.id === cheapestCC.gatewayId)
      const ccTermId = ccGw?.terminals.find((t) => t.id === cheapestCC.terminalId)?.terminalId || cheapestCC.terminalId
      const ccGwName = ccGw?.name || 'gateway'

      // Estimate Visa CC GMV share based on category
      const visaSharePct = merchant.category === 'E-commerce' ? 38
        : merchant.category === 'Fintech' ? 42
        : merchant.category === 'Fashion' ? 35
        : 30
      const visaGMV = Math.round(merchant.monthlyGMV * visaSharePct / 100)
      const visaGMVCr = (visaGMV / 10000000).toFixed(0)

      const costPerTxnSaving = expensiveCC.costPerTxn - cheapestCC.costPerTxn
      const avgTxnVal = merchant.monthlyGMV / merchant.monthlyTxnVolume
      const nrImprovementBps = Math.round((costPerTxnSaving / avgTxnVal) * 10000)

      recs.push({
        id: 'visa-routing',
        type: 'opportunity',
        title: `Route Visa transactions to ${ccGwName}`,
        description: `Estimated monthly Visa CC GMV is ~₹${visaGMVCr}Cr. Routing Visa transactions to ${ccTermId} (${cheapestCC.costPerTxn === 0 ? 'zero-cost' : '₹' + cheapestCC.costPerTxn.toFixed(2) + '/txn'}) at ${ccGwName} — where SR is at ${cheapestCC.successRate}% — will reduce backward cost on these transactions${cheapestCC.costPerTxn === 0 ? ' to zero' : ` by ₹${costPerTxnSaving.toFixed(2)}/txn`}. This helps meet GMV targets on ${ccGwName}, earns clawback benefits, and improves net revenue by ~${nrImprovementBps} bps.`,
        signal: `₹${visaGMVCr}Cr/month Visa GMV, ${cheapestCC.successRate}% SR at ${ccGwName}`,
        action: 'visa_card_routing',
        impact: `Improve NR by ~${nrImprovementBps} bps, earn clawback on ₹${visaGMVCr}Cr Visa GMV`,
        confidence: 76,
        affectedArea: 'Card Routing',
        meta: {
          gateway: ccGwName,
          terminal: ccTermId,
          visaGMVCr,
          nrBps: nrImprovementBps,
        },
      })
    }
  }

  // Ensure at least one recommendation for every merchant
  if (recs.length === 0) {
    recs.push({
      id: 'routine-review',
      type: 'info',
      title: 'Routine health check',
      description: `All metrics are within normal ranges. Current SR is ${merchant.avgPaymentSuccessRate}% and transaction volume is stable. Consider scheduling a quarterly review with the merchant to discuss growth opportunities.`,
      signal: 'All metrics nominal',
      action: 'schedule_review',
      impact: 'Strengthen merchant relationship',
      confidence: 65,
      affectedArea: 'Account Health',
    })
  }

  return recs
}

export function generateSRTimeSeries(merchant) {
  const days = 30
  const endDate = new Date(2026, 2, 10) // March 10, 2026
  const dates = []
  for (let d = 0; d < days; d++) {
    const dt = new Date(endDate)
    dt.setDate(dt.getDate() - (days - 1 - d))
    dates.push(dt.toISOString().slice(0, 10))
  }

  // Build terminal info with display IDs
  const terminalInfos = merchant.gatewayMetrics.map((gm) => {
    const gw = gateways.find((g) => g.id === gm.gatewayId)
    const term = gw?.terminals.find((t) => t.id === gm.terminalId)
    return {
      terminalId: gm.terminalId,
      displayId: term?.terminalId || gm.terminalId,
      gatewayShort: gw?.shortName || 'Unknown',
      baseSR: gm.successRate,
      txnShare: gm.txnShare,
      supportedMethods: gm.supportedMethods || ['Cards', 'UPI', 'NB'],
    }
  })

  // Determine which methods this merchant has across all terminals
  const allMethods = new Set()
  terminalInfos.forEach((t) => t.supportedMethods.forEach((m) => allMethods.add(m)))

  // Decide if this merchant gets a SR dip event (deterministic)
  const merchantSeed = hashCode(merchant.id + '-dip')
  const hasDip = merchantSeed % 3 === 0 // ~33% of merchants
  const dipStartDay = (merchantSeed % 20) + 3 // day 3-22
  const dipDuration = 3 + (merchantSeed % 4) // 3-6 days
  const dipTerminalIdx = merchantSeed % terminalInfos.length
  const dipMagnitude = 3 + (merchantSeed % 5) // 3-7% drop

  // Generate per-terminal, per-method, per-day SR
  const byMethod = {}
  const methodOrder = ['Cards', 'UPI', 'NB']

  methodOrder.forEach((method) => {
    if (!allMethods.has(method)) return

    const terminalsForMethod = terminalInfos.filter((t) => t.supportedMethods.includes(method))
    if (terminalsForMethod.length === 0) return

    const terminals = {}
    terminalsForMethod.forEach((term) => {
      const dailySR = []
      for (let d = 0; d < days; d++) {
        const seed = hashCode(merchant.id + '-' + method + '-' + term.terminalId + '-' + d)
        const noise = (seededRandom(seed) - 0.5) * 4 // ±2% noise
        let sr = term.baseSR + noise

        // Apply dip event
        if (hasDip && term === terminalInfos[dipTerminalIdx] && d >= dipStartDay && d < dipStartDay + dipDuration) {
          const dipProgress = (d - dipStartDay) / dipDuration
          const dipCurve = Math.sin(dipProgress * Math.PI) // peaks in middle
          sr -= dipMagnitude * dipCurve
        }

        dailySR.push(Math.round(Math.max(75, Math.min(100, sr)) * 10) / 10)
      }
      terminals[term.displayId] = dailySR
    })

    // Method-level SR = weighted average of terminal SRs
    const methodSR = []
    for (let d = 0; d < days; d++) {
      let totalWeight = 0
      let weightedSum = 0
      terminalsForMethod.forEach((term) => {
        const w = term.txnShare
        weightedSum += terminals[term.displayId][d] * w
        totalWeight += w
      })
      methodSR.push(Math.round((weightedSum / totalWeight) * 10) / 10)
    }

    byMethod[method] = { sr: methodSR, label: METHOD_LABELS[method], terminals }
  })

  // Overall SR = weighted average across all methods (equal weight per method for simplicity)
  const activeMethodKeys = Object.keys(byMethod)
  const overall = []
  for (let d = 0; d < days; d++) {
    let sum = 0
    activeMethodKeys.forEach((m) => { sum += byMethod[m].sr[d] })
    overall.push(Math.round((sum / activeMethodKeys.length) * 10) / 10)
  }

  return { dates, overall, byMethod }
}

// ── Transaction Generator ───────────────

const PAYMENT_METHODS = [
  { type: 'Visa Card', short: 'Cards', network: 'Visa', cardType: 'card' },
  { type: 'Mastercard Card', short: 'Cards', network: 'Mastercard', cardType: 'card' },
  { type: 'RuPay Card', short: 'Cards', network: 'RuPay', cardType: 'card' },
  { type: 'UPI', short: 'UPI', network: null, cardType: null },
  { type: 'Net Banking', short: 'NB', network: null, cardType: null },
]

function getAmountRange(amount) {
  if (amount < 2000) return '0-2K'
  if (amount < 10000) return '2K-10K'
  return '10K+'
}

export function generateMerchantTransactions(merchant) {
  const txnCount = 50
  const transactions = []
  const avgTxnValue = merchant.monthlyGMV / merchant.monthlyTxnVolume

  // Build terminal info from gatewayMetrics + gateways
  const terminalInfos = merchant.gatewayMetrics.map((gm) => {
    const gw = gateways.find((g) => g.id === gm.gatewayId)
    const term = gw?.terminals.find((t) => t.id === gm.terminalId)
    return {
      gatewayId: gm.gatewayId,
      terminalId: gm.terminalId,
      displayTerminalId: term?.terminalId || gm.terminalId,
      gatewayShort: gw?.shortName || 'Unknown',
      successRate: gm.successRate,
      costPerTxn: gm.costPerTxn,
      txnShare: gm.txnShare,
    }
  })

  // Find the preferred terminal (highest txnShare)
  const preferred = terminalInfos.slice().sort((a, b) => b.txnShare - a.txnShare)[0]

  for (let i = 0; i < txnCount; i++) {
    const seed = hashCode(merchant.id + '-txn-' + i)
    const txnId = 'pay_' + seed.toString(36).padStart(8, '0').slice(0, 8).toUpperCase()

    // Timestamp: within last 7 days
    const now = new Date(2026, 2, 11, 10, 0, 0) // March 11, 2026
    const hoursAgo = (seed % 168) // up to 7 days * 24 hours
    const timestamp = new Date(now.getTime() - hoursAgo * 3600000)

    // Amount
    const amountSeed = hashCode(merchant.id + '-amt-' + i)
    const amount = Math.round(avgTxnValue * (0.3 + (amountSeed % 300) / 100))

    // Payment method
    const pmIdx = seed % PAYMENT_METHODS.length
    const paymentMethod = PAYMENT_METHODS[pmIdx]

    // Status: ~75% success, 15% failed, 10% refunded
    const statusSeed = hashCode(merchant.id + '-st-' + i) % 20
    const status = statusSeed < 15 ? 'success' : statusSeed < 18 ? 'failed' : 'refunded'

    // Simulate routing decision
    let routingDecision
    const srVariation = ((hashCode(merchant.id + '-sr-' + i) % 80) - 40) / 10 // -4 to +4

    if (merchant.srSensitive) {
      // SR Sensitive: always pick highest SR
      const sorted = terminalInfos.slice().sort((a, b) => b.successRate - a.successRate)
      const selected = sorted[0]
      routingDecision = {
        selectedTerminalId: selected.displayTerminalId,
        selectedGatewayShort: selected.gatewayShort,
        selectedSR: selected.successRate,
        selectedCost: selected.costPerTxn,
        reason: 'Merchant is SR-sensitive. Routing locked to highest SR terminal.',
        wasDePrioritized: false,
        dePrioritizedTerminal: null,
        allEvaluated: sorted.map((t, idx) => ({
          terminalId: t.displayTerminalId,
          gatewayShort: t.gatewayShort,
          successRate: t.successRate,
          costPerTxn: t.costPerTxn,
          status: idx === 0 ? 'selected' : 'rejected_sr_sensitive_not_highest',
          statusReason: idx === 0
            ? 'Highest SR terminal — selected for SR-sensitive merchant'
            : `SR ${t.successRate}% is lower than ${sorted[0].successRate}% (highest available)`,
        })),
      }
    } else {
      // Non-SR-sensitive: threshold-based routing
      const threshold = merchant.srThresholdLow || 87

      // Apply SR variation to simulate real-world fluctuation
      const variedTerminals = terminalInfos.map((t) => ({
        ...t,
        effectiveSR: Number((t.successRate + (hashCode(t.terminalId + '-' + i) % 60 - 30) / 10).toFixed(1)),
      }))

      // Check if preferred terminal is above threshold
      const preferredVaried = variedTerminals.find((t) => t.terminalId === preferred.terminalId)
      const aboveThreshold = variedTerminals
        .filter((t) => t.effectiveSR >= threshold)
        .sort((a, b) => a.costPerTxn - b.costPerTxn) // cheapest first

      let selected
      let wasDePrioritized = false
      let dePrioritizedTerminal = null

      if (preferredVaried && preferredVaried.effectiveSR < threshold && aboveThreshold.length > 0) {
        // Preferred terminal is below threshold — de-prioritize
        wasDePrioritized = true
        dePrioritizedTerminal = {
          id: preferredVaried.displayTerminalId,
          sr: preferredVaried.effectiveSR,
          threshold,
        }
        selected = aboveThreshold[0] // cheapest above threshold
      } else if (aboveThreshold.length > 0) {
        // Preferred terminal is fine, use cheapest above threshold
        selected = aboveThreshold[0]
      } else {
        // No terminal above threshold, use highest SR as fallback
        selected = variedTerminals.slice().sort((a, b) => b.effectiveSR - a.effectiveSR)[0]
      }

      const reason = wasDePrioritized
        ? `Terminal ${dePrioritizedTerminal.id} de-prioritized: SR ${dePrioritizedTerminal.sr}% below ${threshold}% threshold. Routed to ${selected.displayTerminalId}: SR ${selected.effectiveSR}%, Cost ₹${selected.costPerTxn.toFixed(2)} (cheapest above threshold)`
        : `Terminal ${selected.displayTerminalId} selected: SR ${selected.effectiveSR}% meets ${threshold}% threshold, Cost ₹${selected.costPerTxn.toFixed(2)}`

      routingDecision = {
        selectedTerminalId: selected.displayTerminalId,
        selectedGatewayShort: selected.gatewayShort,
        selectedSR: selected.effectiveSR,
        selectedCost: selected.costPerTxn,
        reason,
        wasDePrioritized,
        dePrioritizedTerminal,
        allEvaluated: variedTerminals.map((t) => {
          let evalStatus, evalReason
          if (t.terminalId === selected.terminalId) {
            evalStatus = 'selected'
            evalReason = wasDePrioritized
              ? `Cheapest terminal above ${threshold}% threshold`
              : `Meets ${threshold}% threshold at lowest cost`
          } else if (t.effectiveSR < threshold) {
            evalStatus = 'rejected_below_threshold'
            evalReason = `SR ${t.effectiveSR}% is below ${threshold}% threshold`
          } else {
            evalStatus = 'rejected_higher_cost'
            evalReason = `SR ${t.effectiveSR}% meets threshold but cost ₹${t.costPerTxn.toFixed(2)} is higher than selected (₹${selected.costPerTxn.toFixed(2)})`
          }
          return {
            terminalId: t.displayTerminalId,
            gatewayShort: t.gatewayShort,
            successRate: t.effectiveSR,
            costPerTxn: t.costPerTxn,
            status: evalStatus,
            statusReason: evalReason,
          }
        }),
      }
    }

    // Mark failed transactions as NTF (No Terminal Found)
    // Higher rate for merchants with routing constraints (TSP, offer-linked)
    let isNTF = false
    let ntfReason = null
    if (status === 'failed') {
      const ntfSeed = hashCode(merchant.id + '-ntf-' + i) % 10
      const ntfThreshold = merchant.dealType === 'tsp' ? 7
        : merchant.dealType === 'offer-linked' ? 6
        : 4
      if (ntfSeed < ntfThreshold) {
        isNTF = true
        // Assign reasons based on payment method and merchant context for realism
        const pm = paymentMethod.short
        const reasons = pm === 'NB'
          ? [
              'No SELECT rule for payment method — terminal unavailable',
              'Network/card type restriction — no eligible terminal',
              'No SELECT rule for payment method — terminal unavailable',
              'Cost-driven REJECT rule without fallback gateway',
              'Network/card type restriction — no eligible terminal',
              'Blocked MCC compliance restriction',
              'No SELECT rule for payment method — terminal unavailable',
            ]
          : pm === 'UPI'
          ? [
              'Cost-driven REJECT rule without fallback gateway',
              'Cost-driven REJECT rule without fallback gateway',
              'Network/card type restriction — no eligible terminal',
              'Blocked MCC compliance restriction',
              'Cost-driven REJECT rule without fallback gateway',
              'Cost-driven REJECT rule without fallback gateway',
              'Network/card type restriction — no eligible terminal',
            ]
          : [
              'Cost-driven REJECT rule without fallback gateway',
              'No SELECT rule for payment method — terminal unavailable',
              'Network/card type restriction — no eligible terminal',
              'Blocked MCC compliance restriction',
              'Cost-driven REJECT rule without fallback gateway',
              'Cost-driven REJECT rule without fallback gateway',
              'Network/card type restriction — no eligible terminal',
            ]
        ntfReason = reasons[ntfSeed]
      }
    }

    transactions.push({
      txnId,
      timestamp,
      amount,
      paymentMethod,
      status,
      isNTF,
      ntfReason,
      gatewayId: terminalInfos.find((t) => t.displayTerminalId === routingDecision.selectedTerminalId)?.gatewayId || merchant.currentGatewayId,
      terminalId: terminalInfos.find((t) => t.displayTerminalId === routingDecision.selectedTerminalId)?.terminalId || merchant.currentTerminalId,
      routingDecision,
    })
  }

  // Sort by timestamp descending (most recent first)
  transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  return transactions
}

// ---------------------------------------------------------------------------
// Monthly performance history (24 months) for heatmap
// ---------------------------------------------------------------------------
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December']

// Hardcoded achievement percentages for deterministic rendering
// Distribution: ~13 green (>=90%), ~8 yellow (70-89%), ~3 red (<70%)
const ACHIEVEMENT_PCT = [
  92.3, 88.5, 95.1, 67.4, 101.2, 85.7,   // Apr-Sep 2024
  93.8, 78.2, 96.5, 104.3, 91.0, 89.1,    // Oct 2024 - Mar 2025
  87.6, 94.2, 72.8, 98.7, 82.3, 95.9,     // Apr-Sep 2025
  103.1, 76.5, 90.8, 97.4, 88.3,          // Oct 2025 - Feb 2026
  // March 2026 uses live data — not in this array
]

function classifyMonth(pct) {
  if (pct >= 90) return 'green'
  if (pct >= 70) return 'yellow'
  return 'red'
}

export function generateMonthlyHistory(merchantList) {
  const stats = computeAggregateStats(merchantList)
  const baseTarget = 120000000 // 12 Cr

  const months = []
  const startYear = 2024
  const startMonth = 4 // April (1-indexed)

  for (let i = 0; i < 24; i++) {
    const monthIdx = (startMonth - 1 + i) % 12 // 0-indexed
    const year = startYear + Math.floor((startMonth - 1 + i) / 12)
    const isCurrent = year === 2026 && monthIdx === 2 // March 2026

    let pct, achieved
    if (isCurrent) {
      achieved = stats.totalNetRevenue
      pct = Number(((achieved / baseTarget) * 100).toFixed(1))
    } else {
      pct = ACHIEVEMENT_PCT[i]
      achieved = Math.round(baseTarget * (pct / 100))
    }

    months.push({
      year,
      month: monthIdx + 1,
      monthLabel: MONTH_LABELS[monthIdx],
      monthFull: `${MONTH_FULL[monthIdx]} ${year}`,
      target: baseTarget,
      achieved,
      percentage: pct,
      status: classifyMonth(pct),
      isCurrent,
    })
  }

  return months
}

// ── Rule Engine ───────────────────────────

// Seed routing rules per merchant (custom rules only — default rule is generated)
const SEED_RULES = {
  // Zomato — standard, SR-based, 4 terminals
  'merch-001': [
    {
      id: 'rule-merch-001-001', name: 'Visa CC High Value → HDFC', type: 'conditional', enabled: true, priority: 1,
      conditions: [
        { field: 'payment_method', operator: 'equals', value: 'Cards' },
        { field: 'card_network', operator: 'equals', value: 'Visa' },
        { field: 'amount', operator: 'greater_than', value: 5000 },
      ],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-hdfc-001', 'term-icici-001'], splits: [], srThreshold: 90, minPaymentCount: 100 },
      isDefault: false, createdAt: '2026-02-10T10:30:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
    {
      id: 'rule-merch-001-002', name: 'UPI → HDFC + Axis', type: 'conditional', enabled: true, priority: 2,
      conditions: [{ field: 'payment_method', operator: 'equals', value: 'UPI' }],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-hdfc-001', 'term-axis-001'], splits: [], srThreshold: 88, minPaymentCount: 100 },
      isDefault: false, createdAt: '2026-02-10T10:35:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
  ],
  // Swiggy — TSP, HDFC 70% commitment
  'merch-002': [
    {
      id: 'rule-merch-002-001', name: 'HDFC Volume Commitment (TSP)', type: 'volume_split', enabled: true, priority: 1,
      conditions: [],
      conditionLogic: 'AND',
      action: { type: 'split', terminals: [], splits: [
        { terminalId: 'term-hdfc-001', percentage: 70 },
        { terminalId: 'term-icici-002', percentage: 30 },
      ]},
      isDefault: false, createdAt: '2026-01-15T10:30:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
    {
      id: 'rule-merch-002-002', name: 'High Value Visa CC → HDFC', type: 'conditional', enabled: true, priority: 2,
      conditions: [
        { field: 'payment_method', operator: 'equals', value: 'Cards' },
        { field: 'card_network', operator: 'equals', value: 'Visa' },
        { field: 'amount', operator: 'greater_than', value: 5000 },
      ],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-hdfc-001'], splits: [], srThreshold: 92, minPaymentCount: 200 },
      isDefault: false, createdAt: '2026-01-20T14:15:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
  ],
  // CRED — standard, fintech
  'merch-003': [
    {
      id: 'rule-merch-003-001', name: 'CC → HDFC Terminals', type: 'conditional', enabled: true, priority: 1,
      conditions: [{ field: 'payment_method', operator: 'equals', value: 'Cards' }],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-hdfc-001', 'term-hdfc-002'], splits: [], srThreshold: 93, minPaymentCount: 150 },
      isDefault: false, createdAt: '2026-02-05T09:00:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
    {
      id: 'rule-merch-003-002', name: 'UPI → Axis', type: 'conditional', enabled: true, priority: 2,
      conditions: [{ field: 'payment_method', operator: 'equals', value: 'UPI' }],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-axis-001'], splits: [], srThreshold: 88, minPaymentCount: 100 },
      isDefault: false, createdAt: '2026-02-05T09:10:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
  ],
  // Flipkart — standard, e-commerce, 3 terminals
  'merch-004': [
    {
      id: 'rule-merch-004-001', name: 'Mastercard CC → ICICI', type: 'conditional', enabled: true, priority: 1,
      conditions: [
        { field: 'payment_method', operator: 'equals', value: 'Cards' },
        { field: 'card_network', operator: 'equals', value: 'Mastercard' },
      ],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-icici-001'], splits: [], srThreshold: 91, minPaymentCount: 100 },
      isDefault: false, createdAt: '2026-02-01T11:00:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
    {
      id: 'rule-merch-004-002', name: 'UPI → HDFC + Axis + ICICI', type: 'conditional', enabled: true, priority: 2,
      conditions: [{ field: 'payment_method', operator: 'equals', value: 'UPI' }],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-hdfc-002', 'term-axis-001', 'term-icici-001'], splits: [], srThreshold: 90, minPaymentCount: 100 },
      isDefault: false, createdAt: '2026-02-01T11:15:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
    {
      id: 'rule-merch-004-003', name: 'RuPay Debit → ICICI', type: 'conditional', enabled: true, priority: 3,
      conditions: [
        { field: 'payment_method', operator: 'equals', value: 'Cards' },
        { field: 'card_network', operator: 'equals', value: 'RuPay' },
      ],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-icici-001'], splits: [], srThreshold: 90, minPaymentCount: 100 },
      isDefault: false, createdAt: '2026-02-01T11:30:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
    {
      id: 'rule-merch-004-004', name: 'Intl Visa/MC High Value → HDFC', type: 'conditional', enabled: true, priority: 4,
      conditions: [
        { field: 'payment_method', operator: 'equals', value: 'Cards' },
        { field: 'card_network', operator: 'in', value: ['Visa', 'Mastercard'] },
        { field: 'international', operator: 'equals', value: true },
        { field: 'amount', operator: 'greater_than', value: 100000 },
      ],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-hdfc-002', 'term-icici-001', 'term-axis-001'], splits: [] },
      isDefault: false, createdAt: '2026-03-10T09:00:00Z', createdBy: 'anugrah.sharma@razorpay.com',
      expiresAt: '2026-09-30T23:59:59Z',
    },
    {
      id: 'rule-merch-004-005', name: 'No-Cost EMI > ₹1L → HDFC', type: 'conditional', enabled: true, priority: 5,
      conditions: [
        { field: 'payment_method', operator: 'equals', value: 'EMI' },
        { field: 'emi_type', operator: 'equals', value: 'no_cost' },
        { field: 'amount', operator: 'greater_than', value: 100000 },
      ],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-hdfc-001', 'term-hdfc-002'], splits: [] },
      isDefault: false, createdAt: '2026-03-01T10:00:00Z', createdBy: 'anugrah.sharma@razorpay.com',
      expiresAt: '2026-06-30T23:59:59Z',
    },
  ],
  // Blinkit — standard, 2 terminals
  'merch-005': [
    {
      id: 'rule-merch-005-001', name: 'UPI → RBL', type: 'conditional', enabled: true, priority: 1,
      conditions: [{ field: 'payment_method', operator: 'equals', value: 'UPI' }],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-rbl-001'], splits: [] },
      isDefault: false, createdAt: '2026-02-15T16:00:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
  ],
  // Myntra — TSP violation! HDFC locked but NO HDFC terminal in metrics
  'merch-006': [
    {
      id: 'rule-merch-006-001', name: 'High Value CC → Axis', type: 'conditional', enabled: true, priority: 1,
      conditions: [
        { field: 'payment_method', operator: 'equals', value: 'Cards' },
        { field: 'amount', operator: 'greater_than', value: 3000 },
      ],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-axis-001'], splits: [] },
      isDefault: false, createdAt: '2026-01-25T13:00:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
  ],
  // BookMyShow — offer_linked, HDFC 10% cashback on CC
  'merch-007': [
    {
      id: 'rule-merch-007-001', name: 'CC → HDFC (Cashback Offer)', type: 'conditional', enabled: true, priority: 1,
      conditions: [{ field: 'payment_method', operator: 'equals', value: 'Cards' }],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-hdfc-001'], splits: [], srThreshold: 90, minPaymentCount: 100 },
      isDefault: false, createdAt: '2026-02-20T10:00:00Z', createdBy: 'anugrah.sharma@razorpay.com',
      expiresAt: '2026-04-30T23:59:59Z',
    },
    {
      id: 'rule-merch-007-002', name: 'EMI > ₹2L → HDFC + ICICI', type: 'conditional', enabled: true, priority: 2,
      conditions: [
        { field: 'payment_method', operator: 'equals', value: 'EMI' },
        { field: 'amount', operator: 'greater_than', value: 200000 },
      ],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-hdfc-001', 'term-icici-001', 'term-axis-001'], splits: [] },
      isDefault: false, createdAt: '2026-03-05T14:00:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
  ],
  // MakeMyTrip — offer_linked, Axis EMI (but Axis NOT in merchant's terminals!)
  'merch-008': [
    {
      id: 'rule-merch-008-001', name: 'High Value CC → ICICI', type: 'conditional', enabled: true, priority: 1,
      conditions: [
        { field: 'payment_method', operator: 'equals', value: 'Cards' },
        { field: 'amount', operator: 'greater_than', value: 10000 },
      ],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-icici-001'], splits: [] },
      isDefault: false, createdAt: '2026-02-18T15:30:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
    {
      id: 'rule-merch-008-002', name: 'No-Cost EMI Intl → HDFC', type: 'conditional', enabled: true, priority: 2,
      conditions: [
        { field: 'payment_method', operator: 'equals', value: 'EMI' },
        { field: 'emi_type', operator: 'equals', value: 'no_cost' },
        { field: 'international', operator: 'equals', value: true },
        { field: 'amount', operator: 'greater_than', value: 100000 },
      ],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-hdfc-001', 'term-icici-001'], splits: [] },
      isDefault: false, createdAt: '2026-03-01T12:00:00Z', createdBy: 'anugrah.sharma@razorpay.com',
      expiresAt: '2026-08-31T23:59:59Z',
    },
  ],
  // Nykaa — standard, cost_based
  'merch-009': [
    {
      id: 'rule-merch-009-001', name: 'Visa CC → ICICI', type: 'conditional', enabled: true, priority: 1,
      conditions: [
        { field: 'payment_method', operator: 'equals', value: 'Cards' },
        { field: 'card_network', operator: 'equals', value: 'Visa' },
      ],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-icici-002'], splits: [] },
      isDefault: false, createdAt: '2026-03-01T10:00:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
  ],
  // Urban Company — standard, cost_based
  'merch-010': [
    {
      id: 'rule-merch-010-001', name: 'UPI → Yes Bank Zero Cost', type: 'conditional', enabled: true, priority: 1,
      conditions: [{ field: 'payment_method', operator: 'equals', value: 'UPI' }],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-yes-001', 'term-axis-002'], splits: [] },
      isDefault: false, createdAt: '2026-02-28T11:00:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
  ],
  // Zepto — standard, SR-based, 4 terminals
  'merch-011': [
    {
      id: 'rule-merch-011-001', name: 'CC High Value → HDFC', type: 'conditional', enabled: true, priority: 1,
      conditions: [
        { field: 'payment_method', operator: 'equals', value: 'Cards' },
        { field: 'amount', operator: 'greater_than', value: 2000 },
      ],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-hdfc-001', 'term-icici-001'], splits: [] },
      isDefault: false, createdAt: '2026-02-22T09:30:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
    {
      id: 'rule-merch-011-002', name: 'UPI → Zero Cost Terminals', type: 'conditional', enabled: true, priority: 2,
      conditions: [{ field: 'payment_method', operator: 'equals', value: 'UPI' }],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-yes-001', 'term-hdfc-001'], splits: [] },
      isDefault: false, createdAt: '2026-02-22T09:45:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
  ],
  // Ola — standard, 3 terminals
  'merch-012': [
    {
      id: 'rule-merch-012-001', name: 'CC → ICICI + Axis', type: 'conditional', enabled: true, priority: 1,
      conditions: [{ field: 'payment_method', operator: 'equals', value: 'Cards' }],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-icici-001', 'term-axis-001'], splits: [] },
      isDefault: false, createdAt: '2026-02-12T14:00:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
    {
      id: 'rule-merch-012-002', name: 'UPI → Axis + RBL', type: 'conditional', enabled: true, priority: 2,
      conditions: [{ field: 'payment_method', operator: 'equals', value: 'UPI' }],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-axis-001', 'term-rbl-001'], splits: [] },
      isDefault: false, createdAt: '2026-02-12T14:15:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
  ],
  // PhonePe — standard, high volume, 4 terminals
  'merch-013': [
    {
      id: 'rule-merch-013-001', name: 'Visa CC → HDFC + ICICI', type: 'conditional', enabled: true, priority: 1,
      conditions: [
        { field: 'payment_method', operator: 'equals', value: 'Cards' },
        { field: 'card_network', operator: 'equals', value: 'Visa' },
      ],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-hdfc-001', 'term-icici-001'], splits: [] },
      isDefault: false, createdAt: '2026-02-08T10:00:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
    {
      id: 'rule-merch-013-002', name: 'UPI → Axis Zero Cost', type: 'conditional', enabled: true, priority: 2,
      conditions: [{ field: 'payment_method', operator: 'equals', value: 'UPI' }],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-axis-002'], splits: [] },
      isDefault: false, createdAt: '2026-02-08T10:15:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
  ],
  // Paytm Mall — standard, cost_based
  'merch-014': [
    {
      id: 'rule-merch-014-001', name: 'UPI → Yes Bank Zero Cost', type: 'conditional', enabled: true, priority: 1,
      conditions: [{ field: 'payment_method', operator: 'equals', value: 'UPI' }],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-yes-001'], splits: [] },
      isDefault: false, createdAt: '2026-03-02T16:00:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
  ],
  // 1mg — standard, cost_based
  'merch-015': [
    {
      id: 'rule-merch-015-001', name: 'CC → RBL', type: 'conditional', enabled: true, priority: 1,
      conditions: [{ field: 'payment_method', operator: 'equals', value: 'Cards' }],
      conditionLogic: 'AND',
      action: { type: 'route', terminals: ['term-rbl-002'], splits: [] },
      isDefault: false, createdAt: '2026-03-05T11:30:00Z', createdBy: 'anugrah.sharma@razorpay.com',
    },
  ],
}

/**
 * Generate seed routing rules for a merchant.
 * Returns custom rules + auto-generated default rule.
 */
export function generateSeedRules(merchant) {
  const customRules = SEED_RULES[merchant.id] || []
  const rules = customRules.map(r => ({ ...r }))

  const sortedTerminals = [...merchant.gatewayMetrics]
    .sort((a, b) => {
      if (merchant.routingStrategy === 'cost_based') return a.costPerTxn - b.costPerTxn
      return b.successRate - a.successRate
    })
    .map(gm => gm.terminalId)

  // Per-method defaults
  const methods = ['Cards', 'UPI', 'NB']
  methods.forEach((method, idx) => {
    const methodTerminals = merchant.gatewayMetrics
      .filter(gm => {
        const supportedMethods = gm.supportedMethods || []
        return supportedMethods.includes(method)
      })
      .sort((a, b) => {
        if (merchant.routingStrategy === 'cost_based') return a.costPerTxn - b.costPerTxn
        return b.successRate - a.successRate
      })
      .map(gm => gm.terminalId)

    if (methodTerminals.length > 0) {
      rules.push({
        id: `rule-${merchant.id}-default-${method.toLowerCase()}`,
        name: `Default ${method} Routing`,
        type: 'conditional',
        enabled: true,
        priority: 900 + idx,
        conditions: [{ field: 'payment_method', operator: 'equals', value: method }],
        conditionLogic: 'AND',
        action: { type: 'route', terminals: methodTerminals, splits: [] },
        isDefault: false,
        isMethodDefault: true,
        defaultForMethod: method,
        createdAt: '2025-12-01T00:00:00Z',
        createdBy: 'system',
      })
    }
  })

  // Catch-all default
  rules.push({
    id: `rule-${merchant.id}-default`,
    name: 'Default Routing',
    type: 'conditional',
    enabled: true,
    priority: 999,
    conditions: [],
    conditionLogic: 'AND',
    action: { type: 'route', terminals: sortedTerminals, splits: [] },
    isDefault: true,
    createdAt: '2025-12-01T00:00:00Z',
    createdBy: 'system',
  })

  return rules
}

// ── Rule Evaluation Engine ──────────────

/**
 * Check if a single rule's conditions match a transaction.
 */
function matchesConditions(rule, transaction) {
  if (!rule.conditions || rule.conditions.length === 0) return true

  const results = rule.conditions.map(cond => {
    const txnValue = transaction[cond.field]
    if (txnValue === undefined || txnValue === null) return false

    switch (cond.operator) {
      case 'equals':
        return String(txnValue).toLowerCase() === String(cond.value).toLowerCase()
      case 'in':
        return Array.isArray(cond.value) && cond.value.some(v => String(v).toLowerCase() === String(txnValue).toLowerCase())
      case 'greater_than':
        return Number(txnValue) > Number(cond.value)
      case 'less_than':
        return Number(txnValue) < Number(cond.value)
      case 'between':
        if (!Array.isArray(cond.value) || cond.value.length < 2) return false
        return Number(txnValue) >= Number(cond.value[0]) && Number(txnValue) <= Number(cond.value[1])
      default:
        return false
    }
  })

  if (rule.conditionLogic === 'OR') return results.some(Boolean)
  return results.every(Boolean) // AND
}

/**
 * Walk enabled rules in priority order. First match wins.
 * Returns { matchedRule, action } or { matchedRule: null, action: null }.
 */
export function evaluateRules(rules, transaction) {
  const sorted = [...rules]
    .filter(r => r.enabled)
    .sort((a, b) => a.priority - b.priority)

  for (const rule of sorted) {
    if (matchesConditions(rule, transaction)) {
      return { matchedRule: rule, action: rule.action }
    }
  }

  return { matchedRule: null, action: null }
}

// ── NTF Gap Detection ────────────────────

/**
 * Detect coverage gaps that could cause Not-to-Fail (NTF) events.
 * Checks: method-terminal mismatches, orphan terminals, missing default.
 */
export function detectNTFGaps(rules, merchant) {
  const gaps = []
  const enabledRules = rules.filter(r => r.enabled)

  if (enabledRules.length === 0) {
    gaps.push({ method: 'ALL', network: null, reason: 'No routing rules are enabled', severity: 'critical', ruleId: null })
    return { hasGaps: true, gaps }
  }

  // Build terminal capability map from merchant's active terminals
  const terminalMethods = {}
  merchant.gatewayMetrics.forEach(gm => {
    terminalMethods[gm.terminalId] = new Set(gm.supportedMethods || [])
  })
  const merchantTerminalIds = new Set(merchant.gatewayMetrics.map(gm => gm.terminalId))

  // Check each non-default enabled rule for potential gaps
  enabledRules.forEach(rule => {
    if (rule.isDefault) return

    const targetTerminals = rule.action.type === 'split'
      ? rule.action.splits.map(s => s.terminalId)
      : rule.action.terminals

    // 1. Orphan terminals: referenced in rule but not in merchant's active terminals
    const orphans = targetTerminals.filter(tid => !merchantTerminalIds.has(tid))
    if (orphans.length > 0) {
      const orphanNames = orphans.map(tid => getTerminalDisplayId(tid)).join(', ')
      gaps.push({
        method: null, network: null,
        reason: `Rule "${rule.name}" references inactive terminal(s): ${orphanNames}`,
        severity: 'critical', ruleId: rule.id,
      })
    }

    // 2. For unconditional volume splits: must cover ALL merchant payment methods
    if (rule.action.type === 'split' && rule.conditions.length === 0) {
      const allMethods = new Set()
      merchant.gatewayMetrics.forEach(gm => {
        (gm.supportedMethods || []).forEach(m => allMethods.add(m))
      })

      allMethods.forEach(method => {
        const hasSupport = targetTerminals.some(tid => {
          const methods = terminalMethods[tid]
          return methods && methods.has(method)
        })
        if (!hasSupport) {
          gaps.push({
            method, network: null,
            reason: `Volume split "${rule.name}" has no terminal supporting ${method}`,
            severity: 'high', ruleId: rule.id,
          })
        }
      })
    }

    // 3. For conditional rules with payment_method: check terminal supports that method
    const methodCond = rule.conditions.find(c => c.field === 'payment_method')
    if (methodCond) {
      const method = methodCond.value
      const activeTargets = targetTerminals.filter(tid => merchantTerminalIds.has(tid))
      const hasSupport = activeTargets.some(tid => {
        const methods = terminalMethods[tid]
        return methods && methods.has(method)
      })
      if (!hasSupport && activeTargets.length > 0) {
        gaps.push({
          method, network: null,
          reason: `Rule "${rule.name}" routes ${method} to terminal(s) that don't support it`,
          severity: 'critical', ruleId: rule.id,
        })
      }
    }
  })

  // 4. Check: is the default rule present and enabled?
  const hasDefaultEnabled = enabledRules.some(r => r.isDefault)
  if (!hasDefaultEnabled) {
    gaps.push({
      method: 'ALL', network: null,
      reason: 'Default fallback rule is disabled — unmatched transactions will fail',
      severity: 'critical', ruleId: null,
    })
  }

  return { hasGaps: gaps.length > 0, gaps }
}

// ── Transaction Simulator ────────────────

/**
 * Full simulation of a transaction against the rule set.
 * Returns matched rule, resolved terminals, SR/cost, and any warnings.
 */
export function simulateTransaction(rules, transaction, merchant) {
  const result = evaluateRules(rules, transaction)
  const warnings = []

  if (!result.matchedRule) {
    return { matchedRule: null, terminals: [], warnings: ['No rule matched this transaction — it would fail (NTF)'] }
  }

  const { matchedRule, action } = result
  const thresholdLow = merchant.srThresholdLow || 85

  // Resolve target terminals with full detail
  let targetTerminals
  if (action.type === 'split') {
    targetTerminals = action.splits.map(s => {
      const gm = merchant.gatewayMetrics.find(g => g.terminalId === s.terminalId)
      const gw = gateways.find(g => g.id === gm?.gatewayId)
      const term = gw?.terminals.find(t => t.id === s.terminalId)
      return {
        terminalId: s.terminalId,
        displayId: term?.terminalId || s.terminalId,
        gatewayShort: gw?.shortName || '??',
        percentage: s.percentage,
        successRate: gm?.successRate || 0,
        costPerTxn: gm?.costPerTxn || 0,
        supportedMethods: gm?.supportedMethods || [],
      }
    })
  } else {
    const allRouteTerminals = action.terminals.map(tid => {
      const gm = merchant.gatewayMetrics.find(g => g.terminalId === tid)
      const gw = gateways.find(g => g.id === gm?.gatewayId)
      const term = gw?.terminals.find(t => t.id === tid)
      // Derive payment count from txnShare × merchant total volume
      const totalVolume = merchant.txnVolumeHistory?.currentMonth || 0
      const paymentCount = gm ? Math.round((gm.txnShare / 100) * totalVolume) : 0
      return {
        terminalId: tid,
        displayId: term?.terminalId || tid,
        gatewayShort: gw?.shortName || '??',
        successRate: gm?.successRate || 0,
        costPerTxn: gm?.costPerTxn || 0,
        supportedMethods: gm?.supportedMethods || [],
        paymentCount,
      }
    })

    // Apply SR threshold fallback: pick the first terminal that meets threshold,
    // or whose payment count is below minPaymentCount (insufficient data to judge)
    const srThreshold = action.srThreshold || 0
    const minPaymentCount = action.minPaymentCount || 0
    let selectedTerminal = null

    if (srThreshold > 0 && allRouteTerminals.length > 1) {
      for (const t of allRouteTerminals) {
        const hasEnoughData = t.paymentCount >= minPaymentCount
        const srOk = t.successRate >= srThreshold
        if (!hasEnoughData || srOk) {
          selectedTerminal = t
          break
        }
        warnings.push(`Terminal ${t.displayId} SR ${t.successRate}% is below threshold ${srThreshold}% (${t.paymentCount.toLocaleString('en-IN')} payments) — falling back to next`)
      }
      // If all terminals failed threshold, use last as best-effort
      if (!selectedTerminal) {
        selectedTerminal = allRouteTerminals[allRouteTerminals.length - 1]
        warnings.push(`All terminals below SR threshold — using ${selectedTerminal.displayId} as last resort`)
      }
    }

    // Return all terminals but mark which one is the active selection
    targetTerminals = allRouteTerminals.map(t => ({
      ...t,
      isActive: selectedTerminal ? t.terminalId === selectedTerminal.terminalId : allRouteTerminals[0]?.terminalId === t.terminalId,
    }))
  }

  // Warning: method not supported by target terminals
  const paymentMethod = transaction.payment_method
  if (paymentMethod) {
    const supportsMethod = targetTerminals.some(t => t.supportedMethods.includes(paymentMethod))
    if (!supportsMethod) {
      warnings.push(`None of the target terminals support ${paymentMethod} — this transaction would fail (NTF)`)
    }
  }

  // Warning: terminal SR below threshold
  targetTerminals.forEach(t => {
    if (t.successRate > 0 && t.successRate < thresholdLow) {
      warnings.push(`Terminal ${t.displayId} has SR ${t.successRate}%, below threshold of ${thresholdLow}%`)
    }
  })

  // Warning: terminal not in merchant's active list
  const merchantTerminalIds = new Set(merchant.gatewayMetrics.map(gm => gm.terminalId))
  targetTerminals.forEach(t => {
    if (!merchantTerminalIds.has(t.terminalId)) {
      warnings.push(`Terminal ${t.displayId} is not active for this merchant`)
    }
  })

  return { matchedRule, terminals: targetTerminals, warnings }
}

// ── NTF Rule Chain Tracer ──────────────────

/**
 * Generate a detailed step-by-step trace of the routing pipeline for an NTF transaction.
 * Shows how terminals get eliminated at each rule evaluation step.
 */
export function traceNTFRuleChain(transaction, rules, merchant) {
  const steps = []
  const enabledRules = [...rules].filter(r => r.enabled).sort((a, b) => a.priority - b.priority)
  const paymentMethod = transaction.paymentMethod?.short || 'UPI'

  // Step 0: Initial eligible terminals (all that support this payment method)
  const allTerminals = merchant.gatewayMetrics.map(gm => {
    const gw = gateways.find(g => g.id === gm.gatewayId)
    const term = gw?.terminals.find(t => t.id === gm.terminalId)
    return {
      terminalId: gm.terminalId,
      displayId: term?.terminalId || gm.terminalId,
      gatewayShort: gw?.shortName || '??',
      successRate: gm.successRate,
      costPerTxn: gm.costPerTxn,
      supportedMethods: gm.supportedMethods || [],
    }
  })

  const eligible = allTerminals.filter(t => t.supportedMethods.includes(paymentMethod))
  const ineligible = allTerminals.filter(t => !t.supportedMethods.includes(paymentMethod))

  steps.push({
    stepNumber: 0,
    type: 'initial',
    label: 'Eligible Terminals',
    description: `${eligible.length} of ${allTerminals.length} terminals support ${paymentMethod}`,
    terminalsRemaining: eligible.map(t => ({ ...t, status: 'eligible' })),
    terminalsEliminated: ineligible.map(t => ({
      ...t,
      status: 'eliminated',
      reason: `Does not support ${paymentMethod}`,
    })),
  })

  if (eligible.length === 0) {
    steps.push({
      stepNumber: 1,
      type: 'ntf',
      label: 'NTF — No eligible terminals',
      description: `No terminal supports ${paymentMethod} for this merchant. Payment fails immediately.`,
      ntfCause: 'method_unsupported',
    })
    return { steps, ntfStep: 1 }
  }

  // Walk through rules and simulate elimination
  let remaining = [...eligible]
  let stepNum = 1

  for (const rule of enabledRules) {
    if (rule.isDefault) continue
    if (remaining.length === 0) break

    // Check if this rule's conditions could match the transaction
    const txnProxy = {
      payment_method: paymentMethod,
      amount: transaction.amount,
      card_network: transaction.paymentMethod?.network || null,
      card_type: transaction.paymentMethod?.cardType || null,
    }
    const ruleMatches = matchesConditions(rule, txnProxy)

    if (!ruleMatches) {
      steps.push({
        stepNumber: stepNum++,
        type: 'rule_skip',
        label: `Rule: ${rule.name}`,
        ruleId: rule.id,
        ruleName: rule.name,
        ruleType: rule.type === 'volume_split' ? 'Volume Split' : 'Conditional',
        conditions: formatRuleConditions(rule),
        description: 'Conditions did not match — rule skipped',
        terminalsRemaining: remaining.map(t => ({ ...t, status: 'passed' })),
        terminalsEliminated: [],
      })
      continue
    }

    // Rule matched — determine target terminals
    const targetIds = new Set(
      rule.action.type === 'split'
        ? rule.action.splits.map(s => s.terminalId)
        : rule.action.terminals || []
    )

    // For REJECT-like rules (route to specific terminals), everything NOT targeted gets rejected
    const kept = remaining.filter(t => targetIds.has(t.terminalId))
    const eliminated = remaining.filter(t => !targetIds.has(t.terminalId))

    if (kept.length === 0 && eliminated.length > 0) {
      // All current terminals eliminated — this rule causes NTF
      steps.push({
        stepNumber: stepNum,
        type: 'rule_ntf',
        label: `Rule: ${rule.name}`,
        ruleId: rule.id,
        ruleName: rule.name,
        ruleType: rule.type === 'volume_split' ? 'Volume Split' : 'Conditional',
        conditions: formatRuleConditions(rule),
        action: formatRuleAction(rule),
        description: `Rule routes to ${[...targetIds].map(id => _traceTerminalLabel(id)).join(', ')} — none are in the eligible set. All remaining terminals eliminated.`,
        terminalsRemaining: [],
        terminalsEliminated: eliminated.map(t => ({
          ...t,
          status: 'eliminated',
          reason: `Not in rule target: ${[...targetIds].map(id => _traceTerminalLabel(id)).join(', ')}`,
        })),
        isNTFCause: true,
      })

      steps.push({
        stepNumber: stepNum + 1,
        type: 'ntf',
        label: 'NTF — All terminals eliminated',
        description: `Rule "${rule.name}" eliminated all eligible terminals. Payment cannot be routed.`,
        ntfCause: 'rule_elimination',
        causeRuleId: rule.id,
        causeRuleName: rule.name,
      })
      return { steps, ntfStep: stepNum + 1, causeRule: rule }
    }

    if (eliminated.length > 0) {
      steps.push({
        stepNumber: stepNum++,
        type: 'rule_filter',
        label: `Rule: ${rule.name}`,
        ruleId: rule.id,
        ruleName: rule.name,
        ruleType: rule.type === 'volume_split' ? 'Volume Split' : 'Conditional',
        conditions: formatRuleConditions(rule),
        action: formatRuleAction(rule),
        description: `Rule matched. ${eliminated.length} terminal(s) not in target list eliminated.`,
        terminalsRemaining: kept.map(t => ({ ...t, status: 'passed' })),
        terminalsEliminated: eliminated.map(t => ({
          ...t,
          status: 'eliminated',
          reason: 'Not in rule target list',
        })),
      })
      remaining = kept
    } else {
      steps.push({
        stepNumber: stepNum++,
        type: 'rule_pass',
        label: `Rule: ${rule.name}`,
        ruleId: rule.id,
        ruleName: rule.name,
        ruleType: rule.type === 'volume_split' ? 'Volume Split' : 'Conditional',
        conditions: formatRuleConditions(rule),
        action: formatRuleAction(rule),
        description: 'Rule matched. All remaining terminals are in target list — no elimination.',
        terminalsRemaining: remaining.map(t => ({ ...t, status: 'passed' })),
        terminalsEliminated: [],
      })
    }
  }

  // If we get here with remaining terminals, simulate NTF based on ntfReason
  // (in real system, further pipeline steps — SR threshold, compliance — could still eliminate)
  if (remaining.length > 0 && transaction.isNTF) {
    const reason = transaction.ntfReason || 'Unknown routing failure'
    const lastEliminated = remaining
    steps.push({
      stepNumber: stepNum,
      type: 'pipeline_filter',
      label: 'Pipeline: Post-rule filters',
      description: reason,
      terminalsRemaining: [],
      terminalsEliminated: lastEliminated.map(t => ({
        ...t,
        status: 'eliminated',
        reason,
      })),
      isNTFCause: true,
    })
    steps.push({
      stepNumber: stepNum + 1,
      type: 'ntf',
      label: 'NTF — Payment Failed',
      description: `${reason}. No terminals available after pipeline filters.`,
      ntfCause: 'pipeline_filter',
    })
    return { steps, ntfStep: stepNum + 1 }
  }

  return { steps, ntfStep: null }
}

function formatRuleConditions(rule) {
  if (!rule.conditions || rule.conditions.length === 0) return 'Unconditional (matches all)'
  return rule.conditions.map(c => {
    const field = c.field.replace(/_/g, ' ')
    const val = Array.isArray(c.value) ? c.value.join('–') : c.value
    return `${field} ${c.operator.replace(/_/g, ' ')} ${val}`
  }).join(` ${rule.conditionLogic || 'AND'} `)
}

function formatRuleAction(rule) {
  if (rule.action.type === 'split') {
    return 'Split: ' + rule.action.splits.map(s =>
      `${_traceTerminalLabel(s.terminalId)} (${s.percentage}%)`
    ).join(', ')
  }
  return 'Route to: ' + (rule.action.terminals || []).map(id => _traceTerminalLabel(id)).join(' → ')
}

function _traceTerminalLabel(terminalId) {
  for (const gw of gateways) {
    const term = gw.terminals.find(t => t.id === terminalId)
    if (term) return `${term.terminalId} (${gw.shortName})`
  }
  return terminalId
}

// ── Routing Pipeline Simulator ─────────────
//
// Full step-by-step simulation of how a payment routes through the pipeline.
// Returns every stage with terminal-level detail: initial pool → rule filters → sorter → selection.
// Supports what-if overrides (disabled rules, downed terminals, threshold changes).

/**
 * Generate deterministic mock Doppler ML scores for terminals given a payment profile.
 * Higher-SR terminals get higher base scores, with per-payment noise.
 */
function generateDopplerScores(terminals, transaction, merchant) {
  const seed = hashCode(`${merchant.id}-${transaction.payment_method}-${transaction.card_network || ''}-${transaction.amount}`)
  return terminals.map((t, i) => {
    const baseSR = t.successRate || 70
    // Doppler score = SR-weighted base (0–100) + noise (±5)
    const noise = (seededRandom(seed + i * 37) - 0.5) * 10
    const dopplerScore = Math.min(100, Math.max(0, baseSR * 1.1 + noise))
    return {
      terminalId: t.terminalId,
      dopplerScore: Math.round(dopplerScore * 10) / 10,
    }
  })
}

/**
 * Simulate the full routing pipeline for a transaction.
 *
 * @param {object} merchant - Merchant object
 * @param {object} transaction - { payment_method, card_network, card_type, amount, international }
 * @param {array}  rules - Merchant's routingRulesV2 array
 * @param {object} overrides - {
 *   disabledRules: Set<ruleId>,        // rules to treat as disabled
 *   disabledTerminals: Set<terminalId>, // terminals to treat as down
 *   srThreshold: number,                // override SR threshold
 *   routingStrategy: string,            // 'success_rate' | 'cost_based'
 * }
 * @returns {object} Full pipeline trace with stages, final selection, and deltas
 */
export function simulateRoutingPipeline(merchant, transaction, rules, overrides = {}) {
  const stages = []
  const warnings = []
  const {
    disabledRules = new Set(),
    disabledTerminals = new Set(),
    srThreshold = merchant.srThresholdLow || 0,
    routingStrategy = merchant.routingStrategy || 'success_rate',
  } = overrides

  const paymentMethod = transaction.payment_method || 'Cards'

  // ─── Stage 0: Terminal Pool Assembly ───────────────────────
  const allTerminals = merchant.gatewayMetrics.map(gm => {
    const gw = gateways.find(g => g.id === gm.gatewayId)
    const term = gw?.terminals.find(t => t.id === gm.terminalId)
    return {
      terminalId: gm.terminalId,
      displayId: term?.terminalId || gm.terminalId,
      gatewayId: gm.gatewayId,
      gatewayShort: gw?.shortName || '??',
      successRate: gm.successRate,
      costPerTxn: gm.costPerTxn,
      txnShare: gm.txnShare,
      supportedMethods: gm.supportedMethods || [],
      isZeroCost: gm.costPerTxn === 0,
      bankStatus: term?.bankStatus || 'active',
      bankStatusReason: term?.bankStatusReason || null,
    }
  })

  // Filter by payment method support
  const methodEligible = allTerminals.filter(t => t.supportedMethods.includes(paymentMethod))
  const methodIneligible = allTerminals.filter(t => !t.supportedMethods.includes(paymentMethod))

  // Filter by bank-disabled terminals
  const bankDisabled = methodEligible.filter(t => t.bankStatus === 'disabled')
  const afterBankFilter = methodEligible.filter(t => t.bankStatus !== 'disabled')

  // Filter by terminal availability (what-if: terminal down)
  const downedInThisStep = afterBankFilter.filter(t => disabledTerminals.has(t.terminalId))
  const eligible = afterBankFilter.filter(t => !disabledTerminals.has(t.terminalId))

  const eliminatedInPool = [
    ...methodIneligible.map(t => ({ ...t, status: 'eliminated', reason: `Does not support ${paymentMethod}` })),
    ...bankDisabled.map(t => ({ ...t, status: 'eliminated', reason: `Disabled by bank: ${t.bankStatusReason || 'Bank action'}` })),
    ...downedInThisStep.map(t => ({ ...t, status: 'eliminated', reason: 'Terminal marked as down' })),
  ]

  stages.push({
    id: 'pool',
    stepNumber: 0,
    type: 'initial',
    label: 'Terminal Pool',
    description: `${eligible.length} of ${allTerminals.length} terminals eligible for ${paymentMethod}`,
    terminalsRemaining: eligible.map(t => ({ ...t, status: 'eligible' })),
    terminalsEliminated: eliminatedInPool,
    totalCount: allTerminals.length,
    remainingCount: eligible.length,
  })

  if (eligible.length === 0) {
    stages.push({
      id: 'ntf_pool',
      stepNumber: 1,
      type: 'ntf',
      label: 'NTF — No eligible terminals',
      description: `No terminal supports ${paymentMethod}${downedInThisStep.length > 0 ? ' (some are marked down)' : ''}. Payment fails immediately.`,
      ntfCause: downedInThisStep.length > 0 ? 'terminals_down' : 'method_unsupported',
    })
    return _buildResult(stages, null, true, warnings, merchant, routingStrategy)
  }

  // ─── Stage 1+: Rule Filters ────────────────────────────────
  let remaining = [...eligible]
  const enabledRules = [...rules]
    .filter(r => r.enabled && !disabledRules.has(r.id))
    .sort((a, b) => a.priority - b.priority)

  const skippedByOverride = [...rules]
    .filter(r => r.enabled && disabledRules.has(r.id))
    .sort((a, b) => a.priority - b.priority)

  let stepNum = 1

  for (const rule of enabledRules) {
    if (rule.isDefault) continue
    if (remaining.length === 0) break

    // Build transaction proxy for condition matching
    const txnProxy = {
      payment_method: paymentMethod,
      amount: transaction.amount || 0,
      card_network: transaction.card_network || null,
      card_type: transaction.card_type || null,
      issuer_bank: transaction.issuer_bank || null,
      international: transaction.international || false,
    }

    const ruleMatches = matchesConditions(rule, txnProxy)

    if (!ruleMatches) {
      stages.push({
        id: `rule_${rule.id}`,
        stepNumber: stepNum++,
        type: 'rule_skip',
        label: `Rule: ${rule.name}`,
        ruleId: rule.id,
        ruleName: rule.name,
        ruleType: rule.type === 'volume_split' ? 'Volume Split' : 'Conditional',
        conditions: formatRuleConditions(rule),
        description: 'Conditions did not match — rule skipped',
        terminalsRemaining: remaining.map(t => ({ ...t, status: 'passed' })),
        terminalsEliminated: [],
        remainingCount: remaining.length,
        delta: 0,
      })
      continue
    }

    // Rule matched — determine target terminals
    const targetIds = new Set(
      rule.action.type === 'split'
        ? rule.action.splits.map(s => s.terminalId)
        : rule.action.terminals || []
    )

    const kept = remaining.filter(t => targetIds.has(t.terminalId))
    const eliminated = remaining.filter(t => !targetIds.has(t.terminalId))

    if (kept.length === 0 && eliminated.length > 0) {
      // NTF: rule eliminates all remaining terminals
      stages.push({
        id: `rule_${rule.id}`,
        stepNumber: stepNum,
        type: 'rule_ntf',
        label: `Rule: ${rule.name}`,
        ruleId: rule.id,
        ruleName: rule.name,
        ruleType: rule.type === 'volume_split' ? 'Volume Split' : 'Conditional',
        conditions: formatRuleConditions(rule),
        action: formatRuleAction(rule),
        description: `Rule routes to ${[...targetIds].map(id => _traceTerminalLabel(id)).join(', ')} — none in eligible set. All eliminated.`,
        terminalsRemaining: [],
        terminalsEliminated: eliminated.map(t => ({
          ...t, status: 'eliminated',
          reason: `Not in rule target: ${[...targetIds].map(id => _traceTerminalLabel(id)).join(', ')}`,
        })),
        isNTFCause: true,
        remainingCount: 0,
        delta: -eliminated.length,
      })

      stages.push({
        id: 'ntf_rule',
        stepNumber: stepNum + 1,
        type: 'ntf',
        label: 'NTF — Payment Failed',
        description: `Rule "${rule.name}" eliminated all eligible terminals.`,
        ntfCause: 'rule_elimination',
        causeRuleId: rule.id,
        causeRuleName: rule.name,
      })

      return _buildResult(stages, null, true, warnings, merchant, routingStrategy)
    }

    if (eliminated.length > 0) {
      stages.push({
        id: `rule_${rule.id}`,
        stepNumber: stepNum++,
        type: 'rule_filter',
        label: `Rule: ${rule.name}`,
        ruleId: rule.id,
        ruleName: rule.name,
        ruleType: rule.type === 'volume_split' ? 'Volume Split' : 'Conditional',
        conditions: formatRuleConditions(rule),
        action: formatRuleAction(rule),
        description: `Rule matched. ${eliminated.length} terminal(s) not in target list eliminated.`,
        terminalsRemaining: kept.map(t => ({ ...t, status: 'passed' })),
        terminalsEliminated: eliminated.map(t => ({
          ...t, status: 'eliminated', reason: 'Not in rule target list',
        })),
        remainingCount: kept.length,
        delta: -eliminated.length,
      })
      remaining = kept
    } else {
      stages.push({
        id: `rule_${rule.id}`,
        stepNumber: stepNum++,
        type: 'rule_pass',
        label: `Rule: ${rule.name}`,
        ruleId: rule.id,
        ruleName: rule.name,
        ruleType: rule.type === 'volume_split' ? 'Volume Split' : 'Conditional',
        conditions: formatRuleConditions(rule),
        action: formatRuleAction(rule),
        description: 'Rule matched. All remaining terminals are in target list.',
        terminalsRemaining: remaining.map(t => ({ ...t, status: 'passed' })),
        terminalsEliminated: [],
        remainingCount: remaining.length,
        delta: 0,
      })
    }
  }

  // Add any rules disabled by what-if override as visual "disabled" steps
  for (const rule of skippedByOverride) {
    if (rule.isDefault) continue
    stages.push({
      id: `rule_${rule.id}`,
      stepNumber: stepNum++,
      type: 'rule_disabled',
      label: `Rule: ${rule.name}`,
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.type === 'volume_split' ? 'Volume Split' : 'Conditional',
      conditions: formatRuleConditions(rule),
      description: 'Rule disabled in simulation (what-if override)',
      terminalsRemaining: remaining.map(t => ({ ...t, status: 'passed' })),
      terminalsEliminated: [],
      remainingCount: remaining.length,
      delta: 0,
      isWhatIfDisabled: true,
    })
  }

  if (remaining.length === 0) {
    // Shouldn't reach here (handled above), but safety net
    return _buildResult(stages, null, true, warnings, merchant, routingStrategy)
  }

  // ─── Stage N: SR Threshold Filter ──────────────────────────
  if (srThreshold > 0) {
    const belowThreshold = remaining.filter(t => t.successRate < srThreshold)
    const aboveThreshold = remaining.filter(t => t.successRate >= srThreshold)

    if (belowThreshold.length > 0 && aboveThreshold.length > 0) {
      stages.push({
        id: 'sr_threshold',
        stepNumber: stepNum++,
        type: 'threshold_filter',
        label: `SR Safety Net (≥${srThreshold}%)`,
        description: `${belowThreshold.length} terminal(s) below ${srThreshold}% SR threshold removed.`,
        terminalsRemaining: aboveThreshold.map(t => ({ ...t, status: 'passed' })),
        terminalsEliminated: belowThreshold.map(t => ({
          ...t, status: 'eliminated', reason: `SR ${t.successRate}% < threshold ${srThreshold}%`,
        })),
        remainingCount: aboveThreshold.length,
        delta: -belowThreshold.length,
        threshold: srThreshold,
      })
      remaining = aboveThreshold
    } else if (belowThreshold.length > 0 && aboveThreshold.length === 0) {
      // All below threshold — keep all but warn
      warnings.push(`All ${remaining.length} terminals are below SR threshold ${srThreshold}% — threshold bypassed to prevent NTF`)
      stages.push({
        id: 'sr_threshold',
        stepNumber: stepNum++,
        type: 'threshold_bypass',
        label: `SR Safety Net (≥${srThreshold}%)`,
        description: `All terminals below threshold — bypassed to prevent NTF.`,
        terminalsRemaining: remaining.map(t => ({ ...t, status: 'warning' })),
        terminalsEliminated: [],
        remainingCount: remaining.length,
        delta: 0,
        threshold: srThreshold,
      })
    }
  }

  // ─── Stage N+1: Sorter ─────────────────────────────────────
  const dopplerScores = generateDopplerScores(remaining, transaction, merchant)
  const dopplerMap = Object.fromEntries(dopplerScores.map(d => [d.terminalId, d.dopplerScore]))

  const scored = remaining.map(t => {
    const doppler = dopplerMap[t.terminalId] || 50
    let finalScore

    if (routingStrategy === 'cost_based') {
      // Cost-based: lower cost = higher score. Normalize cost to 0–100 (inverse).
      const maxCost = Math.max(...remaining.map(r => r.costPerTxn), 3)
      const costScore = ((maxCost - t.costPerTxn) / maxCost) * 100
      finalScore = Math.round((costScore * 0.6 + doppler * 0.2 + t.successRate * 0.2) * 10) / 10
    } else {
      // SR-based: SR is primary, Doppler is tiebreaker
      finalScore = Math.round((t.successRate * 0.5 + doppler * 0.35 + (t.isZeroCost ? 5 : 0) * 0.15) * 10) / 10
    }

    return { ...t, dopplerScore: doppler, finalScore }
  }).sort((a, b) => b.finalScore - a.finalScore)

  const selectedTerminal = scored[0]

  stages.push({
    id: 'sorter',
    stepNumber: stepNum++,
    type: 'sorter',
    label: `Sorter: ${routingStrategy === 'cost_based' ? 'Cost-Optimized' : 'SR-Optimized'}`,
    description: `${scored.length} terminal(s) scored and ranked. ${routingStrategy === 'cost_based' ? 'Lowest cost prioritized.' : 'Highest success rate prioritized.'}`,
    strategy: routingStrategy,
    scored: scored.map((t, rank) => ({
      ...t,
      rank: rank + 1,
      isSelected: t.terminalId === selectedTerminal.terminalId,
    })),
    selectedTerminal: {
      terminalId: selectedTerminal.terminalId,
      displayId: selectedTerminal.displayId,
      gatewayShort: selectedTerminal.gatewayShort,
      successRate: selectedTerminal.successRate,
      costPerTxn: selectedTerminal.costPerTxn,
      finalScore: selectedTerminal.finalScore,
      dopplerScore: selectedTerminal.dopplerScore,
    },
    remainingCount: scored.length,
  })

  return _buildResult(stages, selectedTerminal, false, warnings, merchant, routingStrategy)
}

/**
 * Build the final result object with deltas vs current primary terminal.
 */
function _buildResult(stages, selectedTerminal, isNTF, warnings, merchant, routingStrategy) {
  // Find current primary terminal for delta comparison
  const currentPrimary = merchant.gatewayMetrics.find(gm => gm.terminalId === merchant.currentTerminalId)
  const currentGw = currentPrimary ? gateways.find(g => g.id === currentPrimary.gatewayId) : null
  const currentTerm = currentGw?.terminals.find(t => t.id === currentPrimary?.terminalId)

  let costDelta = null
  let srDelta = null

  if (selectedTerminal && currentPrimary) {
    costDelta = {
      absolute: Math.round((selectedTerminal.costPerTxn - currentPrimary.costPerTxn) * 100) / 100,
      label: selectedTerminal.costPerTxn <= currentPrimary.costPerTxn ? 'saving' : 'increase',
    }
    srDelta = {
      absolute: Math.round((selectedTerminal.successRate - currentPrimary.avgPaymentSuccessRate || currentPrimary.successRate) * 10) / 10,
      label: selectedTerminal.successRate >= (currentPrimary.successRate || 0) ? 'improvement' : 'decrease',
    }
  }

  return {
    stages,
    isNTF,
    warnings,
    selectedTerminal: selectedTerminal ? {
      terminalId: selectedTerminal.terminalId,
      displayId: selectedTerminal.displayId,
      gatewayShort: selectedTerminal.gatewayShort,
      successRate: selectedTerminal.successRate,
      costPerTxn: selectedTerminal.costPerTxn,
      dopplerScore: selectedTerminal.dopplerScore,
      finalScore: selectedTerminal.finalScore,
    } : null,
    currentPrimary: currentPrimary ? {
      terminalId: currentPrimary.terminalId,
      displayId: currentTerm?.terminalId || currentPrimary.terminalId,
      gatewayShort: currentGw?.shortName || '??',
      successRate: currentPrimary.successRate,
      costPerTxn: currentPrimary.costPerTxn,
    } : null,
    costDelta,
    srDelta,
    routingStrategy,
    stageCount: stages.length,
    terminalPoolSize: stages[0]?.totalCount || 0,
  }
}

// ── Batch Payment Simulation (Galton Board) ─────────────────

export function batchSimulatePayments(merchant, transactions, rules, overrides = {}) {
  const terminalCounts = {}
  const terminalSRSums = {}
  const terminalCostSums = {}
  const ruleMatchCounts = {}
  const ruleElimCounts = {}
  const ruleAffected = {}
  let ntfCount = 0
  const traces = []

  // Build terminal info map
  const termInfoMap = {}
  merchant.gatewayMetrics.forEach(gm => {
    const gw = gateways.find(g => g.id === gm.gatewayId)
    const term = gw?.terminals.find(t => t.id === gm.terminalId)
    termInfoMap[gm.terminalId] = {
      terminalId: gm.terminalId,
      displayId: term?.terminalId || gm.terminalId,
      gatewayShort: gw?.shortName || '??',
      successRate: gm.successRate,
      costPerTxn: gm.costPerTxn,
    }
  })

  // Run each transaction through the pipeline
  transactions.forEach((txn, idx) => {
    const simTxn = {
      payment_method: txn.paymentMethod?.short === 'CC' || txn.paymentMethod?.short === 'DC' ? 'Cards'
        : txn.paymentMethod?.short === 'UPI' ? 'UPI'
        : txn.paymentMethod?.short === 'NB' ? 'NB'
        : txn.paymentMethod?.label || 'Cards',
      amount: txn.amount || 1000,
      card_network: txn.paymentMethod?.short === 'CC' ? 'Visa' : txn.paymentMethod?.short === 'DC' ? 'RuPay' : '',
      card_type: txn.paymentMethod?.short === 'CC' ? 'credit' : txn.paymentMethod?.short === 'DC' ? 'debit' : '',
      international: false,
    }

    const result = simulateRoutingPipeline(merchant, simTxn, rules, overrides)

    // Track terminal distribution
    if (result.isNTF) {
      ntfCount++
    } else if (result.selectedTerminal) {
      const tid = result.selectedTerminal.terminalId
      terminalCounts[tid] = (terminalCounts[tid] || 0) + 1
      terminalSRSums[tid] = (terminalSRSums[tid] || 0) + result.selectedTerminal.successRate
      terminalCostSums[tid] = (terminalCostSums[tid] || 0) + result.selectedTerminal.costPerTxn
    }

    // Track rule impacts
    result.stages.forEach((stage, stageIdx) => {
      if (stage.type === 'rule_filter' || stage.type === 'rule_ntf' || stage.type === 'rule_pass') {
        const rid = stage.ruleId
        if (rid) {
          ruleMatchCounts[rid] = (ruleMatchCounts[rid] || 0) + 1
          ruleElimCounts[rid] = (ruleElimCounts[rid] || 0) + (stage.terminalsEliminated?.length || 0)
          if (!ruleAffected[rid]) ruleAffected[rid] = { name: stage.ruleName, count: 0 }
          ruleAffected[rid].count++
        }
      }
    })

    // Build trace for animation (sample ~80 balls)
    if (idx < 80) {
      const pathStages = []
      let eliminatedAtStage = null
      result.stages.forEach((stage, si) => {
        if (stage.type === 'rule_filter' || stage.type === 'rule_pass' || stage.type === 'rule_skip' || stage.type === 'rule_ntf') {
          pathStages.push(si)
        }
        if (stage.type === 'ntf' || stage.type === 'rule_ntf') {
          eliminatedAtStage = si
        }
      })

      traces.push({
        id: txn.txnId || `txn-${idx}`,
        paymentMethod: simTxn.payment_method,
        cardNetwork: simTxn.card_network,
        amount: simTxn.amount,
        finalTerminalId: result.isNTF ? null : result.selectedTerminal?.terminalId,
        isNTF: result.isNTF,
        pathStages,
        eliminatedAtStage,
      })
    }
  })

  // Build terminal distribution
  const totalPayments = transactions.length
  const terminalDistribution = Object.keys(termInfoMap).map(tid => {
    const count = terminalCounts[tid] || 0
    const info = termInfoMap[tid]
    return {
      terminalId: tid,
      displayId: info.displayId,
      gatewayShort: info.gatewayShort,
      count,
      percentage: totalPayments > 0 ? Math.round((count / totalPayments) * 1000) / 10 : 0,
      avgSR: count > 0 ? Math.round((terminalSRSums[tid] / count) * 10) / 10 : info.successRate,
      avgCost: count > 0 ? Math.round((terminalCostSums[tid] / count) * 100) / 100 : info.costPerTxn,
    }
  }).sort((a, b) => b.count - a.count)

  // Build rule impact
  const ruleImpact = Object.entries(ruleAffected).map(([rid, info]) => ({
    ruleId: rid,
    ruleName: info.name,
    matchCount: ruleMatchCounts[rid] || 0,
    eliminatedTerminals: ruleElimCounts[rid] || 0,
    affectedPayments: info.count,
  }))

  return {
    totalPayments,
    terminalDistribution,
    ntfCount,
    ntfPercentage: totalPayments > 0 ? Math.round((ntfCount / totalPayments) * 1000) / 10 : 0,
    ruleImpact,
    traces,
  }
}

// ── AI Rule Intent Parser ─────────────────

const INTENT_KEYWORDS = {
  payment_method: {
    'credit card': 'Cards', 'credit cards': 'Cards', 'cc': 'Cards',
    'debit card': 'Cards', 'debit cards': 'Cards', 'dc': 'Cards',
    'card': 'Cards', 'cards': 'Cards',
    'upi': 'UPI', 'upi payments': 'UPI',
    'net banking': 'NB', 'netbanking': 'NB', 'nb': 'NB',
  },
  card_network: {
    'visa': 'Visa', 'mastercard': 'Mastercard', 'master card': 'Mastercard',
    'rupay': 'RuPay', 'ru pay': 'RuPay',
    'amex': 'Amex', 'american express': 'Amex',
  },
  issuer_bank: {
    'hdfc': 'HDFC', 'icici': 'ICICI', 'sbi': 'SBI',
    'axis': 'Axis', 'kotak': 'Kotak',
  },
  gateway: {
    'hdfc': 'gw-hdfc', 'icici': 'gw-icici', 'axis': 'gw-axis',
    'rbl': 'gw-rbl', 'yes': 'gw-yes', 'yes bank': 'gw-yes',
  },
}

/**
 * Parse natural-language rule intent into a structured rule suggestion.
 * Uses deterministic keyword matching — no LLM calls.
 *
 * @param {string} text - Natural language description of desired rule
 * @param {object} merchant - Merchant object with gatewayMetrics
 * @returns {{ confidence: number, suggestedRule: object, explanation: string, warnings: string[] }}
 */
export function parseRuleIntent(text, merchant) {
  const input = (text || '').toLowerCase().trim()
  const warnings = []
  const conditions = []
  let ruleType = 'conditional'
  let actionTerminals = []
  let actionSplits = []
  let signals = 0
  let totalPossibleSignals = 5 // payment_method, card_network, issuer_bank, amount, gateway

  if (!input) {
    return {
      confidence: 0,
      suggestedRule: null,
      explanation: "Please describe the routing rule you'd like to create. For example: \"Route Visa credit cards above ₹5,000 to HDFC terminal\"",
      warnings: [],
    }
  }

  // 1. Detect payment method
  for (const [keyword, value] of Object.entries(INTENT_KEYWORDS.payment_method)) {
    if (input.includes(keyword)) {
      if (!conditions.find(c => c.field === 'payment_method' && c.value === value)) {
        conditions.push({ field: 'payment_method', operator: 'equals', value })
        signals++
      }
      break
    }
  }

  // 2. Detect card network
  for (const [keyword, value] of Object.entries(INTENT_KEYWORDS.card_network)) {
    if (input.includes(keyword)) {
      if (!conditions.find(c => c.field === 'card_network' && c.value === value)) {
        conditions.push({ field: 'card_network', operator: 'equals', value })
        signals++
      }
      break
    }
  }

  // 3. Detect issuer bank (as condition, not routing target)
  // Only add as condition if "issued by" or "from" pattern is found
  const issuerPatterns = [/(?:issued?\s+by|from|issuer)\s+(\w+)/i]
  for (const pat of issuerPatterns) {
    const m = input.match(pat)
    if (m) {
      const bankName = m[1].toLowerCase()
      const bankValue = INTENT_KEYWORDS.issuer_bank[bankName]
      if (bankValue) {
        conditions.push({ field: 'issuer_bank', operator: 'equals', value: bankValue })
        signals++
        break
      }
    }
  }

  // 4. Detect amount
  const amountPatterns = [
    { regex: /(?:above|over|greater than|more than|>)\s*(?:₹|rs\.?|inr)?\s*([0-9,.]+(?:k)?)/i, operator: 'greater_than' },
    { regex: /(?:below|under|less than|<)\s*(?:₹|rs\.?|inr)?\s*([0-9,.]+(?:k)?)/i, operator: 'less_than' },
    { regex: /(?:high\s*value)/i, operator: 'greater_than', fixedValue: 5000 },
    { regex: /(?:low\s*value)/i, operator: 'less_than', fixedValue: 1000 },
    { regex: /(?:between)\s*(?:₹|rs\.?|inr)?\s*([0-9,.]+(?:k)?)\s*(?:and|to|-)\s*(?:₹|rs\.?|inr)?\s*([0-9,.]+(?:k)?)/i, operator: 'between' },
  ]

  for (const { regex, operator, fixedValue } of amountPatterns) {
    const m = input.match(regex)
    if (m || fixedValue !== undefined) {
      if (operator === 'between' && m) {
        const low = parseAmountValue(m[1])
        const high = parseAmountValue(m[2])
        conditions.push({ field: 'amount', operator: 'between', value: low, valueTo: high })
      } else {
        const val = fixedValue !== undefined ? fixedValue : parseAmountValue(m[1])
        conditions.push({ field: 'amount', operator, value: val })
      }
      signals++
      break
    }
  }

  // 5. Detect rule type: volume split vs conditional
  const splitKeywords = ['split', 'distribute', 'percentage', 'percent', '%']
  if (splitKeywords.some(kw => input.includes(kw))) {
    ruleType = 'volume_split'
  }

  // 6. Detect gateway/terminal targets
  const merchantTerminalIds = (merchant?.gatewayMetrics || []).map(gm => gm.terminalId)
  const detectedGateways = []

  for (const [keyword, gwId] of Object.entries(INTENT_KEYWORDS.gateway)) {
    // Avoid matching 'hdfc' as gateway when it was already matched as issuer
    if (input.includes(keyword)) {
      const gw = gateways.find(g => g.id === gwId)
      if (gw) {
        // Check if specific terminal mentioned (e.g., "HDFC_T1", "T1", "terminal 1")
        const termMatch = input.match(new RegExp(keyword + '[_ ]?t([12])', 'i'))
        if (termMatch) {
          const termNum = termMatch[1]
          const termId = gw.terminals[parseInt(termNum) - 1]?.id
          if (termId && merchantTerminalIds.includes(termId)) {
            detectedGateways.push({ gwId, termId, gwShort: gw.shortName })
            signals++
          } else if (termId) {
            warnings.push(`${gw.shortName} terminal T${termNum} is not active for ${merchant?.name || 'this merchant'}`)
            // Still add it as a suggestion
            detectedGateways.push({ gwId, termId, gwShort: gw.shortName })
            signals++
          }
        } else {
          // Pick the first available terminal for this gateway
          const availableTerms = gw.terminals.filter(t => merchantTerminalIds.includes(t.id))
          if (availableTerms.length > 0) {
            detectedGateways.push({ gwId, termId: availableTerms[0].id, gwShort: gw.shortName })
            signals++
          } else if (gw.terminals.length > 0) {
            warnings.push(`${gw.shortName} gateway has no active terminals for ${merchant?.name || 'this merchant'}`)
            detectedGateways.push({ gwId, termId: gw.terminals[0].id, gwShort: gw.shortName })
            signals++
          }
        }
      }
      break // Only match first gateway to avoid ambiguity
    }
  }

  // 7. Build action
  if (ruleType === 'volume_split' && detectedGateways.length > 0) {
    // Parse percentage patterns like "70% hdfc", "hdfc 70%", "70/30 split"
    const pctPatterns = [
      /(\d{1,3})\s*%\s*(\w+)/gi,
      /(\w+)\s+(\d{1,3})\s*%/gi,
      /(\d{1,3})\s*[\/]\s*(\d{1,3})/i,
    ]
    const ratioMatch = input.match(/(\d{1,3})\s*[\/]\s*(\d{1,3})/)
    if (ratioMatch && detectedGateways.length >= 1) {
      // Handle "70/30 split" format
      const pct1 = parseInt(ratioMatch[1])
      const pct2 = parseInt(ratioMatch[2])
      if (pct1 + pct2 === 100) {
        actionSplits.push({ terminalId: detectedGateways[0].termId, percentage: pct1 })
        if (detectedGateways.length >= 2) {
          actionSplits.push({ terminalId: detectedGateways[1].termId, percentage: pct2 })
        } else {
          // Pick another terminal from merchant
          const otherTerm = merchantTerminalIds.find(t => t !== detectedGateways[0].termId)
          if (otherTerm) actionSplits.push({ terminalId: otherTerm, percentage: pct2 })
        }
      }
    } else {
      // Try named percentage patterns
      const pctMatch = input.match(/(\d{1,3})\s*%/)
      if (pctMatch) {
        const pct = parseInt(pctMatch[1])
        actionSplits.push({ terminalId: detectedGateways[0].termId, percentage: Math.min(pct, 100) })
        const remaining = 100 - Math.min(pct, 100)
        if (remaining > 0) {
          const otherTerm = merchantTerminalIds.find(t => t !== detectedGateways[0].termId)
          if (otherTerm) actionSplits.push({ terminalId: otherTerm, percentage: remaining })
        }
      } else {
        // Equal split across detected gateways
        const pctEach = Math.floor(100 / detectedGateways.length)
        detectedGateways.forEach((dg, i) => {
          actionSplits.push({
            terminalId: dg.termId,
            percentage: i === detectedGateways.length - 1 ? 100 - pctEach * (detectedGateways.length - 1) : pctEach,
          })
        })
      }
    }
    actionTerminals = []
  } else {
    // Conditional — terminals in priority order
    actionTerminals = detectedGateways.map(dg => dg.termId)
    if (actionTerminals.length === 0 && merchantTerminalIds.length > 0) {
      // Fallback: pick highest-SR terminal
      const sorted = [...(merchant?.gatewayMetrics || [])].sort((a, b) => b.successRate - a.successRate)
      if (sorted.length > 0) {
        actionTerminals = [sorted[0].terminalId]
        warnings.push('No specific gateway mentioned — defaulting to highest-SR terminal')
      }
    }
  }

  // 8. Generate rule name
  const nameParts = []
  const pmCond = conditions.find(c => c.field === 'payment_method')
  const cnCond = conditions.find(c => c.field === 'card_network')
  const amCond = conditions.find(c => c.field === 'amount')
  if (cnCond) nameParts.push(cnCond.value)
  if (pmCond) nameParts.push(pmCond.value)
  if (amCond) {
    if (amCond.operator === 'greater_than') nameParts.push(`>${formatAmount(amCond.value)}`)
    else if (amCond.operator === 'less_than') nameParts.push(`<${formatAmount(amCond.value)}`)
    else if (amCond.operator === 'between') nameParts.push(`${formatAmount(amCond.value)}-${formatAmount(amCond.valueTo)}`)
  }
  if (detectedGateways.length > 0) nameParts.push(`→ ${detectedGateways.map(g => g.gwShort).join('+')}`)
  const ruleName = nameParts.length > 0 ? nameParts.join(' ') : 'New Rule'

  // 9. Compute confidence
  const confidence = Math.min(signals / 3, 1) // 3+ signals = full confidence

  // 10. Generate explanation
  let explanation = ''
  if (confidence === 0) {
    explanation = "I couldn't identify specific routing parameters from your description. Try mentioning payment methods (CC, UPI), card networks (Visa, Mastercard), amount thresholds, or gateway names (HDFC, ICICI)."
  } else {
    const parts = []
    if (ruleType === 'volume_split') {
      parts.push('Create a volume split rule')
    } else {
      parts.push('Create a conditional routing rule')
    }
    if (conditions.length > 0) {
      const condDescs = conditions.map(c => {
        if (c.field === 'payment_method') return `payment method is ${c.value}`
        if (c.field === 'card_network') return `card network is ${c.value}`
        if (c.field === 'issuer_bank') return `issuer bank is ${c.value}`
        if (c.field === 'amount') {
          if (c.operator === 'greater_than') return `amount > ₹${c.value.toLocaleString('en-IN')}`
          if (c.operator === 'less_than') return `amount < ₹${c.value.toLocaleString('en-IN')}`
          if (c.operator === 'between') return `amount between ₹${c.value.toLocaleString('en-IN')} and ₹${(c.valueTo || 0).toLocaleString('en-IN')}`
        }
        return ''
      }).filter(Boolean)
      parts.push(`that matches when ${condDescs.join(' AND ')}`)
    }
    if (ruleType === 'volume_split' && actionSplits.length > 0) {
      const splitDescs = actionSplits.map(s => {
        const dId = getTerminalDisplayId(s.terminalId)
        return `${dId} (${s.percentage}%)`
      })
      parts.push(`splitting traffic: ${splitDescs.join(', ')}`)
    } else if (actionTerminals.length > 0) {
      const termDescs = actionTerminals.map(t => getTerminalDisplayId(t))
      parts.push(`routing to ${termDescs.join(' → ')} in priority order`)
    }
    explanation = parts.join(', ') + '.'
  }

  const suggestedRule = confidence > 0 ? {
    name: ruleName,
    type: ruleType,
    conditions,
    conditionLogic: 'AND',
    action: {
      type: ruleType === 'volume_split' ? 'split' : 'route',
      terminals: actionTerminals,
      splits: actionSplits,
      srThreshold: ruleType === 'conditional' && actionTerminals.length > 1 ? 90 : 0,
      minPaymentCount: ruleType === 'conditional' && actionTerminals.length > 1 ? 100 : 0,
    },
  } : null

  return { confidence, suggestedRule, explanation, warnings }
}

function parseAmountValue(str) {
  if (!str) return 0
  const cleaned = str.replace(/[,₹]/g, '').trim().toLowerCase()
  if (cleaned.endsWith('k')) return parseFloat(cleaned) * 1000
  return parseFloat(cleaned) || 0
}

function formatAmount(val) {
  if (val >= 1000) return `₹${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}K`
  return `₹${val}`
}

// ── Terminal Display Helpers ─────────────

/**
 * Resolve internal terminal ID (e.g. 'term-hdfc-001') to display ID ('HDFC_T1').
 */
export function getTerminalDisplayId(terminalId) {
  for (const gw of gateways) {
    const term = gw.terminals.find(t => t.id === terminalId)
    if (term) return term.terminalId
  }
  return terminalId
}

/**
 * Get full gateway + terminal info from an internal terminal ID.
 */
export function getTerminalGatewayInfo(terminalId) {
  for (const gw of gateways) {
    const term = gw.terminals.find(t => t.id === terminalId)
    if (term) {
      return {
        displayId: term.terminalId,
        gatewayId: gw.id,
        gatewayName: gw.name,
        gatewayShort: gw.shortName,
        successRate: term.successRate,
        costPerTxn: term.costPerTxn,
        isZeroCost: term.isZeroCost,
      }
    }
  }
  return null
}

// ── Routing Health ───────────────

export function generateNTFAnalysis(merchant, ntfTransactions, rules) {
  if (!ntfTransactions || ntfTransactions.length === 0) {
    return { profiles: [], summary: null }
  }

  // Group NTFs by transaction profile
  const groups = {}
  for (const txn of ntfTransactions) {
    const pm = txn.paymentMethod || {}
    const profileKey = [
      pm.short || 'Unknown',
      pm.network || 'N/A',
      pm.cardType || 'N/A',
      getAmountRange(txn.amount),
    ].join('|')

    if (!groups[profileKey]) {
      groups[profileKey] = {
        paymentMethod: pm.short || 'Unknown',
        paymentMethodLabel: pm.type || 'Unknown',
        cardNetwork: pm.network || null,
        cardType: pm.cardType || null,
        amountRange: getAmountRange(txn.amount),
        transactions: [],
      }
    }
    groups[profileKey].transactions.push(txn)
  }

  const NTF_CAUSE_LABELS = {
    rule_elimination: 'Cost-driven REJECT rule without fallback gateway',
    method_unsupported: 'No terminal supports this payment method',
    pipeline_filter: 'Pipeline filter (SR threshold / compliance)',
  }

  const profiles = Object.entries(groups).map(([key, group], idx) => {
    const txns = group.transactions
    const totalAmount = txns.reduce((s, t) => s + t.amount, 0)
    const avgAmount = Math.round(totalAmount / txns.length)

    // Build profile label
    let profileLabel = group.paymentMethodLabel
    if (group.amountRange) profileLabel += `, ${group.amountRange}`

    // Trace rule chain for representative transaction
    const representative = txns[0]
    const trace = traceNTFRuleChain(representative, rules, merchant)

    // Determine NTF cause
    const ntfStep = trace.steps.find(s => s.type === 'ntf')
    const causeStep = trace.steps.find(s => s.isNTFCause)
    const ntfCause = ntfStep?.ntfCause || 'pipeline_filter'

    // Estimate revenue impact (forward pricing ~2% of GMV)
    const revenueLost = Math.round(totalAmount * 0.02)
    const srImpact = -((txns.length / 30) * 100 * 0.1) // rough SR impact

    // Find alternative terminals that COULD handle this traffic
    const allTerminals = merchant.gatewayMetrics.map(gm => {
      const gw = gateways.find(g => g.id === gm.gatewayId)
      const term = gw?.terminals.find(t => t.id === gm.terminalId)
      return {
        terminalId: gm.terminalId,
        displayId: term?.terminalId || gm.terminalId,
        gatewayShort: gw?.shortName || '??',
        successRate: gm.successRate,
        costPerTxn: gm.costPerTxn,
      }
    })

    // Terminals NOT currently assigned to this merchant that could help
    const missingGateways = gateways
      .filter(gw => !merchant.gatewayMetrics.some(gm => gm.gatewayId === gw.id))
      .flatMap(gw => gw.terminals.map(t => ({
        terminalId: t.id,
        displayId: t.terminalId,
        gatewayShort: gw.shortName,
        successRate: t.successRate,
        costPerTxn: t.costPerTxn,
      })))
      .slice(0, 3)

    // Generate actions based on cause
    const actions = []
    if (ntfCause === 'rule_elimination' && causeStep) {
      actions.push({
        id: `act-${idx}-1`,
        type: 'in-dashboard',
        priority: 'high',
        title: `Disable or modify rule "${causeStep.ruleName}"`,
        description: `This rule eliminated all eligible terminals for ${profileLabel} transactions. Consider adding a fallback terminal or relaxing conditions.`,
        owner: 'KAM (You)',
        ownerTeam: null,
        actionType: 'modify_rule',
        targetRuleId: causeStep.ruleId,
      })
      if (missingGateways.length > 0) {
        actions.push({
          id: `act-${idx}-2`,
          type: 'external',
          priority: 'medium',
          title: `Procure ${missingGateways[0].gatewayShort} terminal`,
          description: `Adding ${missingGateways[0].displayId} would provide a fallback for ${group.paymentMethod} transactions.`,
          owner: 'TR Team',
          ownerTeam: 'Terminal & Routing',
          escalationTemplate: generateEscalationTemplate(merchant, { profileLabel, txnCount: txns.length, revenueLost }, 'procure_terminal', missingGateways[0]),
        })
      }
    } else if (ntfCause === 'method_unsupported') {
      actions.push({
        id: `act-${idx}-1`,
        type: 'external',
        priority: 'high',
        title: `Procure terminal for ${group.paymentMethodLabel}`,
        description: `No terminal currently supports ${group.paymentMethodLabel}. ${txns.length} transactions failed due to missing coverage.`,
        owner: 'TR Team',
        ownerTeam: 'Terminal & Routing',
        escalationTemplate: generateEscalationTemplate(merchant, { profileLabel, txnCount: txns.length, revenueLost }, 'procure_method', null),
      })
    } else {
      actions.push({
        id: `act-${idx}-1`,
        type: 'in-dashboard',
        priority: 'medium',
        title: 'Review routing pipeline filters',
        description: `${txns.length} ${profileLabel} transactions were filtered by pipeline-level checks (SR threshold, compliance). Review threshold settings.`,
        owner: 'KAM (You)',
        ownerTeam: null,
        actionType: 'review_config',
      })
      actions.push({
        id: `act-${idx}-2`,
        type: 'external',
        priority: 'low',
        title: 'Escalate to Banking Alliances',
        description: `If compliance/MCC restrictions are causing NTFs, request an exemption review.`,
        owner: 'Banking Alliances',
        ownerTeam: 'Banking Alliances',
        escalationTemplate: generateEscalationTemplate(merchant, { profileLabel, txnCount: txns.length, revenueLost }, 'compliance_review', null),
      })
    }

    return {
      id: `profile-${idx}`,
      profileKey: key,
      profileLabel,
      paymentMethod: group.paymentMethod,
      cardNetwork: group.cardNetwork,
      cardType: group.cardType,
      amountRange: group.amountRange,
      txnCount: txns.length,
      totalAmount,
      avgAmount,
      ruleChainTrace: trace,
      ntfCause,
      ntfCauseLabel: NTF_CAUSE_LABELS[ntfCause] || ntfCause,
      causeRule: causeStep ? { id: causeStep.ruleId, name: causeStep.ruleName } : null,
      impact: {
        revenueLost,
        srImpact: Math.round(srImpact * 10) / 10,
        tradeOff: ntfCause === 'rule_elimination' && causeStep
          ? `Rule "${causeStep.ruleName}" is saving backward cost but causing ${txns.length} NTF failures worth ${formatINR(revenueLost)} in lost revenue.`
          : `${txns.length} transactions worth ${formatINR(totalAmount)} failed due to ${NTF_CAUSE_LABELS[ntfCause] || 'routing issues'}.`,
        alternativeTerminals: missingGateways,
      },
      actions,
    }
  })

  // Sort by txn count descending
  profiles.sort((a, b) => b.txnCount - a.txnCount)

  // Summary
  const totalNTF = ntfTransactions.length
  const totalRevenueLost = profiles.reduce((s, p) => s + p.impact.revenueLost, 0)
  const totalSRImpact = profiles.reduce((s, p) => s + p.impact.srImpact, 0)
  const causeCounts = {}
  profiles.forEach(p => {
    causeCounts[p.ntfCauseLabel] = (causeCounts[p.ntfCauseLabel] || 0) + p.txnCount
  })
  const topCause = Object.entries(causeCounts).sort((a, b) => b[1] - a[1])[0]

  return {
    profiles,
    summary: {
      totalNTFCount: totalNTF,
      totalRevenueLost,
      totalSRImpact: Math.round(totalSRImpact * 10) / 10,
      topCause: topCause ? topCause[0] : 'Unknown',
      topCausePercentage: topCause ? Math.round((topCause[1] / totalNTF) * 100) : 0,
    },
  }
}

function generateEscalationTemplate(merchant, profile, actionType, terminal) {
  const mid = merchant.id
  const name = merchant.name
  const base = `Merchant: ${name} (${mid})\nAffected Profile: ${profile.profileLabel}\nFailed Transactions: ${profile.txnCount}\nEstimated Revenue Impact: ${formatINR(profile.revenueLost)}\n`

  if (actionType === 'procure_terminal' && terminal) {
    return {
      to: 'tr-team@razorpay.com',
      subject: `Terminal Procurement: ${name} - ${terminal.gatewayShort}`,
      body: `Hi TR Team,\n\n${base}\nRequest: Procure ${terminal.gatewayShort} terminal (${terminal.displayId}) as fallback to prevent NTF failures.\n\nThis merchant is currently missing coverage for the above transaction profile, causing payment failures.\n\nPlease prioritize based on revenue impact.\n\nThanks`,
    }
  }
  if (actionType === 'procure_method') {
    return {
      to: 'tr-team@razorpay.com',
      subject: `Terminal Gap: ${name} - ${profile.profileLabel}`,
      body: `Hi TR Team,\n\n${base}\nRequest: No terminal currently supports ${profile.profileLabel} for this merchant. Please procure an appropriate terminal.\n\nThanks`,
    }
  }
  return {
    to: 'banking-alliances@razorpay.com',
    subject: `Compliance Review: ${name} - NTF Failures`,
    body: `Hi Banking Alliances,\n\n${base}\nRequest: Review compliance/MCC restrictions that may be causing NTF failures for this merchant. An exemption or terminal addition may be needed.\n\nThanks`,
  }
}

// ---------------------------------------------------------------------------
// Rule Coverage Matrix
// ---------------------------------------------------------------------------
/**
 * Compute a coverage matrix showing which rule handles each payment type combo.
 * Returns { combos: [...], coverageMap: { comboKey: { matchedRule, selectedTerminal, isDefault, isMethodDefault, isNTF } } }
 */
export function computeRuleCoverageMatrix(rules, merchant) {
  // Define all payment type combinations
  const combos = []

  // Cards combos
  const networks = ['Visa', 'Mastercard', 'RuPay']
  const cardTypes = ['credit', 'debit']
  const intlOptions = [false, true]

  for (const network of networks) {
    for (const cardType of cardTypes) {
      for (const intl of intlOptions) {
        combos.push({
          key: `cards-${network}-${cardType}-${intl ? 'intl' : 'dom'}`,
          label: `${network} ${cardType === 'credit' ? 'CC' : 'DC'} ${intl ? 'Intl' : 'Dom'}`,
          shortLabel: `${network.slice(0, 2)} ${cardType === 'credit' ? 'CC' : 'DC'}${intl ? ' I' : ''}`,
          method: 'Cards',
          txn: { payment_method: 'Cards', card_network: network, card_type: cardType, international: intl, amount: 5000 },
        })
      }
    }
  }

  // UPI combos
  combos.push({ key: 'upi-onetime', label: 'UPI One-time', shortLabel: 'UPI 1x', method: 'UPI', txn: { payment_method: 'UPI', amount: 2000 } })
  combos.push({ key: 'upi-autopay', label: 'UPI Autopay', shortLabel: 'UPI AP', method: 'UPI', txn: { payment_method: 'UPI', upi_flow: 'autopay', amount: 2000 } })

  // NB
  combos.push({ key: 'nb', label: 'Net Banking', shortLabel: 'NB', method: 'NB', txn: { payment_method: 'NB', amount: 5000 } })

  // EMI
  combos.push({ key: 'emi-nocost', label: 'EMI No-Cost', shortLabel: 'EMI NC', method: 'EMI', txn: { payment_method: 'EMI', emi_type: 'no_cost', amount: 10000 } })
  combos.push({ key: 'emi-standard', label: 'EMI Standard', shortLabel: 'EMI Std', method: 'EMI', txn: { payment_method: 'EMI', emi_type: 'standard', amount: 10000 } })

  // For each combo, simulate
  const coverageMap = {}
  for (const combo of combos) {
    try {
      const result = simulateRoutingPipeline(merchant, combo.txn, rules, {})

      // Find which rule matched (the first rule_filter or rule_pass stage that isn't a skip)
      const matchedStage = result.stages.find(s => s.type === 'rule_filter' || s.type === 'rule_pass' || s.type === 'rule_ntf')
      const matchedRule = matchedStage ? rules.find(r => r.id === matchedStage.ruleId) : null

      // If no specific rule matched, it fell through to default
      const isDefault = !matchedRule || matchedRule.isDefault
      const isMethodDefault = matchedRule?.isMethodDefault || false

      coverageMap[combo.key] = {
        matchedRule: matchedRule ? { id: matchedRule.id, name: matchedRule.name, isDefault: matchedRule.isDefault, isMethodDefault: matchedRule.isMethodDefault } : null,
        selectedTerminal: result.selectedTerminal,
        isNTF: result.isNTF,
        isDefault,
        isMethodDefault,
      }
    } catch (e) {
      coverageMap[combo.key] = { matchedRule: null, selectedTerminal: null, isNTF: true, isDefault: false, isMethodDefault: false }
    }
  }

  return { combos, coverageMap }
}

// ── Transaction-to-Simulation Input ─────────────────
/**
 * Convert a transaction object (from generateMerchantTransactions) to a simulation input format.
 */
export function transactionToSimInput(txn) {
  const pm = txn.paymentMethod
  let payment_method = 'Cards'
  if (pm?.short === 'UPI') payment_method = 'UPI'
  else if (pm?.short === 'NB') payment_method = 'NB'
  else if (pm?.short === 'CC' || pm?.short === 'DC') payment_method = 'Cards'
  else if (pm?.label) payment_method = pm.label

  return {
    payment_method,
    amount: txn.amount || 1000,
    card_network: pm?.network || '',
    card_type: pm?.short === 'CC' ? 'credit' : pm?.short === 'DC' ? 'debit' : '',
    international: false,
    issuer_bank: null,
  }
}

// ── Routing Health Analysis ─────────────────
/**
 * Generate a routing health analysis from batch simulation results.
 * Shows per-profile routing outcomes, dormant rules, rule utilization.
 */
export function generateRoutingAnalysis(merchant, transactions, rules) {
  const result = batchSimulatePayments(merchant, transactions, rules)

  // Group transactions by payment method
  const methodGroups = {}
  transactions.forEach(txn => {
    const method = txn.paymentMethod?.short === 'CC' || txn.paymentMethod?.short === 'DC' ? 'Cards'
      : txn.paymentMethod?.short === 'UPI' ? 'UPI'
      : txn.paymentMethod?.short === 'NB' ? 'NB' : 'Other'
    if (!methodGroups[method]) methodGroups[method] = { count: 0, ntf: 0, success: 0 }
    methodGroups[method].count++
    if (txn.isNTF || txn.status === 'failed') methodGroups[method].ntf++
    else methodGroups[method].success++
  })

  // Find dormant rules (rules that never matched any transaction)
  const activeRuleIds = new Set(result.ruleImpact.map(r => r.ruleId))
  const dormantRules = rules.filter(r => !r.isDefault && !r.isMethodDefault && r.enabled && !activeRuleIds.has(r.id))

  // Find highest-impact rules
  const highImpactRules = [...result.ruleImpact].sort((a, b) => b.affectedPayments - a.affectedPayments).slice(0, 5)

  return {
    ...result,
    methodGroups,
    dormantRules,
    highImpactRules,
    totalTransactions: transactions.length,
  }
}

/**
 * Generate a plain-English explanation of how routing works for a specific payment method.
 * Explains the cascade: platform rules → merchant rules → method defaults → catch-all.
 */
export function generateMethodExplainer(methodKey, platformRules, merchantRules, methodDefault, catchAllDefault, merchant) {
  const warnings = []

  // Helper to get terminal display name
  const termName = (tid) => {
    for (const gw of gateways) {
      const t = gw.terminals.find(t => t.id === tid)
      if (t) return t.terminalId
    }
    return tid
  }
  const termNameFull = (tid) => {
    for (const gw of gateways) {
      const t = gw.terminals.find(t => t.id === tid)
      if (t) return `${t.terminalId} (${gw.shortName}, SR ${t.successRate}%)`
    }
    return tid
  }

  const sortedMerchantRules = [...merchantRules].filter(r => !r.isMethodDefault && !r.isDefault).sort((a, b) => a.priority - b.priority)

  // Build scenario-based cases
  // Each scenario = a distinct condition path with its eligible terminals + priority order
  const scenarios = []

  // Build scenarios from merchant rules
  for (const rule of sortedMerchantRules) {
    const otherConds = rule.conditions.filter(c => c.field !== 'payment_method')
    const condLabel = otherConds.length > 0
      ? otherConds.map(c => {
          if (c.field === 'card_network') return `${c.operator === 'in' ? c.value.join('/') : c.value}`
          if (c.field === 'card_type') return c.value === 'credit' ? 'Credit Card' : 'Debit Card'
          if (c.field === 'issuer_bank') return `${c.value} issued`
          if (c.field === 'international' && c.value === true) return 'International'
          if (c.field === 'international' && c.value === false) return 'Domestic'
          if (c.field === 'amount' && c.operator === 'greater_than') return `> \u20B9${Number(c.value).toLocaleString('en-IN')}`
          if (c.field === 'amount' && c.operator === 'less_than') return `< \u20B9${Number(c.value).toLocaleString('en-IN')}`
          if (c.field === 'upi_flow') return c.value === 'autopay' ? 'Autopay' : 'One-time'
          if (c.field === 'emi_type') return c.value === 'no_cost' ? 'No-Cost EMI' : 'Standard EMI'
          return `${c.field}=${c.value}`
        }).join(' + ')
      : `All ${methodKey}`

    let eligibleTerminals = []
    let explanation = ''

    if (rule.action.type === 'route') {
      eligibleTerminals = rule.action.terminals.map(tid => termNameFull(tid))
      const srNote = rule.action.srThreshold > 0
        ? `SR safety net at ${rule.action.srThreshold}% — if primary drops below this, traffic shifts to next in line.`
        : 'No SR safety net — traffic stays on primary regardless of SR.'
      explanation = `Eligible terminals in priority order. ${srNote}`
    } else if (rule.action.type === 'split') {
      eligibleTerminals = rule.action.splits.map(s => `${termName(s.terminalId)} — ${s.percentage}%`)
      explanation = 'Traffic is split by percentage across these terminals.'
    }

    scenarios.push({ label: condLabel, ruleName: rule.name, eligibleTerminals, explanation, isDefault: false })
  }

  // Default/fallback scenario
  if (methodDefault) {
    const defaultTerminals = methodDefault.action.terminals.map(tid => termNameFull(tid))
    const matchedByMerchant = sortedMerchantRules.length > 0
    scenarios.push({
      label: matchedByMerchant ? `All other ${methodKey}` : `All ${methodKey}`,
      ruleName: matchedByMerchant ? 'Default Fallback' : 'Default Routing',
      eligibleTerminals: defaultTerminals,
      explanation: matchedByMerchant
        ? 'Transactions not matching any specific rule above fall through to default routing.'
        : 'All transactions route via Doppler ML scoring across these terminals.',
      isDefault: true,
    })
  }

  // Platform constraints (apply across all scenarios)
  const platformConstraints = []
  platformRules.forEach(pr => {
    const otherConds = pr.conditions.filter(c => c.field !== 'payment_method')
    const condDesc = otherConds.length > 0
      ? otherConds.map(c => {
          if (c.field === 'international' && c.value === true) return 'international transactions'
          if (c.field === 'amount' && c.operator === 'greater_than') return `transactions above \u20B9${Number(c.value).toLocaleString('en-IN')}`
          return `${c.field} ${c.operator} ${c.value}`
        }).join(' and ')
      : 'all transactions'

    if (pr.action.type === 'reject') {
      const blocked = pr.action.terminals.map(tid => termName(tid))
      platformConstraints.push(`${blocked.join(', ')} blocked for ${condDesc} (${pr.name})`)
    } else if (pr.action.type === 'route') {
      const allowed = pr.action.terminals.map(tid => termName(tid))
      platformConstraints.push(`${condDesc} restricted to ${allowed.join(', ')} only (${pr.name})`)
    }
  })

  // Warnings: check if merchant rules route to terminals blocked by platform
  sortedMerchantRules.forEach(rule => {
    platformRules.forEach(pr => {
      if (pr.action.type === 'reject') {
        const blocked = new Set(pr.action.terminals)
        const overlap = (rule.action.terminals || []).filter(t => blocked.has(t))
        if (overlap.length > 0) {
          warnings.push(`Rule "${rule.name}" routes to ${overlap.map(termName).join(', ')}, but platform rule "${pr.name}" blocks these for some transactions. This may cause unexpected NTFs.`)
        }
      }
    })
  })

  // No rules at all
  if (sortedMerchantRules.length === 0 && platformRules.length === 0 && !methodDefault) {
    scenarios.push({
      label: `All ${methodKey}`,
      ruleName: 'Doppler ML',
      eligibleTerminals: ['All terminals eligible — ML-based routing for optimal SR'],
      explanation: 'No specific rules defined. Doppler ML automatically routes to the highest-performing terminal.',
      isDefault: true,
    })
  }

  return { scenarios, platformConstraints, warnings, ruleCount: platformRules.length + sortedMerchantRules.length + (methodDefault ? 1 : 0) }
}
