import { Injectable } from '@angular/core';
import { BaseHttpService, PathConfig } from '../../core/services/base-http.service';
import { Vino } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class VinoService extends BaseHttpService<Vino> {
  protected pathConfig: PathConfig = {
    strategy: 'admin-public',
    endpoint: 'vinos'
  };
}
