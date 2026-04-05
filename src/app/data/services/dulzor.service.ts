import { Injectable } from '@angular/core';
import { BaseHttpService, PathConfig } from '../../core/services/base-http.service';
import { Dulzor } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class DulzorService extends BaseHttpService<Dulzor> {
  protected pathConfig: PathConfig = {
    strategy: 'admin-public',
    endpoint: 'dulzores'
  };
}
