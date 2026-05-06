import { Injectable } from '@angular/core';
import { BaseHttpService, PathConfig } from '../../core/services/base-http.service';
import { Cupon } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class CuponService extends BaseHttpService<Cupon> {
  protected pathConfig: PathConfig = {
    strategy: 'admin-public',
    endpoint: 'cupones'
  };
}
