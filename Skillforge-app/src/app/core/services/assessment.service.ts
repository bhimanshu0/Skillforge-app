// src/app/core/services/assessment.service.ts
// REPLACE entire file with this

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Assessment,
  AssessmentFilter,
  CreateAssessmentRequest,
  UpdateAssessmentRequest,
  AssessmentResult,
  SubmitResultRequest,
  UpdateResultRequest,
} from '../models';

// Backend AssessmentType enum: 0=Quiz, 1=Exam, 2=Practical
const TYPE_TO_INT: Record<string, number> = { Quiz: 0, Exam: 1, Practical: 2 };
const INT_TO_TYPE: Record<number, string> = { 0: 'Quiz', 1: 'Exam', 2: 'Practical' };

// Backend ResultStatus enum: 0=Pass, 1=Fail
const INT_TO_STATUS: Record<number, string> = { 0: 'Pass', 1: 'Fail' };

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private base       = `${environment.apiUrl}/Assessment`;
  private resultBase = `${environment.apiUrl}/Result`;

  constructor(private http: HttpClient) {}

  // ── Assessment CRUD ───────────────────────────────────────────────────────

  getAll(filter?: AssessmentFilter) {
    let params = new HttpParams();
    if (filter?.courseId) params = params.set('courseId', filter.courseId);
    if (filter?.type)     params = params.set('type',     TYPE_TO_INT[filter.type] ?? filter.type);
    if (filter?.fromDate) params = params.set('fromDate', filter.fromDate);
    if (filter?.toDate)   params = params.set('toDate',   filter.toDate);

    return this.http.get<any[]>(`${this.base}/get-assessments`, { params }).pipe(
      map(list => list.map(a => this.mapAssessment(a)))
    );
  }

  getById(id: number) {
    return this.http.get<any>(`${this.base}/get-assessment/${id}`).pipe(
      map(a => this.mapAssessment(a))
    );
  }

  create(payload: CreateAssessmentRequest) {
    return this.http.post<{ assessmentId: number }>(
      `${this.base}/save-assessments`,
      {
        courseId: payload.courseId,
        type:     TYPE_TO_INT[payload.type],   // send int not string
        maxScore: payload.maxScore,
      }
    );
  }

  update(id: number, payload: UpdateAssessmentRequest) {
    return this.http.put<{ message: string }>(
      `${this.base}/update-assessment/${id}`,
      {
        type:     TYPE_TO_INT[payload.type],   // send int not string
        maxScore: payload.maxScore,
      }
    );
  }

  delete(id: number) {
    return this.http.delete<{ message: string }>(`${this.base}/delete-assessment/${id}`);
  }

  // ── Results ───────────────────────────────────────────────────────────────

  // Backend returns: { EmployeeID, Score, Status (enum int) }
  // We inject assessmentId ourselves since backend doesn't return it
 getResults(assessmentId: number) {
  return this.http.get<any[]>(`${this.resultBase}/${assessmentId}`).pipe(
    map(list => list.map(r => ({
      assessmentId: assessmentId,   // ← injected from parameter
      employeeID:   r.employeeID ?? r.EmployeeID,
      employeeName: r.employeeName ?? r.EmployeeName,
      score:        r.score        ?? r.Score,
      status:       INT_TO_STATUS[r.status ?? r.Status] ?? String(r.status ?? r.Status),
    } as AssessmentResult)))
  );
}

  submitResult(payload: SubmitResultRequest) {
    return this.http.post<{ message: string }>(this.resultBase, payload);
  }

  updateResult(assessmentId: number, employeeId: number, payload: UpdateResultRequest) {
    return this.http.put<{ message: string }>(
      `${this.resultBase}/${assessmentId}/${employeeId}`,
      payload
    );
  }

  deleteResult(assessmentId: number, employeeId: number) {
    return this.http.delete<{ message: string }>(
      `${this.resultBase}/${assessmentId}/${employeeId}`
    );
  }

  // ── Helper ────────────────────────────────────────────────────────────────

  private mapAssessment(a: any): Assessment {
    return {
      assessmentId: a.assessmentId ?? a.assessmentID,
      courseId:     a.courseId     ?? a.courseID,
      courseName:   a.courseName,
      type:         INT_TO_TYPE[a.type] ?? String(a.type),  // convert int → string
      maxScore:     a.maxScore,
      date:         a.date,
      scheduledDate: a.date,
    };
  }
}