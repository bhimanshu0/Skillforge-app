import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Course, CreateCourseRequest, ApiResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private base = `${environment.apiUrl}/Course`;
  constructor(private http: HttpClient) {}

  getAll(trainerId?: number) {
    let params = new HttpParams();
    if (trainerId != null) params = params.set('trainerId', trainerId);
    return this.http.get<Course[]>(this.base, { params });
  }

  getById(id: number) {
    return this.http.get<ApiResponse<Course>>(`${this.base}/${id}`)
      .pipe(map(res => (res as any)?.data ?? res));
  }

  create(payload: CreateCourseRequest) {
    return this.http.post<ApiResponse<Course>>(this.base, payload);
  }

  updateStatus(id: number, status: boolean) {
    return this.http.patch<{ message: string }>(`${this.base}/${id}/status`, { status });
  }
}
