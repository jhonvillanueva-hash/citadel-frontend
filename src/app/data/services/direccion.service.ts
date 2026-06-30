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
}