import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Enrollment } from '../models';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private base = `${environment.apiUrl}/Enrollment`;
  constructor(private http: HttpClient) {}

  enroll(courseId: number, employeeId: number) {
    return this.http.post<{ enrollmentId: number }>(this.base, { courseId, employeeId });
  }
}
