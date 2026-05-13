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

// Backend AssessmentListDto returns:
// { assessmentId, courseId, type (enum int), maxScore, date }
export interface Assessment {
  assessmentId?: number;   // matches AssessmentListDto.AssessmentId
  courseId?: number;       // matches AssessmentListDto.CourseId
  courseName?: string;
  type?: string;           // we convert enum int → string on display
  maxScore?: number;
  date?: string;           // matches AssessmentListDto.Date
  scheduledDate?: string;
}

// Backend ResultViewDto returns:
// { employeeID, score, status (enum: 0=Pass,1=Fail) }
// NOTE: assessmentID is NOT returned by backend — we carry it from the parent assessment
export interface AssessmentResult {
  assessmentId: number;    // we set this ourselves from the parent assessment
  employeeID: number;      // matches ResultViewDto.EmployeeID
  employeeName?: string;
  score: number;           // matches ResultViewDto.Score
  status: string;          // we convert 0→'Pass', 1→'Fail' in the service
}

export interface AssessmentFilter {
  courseId?: number;
  type?: string;
  fromDate?: string;
  toDate?: string;
}

export interface CreateAssessmentRequest {
  courseId: number;
  type: string;       // 'Quiz' | 'Exam' | 'Practical' — converted to int in service
  maxScore: number;
}

export interface UpdateAssessmentRequest {
  type: string;       // required in backend UpdateAssessmentRequestDto
  maxScore: number;   // required in backend UpdateAssessmentRequestDto
}

// Backend SubmitAssessmentResultDto:
// { AssessmentID, EmployeeID, Score }
export interface SubmitResultRequest {
  AssessmentID: number;   // uppercase — exact match to C# property
  EmployeeID: number;     // uppercase — exact match to C# property
  Score: number;          // uppercase — exact match to C# property
}

// Backend UpdateResultDto:
// { Score }
export interface UpdateResultRequest {
  Score: number;          // uppercase — exact match to C# property
}

