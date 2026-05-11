import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SfNotification } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private base = `${environment.apiUrl}/Notification`;
  constructor(private http: HttpClient) {}

  getAll(category?: string) {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    return this.http.get<{ data: SfNotification[]; message?: string }>(this.base, { params }).pipe(
      map(res => res?.data ?? [])
    );
  }

  markAsRead(id: number) {
    return this.http.patch<{ message: string; data: SfNotification }>(`${this.base}/${id}`, {});
  }
}
