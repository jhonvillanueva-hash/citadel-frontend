import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService, PathConfig } from '../../core/services/base-http.service';
import { Direccion } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class DireccionService extends BaseHttpService<Direccion> {
  protected pathConfig: PathConfig = {
    strategy: 'admin-me',
    endpoint: 'direcciones'
  };

  obtenerPrincipal(): Observable<Direccion> {
    return this.http.get<Direccion>(`${this.fullUrl}/principal`, {
      withCredentials: true
    });
  }

  actualizarPrincipal(
    direccion: Partial<Direccion>
  ): Observable<Direccion> {
    return this.http.patch<Direccion>(
      `${this.fullUrl}/principal`,
      direccion,
      {
        withCredentials: true
      }
    );
  }

  override getAll(): Observable<Direccion[]> {
    return this.http.get<Direccion[]>(this.fullUrl, { withCredentials: true });
  }

  override create(direccion: Partial<Direccion>): Observable<Direccion> {
    return this.http.post<Direccion>(this.fullUrl, direccion, { withCredentials: true });
  }

  override update(id: number, direccion: Partial<Direccion>): Observable<Direccion> {
    return this.http.put<Direccion>(`${this.fullUrl}/${id}`, direccion, { withCredentials: true });
  }

  override delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.fullUrl}/${id}`, { withCredentials: true });
  }
}