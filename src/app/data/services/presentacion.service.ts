import { Injectable } from '@angular/core';
import { BaseHttpService, PathConfig } from '../../core/services/base-http.service';
import { Presentacion } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class PresentacionService extends BaseHttpService<Presentacion> {
  protected pathConfig: PathConfig = {
    strategy: 'admin-public',
    endpoint: 'presentaciones'
  };
}
