import { Injectable } from '@angular/core';
import { BaseHttpService, PathConfig } from '../../core/services/base-http.service';
import { CarritoProducto } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class CarritoProductoService extends BaseHttpService<CarritoProducto> {
  protected pathConfig: PathConfig = {
    strategy: 'admin-me',
    endpoint: 'carritosproductos'
  };
}