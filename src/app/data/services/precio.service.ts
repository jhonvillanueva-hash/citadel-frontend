import { Injectable } from '@angular/core';
import { BaseHttpService, PathConfig } from '../../core/services/base-http.service';
import { Precio } from '../models/api.models';
import { Observable, of, tap } from 'rxjs';
import { signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PrecioService extends BaseHttpService<Precio> {
  protected pathConfig: PathConfig = {
    strategy: 'admin-public',
    endpoint: 'precios'
  };

  private preciosCache = signal<Precio[] | null>(null);

  override getAll(params?: {
    limit?: number;
    offset?: number;
    [key: string]: any;
  }): Observable<Precio[]> {

    if (this.preciosCache()) {
      return of(this.preciosCache()!);
    }

    return super.getAll(params).pipe(
      tap(data => this.preciosCache.set(data))
    );
  }
}
