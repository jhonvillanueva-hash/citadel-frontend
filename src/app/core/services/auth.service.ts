import { Injectable, signal, inject, computed, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, finalize, BehaviorSubject, of } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

export interface User {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  email: string;
  dni: string;
  telefono: string;
  direccion?: string;
  ciudad?: string;
  url_img?: string;
  tipo: 'A' | 'U';
}

export interface LoginResponse {
  accessToken: string;
  csrfToken: string;
}

export interface RegisterResponse extends User {
  hash_contrasena?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  //Dependencias y Configuración
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly LOGGED_IN_KEY = 'isLogged';

  //Estado Reactivo (Signals)
  public isInitializing = signal(true);
  private _currentUser = signal<User | null>(null);
  public currentUser = this._currentUser.asReadonly();
  public isAuthenticated = computed(() => !!this._currentUser());
  private _accessToken: string | null = null;
  public get accessToken(): string | null {
    return this._accessToken;
  }
  private _csrfToken: string | null = null;
  public get csrfToken(): string | null {
    return this._csrfToken;
  }

  //Region Manejo de Cola de Refresco (Semáforo)
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  public get isRefreshingToken(): boolean {
    return this.isRefreshing;
  }

  public get refreshTokenStream$(): Observable<string | null> {
    return this.refreshTokenSubject.asObservable();
  }

  public notifyRefreshTokenStart(): void {
    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);
  }

  public notifyRefreshTokenSuccess(token: string): void {
    this.isRefreshing = false;
    this.refreshTokenSubject.next(token);
  }

  public notifyRefreshTokenError(error: any): void {
    this.isRefreshing = false;
    this.refreshTokenSubject.error(error);
    this.refreshTokenSubject = new BehaviorSubject<string | null>(null);
    this.handleLogout();
  }

  constructor() {
    if (!this.hasLoggedInFlag()) {
      this.isInitializing.set(false);
    }
  }

  //LLamadas a API
  register(data: any): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, data);
  }

  login(credentials: { email: string; contrasena: string }): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(res => this.handleLoginSuccess(res.accessToken, res.csrfToken)),
        finalize(() => this.isInitializing.set(false))
      );
  }

  logout(): void {
    this.http
      .post(`${this.apiUrl}/logout`, {}, {
        withCredentials: true
      })
      .pipe(
        catchError(() => of(null)),
        finalize(() => this.handleLogout())
      )
      .subscribe();
  }

  refreshToken(): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/refresh`, {}, {
        withCredentials: true
      })
      .pipe(
        tap(res => {
          this.handleLoginSuccess(res.accessToken, res.csrfToken);
        }),
        catchError(err => {
          if (err.status === 401 || err.status === 403) {
            this.handleLogout();
          }
          return throwError(() => err);
        }),
        finalize(() => this.isInitializing.set(false))
      );
  }

  getRedirectUrl(): string {
    const user = this._currentUser();
    if (!user) return '/login';
    return user.tipo === 'A' ? '/admin' : '/';
  }

  loginWithGoogle(idToken: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${this.apiUrl}/google`,
        { idToken },
        { withCredentials: true }
      )
      .pipe(
        tap(res => this.handleLoginSuccess(res.accessToken, res.csrfToken))
      );
  }

  //Lógica Interna de Sesión
  private handleLoginSuccess(token: string, csrfToken: string): void {
    this._csrfToken = csrfToken;
    this.setSession(token);
    if (this.isBrowser()) {
      localStorage.setItem(this.LOGGED_IN_KEY, 'true');
    }
  }

  public handleLogout(): void {
    this.clearSession();
    if (this.isBrowser()) {
      localStorage.removeItem(this.LOGGED_IN_KEY);
    }
    this.router.navigate(['/']);
  }

  setUser(user: User): void {
    this._currentUser.set(user);
  }

  private setSession(token: string): void {
    this._accessToken = token;
    try {
      const payload = this.decodeToken(token);
      this._currentUser.set({
        id_usuario: payload.id,
        email: payload.email,
        tipo: payload.tipo,
        nombres: payload.nombres || '',
        apellidos: payload.apellidos || '',
        dni: payload.dni || '',
        telefono: payload.telefono || '',
      });
    } catch {
      this.clearSession();
    }
  }

  private clearSession(): void {
    this._accessToken = null;
    this._csrfToken = null;
    this._currentUser.set(null);
  }

  public hasLoggedInFlag(): boolean {
    return this.isBrowser() && localStorage.getItem(this.LOGGED_IN_KEY) === 'true';
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private decodeToken(token: string): any {
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const decoded = new TextDecoder('utf-8').decode(
        Uint8Array.from(json, c => c.charCodeAt(0))
      );

      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

}
