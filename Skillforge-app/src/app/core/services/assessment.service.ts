// src/app/core/services/assessment.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private base = `${environment.apiUrl}/Assessment`;
  private resultBase = `${environment.apiUrl}/Result`;

  constructor(private http: HttpClient) {}

  // ── Assessment CRUD ───────────────────────────────────────────────────────

  getAll(filter?: AssessmentFilter) {
    let params = new HttpParams();
    if (filter?.courseId)   params = params.set('courseId',   filter.courseId);
    if (filter?.type)       params = params.set('type',       filter.type);
    if (filter?.fromDate)   params = params.set('fromDate',   filter.fromDate);
    if (filter?.toDate)     params = params.set('toDate',     filter.toDate);
    return this.http.get<Assessment[]>(`${this.base}/get-assessments`, { params });
  }

  getById(id: number) {
    return this.http.get<Assessment>(`${this.base}/get-assessment/${id}`);
  }

  create(payload: CreateAssessmentRequest) {
    return this.http.post<{ assessmentId: number }>(`${this.base}/save-assessments`, payload);
  }

  update(id: number, payload: UpdateAssessmentRequest) {
    return this.http.put<{ message: string }>(`${this.base}/update-assessment/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<{ message: string }>(`${this.base}/delete-assessment/${id}`);
  }

  // ── Results ───────────────────────────────────────────────────────────────

  getResults(assessmentId: number) {
    return this.http.get<AssessmentResult[]>(`${this.resultBase}/${assessmentId}`);
  }

  submitResult(payload: SubmitResultRequest) {
    return this.http.post<{ message: string }>(this.resultBase, payload);
  }

  updateResult(assessmentId: number, employeeId: number, payload: UpdateResultRequest) {
    return this.http.put<{ message: string }>(`${this.resultBase}/${assessmentId}/${employeeId}`, payload);
  }

  deleteResult(assessmentId: number, employeeId: number) {
    return this.http.delete<{ message: string }>(`${this.resultBase}/${assessmentId}/${employeeId}`);
  }
}
