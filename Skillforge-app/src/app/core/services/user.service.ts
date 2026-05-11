import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = `${environment.apiUrl}/User`;
  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<User[]>(`${this.base}/GetAll`); }
  update(id: number, payload: Partial<User>) { return this.http.put<string>(`${this.base}/update/${id}`, payload); }
  updateStatus(id: number, status: boolean) { return this.http.patch<{ message: string }>(`${this.base}/${id}/status`, { status }); }
  delete(id: number) { return this.http.delete<string>(`${this.base}/${id}`); }
}
