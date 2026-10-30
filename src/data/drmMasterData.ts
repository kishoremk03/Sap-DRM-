import { Department, DrmIndicator, MonthlyRecord, CorrectiveAction, SapUpload, AuditLog, UserAccount, CalculationMethod, ComplianceStatus } from '../types/drm';

export const FINANCIAL_YEARS = ['FY 2026-2027', 'FY 2025-2026', 'FY 2024-2025'] as const;

export const MONTHS = [
  'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December', 'January', 'February', 'March'
] as const;

export const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: 'DEP-01',
    name: 'Materials Management Department',
    code: 'MMD',
    headEmail: 'mmd.head@company.com',
    headName: 'Rajesh Sharma',
    active: true,
    description: 'Procurement, vendor development, PO monitoring and material requirement planning',
    indicatorCount: 7
  },
  {
    id: 'DEP-02',
    name: 'Stores',
    code: 'STR',
    headEmail: 'stores.head@company.com',
    headName: 'Vikram Patil',
    active: true,
    description: 'Physical inventory management, bin cards, staging, dock turnaround and shopfloor issue',
    indicatorCount: 6
  },
  {
    id: 'DEP-03',
    name: 'Quality',
    code: 'QA',
    headEmail: 'quality.head@company.com',
    headName: 'Dr. Anita Roy',
    active: true,
    description: 'Incoming inspection, line rejection, customer complaints, 0-km defects and calibration',
    indicatorCount: 7
  },
  {
    id: 'DEP-04',
    name: 'Marketing & Logistics',
    code: 'MKT_LOG',
    headEmail: 'logistics.head@company.com',
    headName: 'Sunil Menon',
    active: true,
    description: 'Order execution, OTIF delivery, freight management and outbound dispatch clearance',
    indicatorCount: 7
  },
  {
    id: 'DEP-05',
    name: 'Production',
    code: 'PROD',
    headEmail: 'production.head@company.com',
    headName: 'K. Murthy',
    active: true,
    description: 'Assembly lines, OEE, machine downtime, cycle time, WIP and scrap generation',
    indicatorCount: 7
  },
  {
    id: 'DEP-06',
    name: 'General Departments',
    code: 'GEN',
    headEmail: 'general.head@company.com',
    headName: 'Pooja Varma',
    active: true,
    description: 'Safety LTIFR, HR training hours, plant utilities, statutory filings and IT uptime',
    indicatorCount: 7
  },
  {
    id: 'DEP-07',
    name: 'Finance',
    code: 'FIN',
    headEmail: 'finance.head@company.com',
    headName: 'Amit Bansal',
    active: true,
    description: 'Vendor invoice TAT, receivables aging, capex budget variance, GST credit and working capital',
    indicatorCount: 7
  }
];

export const DEFAULT_INDICATORS: DrmIndicator[] = [
  // 1. Materials Management Department (7)
  {
    id: 'DRM-MM-01',
    name: 'Purchase Orders Pending Approval > 3 Days',
    description: 'Open purchase orders requiring executive approval beyond standard 72h SLA',
    departmentId: 'DEP-01',
    sapTCode: 'ME28 / ME5A',
    unit: 'Nos',
    frequency: 'Monthly',
    targetValue: 0,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 0,
    toleranceMax: 1,
    responsibleUser: 'suresh.kumar@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Procurement bottleneck metric'
  },
  {
    id: 'DRM-MM-02',
    name: 'Open Purchase Requisitions Pending Conversion',
    description: 'PR to PO conversion backlog older than 7 calendar days',
    departmentId: 'DEP-01',
    sapTCode: 'ME5A',
    unit: 'Nos',
    frequency: 'Monthly',
    targetValue: 5,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 0,
    toleranceMax: 8,
    responsibleUser: 'suresh.kumar@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Buyer processing velocity'
  },
  {
    id: 'DRM-MM-03',
    name: 'Vendor Delivery Adherence / V-OTIF',
    description: 'Vendor on-time in-full delivery compliance against purchase order schedule',
    departmentId: 'DEP-01',
    sapTCode: 'ZM088',
    unit: '%',
    frequency: 'Monthly',
    targetValue: 95.0,
    targetType: 'MIN',
    calculationMethod: 'HIGHER_IS_BETTER',
    toleranceMin: 90.0,
    toleranceMax: 100.0,
    responsibleUser: 'suresh.kumar@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Tier-1 automotive supplier adherence'
  },
  {
    id: 'DRM-MM-04',
    name: 'Non-Moving Inventory > 90 Days',
    description: 'Raw material and bought-out stock without consumption in last 90 days',
    departmentId: 'DEP-01',
    sapTCode: 'ZMR49Q',
    unit: 'INR Lakhs',
    frequency: 'Monthly',
    targetValue: 10.0,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 0,
    toleranceMax: 15.0,
    responsibleUser: 'suresh.kumar@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Working capital optimization'
  },
  {
    id: 'DRM-MM-05',
    name: 'GRN Pending for Receipt Verification',
    description: 'Gate-entry done but GRN posting pending over 24 hours',
    departmentId: 'DEP-01',
    sapTCode: 'ZM055',
    unit: 'Nos',
    frequency: 'Monthly',
    targetValue: 0,
    targetType: 'EXACT',
    calculationMethod: 'EQUAL_TO_TARGET',
    toleranceMin: 0,
    toleranceMax: 0,
    responsibleUser: 'suresh.kumar@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Prevents unbooked dock inventory'
  },
  {
    id: 'DRM-MM-06',
    name: 'Critical Raw Material Stock Buffer Level',
    description: 'Buffer inventory coverage for Grade-A steel sheets and critical fasteners',
    departmentId: 'DEP-01',
    sapTCode: 'MB52',
    unit: 'Days',
    frequency: 'Monthly',
    targetValue: 18.0,
    targetType: 'RANGE',
    calculationMethod: 'WITHIN_RANGE',
    toleranceMin: 15.0,
    toleranceMax: 20.0,
    responsibleUser: 'suresh.kumar@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Zero line stoppage assurance'
  },
  {
    id: 'DRM-MM-07',
    name: 'Cost Reduction Through Alternate Sourcing',
    description: 'Cumulative cost savings achieved through VAVE, localization, and negotiation',
    departmentId: 'DEP-01',
    sapTCode: 'ZM013',
    unit: 'INR Lakhs',
    frequency: 'Monthly',
    targetValue: 5.0,
    targetType: 'MIN',
    calculationMethod: 'HIGHER_IS_BETTER',
    toleranceMin: 4.0,
    toleranceMax: 10.0,
    responsibleUser: 'suresh.kumar@company.com',
    sapReportRequired: false,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Value engineering savings'
  },

  // 2. Stores (6)
  {
    id: 'DRM-ST-01',
    name: 'Physical vs SAP Stock Accuracy',
    description: 'Wall-to-wall cycle count inventory audit variance percentage',
    departmentId: 'DEP-02',
    sapTCode: 'MB52',
    unit: '%',
    frequency: 'Monthly',
    targetValue: 99.5,
    targetType: 'MIN',
    calculationMethod: 'HIGHER_IS_BETTER',
    toleranceMin: 98.5,
    toleranceMax: 100.0,
    responsibleUser: 'stores.lead@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Perpetual inventory audit'
  },
  {
    id: 'DRM-ST-02',
    name: 'Pending Material Issues to Shop Floor > 24h',
    description: 'Material reservations pending pick and bay delivery beyond 24h',
    departmentId: 'DEP-02',
    sapTCode: 'MB25',
    unit: 'Nos',
    frequency: 'Monthly',
    targetValue: 0,
    targetType: 'EXACT',
    calculationMethod: 'EQUAL_TO_TARGET',
    toleranceMin: 0,
    toleranceMax: 0,
    responsibleUser: 'stores.lead@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Assembly kitting readiness'
  },
  {
    id: 'DRM-ST-03',
    name: 'Scrap Material Disposal Adherence',
    description: 'Turnaround from yard staging to scrap auction clearance',
    departmentId: 'DEP-02',
    sapTCode: 'MB51',
    unit: 'Days',
    frequency: 'Monthly',
    targetValue: 7.0,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 0,
    toleranceMax: 10.0,
    responsibleUser: 'stores.lead@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Shopfloor 5S and revenue recovery'
  },
  {
    id: 'DRM-ST-04',
    name: 'Excess Stock Movement to Dead Storage',
    description: 'Identification and quarantine of obsolete tooling and parts',
    departmentId: 'DEP-02',
    sapTCode: 'ZM020V',
    unit: 'Items',
    frequency: 'Monthly',
    targetValue: 2,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 0,
    toleranceMax: 4,
    responsibleUser: 'stores.lead@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Space optimization'
  },
  {
    id: 'DRM-ST-05',
    name: 'High Value Item Daily Cycle Count',
    description: '100% adherence to ABC-category A item daily counting schedule',
    departmentId: 'DEP-02',
    sapTCode: 'SQ01',
    unit: '%',
    frequency: 'Monthly',
    targetValue: 100.0,
    targetType: 'EXACT',
    calculationMethod: 'EQUAL_TO_TARGET',
    toleranceMin: 100.0,
    toleranceMax: 100.0,
    responsibleUser: 'stores.lead@company.com',
    sapReportRequired: false,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'High-value part integrity'
  },
  {
    id: 'DRM-ST-06',
    name: 'Goods Inward Staging Time',
    description: 'Elapsed time from supplier vehicle gate-in to dock unloading',
    departmentId: 'DEP-02',
    sapTCode: 'ZM083P',
    unit: 'Hours',
    frequency: 'Monthly',
    targetValue: 4.0,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 1.0,
    toleranceMax: 5.0,
    responsibleUser: 'stores.lead@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Dock turnaround efficiency'
  },

  // 3. Quality (7)
  {
    id: 'DRM-QA-01',
    name: 'Incoming Material Quality Rejection Rate',
    description: 'Supplier defect density measured in parts per million (PPM)',
    departmentId: 'DEP-03',
    sapTCode: 'QA32',
    unit: 'PPM',
    frequency: 'Monthly',
    targetValue: 50.0,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 0,
    toleranceMax: 75.0,
    responsibleUser: 'qc.engineer@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'IATF 16949 supplier quality baseline'
  },
  {
    id: 'DRM-QA-02',
    name: 'Line Rejection / Defect Rate',
    description: 'Internal production defect percentage caught at assembly gates',
    departmentId: 'DEP-03',
    sapTCode: 'QM10',
    unit: '%',
    frequency: 'Monthly',
    targetValue: 0.8,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 0,
    toleranceMax: 1.0,
    responsibleUser: 'qc.engineer@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Shopfloor defect containment'
  },
  {
    id: 'DRM-QA-03',
    name: 'Customer Complaints / 0-Km Failures',
    description: 'OEM customer reported field rejections and assembly discrepancies',
    departmentId: 'DEP-03',
    sapTCode: 'ZQ046',
    unit: 'Nos',
    frequency: 'Monthly',
    targetValue: 0,
    targetType: 'EXACT',
    calculationMethod: 'EQUAL_TO_TARGET',
    toleranceMin: 0,
    toleranceMax: 0,
    responsibleUser: 'qc.engineer@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Zero-defect corporate imperative'
  },
  {
    id: 'DRM-QA-04',
    name: 'Calibration Pending Past Due Date',
    description: 'Measurement instruments, gauges, and fixtures overdue for NABL calibration',
    departmentId: 'DEP-03',
    sapTCode: 'IW58',
    unit: 'Nos',
    frequency: 'Monthly',
    targetValue: 0,
    targetType: 'EXACT',
    calculationMethod: 'EQUAL_TO_TARGET',
    toleranceMin: 0,
    toleranceMax: 0,
    responsibleUser: 'qc.engineer@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Audit non-negotiable compliance'
  },
  {
    id: 'DRM-QA-05',
    name: 'Supplier Corrective Action Request Turnaround',
    description: 'Average days taken to close 8D SCAR reports with confirmed root cause',
    departmentId: 'DEP-03',
    sapTCode: 'QM10',
    unit: 'Days',
    frequency: 'Monthly',
    targetValue: 14.0,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 5.0,
    toleranceMax: 21.0,
    responsibleUser: 'qc.engineer@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Vendor corrective feedback loop'
  },
  {
    id: 'DRM-QA-06',
    name: 'In-Process Inspection Clearance Turnaround',
    description: 'Average time taken for lab metallographic and CMM sample testing',
    departmentId: 'DEP-03',
    sapTCode: 'QA32',
    unit: 'Hours',
    frequency: 'Monthly',
    targetValue: 2.0,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 0.5,
    toleranceMax: 3.0,
    responsibleUser: 'qc.engineer@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Prevents batch manufacturing hold'
  },
  {
    id: 'DRM-QA-07',
    name: 'First Time Right (FTR) Assembly Rate',
    description: 'Assemblies passing end-of-line electrical and torque testing without rework',
    departmentId: 'DEP-03',
    sapTCode: 'ZQ046',
    unit: '%',
    frequency: 'Monthly',
    targetValue: 98.5,
    targetType: 'MIN',
    calculationMethod: 'HIGHER_IS_BETTER',
    toleranceMin: 96.0,
    toleranceMax: 100.0,
    responsibleUser: 'qc.engineer@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Direct labor productivity index'
  },

  // 4. Marketing & Logistics (7)
  {
    id: 'DRM-ML-01',
    name: 'Customer On-Time In-Full Delivery (OTIF)',
    description: 'Finished vehicle component deliveries dispatched on or before promised delivery date',
    departmentId: 'DEP-04',
    sapTCode: 'VL06O',
    unit: '%',
    frequency: 'Monthly',
    targetValue: 98.0,
    targetType: 'MIN',
    calculationMethod: 'HIGHER_IS_BETTER',
    toleranceMin: 95.0,
    toleranceMax: 100.0,
    responsibleUser: 'logistics.officer@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'OEM customer service SLA'
  },
  {
    id: 'DRM-ML-02',
    name: 'Finished Goods Billing Pending Dispatch',
    description: 'Invoiced batches awaiting transport placement at plant dispatch bay',
    departmentId: 'DEP-04',
    sapTCode: 'VF04',
    unit: 'INR Lakhs',
    frequency: 'Monthly',
    targetValue: 15.0,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 0,
    toleranceMax: 20.0,
    responsibleUser: 'logistics.officer@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Revenue velocity tracker'
  },
  {
    id: 'DRM-ML-03',
    name: 'Pending Customer Sales Orders > 7 Days',
    description: 'Confirmed sales schedule lines awaiting manufacturing allocation',
    departmentId: 'DEP-04',
    sapTCode: 'ZV119',
    unit: 'Nos',
    frequency: 'Monthly',
    targetValue: 0,
    targetType: 'EXACT',
    calculationMethod: 'EQUAL_TO_TARGET',
    toleranceMin: 0,
    toleranceMax: 2,
    responsibleUser: 'logistics.officer@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Order backlog health'
  },
  {
    id: 'DRM-ML-04',
    name: 'Transit Damage / Loss Ratio',
    description: 'Transit loss claims filed against total outbound container dispatches',
    departmentId: 'DEP-04',
    sapTCode: 'ZV048',
    unit: '%',
    frequency: 'Monthly',
    targetValue: 0.05,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 0,
    toleranceMax: 0.1,
    responsibleUser: 'logistics.officer@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Packaging & fleet security'
  },
  {
    id: 'DRM-ML-05',
    name: 'Vehicle Turnaround Time in Plant',
    description: 'Average dwell time for outbound heavy freight vehicles within factory premises',
    departmentId: 'DEP-04',
    sapTCode: 'ZV085',
    unit: 'Hours',
    frequency: 'Monthly',
    targetValue: 3.5,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 2.0,
    toleranceMax: 4.5,
    responsibleUser: 'logistics.officer@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Eliminates detention costs'
  },
  {
    id: 'DRM-ML-06',
    name: 'Finished Goods Inventory Holding Period',
    description: 'Average holding duration of finished goods stock across plant and regional 3PL hubs',
    departmentId: 'DEP-04',
    sapTCode: 'MB52',
    unit: 'Days',
    frequency: 'Monthly',
    targetValue: 5.0,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 3.0,
    toleranceMax: 7.0,
    responsibleUser: 'logistics.officer@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Inventory turns velocity'
  },
  {
    id: 'DRM-ML-07',
    name: 'Freight Cost per Ton Dispatched',
    description: 'Consolidated freight spend divided by total dispatched tonnage',
    departmentId: 'DEP-04',
    sapTCode: 'VF04',
    unit: 'INR/Ton',
    frequency: 'Monthly',
    targetValue: 1200.0,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 1000.0,
    toleranceMax: 1350.0,
    responsibleUser: 'logistics.officer@company.com',
    sapReportRequired: false,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Outbound logistics efficiency'
  },

  // 5. Production (7)
  {
    id: 'DRM-PR-01',
    name: 'Overall Equipment Effectiveness (OEE)',
    description: 'Composite manufacturing index: Availability Rate x Performance Rate x Quality Yield',
    departmentId: 'DEP-05',
    sapTCode: 'COHV',
    unit: '%',
    frequency: 'Monthly',
    targetValue: 85.0,
    targetType: 'MIN',
    calculationMethod: 'HIGHER_IS_BETTER',
    toleranceMin: 80.0,
    toleranceMax: 100.0,
    responsibleUser: 'prod.manager@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'World-class automotive baseline'
  },
  {
    id: 'DRM-PR-02',
    name: 'Daily Production Plan Adherence',
    description: 'Ratio of daily actual vehicle assemblies produced against released master production schedule',
    departmentId: 'DEP-05',
    sapTCode: 'MD62',
    unit: '%',
    frequency: 'Monthly',
    targetValue: 98.0,
    targetType: 'MIN',
    calculationMethod: 'HIGHER_IS_BETTER',
    toleranceMin: 95.0,
    toleranceMax: 100.0,
    responsibleUser: 'prod.manager@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Shopfloor takt adherence'
  },
  {
    id: 'DRM-PR-03',
    name: 'Machine Breakdown / Unplanned Downtime',
    description: 'Cumulative emergency mechanical and electrical breakdown hours across main lines',
    departmentId: 'DEP-05',
    sapTCode: 'IW58',
    unit: 'Hours',
    frequency: 'Monthly',
    targetValue: 12.0,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 0,
    toleranceMax: 18.0,
    responsibleUser: 'prod.manager@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Total productive maintenance metric'
  },
  {
    id: 'DRM-PR-04',
    name: 'Standard vs Actual Production Cycle Time',
    description: 'Measured shopfloor cycle time deviation against engineered standard takt time',
    departmentId: 'DEP-05',
    sapTCode: 'COHV',
    unit: 'Seconds',
    frequency: 'Monthly',
    targetValue: 44.0,
    targetType: 'RANGE',
    calculationMethod: 'WITHIN_RANGE',
    toleranceMin: 42.0,
    toleranceMax: 46.0,
    responsibleUser: 'prod.manager@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Assembly velocity stabilization'
  },
  {
    id: 'DRM-PR-05',
    name: 'Work In Progress (WIP) Value on Shop Floor',
    description: 'Total monetary valuation of unfinished subassemblies between line stations',
    departmentId: 'DEP-05',
    sapTCode: 'MB52',
    unit: 'INR Lakhs',
    frequency: 'Monthly',
    targetValue: 25.0,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 15.0,
    toleranceMax: 30.0,
    responsibleUser: 'prod.manager@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Kanban buffer limitation'
  },
  {
    id: 'DRM-PR-06',
    name: 'Production Scrap Generation Rate',
    description: 'Metal stamping and machining scrap weight as a percentage of gross raw material input',
    departmentId: 'DEP-05',
    sapTCode: 'MB51',
    unit: '%',
    frequency: 'Monthly',
    targetValue: 1.2,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 0.5,
    toleranceMax: 1.5,
    responsibleUser: 'prod.manager@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Material yield optimization'
  },
  {
    id: 'DRM-PR-07',
    name: 'Changeover Time (SMED Matrix)',
    description: 'Single-minute exchange of die turnaround duration for stamping tool changeovers',
    departmentId: 'DEP-05',
    sapTCode: 'COHV',
    unit: 'Minutes',
    frequency: 'Monthly',
    targetValue: 30.0,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 20.0,
    toleranceMax: 40.0,
    responsibleUser: 'prod.manager@company.com',
    sapReportRequired: false,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Line agility for multi-variant runs'
  },

  // 6. General Departments (7)
  {
    id: 'DRM-GD-01',
    name: 'Plant Safety - Lost Time Injury Frequency Rate',
    description: 'Lost Time Injury Frequency Rate (LTIFR) per 1,000,000 operational employee hours',
    departmentId: 'DEP-06',
    sapTCode: 'SQ01',
    unit: 'Rate',
    frequency: 'Monthly',
    targetValue: 0.0,
    targetType: 'EXACT',
    calculationMethod: 'EQUAL_TO_TARGET',
    toleranceMin: 0.0,
    toleranceMax: 0.0,
    responsibleUser: 'ehs.officer@company.com',
    sapReportRequired: false,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Zero-harm corporate safety policy'
  },
  {
    id: 'DRM-GD-02',
    name: 'Mandatory Skill Training Hours Compliance',
    description: 'Adherence percentage to automotive technical, safety, and 5S refresher training targets',
    departmentId: 'DEP-06',
    sapTCode: 'SQ01',
    unit: '%',
    frequency: 'Monthly',
    targetValue: 95.0,
    targetType: 'MIN',
    calculationMethod: 'HIGHER_IS_BETTER',
    toleranceMin: 90.0,
    toleranceMax: 100.0,
    responsibleUser: 'hr.specialist@company.com',
    sapReportRequired: false,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Workforce competency development'
  },
  {
    id: 'DRM-GD-03',
    name: 'Employee Absenteeism Rate',
    description: 'Unplanned employee and contract worker absenteeism across operational shifts',
    departmentId: 'DEP-06',
    sapTCode: 'SQ01',
    unit: '%',
    frequency: 'Monthly',
    targetValue: 4.0,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 0,
    toleranceMax: 5.0,
    responsibleUser: 'hr.specialist@company.com',
    sapReportRequired: false,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Shift balancing control'
  },
  {
    id: 'DRM-GD-04',
    name: 'Near-Miss Incident Closure Rate within 48h',
    description: 'Percentage of proactive hazard reports investigated and closed within 48 hours',
    departmentId: 'DEP-06',
    sapTCode: 'SQ01',
    unit: '%',
    frequency: 'Monthly',
    targetValue: 100.0,
    targetType: 'EXACT',
    calculationMethod: 'EQUAL_TO_TARGET',
    toleranceMin: 100.0,
    toleranceMax: 100.0,
    responsibleUser: 'ehs.officer@company.com',
    sapReportRequired: false,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Proactive safety culture'
  },
  {
    id: 'DRM-GD-05',
    name: 'Plant Utility Specific Power Consumption',
    description: 'Electrical utility energy consumed per metric ton of automotive output produced',
    departmentId: 'DEP-06',
    sapTCode: 'SQ01',
    unit: 'kWh/Ton',
    frequency: 'Monthly',
    targetValue: 140.0,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 120.0,
    toleranceMax: 150.0,
    responsibleUser: 'plant.engineer@company.com',
    sapReportRequired: false,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Energy decarbonization target'
  },
  {
    id: 'DRM-GD-06',
    name: 'Statutory Compliance Timeliness',
    description: 'On-time submission percentage for environmental, factory inspectorate, and boiler permits',
    departmentId: 'DEP-06',
    sapTCode: 'SQ01',
    unit: '%',
    frequency: 'Monthly',
    targetValue: 100.0,
    targetType: 'EXACT',
    calculationMethod: 'EQUAL_TO_TARGET',
    toleranceMin: 100.0,
    toleranceMax: 100.0,
    responsibleUser: 'compliance@company.com',
    sapReportRequired: false,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Zero regulatory default'
  },
  {
    id: 'DRM-GD-07',
    name: 'IT System Uptime & SAP Availability',
    description: 'ERP infrastructure, MES network, and shopfloor barcode scanner system uptime',
    departmentId: 'DEP-06',
    sapTCode: 'SQ01',
    unit: '%',
    frequency: 'Monthly',
    targetValue: 99.9,
    targetType: 'MIN',
    calculationMethod: 'HIGHER_IS_BETTER',
    toleranceMin: 99.5,
    toleranceMax: 100.0,
    responsibleUser: 'it.admin@company.com',
    sapReportRequired: false,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Digital manufacturing continuity'
  },

  // 7. Finance (7)
  {
    id: 'DRM-FN-01',
    name: 'Vendor Invoice Processing Turnaround',
    description: 'Average calendar days to process three-way match (PO, GRN, Tax Invoice) to release',
    departmentId: 'DEP-07',
    sapTCode: 'ZM063K',
    unit: 'Days',
    frequency: 'Monthly',
    targetValue: 3.0,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 1.0,
    toleranceMax: 4.0,
    responsibleUser: 'finance.analyst@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Early payment cash discounts'
  },
  {
    id: 'DRM-FN-02',
    name: 'Outstanding Accounts Receivable > 60 Days',
    description: 'Total overdue OEM and dealer receivables aging beyond approved 60-day credit window',
    departmentId: 'DEP-07',
    sapTCode: 'VF04',
    unit: 'INR Lakhs',
    frequency: 'Monthly',
    targetValue: 20.0,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 0,
    toleranceMax: 25.0,
    responsibleUser: 'finance.analyst@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Cash flow credit control'
  },
  {
    id: 'DRM-FN-03',
    name: 'Unreconciled Bank & Cash Items',
    description: 'Open unidentified bank statement items remaining at end-of-month closing',
    departmentId: 'DEP-07',
    sapTCode: 'FBL3N',
    unit: 'Nos',
    frequency: 'Monthly',
    targetValue: 0,
    targetType: 'EXACT',
    calculationMethod: 'EQUAL_TO_TARGET',
    toleranceMin: 0,
    toleranceMax: 0,
    responsibleUser: 'finance.analyst@company.com',
    sapReportRequired: false,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Financial audit integrity'
  },
  {
    id: 'DRM-FN-04',
    name: 'Capex Budget vs Actual Variance',
    description: 'Plant tooling and machine capex disbursement variance against approved annual plan',
    departmentId: 'DEP-07',
    sapTCode: 'S_ALR_87013558',
    unit: '%',
    frequency: 'Monthly',
    targetValue: 0.0,
    targetType: 'RANGE',
    calculationMethod: 'WITHIN_RANGE',
    toleranceMin: -5.0,
    toleranceMax: 5.0,
    responsibleUser: 'finance.analyst@company.com',
    sapReportRequired: false,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Capital project discipline'
  },
  {
    id: 'DRM-FN-05',
    name: 'GST & TDS Input Credit Reconciliation',
    description: 'Matching percentage of GSTR-2B input tax credits against internal purchase register',
    departmentId: 'DEP-07',
    sapTCode: 'J1IEX',
    unit: '%',
    frequency: 'Monthly',
    targetValue: 100.0,
    targetType: 'EXACT',
    calculationMethod: 'EQUAL_TO_TARGET',
    toleranceMin: 100.0,
    toleranceMax: 100.0,
    responsibleUser: 'finance.analyst@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Tax compliance & input cash recovery'
  },
  {
    id: 'DRM-FN-06',
    name: 'Working Capital Cycle Duration',
    description: 'Net cash conversion duration: Days Inventory Outstanding + DSO minus DPO',
    departmentId: 'DEP-07',
    sapTCode: 'FBL1N',
    unit: 'Days',
    frequency: 'Monthly',
    targetValue: 45.0,
    targetType: 'MAX',
    calculationMethod: 'LOWER_IS_BETTER',
    toleranceMin: 35.0,
    toleranceMax: 50.0,
    responsibleUser: 'finance.analyst@company.com',
    sapReportRequired: false,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Treasury liquidity indicator'
  },
  {
    id: 'DRM-FN-07',
    name: 'Scrap Sale Realization Value',
    description: 'Monthly auction revenue realized from metal press scrap and secondary offcuts',
    departmentId: 'DEP-07',
    sapTCode: 'VF04',
    unit: 'INR Lakhs',
    frequency: 'Monthly',
    targetValue: 15.0,
    targetType: 'MIN',
    calculationMethod: 'HIGHER_IS_BETTER',
    toleranceMin: 12.0,
    toleranceMax: 20.0,
    responsibleUser: 'finance.analyst@company.com',
    sapReportRequired: true,
    effectiveStart: '2026-04-01',
    effectiveEnd: '2027-03-31',
    status: 'ACTIVE',
    remarks: 'Secondary revenue monetization'
  }
];

export function evaluateCompliance(
  rule: CalculationMethod,
  actual: number | null,
  target: number,
  tolMin: number,
  tolMax: number
): { status: ComplianceStatus; achievementPct: number | null; variance: number | null } {
  if (actual === null || actual === undefined || isNaN(actual)) {
    return { status: 'Not Reported', achievementPct: null, variance: null };
  }

  let variance = +(actual - target).toFixed(2);
  let achievementPct: number | null = null;
  let status: ComplianceStatus = 'Non-Compliant';

  switch (rule) {
    case 'HIGHER_IS_BETTER':
      if (target !== 0) achievementPct = +((actual / target) * 100).toFixed(1);
      if (actual >= target) status = 'Compliant';
      else if (tolMin !== undefined && actual >= tolMin) status = 'Action Required';
      else status = 'Non-Compliant';
      break;

    case 'LOWER_IS_BETTER':
      if (target !== 0) achievementPct = +((target / actual) * 100).toFixed(1);
      variance = +(target - actual).toFixed(2);
      if (actual <= target) status = 'Compliant';
      else if (tolMax !== undefined && actual <= tolMax) status = 'Action Required';
      else status = 'Non-Compliant';
      break;

    case 'EQUAL_TO_TARGET':
      variance = +(actual - target).toFixed(2);
      if (actual === target) {
        status = 'Compliant';
        achievementPct = 100.0;
      } else {
        status = 'Non-Compliant';
        achievementPct = 0.0;
      }
      break;

    case 'WITHIN_RANGE':
      variance = 0;
      if (actual >= tolMin && actual <= tolMax) {
        status = 'Compliant';
        achievementPct = 100.0;
      } else {
        variance = actual < tolMin ? +(actual - tolMin).toFixed(2) : +(actual - tolMax).toFixed(2);
        status = 'Non-Compliant';
        achievementPct = Math.max(0, +(100 - Math.abs(variance)).toFixed(1));
      }
      break;

    default:
      if (actual >= target) status = 'Compliant';
      else status = 'Non-Compliant';
  }

  return { status, achievementPct, variance };
}

export function generateInitialRecords(): MonthlyRecord[] {
  const records: MonthlyRecord[] = [];
  const reportedMonths = ['April', 'May', 'June', 'July', 'August', 'September', 'October'];

  DEFAULT_INDICATORS.forEach((ind, idx) => {
    reportedMonths.forEach((m, mIdx) => {
      let actual: number | null = null;
      let workflowStatus: MonthlyRecord['status'] = 'Draft';

      if (mIdx < 6) {
        // Prior months locked & approved
        workflowStatus = 'Approved';
        if (ind.calculationMethod === 'HIGHER_IS_BETTER') {
          actual = +(ind.targetValue * (0.95 + ((idx * 3 + mIdx) % 10) * 0.012)).toFixed(1);
        } else if (ind.calculationMethod === 'LOWER_IS_BETTER') {
          actual = +(ind.targetValue * (0.88 + ((idx * 2 + mIdx) % 8) * 0.025)).toFixed(1);
        } else if (ind.calculationMethod === 'WITHIN_RANGE') {
          actual = +(ind.toleranceMin + 1.2).toFixed(1);
        } else {
          actual = ind.targetValue;
        }
      } else if (mIdx === 6) {
        // Current month: October 2026 (active reporting period)
        if (idx % 3 !== 0) {
          workflowStatus = idx % 2 === 0 ? 'Submitted' : 'Under Review';
          if (ind.calculationMethod === 'HIGHER_IS_BETTER') {
            actual = +(ind.targetValue * (0.92 + (idx % 7) * 0.018)).toFixed(1);
          } else if (ind.calculationMethod === 'LOWER_IS_BETTER') {
            actual = +(ind.targetValue * (0.90 + (idx % 6) * 0.03)).toFixed(1);
          } else if (ind.calculationMethod === 'WITHIN_RANGE') {
            actual = +(ind.toleranceMin + 1.5).toFixed(1);
          } else {
            actual = ind.targetValue;
          }
        }
      }

      const res = evaluateCompliance(
        ind.calculationMethod,
        actual,
        ind.targetValue,
        ind.toleranceMin,
        ind.toleranceMax
      );

      records.push({
        id: `REC-${ind.id}-${m}`,
        financialYear: 'FY 2026-2027',
        month: m,
        indicatorId: ind.id,
        departmentId: ind.departmentId,
        targetValue: ind.targetValue,
        actualValue: actual,
        variance: res.variance,
        achievementPct: res.achievementPct,
        complianceStatus: res.status,
        remarks: actual !== null ? `Auto-validated via SAP report ${ind.sapTCode}` : '',
        status: workflowStatus,
        createdBy: 'suresh.kumar@company.com',
        createdAt: '2026-04-01T08:00:00Z',
        updatedBy: 'suresh.kumar@company.com',
        updatedAt: '2026-10-28T14:30:00Z',
        submittedBy: workflowStatus !== 'Draft' ? 'suresh.kumar@company.com' : undefined,
        submittedAt: workflowStatus !== 'Draft' ? '2026-10-28T14:35:00Z' : undefined,
        approvedBy: workflowStatus === 'Approved' ? 'dr.anita.roy@company.com' : undefined,
        approvedAt: workflowStatus === 'Approved' ? '2026-10-29T10:15:00Z' : undefined
      });
    });
  });

  return records;
}

export const INITIAL_USERS: UserAccount[] = [
  { id: 'USR-01', email: 'admin@company.com', name: 'System Administrator', role: 'ADMIN', departmentId: 'ALL', status: 'ACTIVE' },
  { id: 'USR-02', email: 'mmd.head@company.com', name: 'Rajesh Sharma', role: 'DEPT_HEAD', departmentId: 'DEP-01', status: 'ACTIVE' },
  { id: 'USR-03', email: 'stores.head@company.com', name: 'Vikram Patil', role: 'DEPT_HEAD', departmentId: 'DEP-02', status: 'ACTIVE' },
  { id: 'USR-04', email: 'quality.head@company.com', name: 'Dr. Anita Roy', role: 'DEPT_HEAD', departmentId: 'DEP-03', status: 'ACTIVE' },
  { id: 'USR-05', email: 'logistics.head@company.com', name: 'Sunil Menon', role: 'DEPT_HEAD', departmentId: 'DEP-04', status: 'ACTIVE' },
  { id: 'USR-06', email: 'production.head@company.com', name: 'K. Murthy', role: 'DEPT_HEAD', departmentId: 'DEP-05', status: 'ACTIVE' },
  { id: 'USR-07', email: 'general.head@company.com', name: 'Pooja Varma', role: 'DEPT_HEAD', departmentId: 'DEP-06', status: 'ACTIVE' },
  { id: 'USR-08', email: 'finance.head@company.com', name: 'Amit Bansal', role: 'DEPT_HEAD', departmentId: 'DEP-07', status: 'ACTIVE' },
  { id: 'USR-09', email: 'suresh.kumar@company.com', name: 'Suresh Kumar', role: 'DEPT_USER', departmentId: 'DEP-01', status: 'ACTIVE' }
];

export const INITIAL_CAPAS: CorrectiveAction[] = [
  {
    actionId: 'CAPA-2026-082',
    indicatorId: 'DRM-MM-03',
    departmentId: 'DEP-01',
    financialYear: 'FY 2026-2027',
    month: 'October',
    problemDescription: 'Tier-1 vendor delivery adherence dropped below SLA threshold to 89.2% due to casting supplier induction furnace failure.',
    rootCause: 'Single regional supply risk for Grade-A cylinder head casting without active second source volume buffer.',
    correctiveAction: 'Audited and activated alternate approved casting supplier in Coimbatore cluster; reallocated 35% of monthly schedules.',
    preventiveAction: 'Implemented automated dual-sourcing quota enforcement rule directly in SAP ERP purchasing view for critical components.',
    assignedOwner: 'rajesh.sharma@company.com',
    priority: 'High',
    dueDate: '2026-11-15',
    status: 'In Progress',
    reviewerComments: 'Reviewed in plant operations DRM on Oct 25; pilot batches passed metallurgical clearance.',
    createdAt: '2026-10-24T11:00:00Z'
  },
  {
    actionId: 'CAPA-2026-079',
    indicatorId: 'DRM-QA-02',
    departmentId: 'DEP-03',
    financialYear: 'FY 2026-2027',
    month: 'September',
    problemDescription: 'Assembly Line 2 line rejection rate exceeded target at 1.15% caused by cross-threaded bolt assembly on front axle knuckles.',
    rootCause: 'Pneumatic air line line-pressure fluctuation caused manual torque tool cut-off failure during third shift.',
    correctiveAction: 'Upgraded Station 4 torque drivers with transducerized DC digital smart tools featuring integrated optical part seating sensors.',
    preventiveAction: 'Configured automated Poka-Yoke interlock in MES preventing line index until torque & angle parameters confirm OK.',
    assignedOwner: 'qc.engineer@company.com',
    priority: 'Critical',
    dueDate: '2026-10-10',
    status: 'Closed',
    reviewerComments: 'Zero cross-thread defects verified over 15,000 consecutive chassis assemblies.',
    createdAt: '2026-09-18T09:30:00Z',
    closedAt: '2026-10-09T16:00:00Z'
  }
];

export const INITIAL_UPLOADS: SapUpload[] = [
  {
    uploadId: 'SAP-9481',
    fileName: 'ZM088_Vendor_OTIF_Oct2026.xlsx',
    fileId: '1dr_sap_upload_zm088_oct26',
    driveLink: 'https://drive.google.com/drive/folders/SAP_DRM_Data',
    uploadedBy: 'suresh.kumar@company.com',
    uploadedAt: '2026-10-28T09:30:00Z',
    departmentId: 'DEP-01',
    financialYear: 'FY 2026-2027',
    month: 'October',
    sapTCode: 'ZM088',
    rowsProcessed: 480,
    rowsRejected: 0,
    status: 'Completed',
    remarks: 'Monthly vendor dispatch evaluation run from SAP ECC 6.0'
  },
  {
    uploadId: 'SAP-9480',
    fileName: 'MB52_Warehouse_Stock_Valuation_Oct2026.xlsx',
    fileId: '1dr_sap_upload_mb52_oct26',
    driveLink: 'https://drive.google.com/drive/folders/SAP_DRM_Data',
    uploadedBy: 'stores.lead@company.com',
    uploadedAt: '2026-10-27T16:45:00Z',
    departmentId: 'DEP-02',
    financialYear: 'FY 2026-2027',
    month: 'October',
    sapTCode: 'MB52',
    rowsProcessed: 1250,
    rowsRejected: 2,
    status: 'Completed',
    remarks: 'Plant raw material and component valuation matrix'
  },
  {
    uploadId: 'SAP-9475',
    fileName: 'QA32_Incoming_Inspection_Lots_Oct2026.csv',
    fileId: '1dr_sap_upload_qa32_oct26',
    driveLink: 'https://drive.google.com/drive/folders/SAP_DRM_Data',
    uploadedBy: 'qc.engineer@company.com',
    uploadedAt: '2026-10-26T14:15:00Z',
    departmentId: 'DEP-03',
    financialYear: 'FY 2026-2027',
    month: 'October',
    sapTCode: 'QA32',
    rowsProcessed: 320,
    rowsRejected: 0,
    status: 'Completed',
    remarks: 'Incoming QA sample acceptance and rejection lots'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    auditId: 'AUD-902',
    timestamp: '2026-10-30T08:45:10Z',
    userEmail: 'admin@company.com',
    module: 'INDICATORS',
    action: 'UPDATE',
    recordId: 'DRM-MM-03',
    previousValue: 'tolMin: 92.0',
    newValue: 'tolMin: 90.0',
    details: 'Adjusted tolerance minimum for vendor delivery adherence per quarterly policy review'
  },
  {
    auditId: 'AUD-901',
    timestamp: '2026-10-29T17:12:00Z',
    userEmail: 'quality.head@company.com',
    module: 'APPROVALS',
    action: 'APPROVE',
    recordId: 'REC-DRM-QA-01-September',
    previousValue: 'Submitted',
    newValue: 'Approved',
    details: 'Approved September QA incoming rejection submission with verified supplier credit notes'
  },
  {
    auditId: 'AUD-900',
    timestamp: '2026-10-28T09:32:45Z',
    userEmail: 'suresh.kumar@company.com',
    module: 'SAP_UPLOADS',
    action: 'UPLOAD',
    recordId: 'SAP-9481',
    newValue: 'ZM088_Vendor_OTIF_Oct2026.xlsx',
    details: 'Uploaded ZM088 SAP report to Drive folder /SAP_DRM_Data/SAP_Uploads/FY_2026_2027/October'
  }
];
