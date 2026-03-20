import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export type PathStrategy = 'admin-public' | 'admin-me' | 'admin-me-custom';

export interface PathConfig {
  strategy: PathStrategy;
  endpoint: string;
  customAdminEndpoint?: string;
}

export abstract class BaseHttpService<T> {
    protected http = inject(HttpClient);
    protected authService = inject(AuthService);
    protected apiUrl = environment.apiUrl;

    protected abstract pathConfig: PathConfig;

    private cache = new Map<string, { data: any; expiry: number }>();
    private ttl = 60000;

    protected get fullUrl(): string {
        return `${this.apiUrl}${this.getPath()}`;
    }

    protected getPath(): string {
        const user = this.authService.currentUser();
        const isAdmin = user?.tipo === 'A';
        const { strategy, endpoint, customAdminEndpoint } = this.pathConfig;

        switch (strategy) {
        case 'admin-public':
            return isAdmin ? `/admin/${endpoint}` : `/public/${endpoint}`;
        
        case 'admin-me':
            return isAdmin ? `/admin/${endpoint}` : `/me/${endpoint}`;
        
        case 'admin-me-custom':
            const adminEndpoint = customAdminEndpoint || endpoint;
            return isAdmin ? `/admin/${adminEndpoint}` : `/me/${endpoint}`;
        
        default:
            return `/${endpoint}`;
        }
    }

    getAll(params?: {
        limit?: number;
        offset?: number;
        [key: string]: any;
    }): Observable<T[]> {
        const key = `${this.fullUrl}?${JSON.stringify(params || {})}`;
        const cached = this.cache.get(key);

        if (cached && cached.expiry > Date.now()) {
            return of(cached.data);
        }

        return this.http.get<T[]>(this.fullUrl, {
            params: this.createParams(params),
            withCredentials: true,
        }).pipe(
            tap(data => {
            this.cache.set(key, {
                data,
                expiry: Date.now() + this.ttl
            });
            })
        );
    }

    getById(id: number | string): Observable<T> {
        return this.http.get<T>(`${this.fullUrl}/${id}`, { withCredentials: true });
    }

    create(data: Partial<T>): Observable<T> {
        return this.http.post<T>(this.fullUrl, data, {
            withCredentials: true
        }).pipe(
            tap(() => {
            this.cache.clear();
            })
        );
    }

    update(id: number | string, data: Partial<T>): Observable<T> {
        return this.http.put<T>(`${this.fullUrl}/${id}`, data, { withCredentials: true });
    }

    patch(id: number | string, data: Partial<T>): Observable<T> {
        return this.http.patch<T>(`${this.fullUrl}/${id}`, data, { withCredentials: true });
    }

    delete(id: number | string): Observable<void> {
        return this.http.delete<void>(`${this.fullUrl}/${id}`, { withCredentials: true });
    }

    findByField(campo: string, valor: any): Observable<T[]> {
        return this.http.post<T[]>(`${this.fullUrl}/buscar`, {
            campo,
            valor,
        }, { withCredentials: true });
    }

    private createParams(queryParams: any): HttpParams {
        let params = new HttpParams();
        if (queryParams) {
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] !== null && queryParams[key] !== undefined) {
                    params = params.append(key, queryParams[key]);
                }
            });
        }
        return params;
    }
}
