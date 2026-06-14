import { Injectable } from '@angular/core';
import { BaseHttpService, PathConfig } from '../../core/services/base-http.service';
import { Usuario } from '../models/api.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuarioService extends BaseHttpService<Usuario> {
  protected pathConfig: PathConfig = {
    strategy: 'admin-me-custom',
    endpoint: 'usuario',
    customAdminEndpoint: 'usuarios'
  };

  updateProfile(
    id: number,
    formData: FormData
  ): Observable<Usuario> {

    return this.http.put<Usuario>(
      `${this.fullUrl}/${id}`,
      formData,
      {
        withCredentials: true
      }
    );
  }

  getProfile(): Observable<Usuario> {
    return this.http.get<Usuario>(
      `${this.fullUrl}/perfil`,
      { withCredentials: true }
    );
  }
}
