import { Injectable } from '@angular/core';
import { BaseHttpService, PathConfig } from '../base-http.service';
import { Precio } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class PrecioService extends BaseHttpService<Precio> {
  protected pathConfig: PathConfig = {
    strategy: 'admin-public',
    endpoint: 'precios'
  };
}
