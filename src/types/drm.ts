export type UserRole = 'ADMIN' | 'DEPT_HEAD' | 'DEPT_USER';

export type ComplianceStatus = 'Compliant' | 'Non-Compliant' | 'Action Required' | 'Not Reported';

export type WorkflowStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';

export type CalculationMethod = 'HIGHER_IS_BETTER' | 'LOWER_IS_BETTER' | 'EQUAL_TO_TARGET' | 'WITHIN_RANGE';

export interface DrmIndicator {
  id: string;
  name: string;
  description: string;
  departmentId: string;
  sapTCode: string;
  unit: string;
  frequency: string;
  targetValue: number;
  targetType: 'MIN' | 'MAX' | 'EXACT' | 'RANGE';
  calculationMethod: CalculationMethod;
  toleranceMin: number;
  toleranceMax: number;
  responsibleUser: string;
  sapReportRequired: boolean;
  effectiveStart: string;
  effectiveEnd: string;
  status: 'ACTIVE' | 'INACTIVE';
  remarks?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headEmail: string;
  headName: string;
  active: boolean;
  description: string;
  indicatorCount: number;
}

export interface MonthlyRecord {
  id: string;
  financialYear: string;
  month: string;
  indicatorId: string;
  departmentId: string;
  targetValue: number;
  actualValue: number | null;
  variance: number | null;
  achievementPct: number | null;
  complianceStatus: ComplianceStatus;
  remarks: string;
  uploadId?: string;
  status: WorkflowStatus;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  submittedBy?: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface SapUpload {
  uploadId: string;
  fileName: string;
  fileId: string;
  driveLink: string;
  uploadedBy: string;
  uploadedAt: string;
  departmentId: string;
  financialYear: string;
  month: string;
  sapTCode: string;
  rowsProcessed: number;
  rowsRejected: number;
  status: 'Completed' | 'Pending' | 'Failed';
  remarks?: string;
}

export interface CorrectiveAction {
  actionId: string;
  indicatorId: string;
  departmentId: string;
  financialYear: string;
  month: string;
  problemDescription: string;
  rootCause: string;
  correctiveAction: string;
  preventiveAction: string;
  assignedOwner: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Pending Review' | 'Closed' | 'Overdue';
  reviewerComments?: string;
  createdAt: string;
  closedAt?: string;
}

export interface ApprovalLog {
  approvalId: string;
  recordId: string;
  previousStatus: WorkflowStatus;
  newStatus: WorkflowStatus;
  actionBy: string;
  actionAt: string;
  comments: string;
}

export interface AuditLog {
  auditId: string;
  timestamp: string;
  userEmail: string;
  module: string;
  action: string;
  recordId: string;
  previousValue?: string;
  newValue?: string;
  details: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  departmentId: string;
  status: 'ACTIVE' | 'INACTIVE';
}
