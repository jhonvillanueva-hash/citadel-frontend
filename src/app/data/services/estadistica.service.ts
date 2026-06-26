import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EstadisticaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getEstadisticas(params?: {
    startDate?: string;
    endDate?: string;
    metric?: string;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const val = (params as any)[key];
        if (val !== undefined && val !== null) {
          httpParams = httpParams.append(key, val);
        }
      });
    }
    return this.http.get<any>(`${this.apiUrl}/admin/estadisticas`, {
      params: httpParams,
      withCredentials: true
    });
  }
}
