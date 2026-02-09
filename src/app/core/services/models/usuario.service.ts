import { Injectable } from '@angular/core';
import { BaseHttpService, PathConfig } from '../base-http.service';
import { Usuario } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class UsuarioService extends BaseHttpService<Usuario> {
  protected pathConfig: PathConfig = {
    strategy: 'admin-me-custom',
    endpoint: 'usuario',
    customAdminEndpoint: 'usuarios'
  };
}
