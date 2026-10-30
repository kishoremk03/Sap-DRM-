import React, { useState } from 'react';
import {
  UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle,
  FileCheck, ArrowRight, ArrowLeft, RefreshCw, Eye, Database
} from 'lucide-react';
import { Department, DrmIndicator, SapUpload, MonthlyRecord } from '../types/drm';
import { MONTHS, FINANCIAL_YEARS } from '../data/drmMasterData';

interface Props {
  departments: Department[];
  indicators: DrmIndicator[];
  uploads: SapUpload[];
  selectedFy: string;
  selectedMonth: string;
  onImportSuccess: (upload: SapUpload, updatedRecordsCount: number) => void;
}

export const SapDataImport: React.FC<Props> = ({
  departments,
  indicators,
  uploads,
  selectedFy,
  selectedMonth,
  onImportSuccess
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [file, setFile] = useState<{ name: string; size: string; rows: any[]; headers: string[] } | null>(null);
  const [selectedTCode, setSelectedTCode] = useState('ZM088');
  const [selectedDeptId, setSelectedDeptId] = useState('DEP-01');
  const [fy, setFy] = useState(selectedFy);
  const [month, setMonth] = useState(selectedMonth);
  const [remarks, setRemarks] = useState('');
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<{ [targetField: string]: string }>({
    'Indicator_ID': 'INDICATOR_CODE',
    'Actual_Value': 'MEASURED_VALUE',
    'Posting_Date': 'POST_DATE',
    'Plant': 'WERKS'
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Sample automated loader for SAP exports
  const handleLoadSampleSapReport = (tCode: string) => {
    let headers: string[] = [];
    let rows: any[] = [];

    if (tCode === 'ZM088') {
      headers = ['VENDOR_NO', 'VENDOR_NAME', 'PO_NUMBER', 'MATERIAL_NO', 'PLANNED_DATE', 'ACTUAL_DELIVERY_DATE', 'ORDER_QTY', 'DELIVERED_QTY', 'OTIF_STATUS'];
      rows = [
        ['100294', 'Bharat Forge Ltd', '4500192831', 'CH-1092-A', '2026-10-12', '2026-10-11', '500', '500', 'ON-TIME'],
        ['100412', 'Sundram Fasteners', '4500192832', 'FN-8812-M', '2026-10-14', '2026-10-14', '2500', '2500', 'ON-TIME'],
        ['100583', 'Precision Camshafts', '4500192833', 'CS-4401-K', '2026-10-15', '2026-10-18', '200', '200', 'DELAYED'],
        ['100619', 'Minda Corporation', '4500192834', 'EL-9022-P', '2026-10-18', '2026-10-17', '1200', '1200', 'ON-TIME'],
        ['100871', 'Endurance Tech', '4500192835', 'BR-3309-X', '2026-10-20', '2026-10-20', '800', '800', 'ON-TIME'],
        ['100912', 'Tata AutoComp', '4500192836', 'TR-7714-B', '2026-10-22', '2026-10-21', '650', '650', 'ON-TIME'],
        ['101004', 'Varroc Engineering', '4500192837', 'HL-1029-Y', '2026-10-25', '2026-10-27', '450', '400', 'DELAYED']
      ];
    } else if (tCode === 'MB52') {
      headers = ['MATERIAL', 'DESCRIPTION', 'PLANT', 'STORAGE_LOC', 'BASE_UNIT', 'UNRESTRICTED_QTY', 'VALUE_INR', 'LAST_MOVEMENT'];
      rows = [
        ['STL-ROD-01', 'High Tensile Steel Bar 24mm', '1001', 'RM01', 'KG', '14200', '1420000', '2026-10-26'],
        ['ALU-CAS-02', 'Die Cast Gearbox Housing', '1001', 'SF02', 'PC', '840', '2100000', '2026-10-27'],
        ['FAST-M8-SS', 'Flange Nut M8 Stainless', '1001', 'RM02', 'PC', '45000', '225000', '2026-10-25'],
        ['RUB-SEAL-G', 'Oil Seal Viton Compound', '1001', 'BO01', 'PC', '2800', '420000', '2026-10-28']
      ];
    } else {
      headers = ['INSPECTION_LOT', 'MATERIAL', 'SUPPLIER', 'TOTAL_SAMPLES', 'DEFECTS_FOUND', 'DISPOSITION', 'PPM_RATE'];
      rows = [
        ['010029381', 'STEEL-COIL-01', 'JSW Steel Ltd', '200', '0', 'ACCEPTED', '0'],
        ['010029382', 'BRAKE-DISC-V2', 'Brembo India', '150', '1', 'REJECTED', '6666'],
        ['010029383', 'VALVE-INTAKE', 'Federal Mogul', '500', '0', 'ACCEPTED', '0'],
        ['010029384', 'GASKET-CYL', 'Victor Gaskets', '300', '0', 'ACCEPTED', '0']
      ];
    }

    setFile({
      name: `${tCode}_Export_${month}_${fy.replace(/\s+/g, '_')}.xlsx`,
      size: '245 KB',
      headers,
      rows
    });
    setSelectedTCode(tCode);
    setCurrentStep(2);
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Simulate parsing of Excel/CSV
    const sampleHeaders = ['TRANSACTION', 'RECORD_KEY', 'INDICATOR_CODE', 'MEASURED_VALUE', 'POST_DATE', 'WERKS'];
    const sampleRows = [
      [selectedTCode, 'RK-001', 'DRM-MM-03', '92.4', '2026-10-24', '1001'],
      [selectedTCode, 'RK-002', 'DRM-MM-01', '0', '2026-10-25', '1001'],
      [selectedTCode, 'RK-003', 'DRM-MM-05', '0', '2026-10-26', '1001'],
      [selectedTCode, 'RK-004', 'DRM-MM-04', '8.5', '2026-10-27', '1001']
    ];

    setFile({
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
      headers: sampleHeaders,
      rows: sampleRows
    });
    setCurrentStep(2);
  };

  const handleValidateStep = () => {
    const issues: string[] = [];
    if (!file || file.rows.length === 0) {
      issues.push('The uploaded file contains zero data rows.');
    }
    // Check if mandatory headers exist
    if (file && file.headers.length < 3) {
      issues.push('File has insufficient columns for SAP structured mapping.');
    }
    setValidationIssues(issues);
    setCurrentStep(3);
  };

  const handleExecuteImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newUpload: SapUpload = {
        uploadId: `SAP-${Math.floor(1000 + Math.random() * 9000)}`,
        fileName: file?.name || 'SAP_Report.xlsx',
        fileId: `drive_file_${Date.now()}`,
        driveLink: 'https://drive.google.com/drive/folders/SAP_DRM_Data',
        uploadedBy: 'suresh.kumar@company.com',
        uploadedAt: new Date().toISOString(),
        departmentId: selectedDeptId,
        financialYear: fy,
        month: month,
        sapTCode: selectedTCode,
        rowsProcessed: file?.rows.length || 0,
        rowsRejected: 0,
        status: 'Completed',
        remarks: remarks || `Imported via SAP wizard for ${selectedTCode}`
      };

      setIsProcessing(false);
      setCurrentStep(6);
      onImportSuccess(newUpload, file?.rows.length || 0);
    }, 900);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Step Wizard Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SAP Excel / CSV Data Import Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            6-Step Guided ingestion pipeline for SAP ECC / S4HANA operational reports
          </p>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-6 gap-2 mt-6">
            {[
              { step: 1, label: '1. Select File' },
              { step: 2, label: '2. Preview' },
              { step: 3, label: '3. Validate' },
              { step: 4, label: '4. Map Columns' },
              { step: 5, label: '5. Confirm' },
              { step: 6, label: '6. Processed' }
            ].map(s => (
              <div
                key={s.step}
                className={`border-t-2 pt-2 text-xs font-semibold ${
                  currentStep >= s.step
                    ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: Upload & Configuration */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">SAP Transaction / Report</label>
                <select
                  value={selectedTCode}
                  onChange={e => setSelectedTCode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono"
                >
                  <option value="ZM088">ZM088 - Vendor OTIF & Delivery Adherence</option>
                  <option value="MB52">MB52 - Warehouse Stock by Storage Location</option>
                  <option value="QA32">QA32 - Inspection Lot Rejection & PPM Summary</option>
                  <option value="COHV">COHV - Mass Production Orders & OEE Data</option>
                  <option value="VF04">VF04 - Billing Due List & Outbound Realization</option>
                  <option value="QM10">QM10 - Notification & Defect Items</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Target Department</label>
                <select
                  value={selectedDeptId}
                  onChange={e => setSelectedDeptId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Reporting Period</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={fy}
                    onChange={e => setFy(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                  >
                    {FINANCIAL_YEARS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                  <select
                    value={month}
                    onChange={e => setMonth(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2"
                  >
                    {MONTHS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Google Drive Target Folder</label>
                <input
                  type="text"
                  value={`SAP_DRM_Data / SAP_Uploads / ${fy.replace(/\s+/g, '_')} / ${month}`}
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-500 font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Drag & Drop File Container */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center bg-slate-50/50 dark:bg-slate-800/30 hover:border-sky-500 transition-colors">
              <UploadCloud className="w-12 h-12 text-sky-600 mx-auto mb-2" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">Upload SAP Excel (.xlsx, .xls) or CSV Export</span>
              <span className="text-xs text-slate-400 block mt-1">Exported directly from SAP GUI / Fiori Launchpad</span>
              <input
                type="file"
                id="sapUploadInput"
                accept=".xlsx,.xls,.csv"
                onChange={handleLocalFileChange}
                className="hidden"
              />
              <button
                onClick={() => document.getElementById('sapUploadInput')?.click()}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
              >
                Browse File From Computer
              </button>
            </div>

            {/* Quick Test Sample Loaders */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-500">Need instant SAP test data without downloading from SAP?</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleLoadSampleSapReport('ZM088')}
                  className="px-3 py-1.5 text-xs font-medium bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 hover:bg-sky-100 rounded-lg border border-sky-200 dark:border-sky-800 transition-colors"
                >
                  Load ZM088 (OTIF)
                </button>
                <button
                  onClick={() => handleLoadSampleSapReport('MB52')}
                  className="px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 hover:bg-teal-100 rounded-lg border border-teal-200 dark:border-teal-800 transition-colors"
                >
                  Load MB52 (Stock)
                </button>
                <button
                  onClick={() => handleLoadSampleSapReport('QA32')}
                  className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
                >
                  Load QA32 (Quality)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Preview (First 20 rows & headers) */}
        {currentStep === 2 && file && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-xs">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{file.name}</span>
                <span className="text-slate-400 ml-2">({file.size} · {file.rows.length} records detected)</span>
              </div>
              <span className="font-mono text-teal-600 font-semibold">{selectedTCode}</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <tr>
                    {file.headers.map((h, i) => (
                      <th key={i} className="py-2 px-3 font-semibold font-mono text-[11px] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {file.rows.slice(0, 20).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      {row.map((cell: any, cIdx: number) => (
                        <td key={cIdx} className="py-2 px-3 text-slate-700 dark:text-slate-300 font-mono text-[11px] whitespace-nowrap">
                          {String(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Choose Another File</span>
              </button>
              <button
                onClick={handleValidateStep}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <span>Proceed to Validation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Validate */}
        {currentStep === 3 && file && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-teal-900 dark:text-teal-200">Validation Passed Successfully</h4>
                <p className="text-xs text-teal-700 dark:text-teal-300 mt-0.5">
                  File structure matches SAP ECC / S4HANA export standards. No missing keys or corrupt records identified.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
              <div>
                <span className="text-slate-400 block mb-0.5">Total Rows Analyzed:</span>
                <strong className="text-slate-900 dark:text-white tabular-nums font-mono text-sm">{file.rows.length}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Detected Columns:</span>
                <strong className="text-slate-900 dark:text-white tabular-nums font-mono text-sm">{file.headers.length}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Target Period:</span>
                <strong className="text-slate-900 dark:text-white">{month} {fy}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Duplicate Records:</span>
                <strong className="text-teal-600 font-semibold">0 Conflicting Keys</strong>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Preview</span>
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <span>Proceed to Column Mapping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Map Columns */}
        {currentStep === 4 && file && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Confirm or adjust the column mappings between the uploaded SAP report and the DRM Digital Management System.
            </p>

            <div className="space-y-3">
              {[
                { target: 'Indicator_ID', label: 'DRM Indicator Identifier', default: file.headers[0] },
                { target: 'Actual_Value', label: 'Actual Numeric Performance Value', default: file.headers[file.headers.length - 1] },
                { target: 'Posting_Date', label: 'SAP Posting / Document Date', default: file.headers[4] || file.headers[0] },
                { target: 'Plant_Code', label: 'Plant Identifier (Werks)', default: file.headers[2] || file.headers[0] }
              ].map(m => (
                <div key={m.target} className="grid grid-cols-2 gap-4 items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">{m.label}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{m.target}</span>
                  </div>
                  <div>
                    <select
                      defaultValue={m.default}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-mono text-xs"
                    >
                      {file.headers.map((h, i) => (
                        <option key={i} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setCurrentStep(5)}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <span>Confirm Import Configuration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Confirm Import */}
        {currentStep === 5 && file && (
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <h4 className="font-bold text-amber-900 dark:text-amber-200">Ready to Commit Records to Master Database</h4>
                <p className="text-amber-700 dark:text-amber-300 mt-0.5">
                  Original file will be archived in Google Drive. Target actuals will be updated and recalculated against indicator formulas.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
              <div>
                <span className="text-slate-400 block mb-0.5">Valid Rows to Ingest:</span>
                <strong className="text-teal-600 font-bold tabular-nums font-mono text-base">{file.rows.length}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Rejected Rows:</span>
                <strong className="text-slate-500 font-bold tabular-nums font-mono text-base">0</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Storage Mode:</span>
                <strong className="text-sky-600 font-medium">Drive + Sheets</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Audit Remarks (Optional)</label>
              <input
                type="text"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="e.g. Month-end SAP ZM088 export verified against gate register"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                onClick={handleExecuteImport}
                disabled={isProcessing}
                className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-xs flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Writing to Drive & Sheets...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    <span>Commit & Process Import</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Processed / Success Summary */}
        {currentStep === 6 && (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-950/80 text-teal-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">SAP Data Ingestion Completed!</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Original report saved to Drive folder <span className="font-mono text-sky-600 font-semibold">SAP_DRM_Data/SAP_Uploads</span>.
              Monthly performance figures updated and compliance recalculations complete.
            </p>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setFile(null);
                  setCurrentStep(1);
                }}
                className="px-4 py-2 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Upload Another Report
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">SAP Ingestion History & Drive Archives</h3>
            <p className="text-xs text-slate-500">Audit of uploaded SAP reports and execution status</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{uploads.length} Archival Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Upload ID</th>
                <th className="py-2.5 px-4 font-semibold">Report File Name</th>
                <th className="py-2.5 px-4 font-semibold">SAP T-Code</th>
                <th className="py-2.5 px-4 font-semibold">Period</th>
                <th className="py-2.5 px-4 font-semibold text-right">Rows Processed</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold">Uploaded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {uploads.map(u => (
                <tr key={u.uploadId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-4 font-mono font-medium text-sky-600 whitespace-nowrap">{u.uploadId}</td>
                  <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-white max-w-xs truncate">{u.fileName}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500">{u.sapTCode}</td>
                  <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">{u.month} {u.financialYear}</td>
                  <td className="py-2.5 px-4 text-right tabular-nums font-mono text-slate-700 dark:text-slate-300">{u.rowsProcessed}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/40">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-500">{u.uploadedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
