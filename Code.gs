/**
 * SAP DRM DIGITAL MANAGEMENT SYSTEM
 * Platform: Google Apps Script + Google Drive + Google Sheets
 * 
 * File: Code.gs
 * Backend service handling database initialization, role-based security,
 * indicator tracking, monthly performance calculations, SAP report uploads,
 * approval workflows, CAPA corrective actions, and immutable audit logging.
 */

// Configuration constants
var CONFIG = {
  FOLDER_NAME: 'SAP_DRM_Data',
  DB_FILE_NAME: 'SAP_DRM_Master_Database',
  DEFAULT_FY: 'FY 2026-2027',
  TIMEZONE: 'Asia/Kolkata',
  SHEETS: {
    USERS: 'Users',
    DEPARTMENTS: 'Departments',
    INDICATORS: 'Indicators',
    TARGETS: 'Monthly_Targets',
    ACTUALS: 'Monthly_Actuals',
    UPLOADS: 'SAP_Uploads',
    ACTIONS: 'Corrective_Actions',
    APPROVALS: 'Approval_History',
    AUDIT: 'Audit_Logs',
    SETTINGS: 'Application_Settings'
  }
};

/**
 * Main Web App Entry Point
 */
function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  var output = template.evaluate()
    .setTitle('SAP DRM Digital Management System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1');
  return output;
}

/**
 * Include helper for server-side templates if needed
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Database Initialization
 * Automatically creates or initializes Google Sheets and Google Drive folders.
 * Safe to execute multiple times (idempotent).
 */
function initializeApplication() {
  try {
    var props = PropertiesService.getScriptProperties();
    var folderId = props.getProperty('DRIVE_FOLDER_ID');
    var rootFolder;

    if (!folderId) {
      var folders = DriveApp.getFoldersByName(CONFIG.FOLDER_NAME);
      if (folders.hasNext()) {
        rootFolder = folders.next();
      } else {
        rootFolder = DriveApp.createFolder(CONFIG.FOLDER_NAME);
      }
      folderId = rootFolder.getId();
      props.setProperty('DRIVE_FOLDER_ID', folderId);

      // Create required sub-folders
      var subfolders = ['Database', 'SAP_Uploads', 'Generated_Reports', 'Attachments'];
      for (var i = 0; i < subfolders.length; i++) {
        var subName = subfolders[i];
        if (!rootFolder.getFoldersByName(subName).hasNext()) {
          rootFolder.createFolder(subName);
        }
      }
    } else {
      rootFolder = DriveApp.getFolderById(folderId);
    }

    // Initialize Database Spreadsheet
    var spreadsheetId = props.getProperty('SPREADSHEET_ID');
    var ss;
    if (!spreadsheetId) {
      var dbFolders = rootFolder.getFoldersByName('Database');
      var targetFolder = dbFolders.hasNext() ? dbFolders.next() : rootFolder;
      var files = targetFolder.getFilesByName(CONFIG.DB_FILE_NAME);
      if (files.hasNext()) {
        ss = SpreadsheetApp.open(files.next());
      } else {
        ss = SpreadsheetApp.create(CONFIG.DB_FILE_NAME);
        var ssFile = DriveApp.getFileById(ss.getId());
        targetFolder.addFile(ssFile);
        DriveApp.getRootFolder().removeFile(ssFile);
      }
      spreadsheetId = ss.getId();
      props.setProperty('SPREADSHEET_ID', spreadsheetId);
    } else {
      ss = SpreadsheetApp.openById(spreadsheetId);
    }

    // Ensure all 10 Sheets exist with headers
    setupSheetHeaders_(ss);

    // Seed Initial Data if table empty
    seedInitialData_(ss);

    logAudit_('SYSTEM', 'INIT_APP', 'SYSTEM', 'Initialized database and Google Drive structures');

    return {
      success: true,
      spreadsheetId: spreadsheetId,
      folderId: folderId,
      message: 'SAP DRM Database and Drive folders initialized successfully.'
    };
  } catch (err) {
    return {
      success: false,
      error: err.toString()
    };
  }
}

/**
 * Setup sheet headers with batch write
 */
function setupSheetHeaders_(ss) {
  var headersMap = {};
  headersMap[CONFIG.SHEETS.USERS] = ['User_ID', 'Email', 'Full_Name', 'Role', 'Department_ID', 'Status', 'Created_At'];
  headersMap[CONFIG.SHEETS.DEPARTMENTS] = ['Department_ID', 'Department_Name', 'Department_Code', 'Head_Email', 'Active', 'Description'];
  headersMap[CONFIG.SHEETS.INDICATORS] = [
    'Indicator_ID', 'Indicator_Name', 'Description', 'Department_ID', 'SAP_TCode', 
    'Unit', 'Frequency', 'Target_Value', 'Target_Type', 'Calculation_Method', 
    'Tolerance_Min', 'Tolerance_Max', 'Responsible_User', 'SAP_Report_Required', 
    'Effective_Start', 'Effective_End', 'Status', 'Remarks'
  ];
  headersMap[CONFIG.SHEETS.TARGETS] = ['Target_ID', 'Financial_Year', 'Month', 'Indicator_ID', 'Department_ID', 'Target_Value', 'Created_By', 'Updated_At'];
  headersMap[CONFIG.SHEETS.ACTUALS] = [
    'Record_ID', 'Financial_Year', 'Month', 'Indicator_ID', 'Department_ID', 
    'Target_Value', 'Actual_Value', 'Variance', 'Achievement_Pct', 'Compliance_Status', 
    'Remarks', 'Supporting_Upload_ID', 'Status', 'Created_By', 'Created_At', 
    'Updated_By', 'Updated_At', 'Submitted_By', 'Submitted_At', 'Approved_By', 'Approved_At'
  ];
  headersMap[CONFIG.SHEETS.UPLOADS] = [
    'Upload_ID', 'File_Name', 'File_ID', 'Drive_Link', 'Uploaded_By', 'Uploaded_At', 
    'Department_ID', 'Financial_Year', 'Month', 'SAP_TCode', 'Rows_Processed', 
    'Rows_Rejected', 'Status', 'Remarks'
  ];
  headersMap[CONFIG.SHEETS.ACTIONS] = [
    'Action_ID', 'Indicator_ID', 'Department_ID', 'Financial_Year', 'Month', 
    'Problem_Description', 'Root_Cause', 'Corrective_Action', 'Preventive_Action', 
    'Assigned_Owner', 'Priority', 'Due_Date', 'Status', 'Reviewer_Comments', 
    'Created_At', 'Closed_At'
  ];
  headersMap[CONFIG.SHEETS.APPROVALS] = ['Approval_ID', 'Record_ID', 'Previous_Status', 'New_Status', 'Action_By', 'Action_At', 'Comments'];
  headersMap[CONFIG.SHEETS.AUDIT] = ['Audit_ID', 'Timestamp', 'User_Email', 'Module', 'Action', 'Record_ID', 'Previous_Value', 'New_Value', 'Details'];
  headersMap[CONFIG.SHEETS.SETTINGS] = ['Key', 'Value', 'Description', 'Updated_By', 'Updated_At'];

  for (var sheetName in headersMap) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headersMap[sheetName].length).setValues([headersMap[sheetName]]);
      sheet.getRange(1, 1, 1, headersMap[sheetName].length).setFontWeight('bold').setBackground('#E2E8F0');
      sheet.setFrozenRows(1);
    }
  }

  // Remove default Sheet1 if present and not needed
  var sheet1 = ss.getSheetByName('Sheet1');
  if (sheet1 && ss.getSheets().length > 1) {
    try { ss.deleteSheet(sheet1); } catch (e) {}
  }
}

/**
 * Seed initial 7 automotive manufacturing departments and 48 DRM indicators
 */
function seedInitialData_(ss) {
  var deptSheet = ss.getSheetByName(CONFIG.SHEETS.DEPARTMENTS);
  if (deptSheet.getLastRow() <= 1) {
    var defaultDepts = [
      ['DEP-01', 'Materials Management Department', 'MMD', 'mmd.head@company.com', 'TRUE', 'Procurement, vendor development, PO monitoring and material planning'],
      ['DEP-02', 'Stores', 'STR', 'stores.head@company.com', 'TRUE', 'Physical inventory management, bin cards, staging and shopfloor issue'],
      ['DEP-03', 'Quality', 'QA', 'quality.head@company.com', 'TRUE', 'Incoming inspection, line rejection, customer complaints, 0-km defects and calibration'],
      ['DEP-04', 'Marketing & Logistics', 'MKT_LOG', 'logistics.head@company.com', 'TRUE', 'Order execution, OTIF delivery, freight management and dispatch clearance'],
      ['DEP-05', 'Production', 'PROD', 'production.head@company.com', 'TRUE', 'Assembly lines, OEE, downtime, cycle time, WIP and scrap control'],
      ['DEP-06', 'General Departments', 'GEN', 'general.head@company.com', 'TRUE', 'Safety LTIFR, HR training hours, plant utilities, statutory and IT uptime'],
      ['DEP-07', 'Finance', 'FIN', 'finance.head@company.com', 'TRUE', 'Vendor invoice TAT, receivables aging, budget variance, GST credit and working capital']
    ];
    deptSheet.getRange(2, 1, defaultDepts.length, defaultDepts[0].length).setValues(defaultDepts);
  }

  // Seed Users
  var userSheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
  if (userSheet.getLastRow() <= 1) {
    var activeEmail = Session.getActiveUser().getEmail() || 'admin@company.com';
    var defaultUsers = [
      ['USR-01', activeEmail, 'System Administrator', 'ADMIN', 'ALL', 'ACTIVE', new Date().toISOString()],
      ['USR-02', 'mmd.head@company.com', 'Rajesh Sharma', 'DEPT_HEAD', 'DEP-01', 'ACTIVE', new Date().toISOString()],
      ['USR-03', 'stores.head@company.com', 'Vikram Patil', 'DEPT_HEAD', 'DEP-02', 'ACTIVE', new Date().toISOString()],
      ['USR-04', 'quality.head@company.com', 'Dr. Anita Roy', 'DEPT_HEAD', 'DEP-03', 'ACTIVE', new Date().toISOString()],
      ['USR-05', 'logistics.head@company.com', 'Sunil Menon', 'DEPT_HEAD', 'DEP-04', 'ACTIVE', new Date().toISOString()],
      ['USR-06', 'production.head@company.com', 'K. Murthy', 'DEPT_HEAD', 'DEP-05', 'ACTIVE', new Date().toISOString()],
      ['USR-07', 'general.head@company.com', 'Pooja Varma', 'DEPT_HEAD', 'DEP-06', 'ACTIVE', new Date().toISOString()],
      ['USR-08', 'finance.head@company.com', 'Amit Bansal', 'DEPT_HEAD', 'DEP-07', 'ACTIVE', new Date().toISOString()],
      ['USR-09', 'operator.mmd@company.com', 'Suresh Kumar', 'DEPT_USER', 'DEP-01', 'ACTIVE', new Date().toISOString()]
    ];
    userSheet.getRange(2, 1, defaultUsers.length, defaultUsers[0].length).setValues(defaultUsers);
  }

  // Seed 48 DRM Indicators
  var indSheet = ss.getSheetByName(CONFIG.SHEETS.INDICATORS);
  if (indSheet.getLastRow() <= 1) {
    var indicators = getCore48Indicators_();
    indSheet.getRange(2, 1, indicators.length, indicators[0].length).setValues(indicators);
  }
}

/**
 * Returns the digitized 48 automotive manufacturing DRM indicators
 */
function getCore48Indicators_() {
  return [
    // 1. Materials Management Department (7)
    ['DRM-MM-01', 'Purchase Orders Pending Approval > 3 Days', 'Open POs requiring executive clearance beyond SLA', 'DEP-01', 'ME28 / ME5A', 'Nos', 'Monthly', 0, 'MAX', 'LOWER_IS_BETTER', 0, 1, 'suresh.kumar@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Critical procurement bottleneck indicator'],
    ['DRM-MM-02', 'Open Purchase Requisitions Pending Conversion', 'PR to PO conversion backlog older than 7 calendar days', 'DEP-01', 'ME5A', 'Nos', 'Monthly', 5, 'MAX', 'LOWER_IS_BETTER', 0, 8, 'suresh.kumar@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Tracks buyer turnaround time'],
    ['DRM-MM-03', 'Vendor Delivery Adherence / V-OTIF', 'Vendor on-time in-full delivery compliance against purchase order schedule', 'DEP-01', 'ZM088', '%', 'Monthly', 95.0, 'MIN', 'HIGHER_IS_BETTER', 90.0, 100.0, 'suresh.kumar@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Tier-1 supplier adherence'],
    ['DRM-MM-04', 'Non-Moving Inventory > 90 Days', 'Raw material and bought-out stock without consumption in last quarter', 'DEP-01', 'ZMR49Q', 'INR Lakhs', 'Monthly', 10.0, 'MAX', 'LOWER_IS_BETTER', 0, 15.0, 'suresh.kumar@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Working capital lockup monitoring'],
    ['DRM-MM-05', 'GRN Pending for Receipt Verification', 'Gate-entry done but GRN posting pending over 24 hours', 'DEP-01', 'ZM055', 'Nos', 'Monthly', 0, 'EXACT', 'EQUAL_TO_TARGET', 0, 0, 'suresh.kumar@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Prevents unbooked stock on ramp'],
    ['DRM-MM-06', 'Critical Raw Material Stock Buffer Level', 'Buffer inventory coverage for Grade-A steel and fasteners', 'DEP-01', 'MB52', 'Days', 'Monthly', 18.0, 'RANGE', 'WITHIN_RANGE', 15.0, 20.0, 'suresh.kumar@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Ensures zero line stoppages'],
    ['DRM-MM-07', 'Cost Reduction Through Alternate Sourcing', 'Cumulative cost savings achieved through VAVE and negotiations', 'DEP-01', 'ZM013', 'INR Lakhs', 'Monthly', 5.0, 'MIN', 'HIGHER_IS_BETTER', 4.0, 10.0, 'suresh.kumar@company.com', 'FALSE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Annual cost excellence program'],

    // 2. Stores (6)
    ['DRM-ST-01', 'Physical vs SAP Stock Accuracy', 'Wall-to-wall cycle audit variance percentage', 'DEP-02', 'MB52', '%', 'Monthly', 99.5, 'MIN', 'HIGHER_IS_BETTER', 98.5, 100.0, 'stores.lead@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Essential for perpetual inventory audit'],
    ['DRM-ST-02', 'Pending Material Issues to Shop Floor > 24h', 'Reservations pending pick and dispatch to assembly bays', 'DEP-02', 'MB25', 'Nos', 'Monthly', 0, 'EXACT', 'EQUAL_TO_TARGET', 0, 0, 'stores.lead@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Kitting readiness KPI'],
    ['DRM-ST-03', 'Scrap Material Disposal Adherence', 'Turnaround from scrap generation yard staging to auction', 'DEP-02', 'MB51', 'Days', 'Monthly', 7.0, 'MAX', 'LOWER_IS_BETTER', 0, 10.0, 'stores.lead@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Plant floor 5S and revenue recovery'],
    ['DRM-ST-04', 'Excess Stock Movement to Dead Storage', 'Identification and quarantine of obsolete tooling and parts', 'DEP-02', 'ZM020V', 'Items', 'Monthly', 2, 'MAX', 'LOWER_IS_BETTER', 0, 4, 'stores.lead@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Space optimization'],
    ['DRM-ST-05', 'High Value Item Daily Cycle Count', '100% adherence to ABC-category A item counting schedule', 'DEP-02', 'SQ01', '%', 'Monthly', 100.0, 'EXACT', 'EQUAL_TO_TARGET', 100.0, 100.0, 'stores.lead@company.com', 'FALSE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Strict high-value control'],
    ['DRM-ST-06', 'Goods Inward Staging Time', 'Elapsed time from vehicle gate-in to dock unloading', 'DEP-02', 'ZM083P', 'Hours', 'Monthly', 4.0, 'MAX', 'LOWER_IS_BETTER', 1.0, 5.0, 'stores.lead@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Dock turnaround efficiency'],

    // 3. Quality (7)
    ['DRM-QA-01', 'Incoming Material Quality Rejection Rate', 'Supplier defect density measured in parts per million', 'DEP-03', 'QA32', 'PPM', 'Monthly', 50.0, 'MAX', 'LOWER_IS_BETTER', 0, 75.0, 'qc.engineer@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Automotive IATF 16949 standard'],
    ['DRM-QA-02', 'Line Rejection / Defect Rate', 'Internal production defect percentage caught at quality gates', 'DEP-03', 'QM10', '%', 'Monthly', 0.8, 'MAX', 'LOWER_IS_BETTER', 0, 1.0, 'qc.engineer@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Shopfloor defect containment'],
    ['DRM-QA-03', 'Customer Complaints / 0-Km Failures', 'OEM customer reported field rejections and assembly discrepancies', 'DEP-03', 'ZQ046', 'Nos', 'Monthly', 0, 'EXACT', 'EQUAL_TO_TARGET', 0, 0, 'qc.engineer@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Zero-defect mission'],
    ['DRM-QA-04', 'Calibration Pending Past Due Date', 'Measurement tools and fixtures overdue for NABL recalibration', 'DEP-03', 'IW58', 'Nos', 'Monthly', 0, 'EXACT', 'EQUAL_TO_TARGET', 0, 0, 'qc.engineer@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Audit non-negotiable requirement'],
    ['DRM-QA-05', 'Supplier Corrective Action Request Turnaround', 'Average days to close 8D SCAR reports with root cause', 'DEP-03', 'QM10', 'Days', 'Monthly', 14.0, 'MAX', 'LOWER_IS_BETTER', 5.0, 21.0, 'qc.engineer@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Vendor quality corrective loop'],
    ['DRM-QA-06', 'In-Process Inspection Clearance Turnaround', 'Average time taken for lab metallographic and CMM testing', 'DEP-03', 'QA32', 'Hours', 'Monthly', 2.0, 'MAX', 'LOWER_IS_BETTER', 0.5, 3.0, 'qc.engineer@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Prevents batch holdups'],
    ['DRM-QA-07', 'First Time Right (FTR) Assembly Rate', 'Assemblies passing end-of-line testing without rework', 'DEP-03', 'ZQ046', '%', 'Monthly', 98.5, 'MIN', 'HIGHER_IS_BETTER', 96.0, 100.0, 'qc.engineer@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Direct labor productivity factor'],

    // 4. Marketing & Logistics (7)
    ['DRM-ML-01', 'Customer On-Time In-Full Delivery (OTIF)', 'Order lines fulfilled within promised dispatch window', 'DEP-04', 'VL06O', '%', 'Monthly', 98.0, 'MIN', 'HIGHER_IS_BETTER', 95.0, 100.0, 'logistics.officer@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'OEM customer service SLA'],
    ['DRM-ML-02', 'Finished Goods Billing Pending Dispatch', 'Billed invoices awaiting transport placement at dock', 'DEP-04', 'VF04', 'INR Lakhs', 'Monthly', 15.0, 'MAX', 'LOWER_IS_BETTER', 0, 20.0, 'logistics.officer@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Revenue velocity indicator'],
    ['DRM-ML-03', 'Pending Customer Sales Orders > 7 Days', 'Confirmed backorders awaiting production allocation', 'DEP-04', 'ZV119', 'Nos', 'Monthly', 0, 'EXACT', 'EQUAL_TO_TARGET', 0, 2, 'logistics.officer@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Sales backlog health'],
    ['DRM-ML-04', 'Transit Damage / Loss Ratio', 'Claims against total outbound transit shipments', 'DEP-04', 'ZV048', '%', 'Monthly', 0.05, 'MAX', 'LOWER_IS_BETTER', 0, 0.1, 'logistics.officer@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Packaging and fleet compliance'],
    ['DRM-ML-05', 'Vehicle Turnaround Time in Plant', 'Time spent by outbound trailers inside plant gates', 'DEP-04', 'ZV085', 'Hours', 'Monthly', 3.5, 'MAX', 'LOWER_IS_BETTER', 2.0, 4.5, 'logistics.officer@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Eliminates detention charges'],
    ['DRM-ML-06', 'Finished Goods Inventory Holding Period', 'Average finished inventory stock days across hubs', 'DEP-04', 'MB52', 'Days', 'Monthly', 5.0, 'MAX', 'LOWER_IS_BETTER', 3.0, 7.0, 'logistics.officer@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Finished inventory turnover'],
    ['DRM-ML-07', 'Freight Cost per Ton Dispatched', 'Outbound logistics freight cost efficiency', 'DEP-04', 'VF04', 'INR/Ton', 'Monthly', 1200.0, 'MAX', 'LOWER_IS_BETTER', 1000.0, 1350.0, 'logistics.officer@company.com', 'FALSE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Route optimization tracking'],

    // 5. Production (7)
    ['DRM-PR-01', 'Overall Equipment Effectiveness (OEE)', 'Composite metric of machine Availability x Performance x Quality', 'DEP-05', 'COHV', '%', 'Monthly', 85.0, 'MIN', 'HIGHER_IS_BETTER', 80.0, 100.0, 'prod.manager@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'World-class manufacturing baseline'],
    ['DRM-PR-02', 'Daily Production Plan Adherence', 'Actual assemblies completed vs master production schedule', 'DEP-05', 'MD62', '%', 'Monthly', 98.0, 'MIN', 'HIGHER_IS_BETTER', 95.0, 100.0, 'prod.manager@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Line balancing indicator'],
    ['DRM-PR-03', 'Machine Breakdown / Unplanned Downtime', 'Cumulative emergency maintenance hours across stamping and weld lines', 'DEP-05', 'IW58', 'Hours', 'Monthly', 12.0, 'MAX', 'LOWER_IS_BETTER', 0, 18.0, 'prod.manager@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'TPM reliability metric'],
    ['DRM-PR-04', 'Standard vs Actual Production Cycle Time', 'Measured takt time deviation on main assembly conveyor', 'DEP-05', 'COHV', 'Seconds', 'Monthly', 44.0, 'RANGE', 'WITHIN_RANGE', 42.0, 46.0, 'prod.manager@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Line velocity stabilization'],
    ['DRM-PR-05', 'Work In Progress (WIP) Value on Shop Floor', 'Unfinished subassemblies between line stages', 'DEP-05', 'MB52', 'INR Lakhs', 'Monthly', 25.0, 'MAX', 'LOWER_IS_BETTER', 15.0, 30.0, 'prod.manager@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Kanban inventory control'],
    ['DRM-PR-06', 'Production Scrap Generation Rate', 'Metal stamping and machining scrap as a percentage of gross input', 'DEP-05', 'MB51', '%', 'Monthly', 1.2, 'MAX', 'LOWER_IS_BETTER', 0.5, 1.5, 'prod.manager@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Material yield efficiency'],
    ['DRM-PR-07', 'Changeover Time (SMED Matrix)', 'Single-minute exchange of dies turnaround for tool changes', 'DEP-05', 'COHV', 'Minutes', 'Monthly', 30.0, 'MAX', 'LOWER_IS_BETTER', 20.0, 40.0, 'prod.manager@company.com', 'FALSE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Flexibility on multi-model lines'],

    // 6. General Departments (7)
    ['DRM-GD-01', 'Plant Safety - Lost Time Injury Frequency Rate', 'OSHA compliant incident frequency per million man-hours', 'DEP-06', 'SQ01', 'Rate', 'Monthly', 0.0, 'EXACT', 'EQUAL_TO_TARGET', 0.0, 0.0, 'ehs.officer@company.com', 'FALSE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Safety first imperative'],
    ['DRM-GD-02', 'Mandatory Skill Training Hours Compliance', 'Adherence to technical and safety refresher training schedules', 'DEP-06', 'SQ01', '%', 'Monthly', 95.0, 'MIN', 'HIGHER_IS_BETTER', 90.0, 100.0, 'hr.specialist@company.com', 'FALSE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Workforce capability index'],
    ['DRM-GD-03', 'Employee Absenteeism Rate', 'Unplanned shopfloor absenteeism across three shifts', 'DEP-06', 'SQ01', '%', 'Monthly', 4.0, 'MAX', 'LOWER_IS_BETTER', 0, 5.0, 'hr.specialist@company.com', 'FALSE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Manpower availability indicator'],
    ['DRM-GD-04', 'Near-Miss Incident Closure Rate within 48h', 'Safety hazards reported and eliminated by line supervisors', 'DEP-06', 'SQ01', '%', 'Monthly', 100.0, 'EXACT', 'EQUAL_TO_TARGET', 100.0, 100.0, 'ehs.officer@company.com', 'FALSE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Proactive safety culture'],
    ['DRM-GD-05', 'Plant Utility Specific Power Consumption', 'Electrical energy consumed per metric ton of automotive output', 'DEP-06', 'SQ01', 'kWh/Ton', 'Monthly', 140.0, 'MAX', 'LOWER_IS_BETTER', 120.0, 150.0, 'plant.engineer@company.com', 'FALSE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Energy sustainability metric'],
    ['DRM-GD-06', 'Statutory Compliance Timeliness', 'Pollution board, factory inspectorate and boiler submissions', 'DEP-06', 'SQ01', '%', 'Monthly', 100.0, 'EXACT', 'EQUAL_TO_TARGET', 100.0, 100.0, 'compliance@company.com', 'FALSE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Zero regulatory non-compliance'],
    ['DRM-GD-07', 'IT System Uptime & SAP Availability', 'ERP server, MES terminal and shopfloor network availability', 'DEP-06', 'SQ01', '%', 'Monthly', 99.9, 'MIN', 'HIGHER_IS_BETTER', 99.5, 100.0, 'it.admin@company.com', 'FALSE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Digital continuity SLA'],

    // 7. Finance (7)
    ['DRM-FN-01', 'Vendor Invoice Processing Turnaround', 'Three-way match (PO-GRN-Invoice) turnaround time to approval', 'DEP-07', 'ZM063K', 'Days', 'Monthly', 3.0, 'MAX', 'LOWER_IS_BETTER', 1.0, 4.0, 'finance.analyst@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Ensures vendor discount terms'],
    ['DRM-FN-02', 'Outstanding Accounts Receivable > 60 Days', 'Delayed customer payments past credit terms', 'DEP-07', 'VF04', 'INR Lakhs', 'Monthly', 20.0, 'MAX', 'LOWER_IS_BETTER', 0, 25.0, 'finance.analyst@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Cashflow management'],
    ['DRM-FN-03', 'Unreconciled Bank & Cash Items', 'Unidentified ledger clearances at monthly financial closing', 'DEP-07', 'FBL3N', 'Nos', 'Monthly', 0, 'EXACT', 'EQUAL_TO_TARGET', 0, 0, 'finance.analyst@company.com', 'FALSE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Accounting accuracy'],
    ['DRM-FN-04', 'Capex Budget vs Actual Variance', 'Capital equipment expenditure variance against approved AOP', 'DEP-07', 'S_ALR_87013558', '%', 'Monthly', 0.0, 'RANGE', 'WITHIN_RANGE', -5.0, 5.0, 'finance.analyst@company.com', 'FALSE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Capital discipline'],
    ['DRM-FN-05', 'GST & TDS Input Credit Reconciliation', 'GSTR-2B vs purchase register matching percentage', 'DEP-07', 'J1IEX', '%', 'Monthly', 100.0, 'EXACT', 'EQUAL_TO_TARGET', 100.0, 100.0, 'finance.analyst@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Tax compliance integrity'],
    ['DRM-FN-06', 'Working Capital Cycle Duration', 'Days sales of inventory + DSO minus DPO', 'DEP-07', 'FBL1N', 'Days', 'Monthly', 45.0, 'MAX', 'LOWER_IS_BETTER', 35.0, 50.0, 'finance.analyst@company.com', 'FALSE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Treasury liquidity health'],
    ['DRM-FN-07', 'Scrap Sale Realization Value', 'Monthly realized revenue from metallics and dross scrap auctions', 'DEP-07', 'VF04', 'INR Lakhs', 'Monthly', 15.0, 'MIN', 'HIGHER_IS_BETTER', 12.0, 20.0, 'finance.analyst@company.com', 'TRUE', '2026-04-01', '2027-03-31', 'ACTIVE', 'Secondary revenue optimization']
  ];
}

/**
 * Get App Configuration & Current User info
 */
function getApplicationConfiguration() {
  var props = PropertiesService.getScriptProperties();
  var userEmail = Session.getActiveUser().getEmail() || 'admin@company.com';
  
  var ss = getDatabase_();
  var userRole = 'ADMIN';
  var userDept = 'ALL';
  var userName = 'Administrator';

  if (ss) {
    var userSheet = ss.getSheetByName(CONFIG.SHEETS.USERS);
    if (userSheet && userSheet.getLastRow() > 1) {
      var users = userSheet.getDataRange().getValues();
      for (var i = 1; i < users.length; i++) {
        if (users[i][1] && users[i][1].toLowerCase() === userEmail.toLowerCase()) {
          userName = users[i][2];
          userRole = users[i][3];
          userDept = users[i][4];
          break;
        }
      }
    }
  }

  return {
    success: true,
    user: {
      email: userEmail,
      name: userName,
      role: userRole,
      departmentId: userDept
    },
    defaultFinancialYear: CONFIG.DEFAULT_FY,
    spreadsheetId: props.getProperty('SPREADSHEET_ID'),
    driveFolderId: props.getProperty('DRIVE_FOLDER_ID'),
    financialYears: ['FY 2026-2027', 'FY 2025-2026', 'FY 2024-2025'],
    months: ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March']
  };
}

/**
 * Get Database Spreadsheet handle
 */
function getDatabase_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SPREADSHEET_ID');
  if (!id) return null;
  return SpreadsheetApp.openById(id);
}

/**
 * Audit Logging Helper (Immutable Append)
 */
function logAudit_(userEmail, action, module, recordId, prevVal, newVal, details) {
  try {
    var ss = getDatabase_();
    if (!ss) return;
    var auditSheet = ss.getSheetByName(CONFIG.SHEETS.AUDIT);
    if (!auditSheet) return;

    var auditId = 'AUD-' + Utilities.getUuid().substring(0, 8).toUpperCase();
    var timestamp = new Date().toISOString();
    auditSheet.appendRow([
      auditId,
      timestamp,
      userEmail || 'SYSTEM',
      module || 'GENERAL',
      action || 'ACTION',
      recordId || '',
      prevVal !== undefined ? JSON.stringify(prevVal) : '',
      newVal !== undefined ? JSON.stringify(newVal) : '',
      details || ''
    ]);
  } catch (err) {
    console.error('Audit logging failed: ' + err.toString());
  }
}

/**
 * Get All Departments
 */
function getDepartments() {
  try {
    var ss = getDatabase_();
    if (!ss) return { success: false, error: 'Database not initialized' };
    var sheet = ss.getSheetByName(CONFIG.SHEETS.DEPARTMENTS);
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var departments = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      departments.push({
        id: row[0],
        name: row[1],
        code: row[2],
        headEmail: row[3],
        active: String(row[4]).toUpperCase() === 'TRUE',
        description: row[5]
      });
    }
    return { success: true, departments: departments };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Get All Indicators
 */
function getIndicators(deptId) {
  try {
    var ss = getDatabase_();
    if (!ss) return { success: false, error: 'Database not initialized' };
    var sheet = ss.getSheetByName(CONFIG.SHEETS.INDICATORS);
    var data = sheet.getDataRange().getValues();
    var indicators = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (deptId && deptId !== 'ALL' && row[3] !== deptId) continue;
      indicators.push({
        id: row[0],
        name: row[1],
        description: row[2],
        departmentId: row[3],
        sapTCode: row[4],
        unit: row[5],
        frequency: row[6],
        targetValue: parseFloat(row[7]),
        targetType: row[8],
        calcMethod: row[9],
        toleranceMin: parseFloat(row[10]),
        toleranceMax: parseFloat(row[11]),
        responsibleUser: row[12],
        sapRequired: String(row[13]).toUpperCase() === 'TRUE',
        effectiveStart: row[14],
        effectiveEnd: row[15],
        status: row[16],
        remarks: row[17]
      });
    }
    return { success: true, indicators: indicators };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Save or Update Indicator
 */
function saveIndicator(indicatorData) {
  try {
    var userEmail = Session.getActiveUser().getEmail() || 'admin@company.com';
    var ss = getDatabase_();
    var sheet = ss.getSheetByName(CONFIG.SHEETS.INDICATORS);
    var data = sheet.getDataRange().getValues();
    var rowIndex = -1;
    var isNew = true;

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === indicatorData.id) {
        rowIndex = i + 1;
        isNew = false;
        break;
      }
    }

    var rowValues = [
      indicatorData.id || ('DRM-IND-' + Utilities.getUuid().substring(0, 6).toUpperCase()),
      indicatorData.name,
      indicatorData.description || '',
      indicatorData.departmentId,
      indicatorData.sapTCode || '',
      indicatorData.unit || '%',
      indicatorData.frequency || 'Monthly',
      Number(indicatorData.targetValue) || 0,
      indicatorData.targetType || 'MIN',
      indicatorData.calcMethod || 'HIGHER_IS_BETTER',
      Number(indicatorData.toleranceMin) || 0,
      Number(indicatorData.toleranceMax) || 0,
      indicatorData.responsibleUser || userEmail,
      indicatorData.sapRequired ? 'TRUE' : 'FALSE',
      indicatorData.effectiveStart || '2026-04-01',
      indicatorData.effectiveEnd || '2027-03-31',
      indicatorData.status || 'ACTIVE',
      indicatorData.remarks || ''
    ];

    if (isNew) {
      sheet.appendRow(rowValues);
      logAudit_(userEmail, 'CREATE', 'INDICATORS', rowValues[0], null, indicatorData, 'Created DRM Indicator');
    } else {
      var prev = data[rowIndex - 1];
      sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
      logAudit_(userEmail, 'UPDATE', 'INDICATORS', rowValues[0], prev, indicatorData, 'Updated DRM Indicator');
    }

    return { success: true, indicatorId: rowValues[0] };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Compliance Rule Calculation Logic
 */
function evaluateCompliance_(calcMethod, actual, target, tolMin, tolMax) {
  if (actual === null || actual === undefined || isNaN(actual)) {
    return { status: 'Not Reported', achievementPct: null, variance: null };
  }
  actual = Number(actual);
  target = Number(target);

  var variance = actual - target;
  var achievementPct = null;
  var status = 'Non-Compliant';

  switch (calcMethod) {
    case 'HIGHER_IS_BETTER':
      if (target !== 0) achievementPct = Math.round((actual / target) * 1000) / 10;
      if (actual >= target) status = 'Compliant';
      else if (tolMin !== undefined && actual >= tolMin) status = 'Action Required';
      else status = 'Non-Compliant';
      break;

    case 'LOWER_IS_BETTER':
      if (target !== 0) achievementPct = Math.round((target / actual) * 1000) / 10;
      variance = target - actual;
      if (actual <= target) status = 'Compliant';
      else if (tolMax !== undefined && actual <= tolMax) status = 'Action Required';
      else status = 'Non-Compliant';
      break;

    case 'EQUAL_TO_TARGET':
      variance = actual - target;
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
        variance = actual < tolMin ? (actual - tolMin) : (actual - tolMax);
        status = 'Non-Compliant';
        achievementPct = Math.max(0, 100 - Math.abs(variance));
      }
      break;

    default:
      if (actual >= target) status = 'Compliant';
      else status = 'Non-Compliant';
  }

  return { status: status, achievementPct: achievementPct, variance: variance };
}

/**
 * Get Monthly DRM Records
 */
function getMonthlyRecords(fy, month, deptId) {
  try {
    var ss = getDatabase_();
    if (!ss) return { success: false, error: 'Database not initialized' };
    var sheet = ss.getSheetByName(CONFIG.SHEETS.ACTUALS);
    var data = sheet.getDataRange().getValues();
    var records = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (fy && row[1] !== fy) continue;
      if (month && row[2] !== month) continue;
      if (deptId && deptId !== 'ALL' && row[4] !== deptId) continue;

      records.push({
        id: row[0],
        financialYear: row[1],
        month: row[2],
        indicatorId: row[3],
        departmentId: row[4],
        targetValue: parseFloat(row[5]),
        actualValue: row[6] === '' || row[6] === null ? null : parseFloat(row[6]),
        variance: row[7] === '' ? null : parseFloat(row[7]),
        achievementPct: row[8] === '' ? null : parseFloat(row[8]),
        complianceStatus: row[9],
        remarks: row[10],
        uploadId: row[11],
        status: row[12],
        createdBy: row[13],
        createdAt: row[14],
        updatedBy: row[15],
        updatedAt: row[16],
        submittedBy: row[17],
        submittedAt: row[18],
        approvedBy: row[19],
        approvedAt: row[20]
      });
    }

    return { success: true, records: records };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Save Monthly Actual Value
 */
function saveMonthlyActual(recordData) {
  try {
    var userEmail = Session.getActiveUser().getEmail() || 'user@company.com';
    var ss = getDatabase_();
    var sheet = ss.getSheetByName(CONFIG.SHEETS.ACTUALS);
    var indSheet = ss.getSheetByName(CONFIG.SHEETS.INDICATORS);
    
    // Look up indicator metadata to run compliance formula
    var indData = indSheet.getDataRange().getValues();
    var indicator = null;
    for (var k = 1; k < indData.length; k++) {
      if (indData[k][0] === recordData.indicatorId) {
        indicator = {
          calcMethod: indData[k][9],
          tolMin: parseFloat(indData[k][10]),
          tolMax: parseFloat(indData[k][11]),
          target: parseFloat(indData[k][7])
        };
        break;
      }
    }

    var targetVal = recordData.targetValue !== undefined ? Number(recordData.targetValue) : (indicator ? indicator.target : 0);
    var actualVal = recordData.actualValue !== null && recordData.actualValue !== '' ? Number(recordData.actualValue) : null;
    
    var calc = evaluateCompliance_(
      indicator ? indicator.calcMethod : 'HIGHER_IS_BETTER',
      actualVal,
      targetVal,
      indicator ? indicator.tolMin : 0,
      indicator ? indicator.tolMax : 0
    );

    var data = sheet.getDataRange().getValues();
    var rowIndex = -1;
    var existingRecord = null;

    for (var i = 1; i < data.length; i++) {
      if (data[i][1] === recordData.financialYear && data[i][2] === recordData.month && data[i][3] === recordData.indicatorId) {
        rowIndex = i + 1;
        existingRecord = data[i];
        break;
      }
    }

    // Lock check: if already approved, normal users cannot silently edit
    if (existingRecord && existingRecord[12] === 'Approved') {
      var appConfig = getApplicationConfiguration();
      if (appConfig.user.role !== 'ADMIN') {
        return { success: false, error: 'Record is Approved and locked. Contact Administrator for an amendment.' };
      }
    }

    var nowIso = new Date().toISOString();
    var recordId = existingRecord ? existingRecord[0] : ('REC-' + Utilities.getUuid().substring(0, 8).toUpperCase());
    var status = existingRecord ? (existingRecord[12] === 'Approved' ? 'Approved' : 'Draft') : 'Draft';

    var rowValues = [
      recordId,
      recordData.financialYear,
      recordData.month,
      recordData.indicatorId,
      recordData.departmentId,
      targetVal,
      actualVal,
      calc.variance,
      calc.achievementPct,
      actualVal === null ? 'Not Reported' : calc.status,
      recordData.remarks || '',
      recordData.uploadId || (existingRecord ? existingRecord[11] : ''),
      status,
      existingRecord ? existingRecord[13] : userEmail,
      existingRecord ? existingRecord[14] : nowIso,
      userEmail,
      nowIso,
      existingRecord ? existingRecord[17] : '',
      existingRecord ? existingRecord[18] : '',
      existingRecord ? existingRecord[19] : '',
      existingRecord ? existingRecord[20] : ''
    ];

    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
      logAudit_(userEmail, 'UPDATE', 'ACTUALS', recordId, existingRecord[6], actualVal, 'Updated Monthly Actual');
    } else {
      sheet.appendRow(rowValues);
      logAudit_(userEmail, 'CREATE', 'ACTUALS', recordId, null, actualVal, 'Created Monthly Actual');
    }

    return {
      success: true,
      recordId: recordId,
      complianceStatus: rowValues[9],
      achievementPct: calc.achievementPct,
      variance: calc.variance
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Submit Monthly Record for Approval
 */
function submitMonthlyRecord(recordId, comments) {
  try {
    var userEmail = Session.getActiveUser().getEmail() || 'user@company.com';
    var ss = getDatabase_();
    var sheet = ss.getSheetByName(CONFIG.SHEETS.ACTUALS);
    var data = sheet.getDataRange().getValues();
    var foundIndex = -1;
    var row = null;

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === recordId) {
        foundIndex = i + 1;
        row = data[i];
        break;
      }
    }

    if (foundIndex === -1) return { success: false, error: 'Record not found' };
    if (row[6] === null || row[6] === '') return { success: false, error: 'Cannot submit a record without an actual value' };

    var nowIso = new Date().toISOString();
    sheet.getRange(foundIndex, 13).setValue('Submitted');
    sheet.getRange(foundIndex, 18).setValue(userEmail);
    sheet.getRange(foundIndex, 19).setValue(nowIso);

    // Record approval step
    recordApprovalStep_(recordId, row[12], 'Submitted', userEmail, comments || 'Submitted for department review');
    logAudit_(userEmail, 'SUBMIT', 'ACTUALS', recordId, row[12], 'Submitted', comments);

    return { success: true, message: 'Record successfully submitted for Department review' };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Review Monthly Record (Approve or Reject)
 */
function reviewMonthlyRecord(recordId, action, comments) {
  try {
    var userEmail = Session.getActiveUser().getEmail() || 'approver@company.com';
    var config = getApplicationConfiguration();
    if (config.user.role !== 'ADMIN' && config.user.role !== 'DEPT_HEAD') {
      return { success: false, error: 'Unauthorized: Approvals require Department Head or Administrator role.' };
    }

    if (action === 'REJECT' && (!comments || comments.trim() === '')) {
      return { success: false, error: 'Rejection comments are mandatory.' };
    }

    var ss = getDatabase_();
    var sheet = ss.getSheetByName(CONFIG.SHEETS.ACTUALS);
    var data = sheet.getDataRange().getValues();
    var foundIndex = -1;
    var row = null;

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === recordId) {
        foundIndex = i + 1;
        row = data[i];
        break;
      }
    }

    if (foundIndex === -1) return { success: false, error: 'Record not found' };

    var newStatus = action === 'APPROVE' ? 'Approved' : 'Rejected';
    var nowIso = new Date().toISOString();

    sheet.getRange(foundIndex, 13).setValue(newStatus);
    sheet.getRange(foundIndex, 20).setValue(userEmail);
    sheet.getRange(foundIndex, 21).setValue(nowIso);

    recordApprovalStep_(recordId, row[12], newStatus, userEmail, comments);
    logAudit_(userEmail, action, 'ACTUALS', recordId, row[12], newStatus, comments);

    return { success: true, status: newStatus };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Record Approval Step in Approval_History
 */
function recordApprovalStep_(recordId, prevStatus, newStatus, userEmail, comments) {
  var ss = getDatabase_();
  var appSheet = ss.getSheetByName(CONFIG.SHEETS.APPROVALS);
  if (!appSheet) return;
  var approvalId = 'APP-' + Utilities.getUuid().substring(0, 8).toUpperCase();
  appSheet.appendRow([
    approvalId,
    recordId,
    prevStatus,
    newStatus,
    userEmail,
    new Date().toISOString(),
    comments || ''
  ]);
}

/**
 * Upload SAP Report File to Google Drive
 */
function uploadSapReport(fileBase64, filename, metadata) {
  try {
    var userEmail = Session.getActiveUser().getEmail() || 'uploader@company.com';
    var props = PropertiesService.getScriptProperties();
    var rootFolderId = props.getProperty('DRIVE_FOLDER_ID');
    if (!rootFolderId) {
      initializeApplication();
      rootFolderId = props.getProperty('DRIVE_FOLDER_ID');
    }
    var rootFolder = DriveApp.getFolderById(rootFolderId);

    // Locate or create SAP_Uploads folder and FY subfolder
    var uploadsFolder = rootFolder.getFoldersByName('SAP_Uploads').next();
    var fyClean = (metadata.financialYear || 'FY_2026_2027').replace(/[^a-zA-Z0-9]/g, '_');
    var fyFolder = uploadsFolder.getFoldersByName(fyClean).hasNext() ? 
      uploadsFolder.getFoldersByName(fyClean).next() : uploadsFolder.createFolder(fyClean);

    var decoded = Utilities.base64Decode(fileBase64);
    var blob = Utilities.newBlob(decoded, 'application/octet-stream', filename);
    var file = fyFolder.createFile(blob);

    var uploadId = 'SAP-' + Utilities.getUuid().substring(0, 8).toUpperCase();
    var nowIso = new Date().toISOString();

    var ss = getDatabase_();
    var upSheet = ss.getSheetByName(CONFIG.SHEETS.UPLOADS);
    upSheet.appendRow([
      uploadId,
      filename,
      file.getId(),
      file.getUrl(),
      userEmail,
      nowIso,
      metadata.departmentId || 'ALL',
      metadata.financialYear || CONFIG.DEFAULT_FY,
      metadata.month || 'April',
      metadata.sapTCode || '',
      metadata.rowsProcessed || 0,
      metadata.rowsRejected || 0,
      'Completed',
      metadata.remarks || ''
    ]);

    logAudit_(userEmail, 'UPLOAD_SAP', 'SAP_UPLOADS', uploadId, null, filename, 'Uploaded SAP file');

    return {
      success: true,
      uploadId: uploadId,
      fileId: file.getId(),
      fileUrl: file.getUrl(),
      message: 'File securely stored in Drive and logged in database'
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Get Upload History
 */
function getUploadHistory() {
  try {
    var ss = getDatabase_();
    if (!ss) return { success: false, error: 'Database not initialized' };
    var sheet = ss.getSheetByName(CONFIG.SHEETS.UPLOADS);
    var data = sheet.getDataRange().getValues();
    var uploads = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      uploads.push({
        uploadId: row[0],
        fileName: row[1],
        fileId: row[2],
        driveLink: row[3],
        uploadedBy: row[4],
        uploadedAt: row[5],
        departmentId: row[6],
        financialYear: row[7],
        month: row[8],
        sapTCode: row[9],
        rowsProcessed: row[10],
        rowsRejected: row[11],
        status: row[12],
        remarks: row[13]
      });
    }

    return { success: true, uploads: uploads };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Get Corrective Actions (CAPA)
 */
function getCorrectiveActions(filters) {
  try {
    var ss = getDatabase_();
    if (!ss) return { success: false, error: 'Database not initialized' };
    var sheet = ss.getSheetByName(CONFIG.SHEETS.ACTIONS);
    var data = sheet.getDataRange().getValues();
    var actions = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (filters && filters.departmentId && filters.departmentId !== 'ALL' && row[2] !== filters.departmentId) continue;
      if (filters && filters.status && filters.status !== 'ALL' && row[12] !== filters.status) continue;

      actions.push({
        actionId: row[0],
        indicatorId: row[1],
        departmentId: row[2],
        financialYear: row[3],
        month: row[4],
        problemDescription: row[5],
        rootCause: row[6],
        correctiveAction: row[7],
        preventiveAction: row[8],
        assignedOwner: row[9],
        priority: row[10],
        dueDate: row[11],
        status: row[12],
        reviewerComments: row[13],
        createdAt: row[14],
        closedAt: row[15]
      });
    }

    return { success: true, actions: actions };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Save or Update Corrective Action
 */
function saveCorrectiveAction(actionData) {
  try {
    var userEmail = Session.getActiveUser().getEmail() || 'quality@company.com';
    var ss = getDatabase_();
    var sheet = ss.getSheetByName(CONFIG.SHEETS.ACTIONS);
    var actionId = actionData.actionId || ('CAPA-' + Utilities.getUuid().substring(0, 6).toUpperCase());
    var nowIso = new Date().toISOString();

    var data = sheet.getDataRange().getValues();
    var rowIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === actionId) {
        rowIndex = i + 1;
        break;
      }
    }

    var rowValues = [
      actionId,
      actionData.indicatorId,
      actionData.departmentId,
      actionData.financialYear || CONFIG.DEFAULT_FY,
      actionData.month || 'April',
      actionData.problemDescription,
      actionData.rootCause || '',
      actionData.correctiveAction,
      actionData.preventiveAction || '',
      actionData.assignedOwner || userEmail,
      actionData.priority || 'Medium',
      actionData.dueDate,
      actionData.status || 'Open',
      actionData.reviewerComments || '',
      rowIndex > 0 ? data[rowIndex - 1][14] : nowIso,
      actionData.status === 'Closed' ? nowIso : ''
    ];

    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, rowValues.length).setValues([rowValues]);
      logAudit_(userEmail, 'UPDATE', 'CAPA', actionId, null, actionData, 'Updated Corrective Action');
    } else {
      sheet.appendRow(rowValues);
      logAudit_(userEmail, 'CREATE', 'CAPA', actionId, null, actionData, 'Created Corrective Action');
    }

    return { success: true, actionId: actionId };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

/**
 * Get Audit Logs
 */
function getAuditLogs(limit, filters) {
  try {
    var config = getApplicationConfiguration();
    if (config.user.role !== 'ADMIN') {
      return { success: false, error: 'Access denied: Audit logs are restricted to Administrators' };
    }

    var ss = getDatabase_();
    if (!ss) return { success: false, error: 'Database not initialized' };
    var sheet = ss.getSheetByName(CONFIG.SHEETS.AUDIT);
    var data = sheet.getDataRange().getValues();
    var logs = [];
    var maxRows = limit || 150;

    for (var i = data.length - 1; i >= 1; i--) {
      var row = data[i];
      if (filters && filters.module && filters.module !== 'ALL' && row[3] !== filters.module) continue;
      logs.push({
        auditId: row[0],
        timestamp: row[1],
        userEmail: row[2],
        module: row[3],
        action: row[4],
        recordId: row[5],
        previousValue: row[6],
        newValue: row[7],
        details: row[8]
      });
      if (logs.length >= maxRows) break;
    }

    return { success: true, logs: logs };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}
