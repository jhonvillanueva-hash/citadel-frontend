import { Injectable } from '@angular/core';
import { BaseHttpService, PathConfig } from '../../core/services/base-http.service';
import { Usuario } from '../models/api.models';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UsuarioService extends BaseHttpService<Usuario> {
  protected pathConfig: PathConfig = {
    strategy: 'admin-me-custom',
    endpoint: 'usuario',
    customAdminEndpoint: 'usuarios'
  };

  updateProfile(
    id: number,
    data: Partial<Usuario>
  ): Observable<Usuario> {

    return this.http.patch<Usuario>(
      `${this.fullUrl}/${id}`,
      data,
      {
        withCredentials: true
      }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  getProfile(): Observable<Usuario> {
    return this.http.get<Usuario>(
      `${this.fullUrl}/perfil`,
      { withCredentials: true }
    );
  }
}
