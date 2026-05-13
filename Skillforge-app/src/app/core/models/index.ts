export type UserRole = 'Employee' | 'Trainer' | 'Manager' | 'HR' | 'Admin';

export interface User {
  userID: number;
  userName: string;
  email: string;
  roleName: UserRole;
  phone: string;
  status: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  password: string;
}

export interface JwtPayload {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  exp: number;
  iss: string;
  aud: string;
}

export interface Course {
  courseID: number;
  title: string;
  description: string;
  trainerID: number;
  duration: number;
  status: boolean;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  trainerID: number;
  duration: number;
  status: boolean;
}

export interface Enrollment {
  enrollmentId?: number;
  employeeName?: string;
  courseName?: string;
  courseId: number;
  employeeId: number;
  enrollmentDate?: string;
  status?: string;
  attendance?: string;
}

export interface SfNotification {
  notificationId: number;
  userId: number;
  courseId?: number;
  message: string;
  category: string;
  status: string;
  createdDate: string;
}

export interface Certification {
  certificationId?: number;
  employeeId?: number;
  employeeName?: string;
  courseId?: number;
  courseName?: string;
  issuedDate?: string;
  expiryDate?: string;
  status?: string;
}

export interface Assessment {
  assessmentId?: number;
  courseId?: number;
  courseName?: string;
  type?: string;
  maxScore?: number;
  scheduledDate?: string;
}

export interface CompetencyMatrix {
  competencyId?: number;
  competencyName?: string;
  description?: string;
  level?: string;
  gap?: string;
}

export interface ComplianceRecord {
  recordId?: number;
  employeeId?: number;
  employeeName?: string;
  certificationName?: string;
  status?: string;
  date?: string;
}

export interface AuditLog {
  logId?: number;
  userId?: number;
  userName?: string;
  action?: string;
  resource?: string;
  timestamp?: string;
}

// API response shapes for compliance & audit
export interface AuditLogItem {
  auditID: number;
  userID?: number;
  action: string;
  resource: string;
  timestamp: string;
}

export interface ComplianceItem {
  complianceId: number;
  employeeId: number;
  employeeName: string;
  certificationId: number;
  courseName: string;
  status: boolean;
  date: string;
}

export interface ComplianceSummary {
  totalEmployees: number;
  compliantCount: number;
  nonCompliantCount: number;
  complianceRate: number;
  records: ComplianceItem[];
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  statusCode?: number;
}

export interface AssessmentFilter {
  courseId?: number;
  type?: string;
  fromDate?: string;
  toDate?: string;
}

export interface CreateAssessmentRequest {
  courseId: number;
  type: string;       // 'Quiz' | 'Exam' | 'Practical'
  maxScore: number;
  scheduledDate?: string;
}

export interface UpdateAssessmentRequest {
  type?: string;
  maxScore?: number;
  scheduledDate?: string;
}

export interface AssessmentResult {
  assessmentID: number;
  employeeID: number;
  employeeName?: string;
  score: number;
  status: string;    // true = pass, false = fail
  reviewerId?: number;
}

export interface SubmitResultRequest {
  assessmentId: number;
  employeeId: number;
  score: number;
}

export interface UpdateResultRequest {
  score: number;
}

