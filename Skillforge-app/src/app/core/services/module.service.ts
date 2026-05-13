import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Module, CreateModuleRequest, UpdateModuleRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class ModuleService {
  private base = `${environment.apiUrl}/Course`;
  constructor(private http: HttpClient) {}

  /** GET /api/v1/Course/modules?courseId=n */
  getAll(courseId?: number) {
    let params = new HttpParams();
    if (courseId != null) params = params.set('courseId', courseId);
    return this.http.get<Module[]>(`${this.base}/modules`, { params });
  }

  /** GET /api/v1/Course/modules/{id} */
  getById(id: number) {
    return this.http.get<Module>(`${this.base}/modules/${id}`);
  }

  /** POST /api/v1/Course/{courseId}/modules  — courseID goes in the URL */
  create(payload: CreateModuleRequest) {
    const { courseID, ...body } = payload;
    return this.http.post<{ message: string; moduleId: number }>(
      `${this.base}/${courseID}/modules`,
      body   // only title, contentURI, duration — no status, matches CreateModuleDto
    );
  }

  /** PUT /api/v1/Course/modules/{id} */
  update(id: number, payload: UpdateModuleRequest) {
    return this.http.put<{ message: string }>(`${this.base}/modules/${id}`, payload);
  }

  /** DELETE /api/v1/Course/modules/{id} */
  delete(id: number) {
    return this.http.delete<{ message: string }>(`${this.base}/modules/${id}`);
  }
}