# Razorpay KAM Dashboard

Internal dashboard for Key Account Managers to monitor enterprise merchant portfolios, manage gateway routing, and track revenue targets.

## Domain Knowledge

### Gateway Deal Types
- **0-cost deals**: Razorpay-wide bulk deals negotiated with banks; terminals with costPerTxn=0 (e.g., HDFC UPI, Axis UPI, Yes Bank UPI)
- **TSP (Terminal Specific Pricing)**: Merchant-specific volume commitments. GMV-based but operationalized as traffic-percentage routing rules (e.g., "min 70% traffic via HDFC"). Banks care about Cr GMV; Razorpay translates to traffic % rules. Creates routing rigidity.
- **MCC-based**: Default backward pricing determined by merchant category code. Gambling/FinTech MCCs → higher cost. Government/utility MCCs → lower cost.
- **Offer-linked**: Bank promotional offers (cashback, EMI) requiring routing to specific terminals for offer eligibility.

### Backward Pricing Model
- Deeply granular: network × card_type × amount_range × international × MCC
- Not flat cost/txn — the `min_fee`/`max_fee` gap was a known router bug
- Current mock data uses flat costPerTxn per terminal; pricing breakdown data shows granularity

### NTF (Not-to-Fail) Root Causes
- 40-50%: Cost-driven REJECT rules without fallback gateway
- 20-25%: Missing SELECT rules (terminal not available for payment method)
- 15-20%: Network/card type restrictions
- 5-10%: Compliance (blocked MCCs, international restrictions)

### Routing Pipeline
- Filters: SELECT/REJECT rule groups → Sorters: Doppler ML model, downtime scoring, manual priority rules
- Manual rules override Doppler ML predictions
- KAMs can set routing strategy (SR-optimised vs Cost-optimised) and cost-delta threshold

### KAM OKRs & Pain Points
- Success Rate vs competitors is #1 KAM OKR (not Net Revenue)
- Terminal procurement speed and proactive incident communication are recurring pain points
- Key teams: TR (Terminal & Routing), Banking Alliances, Revenue, Product/Engineering

## Architecture

### Tech Stack
- React 18 + Vite + vanilla CSS (no UI library)
- HashRouter for GitHub Pages deployment
- All data is mock (no API calls) in `src/data/kamMockData.js`

### Data Layer (`src/data/kamMockData.js`)
- `gateways[]`: 5 banks, 2 terminals each (id, terminalId, successRate, costPerTxn, isZeroCost)
- `merchants[]`: 15 enterprises with dealType, gatewayMetrics[], routingStrategy, routingRules
- TSP merchants: Swiggy (70% HDFC constraint), Myntra (65% HDFC Midsign — currently in violation)
- Offer-linked: BookMyShow (HDFC cashback), MakeMyTrip (Axis EMI)
- Helper functions: computeMerchantRevenue(), computeAggregateStats(), computeZeroCostShare(), computeTSPCompliance(), computeNTFRisk(), detectRoutingConflicts()

### State Management (`src/context/KAMContext.jsx`)
- Single KAMProvider wraps all /kam routes
- Pattern: computed values via useMemo, mutations via useCallback
- Exposes: filtered/sorted merchants, stats, compliance maps, risk maps, conflict maps, mutations, selection, modals, toast, auditLog

### Pages
- `KAMOverview.jsx`: Revenue tracker, heatmap, metric cards, TSP compliance, routing alerts, attention table
- `KAMMerchantTable.jsx`: Sortable/filterable table with deal badges, bulk actions
- `KAMMerchantDetail.jsx`: Full detail with deal banners, conflict warnings, NTF risk, Doppler routing, terminal management with expandable pricing, audit log

### CSS Conventions
- BEM-like naming with `kam-` prefix
- Separate files: `kam.css` (layout), `kam-components.css` (shared), `kam-overview.css`, `kam-table.css`, `kam-detail.css`
- CSS variables: `--rzp-blue`, `--rzp-success`, `--rzp-warning`, `--rzp-danger`, `--rzp-border`, etc.
- Card pattern: `.kam-card` with 12px radius, 1px border, subtle shadow
- Badge pattern: `.kam-badge` with variant classes (`.success`, `.warning`, `.danger`, `.info`, `.neutral`, `.deal-tsp`, `.deal-offer`)

### Deployment
- GitHub Pages via GitHub Actions
- Default branch: `claude/document-project-context-a4XRM`
- Dev server: `vite-dev` on port 5173 (configured in `.claude/launch.json`)
