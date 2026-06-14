import { Injectable } from '@angular/core';
import { BaseHttpService, PathConfig } from '../../core/services/base-http.service';
import { Carrito, HistorialPedido } from '../models/api.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CarritoService extends BaseHttpService<Carrito> {
  protected pathConfig: PathConfig = {
    strategy: 'admin-me',
    endpoint: 'carritos'
  };

  getHistory(id: number): Observable<HistorialPedido[]> {
    return this.http.get<HistorialPedido[]>(
      `${this.fullUrl}/${id}/historial`,
      { withCredentials: true }
    );
  }
}
