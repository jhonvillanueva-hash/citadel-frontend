import { Injectable } from '@angular/core';
import { BaseHttpService, PathConfig } from '../base-http.service';
import { Sabor } from '../../models/api.models';

@Injectable({ providedIn: 'root' })
export class SaborService extends BaseHttpService<Sabor> {
  protected pathConfig: PathConfig = {
    strategy: 'admin-public',
    endpoint: 'sabores'
  };
}
