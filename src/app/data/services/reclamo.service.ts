import { Injectable } from '@angular/core';
import { BaseHttpService, PathConfig } from '../../core/services/base-http.service';
import { Reclamo } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ReclamoService extends BaseHttpService<Reclamo> {
  protected pathConfig: PathConfig = {
    strategy: 'admin-public',
    endpoint: 'reclamos'
  };
}
