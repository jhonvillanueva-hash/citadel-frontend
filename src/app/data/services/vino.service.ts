import { Injectable, signal } from '@angular/core';
import { BaseHttpService, PathConfig } from '../../core/services/base-http.service';
import { Vino } from '../models/api.models';
import { Observable, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VinoService extends BaseHttpService<Vino> {
  protected pathConfig: PathConfig = {
    strategy: 'admin-public',
    endpoint: 'vinos'
  };

  private vinosCache = signal<Vino[] | null>(null);

  override getAll(params?: {
    limit?: number;
    offset?: number;
    [key: string]: any;
  }): Observable<Vino[]> {

    if (this.vinosCache()) {
      return of(this.vinosCache()!);
    }

    return super.getAll(params).pipe(
      tap(data => this.vinosCache.set(data))
    );
  }

  createWithImage(formData: FormData): Observable<Vino> {
    return this.http
      .post<Vino>(this.fullUrl, formData, { withCredentials: true })
      .pipe(
        tap(() => this.invalidateCache())
      );
  }

  updateWithImage(id: number | string, formData: FormData): Observable<Vino> {
    return this.http
      .put<Vino>(`${this.fullUrl}/${id}`, formData, { withCredentials: true })
      .pipe(
        tap(() => this.invalidateCache())
      );
  }

  private invalidateCache(): void {
    this.vinosCache.set(null);
  }
}