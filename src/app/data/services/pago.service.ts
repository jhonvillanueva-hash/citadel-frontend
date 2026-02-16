import { Injectable } from '@angular/core';
import { BaseHttpService, PathConfig } from '../../core/services/base-http.service';
import { Pago } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class PagoService extends BaseHttpService<Pago> {
  protected pathConfig: PathConfig = {
    strategy: 'admin-me',
    endpoint: 'pagos'
  };
}